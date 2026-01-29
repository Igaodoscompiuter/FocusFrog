
import React, { useState } from 'react';
import type { Task } from '../../types';
import { usePomodoro } from '../../context/PomodoroContext';
import styles from './PomodoroSetupModal.module.css';
import { Icon } from '../Icon';
import { icons } from '../Icons';

interface PomodoroSetupModalProps {
  task: Task;
  onClose: () => void;
}

export const PomodoroSetupModal: React.FC<PomodoroSetupModalProps> = ({ task, onClose }) => {
  const { startPomodoro } = usePomodoro();
  const [cycles, setCycles] = useState(2);

  const handleStartQuick = () => {
    startPomodoro({
      mode: 'quick',
      taskId: task.id,
      taskTitle: task.title,
      focusMinutes: 25, // Duração padrão do ciclo rápido
    });
    onClose();
  };

  const handleStartClassic = () => {
    startPomodoro({
      mode: 'classic',
      taskId: task.id,
      taskTitle: task.title,
      cycles: cycles,
      focusMinutes: 25,
      breakMinutes: 5,
    });
    onClose();
  };

  const canIncreaseCycles = cycles < 8;
  const canDecreaseCycles = cycles > 2;

  return (
    <div className="g-modal-overlay">
      <div className={`g-modal ${styles.setupModal}`}>
        <header className="g-modal-header">
          <h3>Iniciar Foco na Tarefa</h3>
          <p className={styles.taskTitle}>"{task.title}"</p>
        </header>
        <main className="g-modal-body">
          <div className={styles.optionCard} onClick={handleStartQuick}>
            <div className={styles.optionIcon}><Icon path={icons.zap} /></div>
            <div className={styles.optionText}>
              <h4>Ciclo Rápido</h4>
              <p>Uma única sessão de foco de 25 minutos.</p>
            </div>
            <div className={styles.optionAction}>
                <Icon path={icons.arrowRight} />
            </div>
          </div>

          <div className={`${styles.optionCard} ${styles.classicPomodoroCard}`}>
            <div className={styles.optionIcon}><Icon path={icons.rotateCw} /></div>
            <div className={styles.optionText}>
                <h4>Pomodoro Clássico</h4>
                <p>Sessões de foco de 25 min com pausas de 5 min.</p>
            </div>
            <div className={styles.cycleSelector}>
                <button onClick={() => setCycles(c => c - 1)} disabled={!canDecreaseCycles} className={styles.cycleButton}><Icon path={icons.minus} /></button>
                <span className={styles.cycleCount}>{cycles} ciclos</span>
                <button onClick={() => setCycles(c => c + 1)} disabled={!canIncreaseCycles} className={styles.cycleButton}><Icon path={icons.plus} /></button>
            </div>
          </div>
            <button className={`btn btn-primary ${styles.startClassicButton}`} onClick={handleStartClassic}>Iniciar Pomodoro Clássico</button>

        </main>
        <footer className="g-modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
        </footer>
      </div>
    </div>
  );
};
