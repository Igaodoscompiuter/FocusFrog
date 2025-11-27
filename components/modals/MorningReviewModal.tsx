
import React, { useState } from 'react';
import { Icon } from '../Icon';
import { icons } from '../Icons';
import { useUI } from '../../context/UIContext';
import { useTasks } from '../../context/TasksContext';
import styles from './MorningReviewModal.module.css'; // Importando o CSS Module

export const MorningReviewModal: React.FC = () => {
  const { isMorningReviewOpen, setIsMorningReviewOpen } = useUI();
  const { tasks, handleSetFrogFromReview } = useTasks();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  
  const availableTasks = tasks.filter(t => t.status !== 'done');

  if (!isMorningReviewOpen) return null;

  const handleConfirm = () => {
    if (selectedTaskId) {
      handleSetFrogFromReview(selectedTaskId);
    }
    setIsMorningReviewOpen(false);
  };
  
  const handleClose = () => {
    setIsMorningReviewOpen(false);
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>
            Escolha seu Sapo <Icon path={icons.frog} />
          </h3>
          <p>Qual tarefa única, se concluída hoje, terá o maior impacto positivo?</p>
        </div>
        <div className={styles.modalBody}>
          {availableTasks.length > 0 ? (
              <ul className={styles.taskList}>
                {availableTasks.map(task => (
                  <li key={task.id}>
                    <button
                      className={`${styles.taskButton} ${selectedTaskId === task.id ? styles.selected : ''}`}
                      onClick={() => setSelectedTaskId(task.id)}
                    >
                      {task.title}
                    </button>
                  </li>
                ))}
              </ul>
          ) : (
              <div className={styles.emptyState}>
                  <p>Você não tem tarefas pendentes para hoje.</p>
                  <p style={{marginTop: '0.5rem', fontSize: '0.8rem'}}>Adicione algumas na tela de Tarefas!</p>
              </div>
          )}
        </div>
        <div className={styles.modalFooter}>
           <button className="control-button secondary" onClick={handleClose}>
             Cancelar
           </button>
          <button
            className="control-button primary" // Usando a classe global para consistência
            onClick={handleConfirm}
            disabled={!selectedTaskId}
          >
            <Icon path={icons.frog} /> Definir como Sapo
          </button>
        </div>
      </div>
    </div>
  );
};