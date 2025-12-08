
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useUI } from './UIContext';
import { useTheme } from './ThemeContext';
import { sounds } from '../sounds';

type TimerMode = 'focus'; 
type PomodoroStatus = 'idle' | 'running' | 'paused'; 

const DEFAULT_FOCUS_DURATION = 25 * 60; // Duração padrão de 25 minutos em segundos

const playSound = (sound: HTMLAudioElement, volume: number) => {
    if (sound) {
        sound.volume = volume;
        sound.play().catch(err => console.error('Erro ao tocar som:', err));
    }
};

interface PomodoroContextType {
    pomodorosCompleted: number;
    timerMode: TimerMode;
    status: PomodoroStatus;
    isActive: boolean;
    timeRemaining: number;
    sessionDuration: number;
    distractionNotes: string;
    setDistractionNotes: (notes: string) => void;
    activeTaskId: string | null;
    activeTaskTitle: string | null;
    lastCompletedFocus: { taskId: string | null } | null;
    clearLastCompletedFocus: () => void;
    startFocusOnTask: (taskId: string, taskTitle: string, durationInMinutes?: number) => void;
    startCycle: () => void;
    pauseCycle: () => void;
    resumeCycle: () => void;
    stopCycle: () => void;
    setFocusDuration: (minutes: number) => void;
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
    const { soundEnabled } = useUI();
    const { setPontosFoco } = useTheme();

    const [pomodorosCompleted, setPomodorosCompleted] = useLocalStorage('focusfrog_pomodorosCompleted', 0);
    const [sessionDuration, setSessionDuration] = useState(DEFAULT_FOCUS_DURATION);
    
    const [timerMode] = useState<TimerMode>('focus');
    const [status, setStatus] = useState<PomodoroStatus>('idle');
    const [timeRemaining, setTimeRemaining] = useState(sessionDuration);

    const [distractionNotes, setDistractionNotes] = useState('');
    const [activeTaskId, setActiveTaskId] = useLocalStorage<string | null>('focusfrog_activeTaskId', null);
    const [activeTaskTitle, setActiveTaskTitle] = useLocalStorage<string | null>('focusfrog_activeTaskTitle', null);
    const [lastCompletedFocus, setLastCompletedFocus] = useState<{taskId: string | null} | null>(null);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const isActive = status === 'running';

    const stopAndResetTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        setStatus('idle');
        setTimeRemaining(sessionDuration);
        setActiveTaskId(null);
        setActiveTaskTitle(null);
    }, [sessionDuration, setActiveTaskId, setActiveTaskTitle]);

    useEffect(() => {
        if (status !== 'running') return;

        timerRef.current = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!); 
                    
                    setTimeout(() => {
                        if (soundEnabled) playSound(sounds.levelEnd, 0.5);
                        setPomodorosCompleted(p => p + 1);
                        setPontosFoco(p => p + 25);

                        if (activeTaskId) {
                            setLastCompletedFocus({ taskId: activeTaskId });
                        } else {
                            stopAndResetTimer();
                        }
                    }, 0);

                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if(timerRef.current) clearInterval(timerRef.current);
        };
    }, [status, soundEnabled, setPontosFoco, activeTaskId, setPomodorosCompleted, stopAndResetTimer, setLastCompletedFocus]);

    const startTimer = useCallback((duration: number) => {
        setTimeRemaining(duration);
        setStatus('running');
    }, []);

    const startCycle = useCallback(() => {
        if (activeTaskId) {
           stopAndResetTimer();
        }
        startTimer(sessionDuration);
    }, [activeTaskId, sessionDuration, startTimer, stopAndResetTimer]);

    const startFocusOnTask = useCallback((taskId: string, taskTitle: string, durationInMinutes?: number) => {
        const durationInSeconds = durationInMinutes ? durationInMinutes * 60 : sessionDuration;
        setActiveTaskId(taskId); 
        setActiveTaskTitle(taskTitle); 
        startTimer(durationInSeconds);
    }, [sessionDuration, startTimer, setActiveTaskId, setActiveTaskTitle]);

    const pauseCycle = useCallback(() => setStatus('paused'), []);

    const resumeCycle = useCallback(() => setStatus('running'), []);

    const setFocusDuration = useCallback((minutes: number) => {
        const newDuration = minutes * 60;
        setSessionDuration(newDuration);
        if (status === 'idle') {
            setTimeRemaining(newDuration);
        }
    }, [status]);

    const clearLastCompletedFocus = useCallback(() => setLastCompletedFocus(null), []);

    const value = {
        pomodorosCompleted,
        timerMode,
        status,
        isActive,
        timeRemaining,
        sessionDuration,
        distractionNotes,
        setDistractionNotes,
        activeTaskId,
        activeTaskTitle,
        lastCompletedFocus,
        clearLastCompletedFocus,
        startFocusOnTask,
        startCycle,
        pauseCycle,
        resumeCycle,
        stopCycle: stopAndResetTimer,
        setFocusDuration,
    };

    return <PomodoroContext.Provider value={value}>{children}</PomodoroContext.Provider>;
};