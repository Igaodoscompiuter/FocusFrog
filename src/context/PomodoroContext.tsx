
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useUI } from './UIContext';
import { useTheme } from './ThemeContext';
import { sounds } from '../sounds';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';
type PomodoroStatus = 'idle' | 'running' | 'paused';

const DEFAULT_FOCUS_DURATION = 25 * 60;

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

export const usePomodoro = () => {
    const context = useContext(PomodoroContext);
    if (!context) {
        throw new Error('usePomodoro must be used within a PomodoroProvider');
    }
    return context;
};

export const PomodoroProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { addNotification, soundEnabled, hapticsEnabled } = useUI(); // <--- IMPORTADO hapticsEnabled
    const { activeSoundId, setPontosFoco } = useTheme();

    const [pomodorosCompleted, setPomodorosCompleted] = useLocalStorage('focusfrog_pomodorosCompleted', 0);
    const [pomodorosInCycle, setPomodorosInCycle] = useLocalStorage('focusfrog_pomodorosInCycle', 0);
    const [timerMode, setTimerMode] = useState<TimerMode>('focus');
    const [status, setStatus] = useState<PomodoroStatus>('idle');
    const [timeRemaining, setTimeRemaining] = useState(DEFAULT_FOCUS_DURATION);
    const [sessionDuration, setSessionDuration] = useLocalStorage<number>('focusfrog_sessionDuration', DEFAULT_FOCUS_DURATION);
    const [distractionNotes, setDistractionNotes] = useState('');
    const [activeTaskId, setActiveTaskId] = useLocalStorage<string | null>('focusfrog_activeTaskId', null);
    const [activeTaskTitle, setActiveTaskTitle] = useLocalStorage<string | null>('focusfrog_activeTaskTitle', null);
    const [activeSubtaskId, setActiveSubtaskId] = useLocalStorage<string | null>('focusfrog_activeSubtaskId', null);
    const [activeSubtaskTitle, setActiveSubtaskTitle] = useLocalStorage<string | null>('focusfrog_activeSubtaskTitle', null);
    const [lastCompletedFocus, setLastCompletedFocus] = useState<{taskId: string | null, subtaskId: string | null} | null>(null);

    const audioContextRef = useRef<AudioContext | null>(null);
    const backgroundSoundSourceRef = useRef<AudioScheduledSourceNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const localTimerRef = useRef<number | null>(null);
    const activeSubtaskIdRef = useRef(activeSubtaskId);
    useEffect(() => { activeSubtaskIdRef.current = activeSubtaskId; }, [activeSubtaskId]);

    const isActive = status === 'running';

    const getAudioContext = useCallback(() => {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return null;
        if (!audioContextRef.current) {
            audioContextRef.current = new AudioContextClass();
        }
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume().catch(e => console.error("Could not resume audio context", e));
        }
        return audioContextRef.current;
    }, []);

    const playSound = useCallback((type: 'start' | 'end') => {
        if (!soundEnabled) return; // <--- ADICIONADA VERIFICAÇÃO DE SOM
        try {
            const context = getAudioContext();
            if (!context) return;
            const oscillator = context.createOscillator();
            const gainNode = context.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(context.destination);
            const now = context.currentTime;
            gainNode.gain.setValueAtTime(0.15, now);
            if (type === 'start') {
                oscillator.frequency.setValueAtTime(440, now);
                oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.1);
            } else {
                oscillator.frequency.setValueAtTime(880, now);
                oscillator.frequency.exponentialRampToValueAtTime(440, now + 0.2);
            }
            oscillator.start(now);
            oscillator.stop(now + 0.3);
        } catch (e) { console.error("Audio play failed", e); }
    }, [getAudioContext, soundEnabled]);

    const stopBackgroundSound = useCallback((fade = false) => {
        if (backgroundSoundSourceRef.current && audioContextRef.current && gainNodeRef.current) {
            const source = backgroundSoundSourceRef.current;
            const context = audioContextRef.current;
            const gainNode = gainNodeRef.current;
            try {
                if (fade) {
                    const now = context.currentTime;
                    gainNode.gain.cancelScheduledValues(now);
                    gainNode.gain.setValueAtTime(gainNode.gain.value, now);
                    gainNode.gain.linearRampToValueAtTime(0, now + 1.0);
                    setTimeout(() => { try { source.stop(); } catch (e) { } }, 1100);
                } else {
                    source.stop();
                }
            } catch (e) { /* Ignore */ }
            backgroundSoundSourceRef.current = null;
        }
    }, []);

    const playBackgroundSound = useCallback((fade = false) => {
        stopBackgroundSound(false);
        if (soundEnabled && activeSoundId !== 'none' && sounds[activeSoundId]) { // <--- ADICIONADA VERIFICAÇÃO DE SOM
            try {
                const context = getAudioContext();
                if (!context) return;
                const gainNode = context.createGain();
                const source = sounds[activeSoundId].generator(context, gainNode);
                gainNode.connect(context.destination);
                const now = context.currentTime;
                if (fade) {
                    gainNode.gain.setValueAtTime(0, now);
                    gainNode.gain.linearRampToValueAtTime(0.4, now + 2.0);
                } else {
                    gainNode.gain.setValueAtTime(0.4, now);
                }
                source.start(now);
                backgroundSoundSourceRef.current = source;
                gainNodeRef.current = gainNode;
            } catch (error) { console.error("Error generating sound:", error); }
        }
    }, [activeSoundId, stopBackgroundSound, getAudioContext, soundEnabled]);

    const postCommandToSW = useCallback((type: string, payload?: any) => {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ type, payload });
        } else {
            navigator.serviceWorker.ready.then(registration => {
                registration.active?.postMessage({ type, payload });
            });
        }
    }, []);

    const handleCycleCompletionUI = useCallback((prevMode: TimerMode) => {
        if (prevMode === 'focus') {
            setPomodorosCompleted(p => p + 1);
            setPontosFoco(p => p + 25);
            addNotification('Foco concluído Hora de fazer uma pausa', '🏆', 'victory');
            
            if (activeTaskId && activeSubtaskIdRef.current) {
                setLastCompletedFocus({ taskId: activeTaskId, subtaskId: activeSubtaskIdRef.current });
            }

            setDistractionNotes('');
            setActiveTaskId(null);
            setActiveTaskTitle(null);
            setActiveSubtaskId(null);
            setActiveSubtaskTitle(null);
        } else {
            addNotification('Pausa concluída Hora de focar', '💪', 'success');
        }
        playSound('end');
        if (hapticsEnabled && navigator.vibrate) { // <--- ADICIONADA VERIFICAÇÃO DE VIBRAÇÃO
            navigator.vibrate([200, 100, 200]); // Um padrão para fim de ciclo
        }
        stopBackgroundSound(true);
    }, [addNotification, playSound, setPomodorosCompleted, setPontosFoco, stopBackgroundSound, activeTaskId, setActiveTaskId, setActiveTaskTitle, setActiveSubtaskId, setActiveSubtaskTitle, hapticsEnabled]); // <--- ADICIONADA DEPENDÊNCIA

    const uiCallbackRef = useRef(handleCycleCompletionUI);
    useEffect(() => { uiCallbackRef.current = handleCycleCompletionUI; }, [handleCycleCompletionUI]);

    useEffect(() => {
        const handleSWMessage = (event: MessageEvent) => {
            const { type, timeRemaining: swTime, timerMode: swMode, status: swStatus, pomodorosInCycle: swPoms } = event.data;

            const isValidNumber = (val: any): val is number => typeof val === 'number' && isFinite(val);

            if (type === 'TIMER_STATE') {
                if (timerMode !== swMode && isValidNumber(swTime)) {
                    setSessionDuration(swTime);
                }
                if (isValidNumber(swTime)) {
                    if (swStatus !== 'running' || Math.abs(swTime - timeRemaining) > 1) {
                        setTimeRemaining(swTime);
                    }
                }
                if (swMode) setTimerMode(swMode);
                if (swStatus) setStatus(swStatus);
                if (isValidNumber(swPoms)) setPomodorosInCycle(swPoms);

            } else if (type === 'CYCLE_END') {
                uiCallbackRef.current(timerMode);
            }
        };

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', handleSWMessage);
            postCommandToSW('SYNC_STATE');
            postCommandToSW('SET_CYCLE_COUNT', pomodorosInCycle);
        }

        return () => {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.removeEventListener('message', handleSWMessage);
            }
        };
    }, [postCommandToSW, timerMode, pomodorosInCycle, timeRemaining]); 

    useEffect(() => {
        if (status === 'running') {
            localTimerRef.current = window.setInterval(() => setTimeRemaining(prev => Math.max(0, prev - 1)), 1000);
        } else {
            if (localTimerRef.current) clearInterval(localTimerRef.current);
        }
        return () => { if (localTimerRef.current) clearInterval(localTimerRef.current); };
    }, [status]);

    const clearLastCompletedFocus = useCallback(() => setLastCompletedFocus(null), []);

    const clearActiveSubtask = useCallback(() => {
        setActiveSubtaskId(null);
        setActiveSubtaskTitle(null);
    }, [setActiveSubtaskId, setActiveSubtaskTitle]);

    const startCycle = useCallback(() => {
        if (activeTaskId) {
            setActiveTaskId(null);
            setActiveTaskTitle(null);
            setActiveSubtaskId(null);
            setActiveSubtaskTitle(null);
        }
        const newDurationInSeconds = DEFAULT_FOCUS_DURATION;
        setTimeRemaining(newDurationInSeconds);
        setSessionDuration(newDurationInSeconds);

        const ctx = getAudioContext();
        if (ctx && ctx.state === 'suspended') ctx.resume();
        playSound('start');
        playBackgroundSound(true);
        setStatus('running');
        postCommandToSW('START_TIMER');
    }, [playSound, playBackgroundSound, postCommandToSW, getAudioContext, activeTaskId, setActiveTaskId, setActiveTaskTitle, setActiveSubtaskId, setActiveSubtaskTitle]);

    const pauseCycle = useCallback(() => {
        stopBackgroundSound(true);
        setStatus('paused');
        postCommandToSW('PAUSE_TIMER');
    }, [stopBackgroundSound, postCommandToSW]);

    const resumeCycle = useCallback(() => {
        const ctx = getAudioContext();
        if (ctx && ctx.state === 'suspended') ctx.resume();
        playSound('start');
        playBackgroundSound(true);
        setStatus('running');
        postCommandToSW('START_TIMER');
    }, [playSound, playBackgroundSound, postCommandToSW, getAudioContext]);

    const stopCycle = useCallback(() => {
        stopBackgroundSound();
        setStatus('idle');
        setTimeRemaining(DEFAULT_FOCUS_DURATION);
        setSessionDuration(DEFAULT_FOCUS_DURATION);
        postCommandToSW('STOP_TIMER');
        postCommandToSW('SET_FOCUS_DURATION', DEFAULT_FOCUS_DURATION / 60);
        setActiveTaskId(null);
        setActiveTaskTitle(null);
        setActiveSubtaskId(null);
        setActiveSubtaskTitle(null);
    }, [stopBackgroundSound, postCommandToSW, setActiveTaskId, setActiveTaskTitle, setActiveSubtaskId, setActiveSubtaskTitle]);

    const startFocusOnTask = useCallback((taskId: string, taskTitle: string, duration?: number, subtaskId: string | null = null, subtaskTitle: string | null = null) => {
        stopBackgroundSound(false);
        postCommandToSW('STOP_TIMER');

        const newDurationInMinutes = duration || (DEFAULT_FOCUS_DURATION / 60);
        const newDurationInSeconds = newDurationInMinutes * 60;

        postCommandToSW('SET_FOCUS_DURATION', newDurationInMinutes);
        setTimeRemaining(newDurationInSeconds);
        setSessionDuration(newDurationInSeconds);

        setActiveTaskId(taskId);
        setActiveTaskTitle(taskTitle);
        setActiveSubtaskId(subtaskId);
        setActiveSubtaskTitle(subtaskTitle);
        
        const notificationTitle = subtaskTitle ? `${taskTitle}: ${subtaskTitle}` : taskTitle;
        addNotification(`Focando em ${notificationTitle}`, '🎯', 'success');

        setTimerMode('focus');
        setStatus('running');

        const ctx = getAudioContext();
        if (ctx && ctx.state === 'suspended') ctx.resume();

        playSound('start');
        playBackgroundSound(true);
        postCommandToSW('START_TIMER');
    }, [addNotification, getAudioContext, playBackgroundSound, playSound, postCommandToSW, stopBackgroundSound, setActiveTaskId, setActiveTaskTitle, setActiveSubtaskId, setActiveSubtaskTitle]);

    const skipBreak = useCallback(() => {
        stopBackgroundSound();
        postCommandToSW('SKIP_BREAK');
    }, [stopBackgroundSound, postCommandToSW]);

    const endCycleAndStartNext = useCallback(() => {
        stopBackgroundSound();
        postCommandToSW('SKIP_CYCLE');
    }, [stopBackgroundSound, postCommandToSW]);

    const setFocusDuration = useCallback((minutes: number) => {
        const newDurationInSeconds = minutes * 60;
        postCommandToSW('SET_FOCUS_DURATION', minutes);
        setStatus('idle');
        setTimerMode('focus');
        setTimeRemaining(newDurationInSeconds);
        setSessionDuration(newDurationInSeconds);
    }, [postCommandToSW]);

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
        skipBreak,
        endCycleAndStartNext,
        setFocusDuration
    };

    return <PomodoroContext.Provider value={value}>{children}</PomodoroContext.Provider>;
};