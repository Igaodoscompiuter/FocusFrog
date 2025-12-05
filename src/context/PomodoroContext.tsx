
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { PluginListenerHandle } from '@capacitor/core/dist/esm/web/plugin';
import BackgroundTimer from '../plugins/background-timer';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useUI } from './UIContext';
import { useTheme } from './ThemeContext';
import { sounds } from '../sounds';
import { showNotification, closeNotification } from '../utils/notifications';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';
type PomodoroStatus = 'idle' | 'running' | 'paused' | 'finished';

const DEFAULT_FOCUS_DURATION = 25 * 60;
const NOTIFICATION_TAG = 'pomodoro-status';

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
    const { addNotification, soundEnabled, hapticsEnabled } = useUI();
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
    const isNative = Capacitor.isNativePlatform();

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
        if (!soundEnabled) return;
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
        if (soundEnabled && activeSoundId !== 'none' && sounds[activeSoundId]) {
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

    const handleCycleCompletionUI = useCallback(async (prevMode: TimerMode) => {
        await closeNotification(NOTIFICATION_TAG);
        if (prevMode === 'focus') {
            setPomodorosCompleted(p => p + 1);
            setPontosFoco(p => p + 25);
            const msg = 'Foco concluído! Hora de uma pausa.';
            addNotification(msg, '🏆', 'victory');
            showNotification(msg, { body: 'Bom trabalho! Clique para iniciar sua pausa.', tag: 'pomodoro-finished' });
            if (activeTaskId && activeSubtaskIdRef.current) {
                setLastCompletedFocus({ taskId: activeTaskId, subtaskId: activeSubtaskIdRef.current });
            }
            setDistractionNotes('');
            setActiveTaskId(null); setActiveTaskTitle(null); setActiveSubtaskId(null); setActiveSubtaskTitle(null);
        } else {
            const msg = 'Pausa concluída! Hora de focar.';
            addNotification(msg, '💪', 'success');
            showNotification(msg, { body: 'Clique para iniciar seu próximo ciclo de foco.', tag: 'pomodoro-finished' });
        }
        playSound('end');
        if (hapticsEnabled && navigator.vibrate) navigator.vibrate([200, 100, 200]);
        stopBackgroundSound(true);
    }, [addNotification, playSound, hapticsEnabled, stopBackgroundSound, setPomodorosCompleted, setPontosFoco, activeTaskId, setActiveTaskId, setActiveTaskTitle, setActiveSubtaskId, setActiveSubtaskTitle]);

    const uiCallbackRef = useRef(handleCycleCompletionUI);
    useEffect(() => { uiCallbackRef.current = handleCycleCompletionUI; }, [handleCycleCompletionUI]);

    useEffect(() => {
        if (isNative) {
             let tickListener: PluginListenerHandle | null = null;
            let finishListener: PluginListenerHandle | null = null;

            const setupNativeListeners = async () => {
                tickListener = await BackgroundTimer.addListener('onTick', (data) => {
                    setTimeRemaining(data.remainingTime);
                });
                finishListener = await BackgroundTimer.addListener('onFinish', () => {
                    uiCallbackRef.current(timerMode);
                    setStatus('finished');
                });
            };
            setupNativeListeners();
            return () => {
                tickListener?.remove();
                finishListener?.remove();
            };
        } else {
            const handleSWMessage = (event: MessageEvent) => {
                const { type, timeRemaining: swTime, timerMode: swMode, status: swStatus } = event.data;
                if (type === 'TIMER_STATE') {
                     if (swStatus !== 'running' || Math.abs(swTime - timeRemaining) > 2) {
                        setTimeRemaining(swTime);
                    }
                    if (timerMode !== swMode) setSessionDuration(swTime);
                    setTimerMode(swMode);
                    setStatus(swStatus);
                } else if (type === 'CYCLE_END') {
                    uiCallbackRef.current(timerMode);
                }
            };
            navigator.serviceWorker.addEventListener('message', handleSWMessage);
            postCommandToSW('SYNC_STATE');

            if (status === 'running') {
                localTimerRef.current = window.setInterval(() => setTimeRemaining(prev => Math.max(0, prev - 1)), 1000);
            } else {
                if (localTimerRef.current) clearInterval(localTimerRef.current);
            }
            return () => {
                navigator.serviceWorker.removeEventListener('message', handleSWMessage);
                if (localTimerRef.current) clearInterval(localTimerRef.current);
            };
        }
    }, [isNative, status, timerMode, timeRemaining]);

    const postCommandToSW = useCallback((type: string, payload?: any) => {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ type, payload });
        }
    }, []);

    const startCycleLogic = async (duration: number, title: string, body: string) => {
        setTimeRemaining(duration);
        setSessionDuration(duration);
        if (isNative) {
            BackgroundTimer.start({ duration });
        } else {
            postCommandToSW('SET_FOCUS_DURATION', duration / 60);
            postCommandToSW('START_TIMER');
            await showNotification(title, { body, tag: NOTIFICATION_TAG, renotify: false, silent: true });
        }
        setStatus('running');
        playSound('start');
        playBackgroundSound(true);
    };

    const startCycle = useCallback(() => {
        if (activeTaskId) {
            setActiveTaskId(null); setActiveTaskTitle(null); setActiveSubtaskId(null); setActiveSubtaskTitle(null);
        }
        startCycleLogic(DEFAULT_FOCUS_DURATION, 'Foco Geral Ativado', `Próximos ${DEFAULT_FOCUS_DURATION / 60} minutos de foco intenso.`);
    }, [activeTaskId, setActiveTaskId, setActiveTaskTitle, setActiveSubtaskId, setActiveSubtaskTitle, isNative, playSound, playBackgroundSound, postCommandToSW]);

    const startFocusOnTask = useCallback(async (taskId: string, taskTitle: string, duration?: number, subtaskId: string | null = null, subtaskTitle: string | null = null) => {
        const newDurationInSeconds = (duration || DEFAULT_FOCUS_DURATION / 60) * 60;
        setActiveTaskId(taskId); setActiveTaskTitle(taskTitle); setActiveSubtaskId(subtaskId); setActiveSubtaskTitle(subtaskTitle);
        setTimerMode('focus');
        addNotification(`Focando em ${taskTitle}`, '🎯', 'success');
        await startCycleLogic(newDurationInSeconds, `Focando em: ${taskTitle}`, `Você tem ${newDurationInSeconds / 60} minutos dedicados a esta tarefa.`);
    }, [addNotification, setActiveTaskId, setActiveTaskTitle, setActiveSubtaskId, setActiveSubtaskTitle, isNative, playSound, playBackgroundSound, postCommandToSW]);

    const pauseCycle = useCallback(async () => {
        if (isNative) {
            BackgroundTimer.stop();
        } else {
            postCommandToSW('PAUSE_TIMER');
            await showNotification('Pomodoro Pausado', { body: 'Sua sessão de foco está em pausa. Clique para retomar.', tag: NOTIFICATION_TAG, renotify: true });
        }
        setStatus('paused');
        stopBackgroundSound(true);
    }, [isNative, stopBackgroundSound, postCommandToSW]);

    const resumeCycle = useCallback(() => {
        startCycleLogic(timeRemaining, `Retomando Foco: ${activeTaskTitle || 'Foco Geral'}`, `Restam ${Math.ceil(timeRemaining / 60)} minutos.`);
    }, [timeRemaining, activeTaskTitle, isNative, playSound, playBackgroundSound, postCommandToSW]);

    const stopCycle = useCallback(async () => {
        if (isNative) {
            BackgroundTimer.stop();
        } else {
            postCommandToSW('STOP_TIMER');
            await closeNotification(NOTIFICATION_TAG);
        }
        setStatus('idle');
        setTimeRemaining(DEFAULT_FOCUS_DURATION);
        setSessionDuration(DEFAULT_FOCUS_DURATION);
        stopBackgroundSound();
        setActiveTaskId(null); setActiveTaskTitle(null); setActiveSubtaskId(null); setActiveSubtaskTitle(null);
    }, [isNative, stopBackgroundSound, postCommandToSW, setActiveTaskId, setActiveTaskTitle, setActiveSubtaskId, setActiveSubtaskTitle]);

    const skipBreak = useCallback(() => !isNative && postCommandToSW('SKIP_BREAK'), [isNative, postCommandToSW]);
    const endCycleAndStartNext = useCallback(() => !isNative && postCommandToSW('SKIP_CYCLE'), [isNative, postCommandToSW]);
    const setFocusDuration = useCallback((minutes: number) => {
        const newDuration = minutes * 60;
        if (!isNative) postCommandToSW('SET_FOCUS_DURATION', minutes);
        setStatus('idle');
        setTimerMode('focus');
        setTimeRemaining(newDuration);
        setSessionDuration(newDuration);
    }, [isNative, postCommandToSW]);

    const clearLastCompletedFocus = useCallback(() => setLastCompletedFocus(null), []);
    const clearActiveSubtask = useCallback(() => {
        setActiveSubtaskId(null);
        setActiveSubtaskTitle(null);
    }, [setActiveSubtaskId, setActiveSubtaskTitle]);

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