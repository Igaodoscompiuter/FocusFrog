
import React, { useState, useMemo, useCallback } from 'react';
import Balancer from 'react-wrap-balancer';
import { usePomodoro } from '../../context/PomodoroContext';
import { Icon } from '../../components/Icon';
import { icons } from '../../components/Icons';
import styles from './ActiveFocusScreen.module.css';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { Aura } from '../../components/Aura';
import { FocusFrogCharacter } from '../../components/FocusFrogCharacter';
import { useTasks } from '../../context/TasksContext';
import { ConfirmationModal } from '../../components/modals/ConfirmationModal';
import { motivationalQuotes } from '../../utils/quotes';

const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const MemoizedFocusFrogCharacter = React.memo(FocusFrogCharacter);

export const ActiveFocusScreen: React.FC = () => {
    const { handleCompleteTask } = useTasks();
    const { 
        sessionStatus, timeRemaining, focusDuration, breakDuration, activeTaskId, 
        activeTaskTitle, isPaused, currentCycle, totalCycles, mode,
        resumeCycle, pauseCycle, stopCycle 
    } = usePomodoro();

    const [isStopModalOpen, setIsStopModalOpen] = useState(false);
    const [quote] = useState(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);

    const isMobile = useMediaQuery('(max-width: 768px)');
    const auraSize = isMobile ? 300 : 360;
    const frogSize = isMobile ? 110 : 140;

    const currentDuration = sessionStatus === 'focus' ? focusDuration : breakDuration;
    const progress = currentDuration > 0 ? (timeRemaining / currentDuration) * 100 : 0;
    
    const frogStatus = useMemo(() => {
        if (!isPaused && sessionStatus === 'focus') return 'meditating';
        if (!isPaused && sessionStatus === 'break') return 'happy';
        return 'idle';
    }, [sessionStatus, isPaused]);

    const handleConfirmStop = useCallback(() => { setIsStopModalOpen(false); stopCycle(); }, [stopCycle]);
    const handleCloseModal = useCallback(() => { setIsStopModalOpen(false); }, []);
    const handleComplete = () => { if(activeTaskId) handleCompleteTask(activeTaskId); stopCycle(); }
    
    return (
        <>
            <main className={`${styles.focusScreen} ${styles[sessionStatus]}`}>
                <div className={styles.screenContent}>
                    <div className={styles.taskBanner}>
                        <h2 className={styles.taskTitle}>
                            <Balancer>{activeTaskTitle || 'Sessão de Foco'}</Balancer>
                        </h2>
                        <p className={styles.motivationalQuote}>"{quote}"</p>
                    </div>

                    <div className={styles.zenSanctuary}>
                        <Aura progress={progress} size={auraSize} isBreak={sessionStatus === 'break'} />
                        <div className={styles.zenElements}>
                            <div className={styles.characterContainer}><MemoizedFocusFrogCharacter status={frogStatus} size={frogSize} /></div>
                            <div className={styles.timerDisplay}>{formatTime(timeRemaining)}</div>
                            {mode === 'classic' && (
                                <div className={styles.cycleCounter}>Ciclo {currentCycle} de {totalCycles}</div>
                            )}
                        </div>
                    </div>

                    <footer className={styles.sessionFooter}>
                        <div className={styles.controlsContainer}>
                            <div className={styles.footerActionLeft}>
                                <button className={styles.secondaryActionButton} onClick={() => setIsStopModalOpen(true)} aria-label="Parar Sessão"><Icon path={icons.square} /></button>
                            </div>
                            <div className={styles.mainActions}>
                                {isPaused ? (
                                    <button className={styles.mainActionButton} onClick={resumeCycle} aria-label='Continuar ciclo'><Icon path={icons.play} /></button>
                                ) : (
                                    <button className={`${styles.mainActionButton} ${styles.pulsating}`} onClick={pauseCycle} aria-label="Pausar ciclo"><Icon path={icons.pause} /></button>
                                )}
                            </div>
                            <div className={styles.footerActionRight}>
                                {activeTaskId && sessionStatus === 'focus' ? (
                                    <button className={styles.secondaryActionButton} onClick={handleComplete} aria-label="Concluir tarefa"><Icon path={icons.checkCircle} /></button>
                                ) : <div className={styles.placeholder}></div> }
                            </div>
                        </div>
                    </footer>
                </div>
            </main>

            <ConfirmationModal isOpen={isStopModalOpen} onClose={handleCloseModal} onConfirm={handleConfirmStop} title="Interromper a sessão?" message="Seu sapo estava quase atingindo a iluminação. A consistência é a chave para o progresso!" confirmText="Sim, interromper" cancelText="Não, continuar foco" />
        </>
    );
}
