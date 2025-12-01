import React from 'react';
import type { Task } from '../../types';
import styles from './MorningReviewModal.module.css';
import { useClickOutside } from '../../hooks/useClickOutside';

interface MorningReviewModalProps {
  isOpen: boolean; 
  tasks?: Task[];
  selectedTask: string | null; 
  onSelectTask: (taskId: string) => void; 
  onConfirm: () => void; 
  onClose: () => void; 
}

export const MorningReviewModal: React.FC<MorningReviewModalProps> = ({ 
  isOpen,
  tasks = [],
  selectedTask,
  onSelectTask,
  onConfirm,
  onClose
}) => {

  const modalRef = useClickOutside(onClose);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="g-modal-overlay"> 
      <div className="g-modal" ref={modalRef}> 
        
        <header className={`g-modal-header ${styles.centeredHeader}`}>
          <h3>🐸 Qual sapo você vai engolir hoje?</h3>
          <p className={styles.subtitle}>Escolha a tarefa mais importante para focar primeiro.</p>
        </header>

        <main className="g-modal-body">
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
        </main>

        <footer className={"g-modal-footer g-modal-footer--space-between"}>
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
        </footer>
      </div>
    </div>
  );
};