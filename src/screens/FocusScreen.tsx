
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
    const { tasks, handleCompleteTask: completeTaskAction } = useTasks();
    const {
        timerMode, 
        status,
        timeRemaining, 
        sessionDuration,
        activeTaskId,
        activeTaskTitle, // Título da tarefa principal já vem do PomodoroContext
        activeSubtaskTitle, // Título da subtarefa também já vem do PomodoroContext
        resumeCycle, 
        pauseCycle, 
        stopCycle,
    } = usePomodoro();

    const isMobile = useMediaQuery('(max-width: 768px)');
    const auraSize = isMobile ? 280 : 320;
    const frogSize = isMobile ? 100 : 120;

    const activeTask = useMemo(() => tasks.find(t => t.id === activeTaskId), [tasks, activeTaskId]);

    const handleCompleteTask = () => {
        if (activeTaskId) {
            completeTaskAction(activeTaskId);
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

                {/* Bloco 1: "Mini Card" de Foco - Reutiliza o estilo do titleContainer */}
                <div className={styles.titleContainer}>
                    <p>Focando em:</p>
                    {/* Mostra o título da tarefa principal, ou "Foco Geral" se não houver */}
                    <h2>{activeTaskTitle || 'Foco Geral'}</h2>
                    {/* Se houver uma subtarefa ativa, mostra seu título */}
                    {activeSubtaskTitle && (
                        <p className={styles.subtaskTitle}>{activeSubtaskTitle}</p>
                    )}
                </div>

                {/* Bloco 2: Santuário Zen (Sapo e Timer) - Sem alterações */}
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

                {/* Bloco 3: Controles - Sem alterações */}
                <div className={styles.controlsContainer}>
                    <div className={styles.footerActionLeft}>
                    { (status === 'running' || status === 'paused') && (
                        <button 
                            className={`btn ${styles.secondaryActionButton}`}
                            onClick={stopCycle}
                            aria-label="Parar ciclo"
                        >
                            <Icon path={icons.square} />
                        </button>
                    )}
                    </div>

                    <div className={styles.mainActions}>
                        {status === 'running' ? (
                            <button className={`btn btn-primary ${styles.mainActionButton}`} onClick={pauseCycle} aria-label="Pausar ciclo">
                                <Icon path={icons.pause} />
                            </button>
                        ) : (
                            <button 
                                className={`btn btn-primary ${styles.mainActionButton}`} 
                                onClick={resumeCycle}
                                aria-label={status === 'paused' ? 'Continuar ciclo' : 'Iniciar ciclo'}
                            >
                                <Icon path={icons.play} />
                            </button>
                        )}
                    </div>

                    <div className={styles.footerActionRight}>
                        {activeTask && timerMode === 'focus' && status !== 'finished' ? (
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
