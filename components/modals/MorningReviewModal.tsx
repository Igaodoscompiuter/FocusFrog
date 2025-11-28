import React from 'react';
import type { Task } from '../../types';
import styles from './MorningReviewModal.module.css';

interface MorningReviewModalProps {
  tasks?: Task[]; // Tornando a prop opcional para refletir a realidade
  selectedTask: string | null; 
  onSelectTask: (taskId: string) => void; 
  onConfirm: () => void; 
  onClose: () => void; 
}

export const MorningReviewModal: React.FC<MorningReviewModalProps> = ({ 
  tasks = [], // FIX: Se tasks for undefined, use um array vazio como padrão.
  selectedTask,
  onSelectTask,
  onConfirm,
  onClose
}) => {
  return (
    <div className="g-modal-overlay"> 
      <div className="g-modal"> 
        <div className={styles.modalHeader}>
          <h3>🐸 Qual sapo você vai engolir hoje?</h3>
          <p>Escolha a tarefa mais importante para focar primeiro.</p>
        </div>

        <div className={styles.modalBody}>
          {tasks.length > 0 ? (
            <ul className={styles.taskList}>
              {tasks.map(task => (
                <li key={task.id}>
                  <button 
                    className={`${styles.taskButton} ${selectedTask === task.id ? styles.selected : ''}`}
                    onClick={() => onSelectTask(task.id)}
                  >
                    {task.title} 
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className={styles.emptyState}>
              <p>Nenhuma tarefa na sua lista! Adicione algumas para começar.</p>
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button className={`${styles.controlButton} ${styles.secondary}`} onClick={onClose}> 
            Decidir depois
          </button>
          <button 
            className={`${styles.controlButton} ${styles.primary}`} 
            onClick={onConfirm} 
            disabled={!selectedTask}
          >
            Engolir este sapo
          </button>
        </div>
      </div>
    </div>
  );
};