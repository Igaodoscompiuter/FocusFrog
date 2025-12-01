
import React, { useState, useMemo } from 'react';
import { usePomodoro } from '../context/PomodoroContext';
import { useTasks } from '../context/TasksContext';
import { useUI } from '../context/UIContext';
import { Icon } from '../components/Icon';
import { icons } from '../components/Icons';
import { FocusTip } from '../components/focus/FocusTip';
import styles from './FocusScreen.module.css';

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
    const { isImmersiveMode, setIsImmersiveMode } = useUI();
    const { handleToggleSubtask } = useTasks();
    const {
        timerMode, 
        status,
        isActive,
        timeRemaining, 
        sessionDuration,
        pomodorosInCycle,
        activeTaskId,
        activeTaskTitle,
        activeSubtaskId,
        activeSubtaskTitle,
        startCycle, 
        pauseCycle,
        resumeCycle, 
        stopCycle, // Mantido para o botão de parada geral
        distractionNotes,
        setDistractionNotes
    } = usePomodoro();
    
    const [showDistractionPad, setShowDistractionPad] = useState(false);

    const progress = useMemo(() => {
        if (sessionDuration === 0) return 0;
        return Math.min(100, Math.max(0, (sessionDuration - timeRemaining) / sessionDuration * 100));
    }, [timeRemaining, sessionDuration]);

    const displayTitle = useMemo(() => {
        if (activeTaskTitle && activeSubtaskTitle) {
            return `${activeTaskTitle}: ${activeSubtaskTitle}`;
        }
        if (activeTaskTitle) {
            return activeTaskTitle;
        }
        return 'Foco Geral';
    }, [activeTaskTitle, activeSubtaskTitle]);

    // CORREÇÃO: Ação do botão simplificada. Apenas conclui a subtarefa.
    // O TasksContext agora é responsável por parar o timer.
    const handleCompleteSubtask = () => {
        if (activeTaskId && activeSubtaskId) {
            handleToggleSubtask(activeTaskId, activeSubtaskId);
        }
    };

    return (
        <>
            <main className={`${styles.focusScreen} ${styles['cycle-' + timerMode]} ${isImmersiveMode ? styles.immersive : ''}`}>
                <div className="screen-content">

                    <div className={styles.focusHeaderControls}>{/* ... */}</div>

                    <div className={styles.focusTaskInfo}>
                         {activeTaskTitle ? (
                        <>
                            <p>Focando em:</p>
                            <h2>{displayTitle}</h2>
                            {/* CORREÇÃO: Botão atualizado */}
                            {activeSubtaskId && status === 'running' && (
                                <button 
                                    className={`btn btn-secondary btn-small ${styles.completeSubtaskBtn}`}
                                    onClick={handleCompleteSubtask} // Ação simplificada
                                >
                                    <Icon path={icons.check} />
                                    Concluir Subtarefa
                                </button>
                            )}
                        </>
                    ) : (
                        <>
                             <p>Sessão de Foco Livre</p>
                             <h2>{displayTitle}</h2>
                        </>
                    )}
                    </div>

                    <div className={styles.timerDisplay}>{/* ... */}
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
                        <div className={styles.distractionPadContainer}>{/* ... */}</div>
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
                                <button className="btn btn-primary" onClick={status === 'paused' ? resumeCycle : startCycle}>
                                    <Icon path={icons.play} />
                                </button>
                            )}
                        </div>
                        <div className={styles.secondaryActions}></div>
                    </div>

                    {!isImmersiveMode && <FocusTip isActive={isActive} currentCycle={timerMode} />}
                </div>
            </main>
        </>
    );
};