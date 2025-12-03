import React from 'react';
import { Icon } from '../Icon';
import { icons } from '../Icons';
import type { Task, Subtask } from '../../types';
import { useClickOutside } from '../../hooks/useClickOutside';

export const FocusConfirmationModal = ({ task, subtask, onConfirmFocus, onConfirmComplete, onCancel }: { 
    task: Task; 
    subtask: Subtask; 
    onConfirmFocus: () => void; 
    onConfirmComplete: () => void; 
    onCancel: () => void; 
}) => {

    const modalRef = useClickOutside(onCancel);

    return (
        <div className="modal-overlay">
        <div className="modal completion-modal" ref={modalRef}>
            <div className="icon-wrapper">
            <Icon path={icons.target} />
            </div>
            <h3>Pronto para Focar?</h3>
            <p>
            Esta é uma tarefa importante. Que tal uma sessão de foco para progredir sem distrações?
            <br/><strong>"{subtask.text}"</strong>
            </p>
            <div className="modal-footer" style={{ flexDirection: 'column', gap: '0.75rem', justifyContent: 'center' }}>
            <button className="control-button" onClick={onConfirmFocus}>
                <Icon path={icons.play} />
                <span>Iniciar Pomodoro de 25 min</span>
            </button>
            <button className="control-button secondary" onClick={onConfirmComplete}>
                <Icon path={icons.checkCircle} />
                <span>Já concluí, marcar como feita</span>
            </button>
            <button className="control-button tertiary" onClick={onCancel}>
                <span>Cancelar</span>
            </button>
            </div>
        </div>
        </div>
    )
};
