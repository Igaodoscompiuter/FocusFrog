import React, { useState } from 'react';
import { Icon } from '../Icon';
import { icons } from '../Icons';
import { useUI } from '../../context/UIContext';
import { useTasks } from '../../context/TasksContext';

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
    <div className="modal-overlay">
      <div className="modal review-modal">
        <div className="modal-header">
          <h3>Escolha seu Sapo 🐸</h3>
          <p>Qual tarefa, se concluída, fará você sentir que o dia valeu a pena?</p>
        </div>
        <div className="modal-body">
          {availableTasks.length > 0 ? (
              <ul className="frog-selection-list">
                {availableTasks.map(task => (
                  <li
                    key={task.id}
                    className={`frog-selection-item ${selectedTaskId === task.id ? 'selected' : ''}`}
                    onClick={() => setSelectedTaskId(task.id)}
                    tabIndex={0}
                    onKeyPress={(e) => e.key === 'Enter' && setSelectedTaskId(task.id)}
                  >
                    <span className="frog-selection-radio"></span>
                    <span className="frog-selection-title">{task.title}</span>
                  </li>
                ))}
              </ul>
          ) : (
              <div className="empty-state">
                  <p>Você não tem tarefas pendentes.</p>
              </div>
          )}
        </div>
        <div className="modal-footer">
           <button className="control-button secondary" onClick={handleClose}>
             Cancelar
           </button>
          <button
            className="control-button"
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