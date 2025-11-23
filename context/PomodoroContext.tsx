
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
    pomodorosInCycle: number; // Exposed to UI
    timerMode: TimerMode;
    status: PomodoroStatus;
    isActive: boolean;
    timeRemaining: number;
    distractionNotes: string; // New: Persist notes
    setDistractionNotes: (notes: string) => void; // New: Setter
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
    const { addNotification } = useUI();
    const { activeSoundId, setPontosFoco } = useTheme();

    const [pomodorosCompleted, setPomodorosCompleted] = useLocalStorage('focusfrog_pomodorosCompleted', 0);
    // Store local cycle state to persist on refresh, though SW is truth source for timing
    const [pomodorosInCycle, setPomodorosInCycle] = useLocalStorage('focusfrog_pomodorosInCycle', 0);
    const [timerMode, setTimerMode] = useState<TimerMode>('focus');
    const [status, setStatus] = useState<PomodoroStatus>('idle');
    const [timeRemaining, setTimeRemaining] = useState(DEFAULT_FOCUS_DURATION);
    const [distractionNotes, setDistractionNotes] = useState(''); // Global state for session notes
    
    const audioContextRef = useRef<AudioContext | null>(null);
    const backgroundSoundSourceRef = useRef<AudioScheduledSourceNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const localTimerRef = useRef<number | null>(null);

    const isActive = status === 'running';

    // --- Audio Logic ---
    
    // Helper to get or create AudioContext and ensure it's running
    const getAudioContext = useCallback(() => {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return null;
        
        if (!audioContextRef.current) {
            audioContextRef.current = new AudioContextClass();
        }
        
        const context = audioContextRef.current;
        // Important: Resume context if suspended (browser autoplay policy)
        if (context.state === 'suspended') {
            context.resume().catch(e => console.error("Could not resume audio context", e));
        }
        return context;
    }, []);

    const playSound = useCallback((type: 'start' | 'end') => {
        try {
            const context = getAudioContext();
            if (!context) return;
            
            const oscillator = context.createOscillator();
            const gainNode = context.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(context.destination);
            
            // Sound Design for Beeps
            const now = context.currentTime;
            gainNode.gain.setValueAtTime(0.15, now);
            
            if (type === 'start') {
                // Rising tone (Positive)
                oscillator.frequency.setValueAtTime(440, now);
                oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.1);
            } else {
                // Falling tone/Chord (Completion)
                oscillator.frequency.setValueAtTime(880, now);
                oscillator.frequency.exponentialRampToValueAtTime(440, now + 0.2);
            }
            
            oscillator.start(now);
            oscillator.stop(now + 0.3);
        } catch (e) {
            console.error("Audio play failed", e);
        }
    }, [getAudioContext]);
    
    const stopBackgroundSound = useCallback((fade = false) => {
        if (backgroundSoundSourceRef.current && audioContextRef.current && gainNodeRef.current) {
            const source = backgroundSoundSourceRef.current;
            const context = audioContextRef.current;
            const gainNode = gainNodeRef.current;
            try {
                if (fade) {
                    // Fade out logic
                    const now = context.currentTime;
                    gainNode.gain.cancelScheduledValues(now);
                    gainNode.gain.setValueAtTime(gainNode.gain.value, now);
                    gainNode.gain.linearRampToValueAtTime(0, now + 1.0);
                    setTimeout(() => {
                        try { source.stop(); } catch(e){}
                    }, 1100);
                } else {
                    source.stop();
                }
            } catch (e) { /* Ignore already stopped errors */ }
            
            backgroundSoundSourceRef.current = null;
            // Do not nullify gainNodeRef immediately if fading, but simple logic:
            if (!fade) gainNodeRef.current = null;
        }
    }, []);

    const playBackgroundSound = useCallback((fade = false) => {
        stopBackgroundSound(false); // Hard stop previous
        
        // Check if sound is enabled and exists in our library
        if (activeSoundId !== 'none' && sounds[activeSoundId]) {
            try {
                const context = getAudioContext();
                if (!context) return;
                
                const gainNode = context.createGain();
                
                // Generate the sound graph. 
                // Now we pass the gainNode as the destination so the generator can connect filters to it.
                const source = sounds[activeSoundId].generator(context, gainNode);
                
                // Connect master gain to output
                gainNode.connect(context.destination);
                
                const now = context.currentTime;
                if (fade) {
                    gainNode.gain.setValueAtTime(0, now);
                    gainNode.gain.linearRampToValueAtTime(0.4, now + 2.0); // Smooth fade in
                } else {
                    gainNode.gain.setValueAtTime(0.4, now);
                }
                
                source.start(now);
                backgroundSoundSourceRef.current = source;
                gainNodeRef.current = gainNode;
            } catch (error) { console.error("Error generating sound:", error); }
        }
    }, [activeSoundId, stopBackgroundSound, getAudioContext]);

    // --- Service Worker Communication ---
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
            addNotification('Sessão de Foco concluída!', '🏆');
            setDistractionNotes(''); // Clear notes after successful session
        } else {
            addNotification('Pausa concluída! Hora de focar.', '💪');
        }
        playSound('end');
        stopBackgroundSound(true);
    }, [addNotification, playSound, setPomodorosCompleted, setPontosFoco, stopBackgroundSound]);

    // Keep a ref to the callback to prevent useEffect re-binding
    const uiCallbackRef = useRef(handleCycleCompletionUI);
    useEffect(() => { uiCallbackRef.current = handleCycleCompletionUI; }, [handleCycleCompletionUI]);

    // --- Event Listener ---
    useEffect(() => {
        const handleSWMessage = (event: MessageEvent) => {
            const { type, timeRemaining: swTime, timerMode: swMode, status: swStatus, pomodorosInCycle: swPoms, nextMode } = event.data;

            if (type === 'TIMER_STATE') {
                // Update state from SW
                setTimerMode(swMode);
                setStatus(swStatus);
                setPomodorosInCycle(swPoms);
                
                // Only update time if the drift is significant (>1s) or if paused/idle
                if (swStatus !== 'running' || Math.abs(swTime - timeRemaining) > 1) {
                    setTimeRemaining(swTime);
                }
            } else if (type === 'CYCLE_END') {
                // Handle UI side effects
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
    }, [postCommandToSW, timerMode]);

    // --- Local Ticker for Smooth UI ---
    useEffect(() => {
        if (status === 'running') {
            localTimerRef.current = window.setInterval(() => {
                setTimeRemaining(prev => Math.max(0, prev - 1));
            }, 1000);
        } else {
            if (localTimerRef.current) {
                clearInterval(localTimerRef.current);
                localTimerRef.current = null;
            }
        }
        return () => {
            if (localTimerRef.current) {
                clearInterval(localTimerRef.current);
            }
        };
    }, [status]);


    const startCycle = useCallback(() => {
        // Critical: Resume AudioContext on user interaction
        const ctx = getAudioContext();
        if(ctx && ctx.state === 'suspended') ctx.resume();

        playSound('start');
        playBackgroundSound(true);
        setStatus('running'); // Optimistic update
        postCommandToSW('START_TIMER');
    }, [playSound, playBackgroundSound, postCommandToSW, getAudioContext]);

    const pauseCycle = useCallback(() => {
        stopBackgroundSound(true);
        setStatus('paused'); // Optimistic update
        postCommandToSW('PAUSE_TIMER');
    }, [stopBackgroundSound, postCommandToSW]);
    
    const resumeCycle = useCallback(() => {
        // Critical: Resume AudioContext on user interaction
        const ctx = getAudioContext();
        if(ctx && ctx.state === 'suspended') ctx.resume();

        playSound('start');
        playBackgroundSound(true);
        setStatus('running'); // Optimistic update
        postCommandToSW('START_TIMER');
    }, [playSound, playBackgroundSound, postCommandToSW, getAudioContext]);

    const stopCycle = useCallback(() => {
        stopBackgroundSound();
        setStatus('idle'); // Optimistic update
        setTimeRemaining(DEFAULT_FOCUS_DURATION);
        postCommandToSW('STOP_TIMER');
    }, [stopBackgroundSound, postCommandToSW]);
    
    const skipBreak = useCallback(() => {
        stopBackgroundSound();
        postCommandToSW('SKIP_BREAK');
    }, [stopBackgroundSound, postCommandToSW]);
    
    const endCycleAndStartNext = useCallback(() => {
        stopBackgroundSound();
        postCommandToSW('SKIP_CYCLE');
    }, [stopBackgroundSound, postCommandToSW]);
    
    const setFocusDuration = useCallback((minutes: number) => {
        postCommandToSW('SET_FOCUS_DURATION', minutes);
        // Force optimistic update immediately to prevent UI lag/flash
        // This ensures "15:00" appears instantly even if SW is slow
        setStatus('idle'); 
        setTimerMode('focus');
        setTimeRemaining(minutes * 60);
    }, [postCommandToSW]);

    const value = {
        pomodorosCompleted,
        pomodorosInCycle,
        timerMode,
        status,
        isActive,
        timeRemaining,
        distractionNotes,
        setDistractionNotes,
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
