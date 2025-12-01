import React from 'react';
import { Icon } from '../Icon';
import { icons } from '../Icons';
import { useUI } from '../../context/UIContext';
import { useTasks } from '../../context/TasksContext';
import { useClickOutside } from '../../hooks/useClickOutside';

export const EndDayReviewModal: React.FC = () => {
  const { isReviewModalOpen, setIsReviewModalOpen } = useUI();
  const { overdueTasksForReview, handleReviewAction, handlePostponeAllOverdue, clearOverdueReview } = useTasks();
  
  const onAction = (action: 'complete' | 'postpone' | 'remove_date', taskId: string) => {
    handleReviewAction(action, taskId);
  }

  const handleClose = () => {
    // If the user closes without action, we still need to clear the state
    // so the prompt doesn't re-appear until the next day.
    clearOverdueReview();
    setIsReviewModalOpen(false);
  }

  const modalRef = useClickOutside(handleClose);

  const handlePostponeAllAndClose = async () => {
    const taskIds = overdueTasksForReview.map(t => t.id);
    if (taskIds.length > 0) {
        await handlePostponeAllOverdue(taskIds);
    }
    setIsReviewModalOpen(false);
  }
  

  if (!isReviewModalOpen || overdueTasksForReview.length === 0) return null;
  const tasks = overdueTasksForReview;

  return (
    <div className="modal-overlay">
      <div className="modal review-modal" ref={modalRef}>
        <div className="modal-header">
          <h3>Hora de Revisar o Dia</h3>
          <p>Parece que {tasks.length} {tasks.length === 1 ? 'tarefa ficou' : 'tarefas ficaram'} pendente{tasks.length > 1 ? 's' : ''}. Sem problemas, vamos organizar!</p>
        </div>
        <div className="modal-body">
          <ul className="review-task-list">
            {tasks.map(task => (
              <li key={task.id} className="review-task-item">
                <span className="review-task-title">{task.title}</span>
                <div className="review-task-actions">
                  <button onClick={() => onAction('postpone', task.id)} title="Adiar 1 Dia"><Icon path={icons.calendar} /></button>
                  <button onClick={() => onAction('remove_date', task.id)} title="Remover Data"><Icon path={icons.trash} /></button>
                  <button onClick={() => onAction('complete', task.id)} title="Concluir"><Icon path={icons.checkCircle} /></button>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="modal-footer" style={{ flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
          <button className="button-primary" style={{width: '100%'}} onClick={handlePostponeAllAndClose}>
            <Icon path={icons.calendar} /> Adiar Todas para Amanhã
          </button>
          <button className="button-outline" style={{width: '100%'}} onClick={handleClose}>
            Decidir Depois
          </button>
        </div>
      </div>
    </div>
  );
};