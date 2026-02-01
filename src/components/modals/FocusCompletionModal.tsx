import React from 'react';
import { Icon } from '../Icon';
import { icons } from '../Icons';
import type { Task } from '../../types';
import { useClickOutside } from '../../hooks/useClickOutside';

export const FocusCompletionModal = ({ task, subtaskId, onConfirm, onDismiss }: { task: Task, subtaskId: string | null, onConfirm: () => void, onDismiss: () => void }) => {
    const subtask = subtaskId ? task.subtasks?.find(st => st.id === subtaskId) : null;
    const taskTitle = subtask ? subtask.text : task.title;

    const modalRef = useClickOutside(onDismiss);

    return (
        <div className="modal-overlay">
            <div className="modal completion-modal" ref={modalRef}>
                <div className="icon-wrapper">
                    {/* Ícone alterado para simbolizar uma recompensa */}
                    <Icon path={icons.gift} /> 
                </div>
                <h3>Sessão Concluída!</h3>
                <p>
                    Você manteve o foco e um novo sapo se juntou ao seu laguinho!
                </p>
                <p>Deseja marcar a tarefa <strong>"{taskTitle}"</strong> como concluída?</p>
                <div className="modal-footer">
                    <button className="control-button secondary" onClick={onDismiss}>Depois</button>
                    <button className="control-button" onClick={onConfirm}>Sim, Concluir</button>
                </div>
            </div>
        </div>
    );
};
