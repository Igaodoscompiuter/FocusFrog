
import React, { useState, useEffect, useMemo } from 'react';
import { usePomodoro } from '../context/PomodoroContext';
import { useUI } from '../context/UIContext';
import { useTasks } from '../context/TasksContext';
import { Icon } from '../components/Icon';
import { icons } from '../components/Icons';
import { FocusTip } from '../components/focus/FocusTip';
import { FocusCompletionModal } from '../components/modals/FocusCompletionModal';

const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const CYCLE_LABELS: Record<ReturnType<typeof usePomodoro>['timerMode'], string> = {
    focus: 'Foco',
    shortBreak: 'Pausa Curta',
    longBreak: 'Pausa Longa',
};

const CycleIndicators = ({ completedCount }: { completedCount: number }) => {
    return (
        <div className="cycle-indicators" style={{ display: 'flex', gap: '8px', marginTop: '0.5rem', justifyContent: 'center' }}>
            {[0, 1, 2, 3].map((index) => (
                <div 
                    key={index} 
                    style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: index < completedCount ? 'var(--primary-color)' : 'transparent',
                        border: '2px solid var(--primary-color)',
                        transition: 'all 0.3s ease'
                    }}
                    title={`Sessão ${index + 1}`}
                />
            ))}
        </div>
    );
};

export const FocusScreen: React.FC = () => {
    const { taskInFocus, subtaskInFocusId, isImmersiveMode, setIsImmersiveMode } = useUI();
    const { handleCompleteTask } = useTasks();
    const { 
        timerMode, 
        status,
        isActive,
        timeRemaining, 
        pomodorosInCycle,
        startCycle, 
        pauseCycle,
        resumeCycle, 
        stopCycle,
        setFocusDuration,
        distractionNotes,
        setDistractionNotes
    } = usePomodoro();
    
    const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
    const [breakModalShown, setBreakModalShown] = useState(false);
    const [showDistractionPad, setShowDistractionPad] = useState(false);

    const subtaskInFocus = useMemo(() => {
        if (!taskInFocus || !subtaskInFocusId) return null;
        return taskInFocus.subtasks?.find(st => st.id === subtaskInFocusId);
    }, [taskInFocus, subtaskInFocusId]);

    const taskTitle = subtaskInFocus ? subtaskInFocus.text : taskInFocus?.title;
    
    useEffect(() => {
        if (taskInFocus?.customDuration) {
            setFocusDuration(taskInFocus.customDuration);
        } else if (taskInFocus) {
            setFocusDuration(25);
        }
    }, [taskInFocus?.id, taskInFocus?.customDuration, setFocusDuration]);
    
    const totalDuration = useMemo(() => {
        if (timerMode === 'shortBreak') return 5 * 60;
        if (timerMode === 'longBreak') return 15 * 60;
        if (taskInFocus?.customDuration) return taskInFocus.customDuration * 60;
        return 25 * 60;
    }, [timerMode, taskInFocus]);

    const progress = Math.min(100, Math.max(0, (totalDuration - timeRemaining) / totalDuration * 100));

    useEffect(() => {
        if (timerMode !== 'focus' && status === 'idle' && !breakModalShown && timeRemaining === totalDuration) {
            if (taskInFocus) {
                setIsCompletionModalOpen(true);
            }
            setBreakModalShown(true);
        }
        if (timerMode === 'focus') {
            setBreakModalShown(false);
        }
    }, [timerMode, status, breakModalShown, timeRemaining, totalDuration, taskInFocus]);

    const handleConfirmCompletion = () => {
        if (taskInFocus) {
            handleCompleteTask(taskInFocus.id, subtaskInFocusId || undefined);
        }
        setIsCompletionModalOpen(false);
    };

    return (
        <>
            {isCompletionModalOpen && taskInFocus && (
                <FocusCompletionModal
                    task={taskInFocus}
                    subtaskId={subtaskInFocusId}
                    onConfirm={handleConfirmCompletion}
                    onDismiss={() => setIsCompletionModalOpen(false)}
                />
            )}
            
            <main className={`focus-screen cycle-${timerMode} ${isImmersiveMode ? 'immersive' : ''}`}>
                <div className="focus-header-controls">
                    <button 
                        className={`control-button secondary small ${isImmersiveMode ? 'active' : ''}`} 
                        onClick={() => setIsImmersiveMode(!isImmersiveMode)}
                        title="Modo Zen (Esconder UI)"
                        style={{
                            backgroundColor: isImmersiveMode ? 'rgba(0,0,0,0.5)' : undefined,
                            color: isImmersiveMode ? 'white' : undefined,
                            backdropFilter: isImmersiveMode ? 'blur(4px)' : undefined
                        }}
                    >
                         <Icon path={isImmersiveMode ? "M4 15h16v-2H4v2zm0 4h16v-2H4v2zm0-8h16V9H4v2zm0-6v2h16V5H4z" : "M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"} />
                         {isImmersiveMode ? 'Sair' : 'Modo Zen'}
                    </button>
                </div>

                <div className="focus-task-info">
                    {taskInFocus ? (
                        <>
                            <p>Focando em:</p>
                            <h2>{taskTitle}</h2>
                            {subtaskInFocus && <p className="parent-task-name">de: {taskInFocus.title}</p>}
                        </>
                    ) : (
                        <>
                             <p>Sessão de Foco Livre</p>
                             <h2>Foco Geral</h2>
                        </>
                    )}
                </div>

                <div className="timer-display">
                    {status === 'paused' && (
                        <div className="timer-paused-overlay">
                            <Icon path={icons.pause} />
                            <span>PAUSADO</span>
                        </div>
                    )}
                    <svg className="timer-progress-ring" width="300" height="300" viewBox="0 0 300 300">
                        <circle className="timer-progress-ring-bg" strokeWidth="10" cx="150" cy="150" r="140" />
                        <circle 
                            className={`timer-progress-ring-fg ${isActive ? 'breathing' : ''}`} 
                            strokeWidth="10" 
                            cx="150" 
                            cy="150" 
                            r="140"
                            strokeDasharray={`${2 * Math.PI * 140}`}
                            strokeDashoffset={`${(2 * Math.PI * 140) * (1 - progress / 100)}`}
                            transform="rotate(-90 150 150)"
                        />
                    </svg>
                    <div className="timer-time-display">
                        <div className="timer-time">{formatTime(timeRemaining)}</div>
                        <div className="timer-cycle">
                            {isActive && timerMode === 'focus' && <Icon path={icons.zap} className="focus-mode-indicator" />}
                            {CYCLE_LABELS[timerMode]}
                        </div>
                        <CycleIndicators completedCount={pomodorosInCycle} />
                    </div>
                </div>

                {/* Distraction Pad Toggle */}
                {isActive && (
                    <div className="distraction-pad-container">
                        {!showDistractionPad && !distractionNotes ? (
                            <button className="distraction-pad-trigger" onClick={() => setShowDistractionPad(true)}>
                                🧠 Pensamento intrusivo? Anote aqui.
                            </button>
                        ) : (
                            <div className="distraction-pad">
                                <textarea 
                                    placeholder="Tire da cabeça e continue focando..."
                                    value={distractionNotes}
                                    onChange={(e) => setDistractionNotes(e.target.value)}
                                    autoFocus
                                />
                                <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                                     <button className="control-button small tertiary" onClick={() => setShowDistractionPad(false)}>Esconder</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="focus-controls">
                    <div className="secondary-actions">
                         <button className="control-button" onClick={stopCycle}>
                            <Icon path={icons.rotateCw} />
                            <span>Parar</span>
                        </button>
                    </div>
                    <div className="main-actions">
                         {status === 'running' ? (
                            <button className="control-button primary" onClick={pauseCycle}>
                                <Icon path={icons.pause} />
                            </button>
                        ) : (
                             <button className="control-button primary" onClick={isActive ? resumeCycle : startCycle}>
                                <Icon path={icons.play} />
                            </button>
                        )}
                    </div>
                    <div className="secondary-actions"></div>
                </div>

                {!isImmersiveMode && <FocusTip isActive={isActive} currentCycle={timerMode} />}
            </main>
        </>
    );
};
