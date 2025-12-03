
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
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
  const [modalRoot, setModalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Garante que o código só é executado no cliente
    setModalRoot(document.getElementById('modal-root'));
  }, []);

  // Renderiza nulo se não estiver aberto ou o portal não estiver pronto
  if (!isOpen || !modalRoot) {
    return null;
  }

  const modalContent = (
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

  return createPortal(modalContent, modalRoot);
};
