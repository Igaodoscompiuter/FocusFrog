import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePomodoro } from '../../context/PomodoroContext';
import styles from './ZenLakeScreen.module.css';
import { Icon } from '../../components/Icon';
import { icons } from '../../components/Icons';
import { FocusFrogLifeCycle } from '../../components/FocusFrogLifeCycle';
import { ProgressRing } from '../../components/ProgressRing';
import { Lake } from '../../components/Lake'; // Importando o novo componente Lake

const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const ZenLakeScreen: React.FC = () => {
    const {
        sessionStatus,
        activeTaskTitle,
        timeRemaining,
        isPaused,
        focusDuration,
        breakDuration,
        resumeCycle,
        pauseCycle,
        stopCycle,
        completeTask,
    } = usePomodoro();

    const totalDuration = sessionStatus === 'focus' ? focusDuration : breakDuration;
    const progress = totalDuration > 0 ? (totalDuration - timeRemaining) / totalDuration : 0;

    const currentFrogSpecies = 'JUNGLE';

    return (
        <motion.main
            className={`${styles.lakeScreen} ${styles[sessionStatus]}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
        >
            <div className={styles.focusPanel}>
                <div className={styles.taskCard}>
                    {sessionStatus === 'focus' ? (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTaskTitle || 'no-task'}
                                className={styles.taskContent}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ duration: 0.3 }}
                            >
                                <span className={styles.taskLabel}>FOCANDO EM:</span>
                                <span className={styles.taskTitleText}>
                                    {activeTaskTitle || 'Sessão Livre'}
                                </span>
                            </motion.div>
                        </AnimatePresence>
                    ) : (
                        <div className={styles.breakMessage}>Pausa para recarregar.</div>
                    )}
                </div>

                <div className={styles.timerContainer}>
                    <ProgressRing progress={progress} />
                    <Lake /> {/* O laguinho animado como fundo */}
                    <div className={styles.timerContentContainer}>
                        <div className={styles.timerDisplay}>
                            {formatTime(timeRemaining)}
                        </div>
                        <FocusFrogLifeCycle progress={progress} speciesId={currentFrogSpecies} />
                    </div>
                </div>
            </div>

            <div className={styles.controlsZone}>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                    <button className={styles.secondaryActionButton} onClick={stopCycle} aria-label="Parar Sessão">
                        <Icon path={icons.square} />
                    </button>
                </motion.div>

                <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
                    {isPaused ? (
                        <button className={`${styles.mainActionButton} ${styles.play}`} onClick={resumeCycle} aria-label='Continuar ciclo'>
                            <Icon path={icons.play} />
                        </button>
                    ) : (
                        <button className={styles.mainActionButton} onClick={pauseCycle} aria-label="Pausar ciclo">
                            <Icon path={icons.pause} />
                        </button>
                    )}
                </motion.div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                    {isPaused && sessionStatus === 'focus' && activeTaskTitle ? (
                         <button className={styles.secondaryActionButton} onClick={completeTask} aria-label="Concluir tarefa">
                            <Icon path={icons.checkCircle} />
                        </button>
                    ) : (
                        <div className={styles.placeholder} />
                    )}
                </motion.div>
            </div>
        </motion.main>
    );
};
