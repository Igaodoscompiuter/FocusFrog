
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useUI } from './UIContext';
import { useUser } from './UserContext';
import { uiEffects } from '../sounds';
import { postMessageToSW } from '../sw-helpers';
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
    const [lastCompletedFocus, setLastCompletedFocus] = useState<LastCompletedFocus | null>(null);
    const [distractionNotes, setDistractionNotes] = useState('');

    const [mode, setMode] = useState<PomodoroMode | null>(null);
    const [sessionStatus, setSessionStatus] = useState<PomodoroSessionStatus>('idle');
    const [isPaused, setIsPaused] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(DEFAULT_FOCUS_DURATION);
    const [focusDuration, setFocusDuration] = useState(DEFAULT_FOCUS_DURATION);
    const [breakDuration, setBreakDuration] = useState(DEFAULT_BREAK_DURATION);
    const [totalCycles, setTotalCycles] = useState(1);
    const [currentCycle, setCurrentCycle] = useState(1);

    const [totalSessionTime, setTotalSessionTime] = useState(0);
    const [sessionProgress, setSessionProgress] = useState(0);
    const [cycleProgress, setCycleProgress] = useState(0);
    const [sessionFrog, setSessionFrog] = useState<SessionFrog | null>(null);

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
        postMessageToSW({ type: 'CANCEL_NOTIFICATION' });
    }, [focusDuration, setActiveTaskId, setActiveTaskTitle]);

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
            setTimeRemaining(prev => {
                // Decrementa o tempo
                if (prev > 1) {
                    return prev - 1;
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
                        postMessageToSW({ type: 'SCHEDULE_NOTIFICATION', payload: { title: 'Pausa Merecida!', body: `Sua pausa de ${breakDuration / 60} minutos começou.`, timestamp: Date.now() + breakDuration * 1000 } });
                    }
                } else if (sessionStatus === 'break') {
                    // --- Fim da Pausa ---
                    if (uiEffects.timerStart) playEffect(uiEffects.timerStart);
                    setCurrentCycle(c => c + 1);
                    setSessionStatus('focus');
                    setTimeRemaining(focusDuration);
                    postMessageToSW({ type: 'SCHEDULE_NOTIFICATION', payload: { title: 'De volta ao Foco!', body: `Seu bloco de trabalho de ${focusDuration / 60} minutos começou.`, timestamp: Date.now() + focusDuration * 1000 } });
                }

                return 0;
            });
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [mode, sessionStatus, isPaused, activeTaskId, breakDuration, currentCycle, totalCycles, focusDuration, playEffect, setPomodorosCompleted, stopAndReset, addFrogToCollection, sessionFrog]);

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
        postMessageToSW({
            type: 'SCHEDULE_NOTIFICATION',
            payload: {
                title: 'Foco Terminado!',
                body: `A tarefa "${settings.taskTitle}" espera por você.`,
                timestamp: Date.now() + newFocusDuration * 1000,
            },
        });
    }, [playEffect, setActiveTaskId, setActiveTaskTitle, stopAndReset]);

    const pauseCycle = useCallback(() => {
        if (sessionStatus !== 'idle') {
            setIsPaused(true);
            postMessageToSW({ type: 'CANCEL_NOTIFICATION' });
        }
    }, [sessionStatus]);

    const resumeCycle = useCallback(() => {
        if (sessionStatus !== 'idle') {
            setIsPaused(false);
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
