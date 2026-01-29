
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePomodoro } from '../../context/PomodoroContext';
import styles from './ZenLakeScreen.module.css';
import { Icon } from '../../components/Icon';
import { icons } from '../../components/Icons';
import { FocusAura } from '../../components/Aura';
import { ZenFrog } from '../../components/zen/ZenFrog';
import { LotusFlower } from '../../components/zen/LotusFlower';

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

    const focusMinutes = focusDuration / 60;
    const sceneryLevel = React.useMemo(() => {
        if (focusMinutes >= 30) return 2; // Lótus
        return 1; // Apenas o Sapo
    }, [focusMinutes]);

    return (
        <motion.main
            className={`${styles.lakeScreen} ${styles[sessionStatus]}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
        >
            {/* 1. Zona Visual (Topo) */}
            <div className={styles.visualZone}>
                <div className={styles.auraContainer}>
                    <FocusAura progress={progress} />
                </div>
                <ZenFrog />
                
                <AnimatePresence>
                    {sceneryLevel >= 2 && (
                        <>
                            <LotusFlower style={{ position: 'absolute', bottom: '20%', left: '10%' }} delay={1} />
                            <LotusFlower style={{ position: 'absolute', bottom: '20%', right: '10%' }} delay={1.5} />
                        </>
                    )}
                </AnimatePresence>
            </div>

            {/* 2. Zona de Informação (Meio) */}
            <div className={styles.infoZone}>
                <div className={styles.timerDisplay}>
                    {formatTime(timeRemaining)}
                </div>
                <div className={styles.taskTitleCard}>
                     <AnimatePresence mode="wait">
                        <motion.span
                            key={activeTaskTitle || 'no-task'}
                            className={styles.taskTitleText}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.3 }}
                        >
                            {(sessionStatus === 'focus' && activeTaskTitle) || 'Sessão Livre'}
                        </motion.span>
                    </AnimatePresence>
                </div>
            </div>

            {/* 3. Zona de Controles (Base) */}
            <div className={styles.controlsZone}>
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                    <button className={styles.secondaryActionButton} onClick={stopCycle} aria-label="Parar Sessão">
                        <Icon path={icons.square} />
                    </button>
                </motion.div>

                <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
                    {isPaused ? (
                        <button className={styles.mainActionButton} onClick={resumeCycle} aria-label='Continuar ciclo'>
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
