
import React, { useMemo, useState, useEffect } from 'react';
import { usePomodoro } from '../context/PomodoroContext';
import { useTasks } from '../context/TasksContext';
import { useUI } from '../context/UIContext';
import { Icon } from '../components/Icon';
import { icons } from '../components/Icons';
import styles from './FocusScreen.module.css';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { Aura } from '../components/Aura';
import { FocusFrogCharacter } from '../components/FocusFrogCharacter';

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

export const FocusScreen: React.FC = () => {
    const { setShowFocusScreen } = useUI();
    const { tasks, completeTask } = useTasks();
    const {
        timerMode, 
        status,
        timeRemaining, 
        sessionDuration,
        activeTaskId,
        activeSubtaskTitle,
        startCycle, 
        pauseCycle,
        resumeCycle, 
        stopCycle,
    } = usePomodoro();

    const isMobile = useMediaQuery('(max-width: 768px)');
    const auraSize = isMobile ? 280 : 320;
    const frogSize = isMobile ? 100 : 120;

    const activeTask = useMemo(() => tasks.find(t => t.id === activeTaskId), [tasks, activeTaskId]);
    const displayTitle = activeTask?.title || 'Foco Geral';

    const handleCompleteTask = () => {
        if (activeTaskId) {
            completeTask(activeTaskId);
            stopCycle();
            setShowFocusScreen(false);
        }
    };
    
    const progress = sessionDuration > 0 ? (timeRemaining / sessionDuration) * 100 : 0;

    const [frogStatus, setFrogStatus] = useState<'idle' | 'meditating' | 'happy'>('idle');

    useEffect(() => {
        if (status === 'running') {
            setFrogStatus('meditating');
        } else if (status === 'finished') {
            setFrogStatus('happy');
            const timer = setTimeout(() => setFrogStatus('idle'), 2500);
            return () => clearTimeout(timer);
        } else {
            setFrogStatus('idle');
        }
    }, [status]);

    return (
        <main className={`${styles.focusScreen} ${styles['cycle-' + timerMode]}`}>
            <div className={styles.screenContent}>

                <div className={styles.titleContainer}>
                    <p>Focando em:</p>
                    <h2>{displayTitle}</h2>
                    {activeSubtaskTitle && (
                        <p className={styles.subtaskTitle}>{activeSubtaskTitle}</p>
                    )}
                </div>

                <div className={styles.zenSanctuary}>
                    <Aura 
                        progress={progress} 
                        size={auraSize}
                        mode={timerMode}
                    />
                    <div className={styles.zenElements}>
                        <div className={styles.characterContainer}>
                            <FocusFrogCharacter status={frogStatus} size={frogSize} />
                        </div>
                        <div className={styles.timerTime}>{formatTime(timeRemaining)}</div>
                    </div>
                </div>

                <div className={styles.controlsContainer}>
                    <div className={styles.footerActionLeft}>
                    { (status === 'running' || status === 'paused') && (
                        // FIX: Tooltip removido
                        <button 
                            className={`btn ${styles.secondaryActionButton}`}
                            onClick={stopCycle}
                            aria-label="Parar ciclo"
                        >
                            {/* FIX: Ícone melhorado para "Parar" */}
                            <Icon path={icons.square} />
                        </button>
                    )}
                    </div>

                    <div className={styles.mainActions}>
                        {status === 'running' ? (
                            // FIX: Tooltip removido
                            <button className={`btn btn-primary ${styles.mainActionButton}`} onClick={pauseCycle} aria-label="Pausar ciclo">
                                <Icon path={icons.pause} />
                            </button>
                        ) : (
                            // FIX: Tooltip removido
                            <button 
                                className={`btn btn-primary ${styles.mainActionButton}`} 
                                onClick={status === 'paused' ? resumeCycle : startCycle}
                                aria-label={status === 'paused' ? 'Continuar ciclo' : 'Iniciar ciclo'}
                            >
                                <Icon path={icons.play} />
                            </button>
                        )}
                    </div>

                    <div className={styles.footerActionRight}>
                        {activeTask && !activeTask.completed ? (
                            // FIX: Tooltip removido
                            <button className={`btn ${styles.secondaryActionButton}`} onClick={handleCompleteTask} aria-label="Concluir tarefa">
                                <Icon path={icons.checkCircle} />
                            </button>
                        ) : (
                            <div className={styles.timerCycle}>{CYCLE_LABELS[timerMode]}</div>
                        )}
                    </div>
                </div>

            </div>
        </main>
    );
};
