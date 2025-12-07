
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useUI } from './UIContext';
import { useTheme } from './ThemeContext';
import { sounds } from '../sounds';

const NOTIFICATION_TAG = 'pomodoro-status';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';
type PomodoroStatus = 'idle' | 'running' | 'paused' | 'finished';

const DEFAULT_FOCUS_DURATION = 10; // Para teste
const SHORT_BREAK_DURATION = 2; // Para teste
const LONG_BREAK_DURATION = 5; // Para teste

// --- Funções Auxiliares ---
const playSound = (sound: HTMLAudioElement, volume: number) => {
    if (sound) {
        sound.volume = volume;
        sound.play().catch(err => console.error('Erro ao tocar som:', err));
    }
};

const postWebNotification = async (title: string, options: NotificationOptions) => {
    // if ('serviceWorker' in navigator) {
    //     try {
    //         const registration = await navigator.serviceWorker.ready;
    //         registration.active?.postMessage({ type: 'POST_NOTIFICATION', payload: { title, options } });
    //     } catch (error) {
    //         console.error('Erro ao enviar notificação via Service Worker:', error);
    //     }
    // } else {
    //     console.warn('Service Worker não é suportado neste navegador.');
    // }
};

// --- Interfaces ---
interface PomodoroContextType {
    pomodorosCompleted: number;
    pomodorosInCycle: number;
    timerMode: TimerMode;
    status: PomodoroStatus;
    isActive: boolean;
    timeRemaining: number;
    sessionDuration: number;
    distractionNotes: string;
    setDistractionNotes: (notes: string) => void;
    activeTaskId: string | null;
    activeTaskTitle: string | null;
    activeSubtaskId: string | null;
    activeSubtaskTitle: string | null;
    lastCompletedFocus: { taskId: string | null; subtaskId: string | null; } | null;
    clearLastCompletedFocus: () => void;
    startFocusOnTask: (taskId: string, taskTitle: string, duration?: number, subtaskId?: string | null, subtaskTitle?: string | null) => void;
    clearActiveSubtask: () => void;
    startCycle: () => void;
    pauseCycle: () => void;
    resumeCycle: () => void;
    stopCycle: () => void;
    skipBreak: () => void;
    endCycleAndStartNext: () => void;
    setFocusDuration: (minutes: number) => void;
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

// --- Hooks ---
export const usePomodoro = () => {
    const context = useContext(PomodoroContext);
    if (!context) {
        throw new Error('usePomodoro must be used within a PomodoroProvider');
    }
    return context;
};

// --- Provider ---
export const PomodoroProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { addNotification, soundEnabled } = useUI();
    const { setPontosFoco } = useTheme();

    const [pomodorosCompleted, setPomodorosCompleted] = useLocalStorage('focusfrog_pomodorosCompleted', 0);
    const [pomodorosInCycle, setPomodorosInCycle] = useLocalStorage('focusfrog_pomodorosInCycle', 0);
    
    const [sessionDuration, setSessionDuration] = useState(DEFAULT_FOCUS_DURATION);
    
    const [timerMode, setTimerMode] = useState<TimerMode>('focus');
    const [status, setStatus] = useState<PomodoroStatus>('idle');
    const [timeRemaining, setTimeRemaining] = useState(sessionDuration);

    const [distractionNotes, setDistractionNotes] = useState('');
    const [activeTaskId, setActiveTaskId] = useLocalStorage<string | null>('focusfrog_activeTaskId', null);
    const [activeTaskTitle, setActiveTaskTitle] = useLocalStorage<string | null>('focusfrog_activeTaskTitle', null);
    const [activeSubtaskId, setActiveSubtaskId] = useLocalStorage<string | null>('focusfrog_activeSubtaskId', null);
    const [activeSubtaskTitle, setActiveSubtaskTitle] = useLocalStorage<string | null>('focusfrog_activeSubtaskTitle', null);
    const [lastCompletedFocus, setLastCompletedFocus] = useState<{taskId: string | null, subtaskId: string | null} | null>(null);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const initialTimeRef = useRef(sessionDuration);

    const isActive = status === 'running';

    const startTimer = useCallback(async (duration: number) => {
        initialTimeRef.current = duration;
        setTimeRemaining(duration);
        setStatus('running');

        // await postWebNotification('🎯 Foco Ativado', {
        //     body: 'Mantenha a concentração!',
        //     tag: NOTIFICATION_TAG,
        //     renotify: true,
        // });
    }, []);

    const startNextCycle = useCallback((startImmediately = false) => {
        const wasFocus = timerMode === 'focus';
        if (wasFocus) {
            setPomodorosInCycle(prev => prev + 1);
        }

        const nextMode = wasFocus
            ? (pomodorosInCycle + 1) % 4 === 0 ? 'longBreak' : 'shortBreak'
            : 'focus';
        
        if (nextMode === 'focus' && timerMode === 'longBreak') {
            setPomodorosInCycle(0);
        }

        setTimerMode(nextMode);
        const newDuration = nextMode === 'shortBreak' ? SHORT_BREAK_DURATION : nextMode === 'longBreak' ? LONG_BREAK_DURATION : sessionDuration;
        setTimeRemaining(newDuration);
        initialTimeRef.current = newDuration;

        if (startImmediately) {
            setStatus('running');
        } else {
            setStatus('finished');
        }
    }, [timerMode, pomodorosInCycle, sessionDuration]);

    useEffect(() => {
        if (status !== 'running') return;

        timerRef.current = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);                    
                    if (soundEnabled) playSound(sounds.levelEnd, 0.5);
                    
                    if (timerMode === 'focus') {
                        // addNotification('Foco Concluído! 🎉', 'victory');
                        setPomodorosCompleted(p => p + 1);
                        setPontosFoco(p => p + 25);
                        if (activeTaskId) {
                            setLastCompletedFocus({ taskId: activeTaskId, subtaskId: activeSubtaskId });
                            setActiveTaskId(null); setActiveTaskTitle(null); setActiveSubtaskId(null); setActiveSubtaskTitle(null);
                        }
                    } else {
                        // addNotification('Pausa Finalizada! 💪', 'success');
                    }

                    startNextCycle(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timerRef.current!);
    }, [status, timerMode, soundEnabled, addNotification, setPontosFoco, startNextCycle, activeTaskId, activeSubtaskId]);

    // --- Funções de Controle ---

    const startCycle = useCallback(() => {
        if (activeTaskId) {
            setActiveTaskId(null); setActiveTaskTitle(null); setActiveSubtaskId(null); setActiveSubtaskTitle(null);
        }
        setTimerMode('focus');
        startTimer(sessionDuration);
        // addNotification('Foco Geral Ativado', '🎯', 'info');
    }, [activeTaskId, sessionDuration, startTimer, addNotification]);

    const startFocusOnTask = useCallback((taskId: string, taskTitle: string, duration?: number, subtaskId: string | null = null, subtaskTitle: string | null = null) => {
        const newDurationInSeconds = (duration || sessionDuration / 60) * 60;
        setActiveTaskId(taskId); setActiveTaskTitle(taskTitle); setActiveSubtaskId(subtaskId); setActiveSubtaskTitle(subtaskTitle);
        setTimerMode('focus');
        startTimer(newDurationInSeconds);
        // addNotification(`Focando em: ${taskTitle}`, '🎯', 'success');
    }, [sessionDuration, startTimer, addNotification, setActiveTaskId, setActiveTaskTitle, setActiveSubtaskId, setActiveSubtaskTitle]);

    const pauseCycle = useCallback(async () => {
        setStatus('paused');
        // await postWebNotification('⏸️ Foco Pausado', {
        //     body: 'Aguardando para retomar.',
        //     tag: NOTIFICATION_TAG,
        //     renotify: true
        // });
    }, []);

    const resumeCycle = useCallback(() => setStatus('running'), []);

    const stopCycle = useCallback(() => {
        setStatus('idle');
        setTimeRemaining(sessionDuration);
        setActiveTaskId(null); setActiveTaskTitle(null); setActiveSubtaskId(null); setActiveSubtaskTitle(null);
    }, [sessionDuration]);

    const endCycleAndStartNext = useCallback(() => startNextCycle(true), [startNextCycle]);

    const setFocusDuration = useCallback((minutes: number) => {
        const newDuration = minutes * 60;
        setSessionDuration(newDuration);
        if (status === 'idle') {
            setTimeRemaining(newDuration);
        }
    }, [status, setSessionDuration]);

    const clearLastCompletedFocus = useCallback(() => setLastCompletedFocus(null), []);
    const clearActiveSubtask = useCallback(() => {
        setActiveSubtaskId(null);
        setActiveSubtaskTitle(null);
    }, []);

    const value = {
        pomodorosCompleted,
        pomodorosInCycle,
        timerMode,
        status,
        isActive,
        timeRemaining,
        sessionDuration,
        distractionNotes,
        setDistractionNotes,
        activeTaskId,
        activeTaskTitle,
        activeSubtaskId,
        activeSubtaskTitle,
        lastCompletedFocus,
        clearLastCompletedFocus,
        startFocusOnTask,
        clearActiveSubtask,
        startCycle,
        pauseCycle,
        resumeCycle,
        stopCycle,
        skipBreak: endCycleAndStartNext,
        endCycleAndStartNext,
        setFocusDuration
    };

    return <PomodoroContext.Provider value={value}>{children}</PomodoroContext.Provider>;
};