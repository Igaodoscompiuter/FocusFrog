import React from 'react';
import { Icon } from '../Icon';
import { icons } from '../Icons';
import type { Task } from '../../types';
import { useClickOutside } from '../../hooks/useClickOutside';

export const FocusCompletionModal = ({ task, subtaskId, onConfirm, onDismiss }: { task: Task, subtaskId: string | null, onConfirm: () => void, onDismiss: () => void }) => {
    const subtask = subtaskId ? task.subtasks?.find(st => st.id === subtaskId) : null;
    const completionText = subtask ? `Progresso feito em:` : `Progresso feito em:`;
    const taskTitle = subtask ? subtask.text : task.title;

    const modalRef = useClickOutside(onDismiss);

    return (
        <div className="modal-overlay">
            <div className="modal completion-modal" ref={modalRef}>
                <div className="icon-wrapper">
                    <Icon path={icons.checkCircle} />
                </div>
                <h3>Tarefa Concluída?</h3>
                <p>
                    {completionText} <br/><strong>"{taskTitle}"</strong>
                </p>
                <p>Marcar como finalizada e ganhar seus pontos?</p>
                <div className="modal-footer">
                    <button className="control-button secondary" onClick={onDismiss}>Ainda não</button>
                    <button className="control-button" onClick={onConfirm}>Sim, Concluir!</button>
                </div>
            </div>
        </div>
    );
};
