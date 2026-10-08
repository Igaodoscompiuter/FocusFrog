
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useUI } from './UIContext';
import { useUser } from './UserContext';
import { uiEffects } from '../sounds';
import { postMessageToSW } from '../sw-helpers';
import { schedulePhaseEndNotification, startOrUpdateFocusForegroundService, cancelPomodoroNotifications, scheduleSessionDoneNotification, finishPomodoroNotifications, getFocusDistractionMs, resetFocusDistraction, isDistractionGuardOn, setDistractionGuard } from '../notifications';
import { frogSpecies } from '../utils/frogSpecies';

export type PomodoroMode = 'quick' | 'classic';
export type PomodoroSessionStatus = 'idle' | 'focus' | 'break';

const DEFAULT_FOCUS_DURATION = 25 * 60;
const DEFAULT_BREAK_DURATION = 5 * 60;

interface SessionFrog {
    speciesId: keyof typeof frogSpecies;
    isCollected: boolean;
}

interface PomodoroSettings {
    mode: PomodoroMode;
    taskId: string;
    taskTitle: string;
    cycles?: number;
    focusMinutes?: number;
    breakMinutes?: number;
}

interface LastCompletedFocus {
    taskId: string | null;
    completionMethod: 'timer' | 'button';
}

interface PomodoroContextType {
    /** sessão terminou mas as distrações passaram do limite → sem sapo */
    scaredOutcome: ScaredOutcome | null;
    clearScaredOutcome: () => void;
    pomodorosCompleted: number;
    activeTaskId: string | null;
    activeTaskTitle: string | null;
    mode: PomodoroMode | null;
    sessionStatus: PomodoroSessionStatus;
    isPaused: boolean;
    timeRemaining: number;
    focusDuration: number;
    breakDuration: number;
    totalCycles: number;
    currentCycle: number;
    startPomodoro: (settings: PomodoroSettings) => void;
    pauseCycle: () => void;
    resumeCycle: () => void;
    stopCycle: () => void;
    completeTask: () => void;
    lastCompletedFocus: LastCompletedFocus | null;
    clearLastCompletedFocus: () => void;
    distractionNotes: string;
    setDistractionNotes: (notes: string) => void;
    /** Progresso geral da sessão (0 a 1), considerando todos os ciclos. Usado para o ciclo de vida do sapo. */
    sessionProgress: number;
    /** Progresso do ciclo de foco/pausa atual (0 a 1). Usado para o anel de progresso. */
    cycleProgress: number;
    sessionFrog: SessionFrog | null;
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

export const usePomodoro = () => {
    const context = useContext(PomodoroContext);
    if (!context) {
        throw new Error('usePomodoro must be used within a PomodoroProvider');
    }
    return context;
};

const getRandomFrog = (): keyof typeof frogSpecies => {
    const speciesKeys = Object.keys(frogSpecies);
    const randomIndex = Math.floor(Math.random() * speciesKeys.length);
    return speciesKeys[randomIndex] as keyof typeof frogSpecies;
};

/**
 * [CORREÇÃO] Aviso do FIM de cada fase, agendado já no INÍCIO dela (dispara
 * pelo AlarmManager mesmo com o app congelado). O texto descreve o que
 * acontece naquele momento:
 *   fim de um foco intermediário → "Hora da pausa"
 *   fim de uma pausa             → "De volta ao foco"
 *   fim do ÚLTIMO foco           → "Foco concluído" (número próprio, 9004)
 * Antes o aviso de pausa dizia "Hora da pausa" no FIM da pausa, e retomar
 * de uma pausa não reagendava nada no celular.
 */
/** Sapo só pra foco limpo: até 10% do tempo total de foco em outros apps. */
export const MAX_DISTRACTION_RATIO = 0.10;

/** Resultado de uma sessão em que as distrações passaram do limite. */
export interface ScaredOutcome { speciesId: string; distractedMs: number; focusMs: number; }

function scheduleEndAlert(phase: 'focus' | 'break', endsAt: number, isFinalFocus: boolean, taskTitle: string | null, breakSec: number, focusSec: number) {
    if (phase === 'focus' && isFinalFocus) {
        scheduleSessionDoneNotification('✅ Foco concluído!', taskTitle ? `Você terminou seu foco em "${taskTitle}". Toque pra ver como foi 🐸` : 'Você terminou seu bloco de foco. Toque pra ver como foi 🐸', endsAt);
    } else if (phase === 'focus') {
        schedulePhaseEndNotification('☕ Hora da pausa', `Bom trabalho! Descanse ${Math.round(breakSec / 60)} min.`, endsAt);
    } else {
        schedulePhaseEndNotification('🐸 De volta ao foco!', `Hora do próximo bloco de ${Math.round(focusSec / 60)} min.`, endsAt);
    }
}

export const PomodoroProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { playEffect } = useUI();
    const { addFrogToCollection } = useUser();

    const [pomodorosCompleted, setPomodorosCompleted] = useLocalStorage('focusfrog_pomodorosCompleted', 0);
    const [activeTaskId, setActiveTaskId] = useLocalStorage<string | null>('focusfrog_activeTaskId', null);
    const [activeTaskTitle, setActiveTaskTitle] = useLocalStorage<string | null>('focusfrog_activeTaskTitle', null);
    // [NOVO] Horário absoluto (epoch ms) em que a fase atual termina, persistido.
    // É a peça que permite recuperar a sessão se o app for fechado/morto em segundo
    // plano: em vez de confiar num contador de JS que para de rodar, recalculamos
    // o tempo restante a partir desse relógio sempre que o app volta ao primeiro plano.
    const [sessionEndsAt, setSessionEndsAt] = useLocalStorage<number | null>('focusfrog_sessionEndsAt', null);
    const [lastCompletedFocus, setLastCompletedFocus] = useState<LastCompletedFocus | null>(null);
    const [distractionNotes, setDistractionNotes] = useState('');

    const [mode, setMode] = useLocalStorage<PomodoroMode | null>('focusfrog_pomodoroMode', null);
    const [sessionStatus, setSessionStatus] = useLocalStorage<PomodoroSessionStatus>('focusfrog_sessionStatus', 'idle');
    const [isPaused, setIsPaused] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(DEFAULT_FOCUS_DURATION);
    const [focusDuration, setFocusDuration] = useLocalStorage('focusfrog_focusDuration', DEFAULT_FOCUS_DURATION);
    const [breakDuration, setBreakDuration] = useLocalStorage('focusfrog_breakDuration', DEFAULT_BREAK_DURATION);
    const [totalCycles, setTotalCycles] = useLocalStorage('focusfrog_totalCycles', 1);
    const [currentCycle, setCurrentCycle] = useLocalStorage('focusfrog_currentCycle', 1);

    const [totalSessionTime, setTotalSessionTime] = useLocalStorage('focusfrog_totalSessionTime', 0);
    const [sessionProgress, setSessionProgress] = useState(0);
    const [cycleProgress, setCycleProgress] = useState(0);
    const [sessionFrog, setSessionFrog] = useLocalStorage<SessionFrog | null>('focusfrog_sessionFrog', null);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const heartbeatTick = useRef(0);
    const [scaredOutcome, setScaredOutcome] = useState<ScaredOutcome | null>(null);
    const clearScaredOutcome = useCallback(() => setScaredOutcome(null), []);

    const clearLastCompletedFocus = useCallback(() => setLastCompletedFocus(null), []);

    const stopAndReset = useCallback((opts?: { finished?: boolean }) => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        setSessionStatus('idle');
        setIsPaused(false);
        setMode(null);
        setTimeRemaining(focusDuration);
        setActiveTaskId(null);
        setActiveTaskTitle(null);
        setCurrentCycle(1);
        setTotalCycles(1);
        setSessionProgress(0);
        setCycleProgress(0);
        setSessionFrog(null);
        setSessionEndsAt(null);
        // terminou naturalmente → preserva o "Foco concluído" já agendado
        if (opts?.finished) finishPomodoroNotifications(); else cancelPomodoroNotifications();
    }, [focusDuration, setActiveTaskId, setActiveTaskTitle, setSessionEndsAt, setSessionFrog, setMode, setSessionStatus, setCurrentCycle, setTotalCycles]);

    const completeTask = useCallback(() => {
        if (activeTaskId) {
            setLastCompletedFocus({ taskId: activeTaskId, completionMethod: 'button' });
        }
        if (uiEffects.sessionComplete) playEffect(uiEffects.sessionComplete);
        stopAndReset();
    }, [activeTaskId, stopAndReset, playEffect]);

    // Efeito para calcular o progresso do ciclo e da sessão
    useEffect(() => {
        // Calcula o progresso para qualquer ciclo ativo (foco ou pausa)
        if ((sessionStatus === 'focus' || sessionStatus === 'break') && !isPaused) {
            // Determina a duração total do ciclo atual (seja foco ou pausa)
            const currentCycleDuration = sessionStatus === 'focus' ? focusDuration : breakDuration;

            // --- Cálculo do Progresso do CICLO ATUAL (para o anel) ---
            const elapsedTimeInCurrentCycle = currentCycleDuration - timeRemaining;
            const currentCycleCompletion = currentCycleDuration > 0 ? elapsedTimeInCurrentCycle / currentCycleDuration : 0;
            setCycleProgress(Math.min(currentCycleCompletion, 1));

            // --- Cálculo do Progresso da SESSÃO TOTAL (para o sapo) ---
            // Este cálculo só faz sentido durante o ciclo de FOCO, pois representa o avanço na tarefa.
            if (sessionStatus === 'focus') {
                const completedCyclesTime = (currentCycle - 1) * focusDuration;
                const totalElapsedTime = completedCyclesTime + (focusDuration - timeRemaining);
                const overallSessionCompletion = totalSessionTime > 0 ? totalElapsedTime / totalSessionTime : 0;
                setSessionProgress(Math.min(overallSessionCompletion, 1));
            }
        }
    }, [timeRemaining, sessionStatus, isPaused, currentCycle, focusDuration, breakDuration, totalSessionTime]);

    // [CORREÇÃO] Antes, a lógica de "fase terminou" (dar ponto, coletar sapo,
    // trocar pra pausa) só existia DENTRO do tick do setInterval. Se o Android
    // suspendesse o timer de JS em segundo plano (comum — é exatamente pra
    // isso que existe o throttling de timer em WebView/Chrome), o app voltava
    // ao primeiro plano, o listener de appStateChange só ATUALIZAVA O
    // MOSTRADOR pro tempo certo (inclusive "00:00"), mas a conclusão de
    // verdade nunca rodava — sem pontos, sem sapo, sem transição de fase.
    // Agora essa lógica mora numa função só, chamada tanto pelo tick normal
    // quanto diretamente ao retomar o app, então ela roda de qualquer jeito.
    const handlePhaseEnd = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);

        if (sessionStatus === 'focus') {
            setPomodorosCompleted(p => p + 1);

            // --- Lógica de Conclusão de Ciclo de Foco ---
            if (mode === 'quick' || currentCycle >= totalCycles) {
                // [NOVO] Foco limpo: o sapo só vem se a distração (tela ligada em
                // outro app, medida no lado nativo) ficou até 10% do tempo de foco.
                // O tempo e a conclusão da tarefa contam de qualquer jeito.
                if (activeTaskId && sessionFrog && !sessionFrog.isCollected) {
                    const speciesId = sessionFrog.speciesId;
                    const focusMs = (mode === 'quick' ? 1 : totalCycles) * focusDuration * 1000;
                    const guard = isDistractionGuardOn(); // desligado: sapo garantido
                    (guard ? getFocusDistractionMs() : Promise.resolve(0)).then(distractedMs => {
                        if (distractedMs <= focusMs * MAX_DISTRACTION_RATIO) {
                            addFrogToCollection(speciesId);
                        } else {
                            setScaredOutcome({ speciesId, distractedMs, focusMs });
                        }
                    });
                }

                if (activeTaskId) {
                    setLastCompletedFocus({ taskId: activeTaskId, completionMethod: 'timer' });
                }

                if (uiEffects.sessionComplete) playEffect(uiEffects.sessionComplete);
                // O "Foco concluído" já foi agendado no INÍCIO deste bloco pro
                // horário exato do fim — aqui só encerra preservando ele.
                stopAndReset({ finished: true });

            } else {
                if (uiEffects.breakStart) playEffect(uiEffects.breakStart);
                setSessionStatus('break');
                setTimeRemaining(breakDuration);
                const endsAt = Date.now() + breakDuration * 1000;
                setSessionEndsAt(endsAt);
                // [CORREÇÃO] Antes essa notificação dizia "Pausa Merecida!" tanto
                // aqui (começo da pausa) quanto era confundida com "foco terminado"
                // pelo usuário — o título agora deixa claro que é uma MUDANÇA de
                // estado (foco -> pausa), não o fim de tudo.
                scheduleEndAlert('break', endsAt, false, activeTaskTitle, breakDuration, focusDuration);
                startOrUpdateFocusForegroundService(activeTaskTitle || 'Tarefa', 'break', endsAt);
            }
        } else if (sessionStatus === 'break') {
            // --- Fim da Pausa ---
            if (uiEffects.timerStart) playEffect(uiEffects.timerStart);
            setCurrentCycle(c => c + 1);
            setSessionStatus('focus');
            setTimeRemaining(focusDuration);
            const endsAt = Date.now() + focusDuration * 1000;
            setSessionEndsAt(endsAt);
            scheduleEndAlert('focus', endsAt, currentCycle + 1 >= totalCycles, activeTaskTitle, breakDuration, focusDuration);
            startOrUpdateFocusForegroundService(activeTaskTitle || 'Tarefa', 'focus', endsAt);
        }

        setTimeRemaining(0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode, sessionStatus, activeTaskId, activeTaskTitle, breakDuration, currentCycle, totalCycles, focusDuration, playEffect, setPomodorosCompleted, stopAndReset, addFrogToCollection, sessionFrog, setSessionEndsAt]);

    // Efeito principal do temporizador
    useEffect(() => {
        if (sessionStatus === 'idle' || isPaused) {
            return; // Não faz nada se o timer estiver parado ou pausado
        }

        timerRef.current = setInterval(() => {
            // Recalcula a partir do relógio absoluto (sessionEndsAt) sempre que
            // ele existe — corrige deriva/throttling em vez de só decrementar.
            const real = sessionEndsAt !== null
                ? Math.max(0, Math.round((sessionEndsAt - Date.now()) / 1000))
                : null;

            if (real !== null && real <= 0) {
                handlePhaseEnd();
                return;
            }

            // [CORREÇÃO] setOngoing(true) deveria bastar pra notificação não sumir,
            // mas alguns fabricantes ignoram isso no botão "limpar tudo" do sistema.
            // A cada ~30s reposta ela de novo como rede de segurança — mesmo que
            // alguém consiga descartá-la, ela volta sozinha logo em seguida, em vez
            // de ficar ausente até a próxima troca de fase (até 25min de distância).
            heartbeatTick.current += 1;
            if (heartbeatTick.current % 30 === 0 && sessionEndsAt !== null) {
                startOrUpdateFocusForegroundService(activeTaskTitle || 'Tarefa', sessionStatus === 'break' ? 'break' : 'focus', sessionEndsAt);
            }

            setTimeRemaining(prev => (real !== null ? real : Math.max(0, prev - 1)));
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [sessionStatus, isPaused, sessionEndsAt, handlePhaseEnd, activeTaskTitle]);

    // Quando o app volta ao primeiro plano, força uma reavaliação imediata —
    // se a fase já tiver terminado enquanto o app estava fora do ar, completa
    // de verdade (pontos, sapo, transição) em vez de só corrigir o mostrador.
    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;
        const sub = CapacitorApp.addListener('appStateChange', ({ isActive }) => {
            if (!isActive || sessionStatus === 'idle' || isPaused || sessionEndsAt === null) return;
            const real = Math.max(0, Math.round((sessionEndsAt - Date.now()) / 1000));
            if (real <= 0) {
                handlePhaseEnd();
            } else {
                setTimeRemaining(real);
            }
        });
        return () => { sub.then(s => s.remove()); };
    }, [sessionStatus, isPaused, sessionEndsAt, handlePhaseEnd]);

    const startPomodoro = useCallback((settings: PomodoroSettings) => {
        stopAndReset();

        const newFocusDuration = (settings.focusMinutes || 25) * 60;
        const newBreakDuration = (settings.breakMinutes || 5) * 60;
        const newTotalCycles = settings.mode === 'classic' ? (settings.cycles || 1) : 1;
        
        setMode(settings.mode);
        setActiveTaskId(settings.taskId);
        setActiveTaskTitle(settings.taskTitle);
        setFocusDuration(newFocusDuration);
        setBreakDuration(newBreakDuration);
        setTotalCycles(newTotalCycles);
        setTimeRemaining(newFocusDuration);
        setTotalSessionTime(newFocusDuration * newTotalCycles);
        setSessionFrog({ speciesId: getRandomFrog(), isCollected: false });
        
        setCurrentCycle(1);
        setSessionStatus('focus');
        setIsPaused(false);
        
        if (uiEffects.timerStart) playEffect(uiEffects.timerStart);
        const endsAt = Date.now() + newFocusDuration * 1000;
        setSessionEndsAt(endsAt);
        resetFocusDistraction();
        setDistractionGuard(isDistractionGuardOn()); // mantém o lado nativo sincronizado
        scheduleEndAlert('focus', endsAt, newTotalCycles <= 1, settings.taskTitle, newBreakDuration, newFocusDuration);
        startOrUpdateFocusForegroundService(settings.taskTitle, 'focus', endsAt);
    }, [playEffect, setActiveTaskId, setActiveTaskTitle, stopAndReset, setSessionEndsAt, setSessionFrog, setMode, setSessionStatus, setFocusDuration, setBreakDuration, setTotalCycles, setCurrentCycle, setTotalSessionTime]);

    const pauseCycle = useCallback(() => {
        if (sessionStatus !== 'idle') {
            setIsPaused(true);
            cancelPomodoroNotifications();
        }
    }, [sessionStatus]);

    const resumeCycle = useCallback(() => {
        if (sessionStatus !== 'idle') {
            setIsPaused(false);
            // Pausar "congela" o relógio; ao retomar, o fim da fase desloca pra
            // frente pelo tanto que ficou pausado — recalculado a partir do
            // timeRemaining atual, que é a fonte confiável durante a pausa.
            const endsAt = Date.now() + timeRemaining * 1000;
            setSessionEndsAt(endsAt);
            startOrUpdateFocusForegroundService(activeTaskTitle || 'Tarefa', sessionStatus === 'focus' ? 'focus' : 'break', endsAt);
            // [CORREÇÃO] antes só reagendava pelo service worker (PWA) — no
            // celular, depois de uma pausa a sessão terminava sem aviso nenhum
            scheduleEndAlert(sessionStatus === 'focus' ? 'focus' : 'break', endsAt,
                mode === 'quick' || currentCycle >= totalCycles, activeTaskTitle, breakDuration, focusDuration);
        }
    }, [sessionStatus, timeRemaining, activeTaskTitle, mode, currentCycle, totalCycles, breakDuration, focusDuration]);

    const value: PomodoroContextType = {
        pomodorosCompleted,
        activeTaskId,
        activeTaskTitle,
        scaredOutcome,
        clearScaredOutcome,
        mode,
        sessionStatus,
        isPaused,
        timeRemaining,
        focusDuration,
        breakDuration,
        totalCycles,
        currentCycle,
        startPomodoro,
        pauseCycle,
        resumeCycle,
        stopCycle: stopAndReset,
        completeTask,
        lastCompletedFocus,
        clearLastCompletedFocus,
        distractionNotes,
        setDistractionNotes,
        sessionProgress,
        cycleProgress,
        sessionFrog,
    };

    return <PomodoroContext.Provider value={value}>{children}</PomodoroContext.Provider>;
};
