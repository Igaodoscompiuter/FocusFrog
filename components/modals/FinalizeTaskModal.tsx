import React from 'react';
import { Icon } from '../Icon';
import { icons } from '../Icons';
import type { Task } from '../../types';

export const FinalizeTaskModal = ({ task, onConfirm, onCancel }: { task: Task; onConfirm: () => void; onCancel: () => void; }) => (
    <div className="modal-overlay">
        <div className="modal completion-modal">
            <div className="icon-wrapper">
                <Icon path={icons.checkCircle} />
            </div>
            <h3>Último Passo!</h3>
            <p>Você está prestes a concluir a tarefa: <br/><strong>"{task.title}"</strong>.</p>
            <p>Confirmar a conclusão e ganhar sua recompensa?</p>
            <div className="modal-footer" style={{ justifyContent: 'center' }}>
                 <button className="control-button secondary" onClick={onCancel}>Cancelar</button>
                <button className="control-button" onClick={onConfirm}>
                    <Icon path={icons.zap} />
                    Finalizar & Ganhar Pontos!
                </button>
            </div>
        </div>
    </div>
);
