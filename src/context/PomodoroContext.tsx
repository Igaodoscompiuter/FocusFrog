
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useUI } from './UIContext';
import { uiEffects } from '../sounds';
import { postMessageToSW } from '../sw-helpers';

export type PomodoroMode = 'quick' | 'classic';
export type PomodoroSessionStatus = 'idle' | 'focus' | 'break';

const DEFAULT_FOCUS_DURATION = 25 * 60;
const DEFAULT_BREAK_DURATION = 5 * 60;

interface PomodoroSettings {
    mode: PomodoroMode;
    taskId: string;
    taskTitle: string;
    cycles?: number;
    focusMinutes?: number;
    breakMinutes?: number;
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
    completeTask: () => void; // Adicionando a função ao tipo
    lastCompletedFocus: { taskId: string | null } | null;
    clearLastCompletedFocus: () => void;
    distractionNotes: string;
    setDistractionNotes: (notes: string) => void;
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

export const usePomodoro = () => {
    const context = useContext(PomodoroContext);
    if (!context) {
        throw new Error('usePomodoro must be used within a PomodoroProvider');
    }
    return context;
};

export const PomodoroProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { playEffect } = useUI();

    const [pomodorosCompleted, setPomodorosCompleted] = useLocalStorage('focusfrog_pomodorosCompleted', 0);
    const [activeTaskId, setActiveTaskId] = useLocalStorage<string | null>('focusfrog_activeTaskId', null);
    const [activeTaskTitle, setActiveTaskTitle] = useLocalStorage<string | null>('focusfrog_activeTaskTitle', null);
    const [lastCompletedFocus, setLastCompletedFocus] = useState<{ taskId: string | null } | null>(null);
    const [distractionNotes, setDistractionNotes] = useState('');

    const [mode, setMode] = useState<PomodoroMode | null>(null);
    const [sessionStatus, setSessionStatus] = useState<PomodoroSessionStatus>('idle');
    const [isPaused, setIsPaused] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(DEFAULT_FOCUS_DURATION);
    const [focusDuration, setFocusDuration] = useState(DEFAULT_FOCUS_DURATION);
    const [breakDuration, setBreakDuration] = useState(DEFAULT_BREAK_DURATION);
    const [totalCycles, setTotalCycles] = useState(1);
    const [currentCycle, setCurrentCycle] = useState(1);

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
        postMessageToSW({ type: 'CANCEL_NOTIFICATION' });
    }, [focusDuration, setActiveTaskId, setActiveTaskTitle]);

    // Nova função para completar a tarefa
    const completeTask = useCallback(() => {
        if (activeTaskId) {
            setLastCompletedFocus({ taskId: activeTaskId });
        }
        if (uiEffects.sessionComplete) playEffect(uiEffects.sessionComplete);
        stopAndReset();
    }, [activeTaskId, stopAndReset, playEffect, uiEffects]);


    useEffect(() => {
        if (sessionStatus === 'idle' || isPaused) {
            return;
        }

        timerRef.current = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev > 1) {
                    return prev - 1;
                }

                clearInterval(timerRef.current!);

                if (sessionStatus === 'focus') {
                    setPomodorosCompleted(p => p + 1);

                    if (mode === 'quick') {
                        if (uiEffects.sessionComplete) playEffect(uiEffects.sessionComplete);
                        if (activeTaskId) {
                            setLastCompletedFocus({ taskId: activeTaskId });
                        }
                        stopAndReset();
                    } else { // 'classic' mode
                        if (currentCycle < totalCycles) {
                            if (uiEffects.breakStart) playEffect(uiEffects.breakStart);
                            setSessionStatus('break');
                            setTimeRemaining(breakDuration);

                            postMessageToSW({ 
                                type: 'SCHEDULE_NOTIFICATION', 
                                payload: { 
                                    title: 'Pausa Merecida!', 
                                    body: `Sua pausa de ${breakDuration > 59 ? `${breakDuration/60} minutos` : `${breakDuration} segundos`} começou.`,
                                    timestamp: Date.now() + breakDuration * 1000 
                                } 
                            });
                        } else {
                            if (uiEffects.sessionComplete) playEffect(uiEffects.sessionComplete);
                            if (activeTaskId) {
                                setLastCompletedFocus({ taskId: activeTaskId });
                            }
                            stopAndReset();
                        }
                    }
                } else if (sessionStatus === 'break') {
                    if (uiEffects.timerStart) playEffect(uiEffects.timerStart);
                    setCurrentCycle(c => c + 1);
                    setSessionStatus('focus');
                    setTimeRemaining(focusDuration);
                    postMessageToSW({ type: 'SCHEDULE_NOTIFICATION', payload: { title: 'De volta ao Foco!', body: `Seu bloco de trabalho de ${focusDuration/60} minutos começou.`, timestamp: Date.now() + focusDuration * 1000 } });
                }

                return 0;
            });
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [mode, sessionStatus, isPaused, activeTaskId, breakDuration, currentCycle, focusDuration, playEffect, setPomodorosCompleted, stopAndReset, totalCycles]);

    const startPomodoro = useCallback((settings: PomodoroSettings) => {
        stopAndReset();

        const newFocusDuration = (settings.focusMinutes || 25) * 60;
        const isTestTask = settings.taskId === '81';
        const newBreakDuration = isTestTask ? 3 : (settings.breakMinutes || 5) * 60;

        setMode(settings.mode);
        setActiveTaskId(settings.taskId);
        setActiveTaskTitle(settings.taskTitle);
        setFocusDuration(newFocusDuration);
        setBreakDuration(newBreakDuration);
        setTimeRemaining(newFocusDuration);
        
        if (settings.mode === 'classic') {
            setTotalCycles(settings.cycles || 1);
        } else {
            setTotalCycles(1);
        }
        
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
        completeTask, // Expondo a nova função no contexto
        lastCompletedFocus,
        clearLastCompletedFocus,
        distractionNotes,
        setDistractionNotes,
    };

    return <PomodoroContext.Provider value={value}>{children}</PomodoroContext.Provider>;
};
