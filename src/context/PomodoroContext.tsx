
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useUI } from './UIContext';
import { useUser } from './UserContext';
import { uiEffects } from '../sounds';
import { postMessageToSW } from '../sw-helpers';
import { schedulePhaseEndNotification, startOrUpdateFocusForegroundService, cancelPomodoroNotifications } from '../notifications';
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

    const clearLastCompletedFocus = useCallback(() => setLastCompletedFocus(null), []);

    const stopAndReset = useCallback(() => {
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
        cancelPomodoroNotifications();
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

    // Efeito principal do temporizador
    useEffect(() => {
        if (sessionStatus === 'idle' || isPaused) {
            return; // Não faz nada se o timer estiver parado ou pausado
        }

        timerRef.current = setInterval(() => {
            // [CORREÇÃO] Em vez de só decrementar (o que perde a conta se o app ficar
            // em segundo plano e o JS for pausado pelo Android), recalcula o tempo
            // restante a partir do relógio absoluto (sessionEndsAt) sempre que ele
            // existe. Isso faz o timer "pular" direto pro valor certo ao voltar do
            // background, em vez de continuar contando como se nada tivesse acontecido.
            const real = sessionEndsAt !== null
                ? Math.max(0, Math.round((sessionEndsAt - Date.now()) / 1000))
                : null;

            setTimeRemaining(prev => {
                const next = real !== null ? real : prev - 1;
                if (next > 0) {
                    return next;
                }

                // --- Fim de um intervalo (foco ou pausa) ---
                clearInterval(timerRef.current!);

                if (sessionStatus === 'focus') {
                    setPomodorosCompleted(p => p + 1);

                    // --- Lógica de Conclusão de Ciclo de Foco ---
                    if (mode === 'quick' || currentCycle >= totalCycles) {
                        if (activeTaskId && sessionFrog && !sessionFrog.isCollected) {
                            addFrogToCollection(sessionFrog.speciesId);
                        }
                        
                        if (activeTaskId) {
                            setLastCompletedFocus({ taskId: activeTaskId, completionMethod: 'timer' });
                        }

                        if (uiEffects.sessionComplete) playEffect(uiEffects.sessionComplete);
                        stopAndReset();

                    } else {
                        if (uiEffects.breakStart) playEffect(uiEffects.breakStart);
                        setSessionStatus('break');
                        setTimeRemaining(breakDuration);
                        const endsAt = Date.now() + breakDuration * 1000;
                        setSessionEndsAt(endsAt);
                        schedulePhaseEndNotification('Pausa Merecida!', `Sua pausa de ${breakDuration / 60} minutos começou.`, endsAt);
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
                    schedulePhaseEndNotification('De volta ao Foco!', `Seu bloco de trabalho de ${focusDuration / 60} minutos começou.`, endsAt);
                    startOrUpdateFocusForegroundService(activeTaskTitle || 'Tarefa', 'focus', endsAt);
                }

                return 0;
            });
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [mode, sessionStatus, isPaused, activeTaskId, activeTaskTitle, breakDuration, currentCycle, totalCycles, focusDuration, playEffect, setPomodorosCompleted, stopAndReset, addFrogToCollection, sessionFrog, sessionEndsAt, setSessionEndsAt]);

    // [NOVO] Quando o app volta ao primeiro plano (depois de minimizado/fechado),
    // força uma reavaliação imediata — não espera o próximo tick de 1s — pra
    // corrigir a tela assim que possível, inclusive completando a fase se ela já
    // tiver terminado enquanto o app estava fora do ar.
    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;
        const sub = CapacitorApp.addListener('appStateChange', ({ isActive }) => {
            if (isActive && sessionStatus !== 'idle' && !isPaused && sessionEndsAt !== null) {
                const real = Math.max(0, Math.round((sessionEndsAt - Date.now()) / 1000));
                setTimeRemaining(real);
            }
        });
        return () => { sub.then(s => s.remove()); };
    }, [sessionStatus, isPaused, sessionEndsAt]);

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
        schedulePhaseEndNotification('Foco Terminado!', `A tarefa "${settings.taskTitle}" espera por você.`, endsAt);
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
            const notificationBody = sessionStatus === 'focus' 
                ? `Foco em "${activeTaskTitle}" termina em breve.`
                : 'Sua pausa está quase no fim.';
            postMessageToSW({
                type: 'SCHEDULE_NOTIFICATION',
                payload: {
                    title: sessionStatus === 'focus' ? 'Sessão de Foco Quase Completa' : 'Pausa Quase Completa',
                    body: notificationBody,
                    timestamp: Date.now() + timeRemaining * 1000,
                },
            });
        }
    }, [sessionStatus, timeRemaining, activeTaskTitle]);

    const value: PomodoroContextType = {
        pomodorosCompleted,
        activeTaskId,
        activeTaskTitle,
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
