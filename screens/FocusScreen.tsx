
import React, { useState, useEffect, useMemo } from 'react';
import { usePomodoro } from '../context/PomodoroContext';
import { useUI } from '../context/UIContext';
import { useTasks } from '../context/TasksContext';
import { Icon } from '../components/Icon';
import { icons } from '../components/Icons';
import { FocusTip } from '../components/focus/FocusTip';
import { FocusCompletionModal } from '../components/modals/FocusCompletionModal';
import styles from './FocusScreen.module.css'; // Usando CSS Modules

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

// Componente interno agora usa CSS Modules
const CycleIndicators = ({ completedCount }: { completedCount: number }) => {
    return (
        <div className={styles.cycleIndicators}>
            {[0, 1, 2, 3].map((index) => (
                <div 
                    key={index} 
                    className={`${styles.cycleDot} ${index < completedCount ? styles.completed : ''}`}
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
    
    // ... (lógica de useEffect e duration continua a mesma)

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
            
            <main className={`${styles.focusScreen} ${styles['cycle-' + timerMode]} ${isImmersiveMode ? styles.immersive : ''}`}>
                {/* Aderindo ao layout global com screen-content */}
                <div className="screen-content">

                    <div className={styles.focusHeaderControls}>
                        <button 
                            className={`btn btn-secondary btn-small ${isImmersiveMode ? styles.activeImmersive : ''}`}
                            onClick={() => setIsImmersiveMode(!isImmersiveMode)}
                            title="Modo Zen"
                        >
                            <Icon path={isImmersiveMode ? icons.minimize : icons.maximize} />
                            {isImmersiveMode ? 'Sair' : 'Modo Zen'}
                        </button>
                    </div>

                    <div className={styles.focusTaskInfo}>
                         {taskInFocus ? (
                        <>
                            <p>Focando em:</p>
                            <h2>{taskTitle}</h2>
                            {subtaskInFocus && <p className={styles.parentTaskName}>de: {taskInFocus.title}</p>}
                        </>
                    ) : (
                        <>
                             <p>Sessão de Foco Livre</p>
                             <h2>Foco Geral</h2>
                        </>
                    )}
                    </div>

                    <div className={styles.timerDisplay}>
                        {status === 'paused' && (
                            <div className={styles.timerPausedOverlay}>
                                <Icon path={icons.pause} />
                                <span>PAUSADO</span>
                            </div>
                        )}
                        <svg className={styles.timerProgressRing} width="300" height="300" viewBox="0 0 300 300">
                            <circle className={styles.timerProgressRingBg} strokeWidth="10" cx="150" cy="150" r="140" />
                            <circle 
                                className={`${styles.timerProgressRingFg} ${isActive ? styles.breathing : ''}`} 
                                strokeWidth="10" 
                                cx="150" 
                                cy="150" 
                                r="140"
                                strokeDasharray={`${2 * Math.PI * 140}`}
                                strokeDashoffset={`${(2 * Math.PI * 140) * (1 - progress / 100)}`}
                                transform="rotate(-90 150 150)"
                            />
                        </svg>
                        <div className={styles.timerTimeDisplay}>
                            <div className={styles.timerTime}>{formatTime(timeRemaining)}</div>
                            <div className={styles.timerCycle}>
                                {isActive && timerMode === 'focus' && <Icon path={icons.zap} className={styles.focusModeIndicator} />}
                                {CYCLE_LABELS[timerMode]}
                            </div>
                            <CycleIndicators completedCount={pomodorosInCycle} />
                        </div>
                    </div>

                    {isActive && (
                        <div className={styles.distractionPadContainer}>
                            {!showDistractionPad && !distractionNotes ? (
                                <button className={styles.distractionPadTrigger} onClick={() => setShowDistractionPad(true)}>
                                    🧠 Pensamento intrusivo? Anote aqui.
                                </button>
                            ) : (
                                <div className={styles.distractionPad}>
                                    <textarea 
                                        placeholder="Tire da cabeça e continue focando..."
                                        value={distractionNotes}
                                        onChange={(e) => setDistractionNotes(e.target.value)}
                                        autoFocus
                                    />
                                    <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                                        <button className="btn btn-secondary btn-small" onClick={() => setShowDistractionPad(false)}>Esconder</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className={styles.focusControls}>
                        <div className={styles.secondaryActions}>
                            <button className="btn btn-secondary" onClick={stopCycle}>
                                <Icon path={icons.rotateCw} />
                                <span>Parar</span>
                            </button>
                        </div>
                        <div className={styles.mainActions}>
                            {status === 'running' ? (
                                <button className="btn btn-primary" onClick={pauseCycle}>
                                    <Icon path={icons.pause} />
                                </button>
                            ) : (
                                <button className="btn btn-primary" onClick={isActive ? resumeCycle : startCycle}>
                                    <Icon path={icons.play} />
                                </button>
                            )}
                        </div>
                        <div className={styles.secondaryActions}></div> {/* Espaçador */}
                    </div>

                    {!isImmersiveMode && <FocusTip isActive={isActive} currentCycle={timerMode} />}
                </div>
            </main>
        </>
    );
};
