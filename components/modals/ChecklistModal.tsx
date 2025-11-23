import React, { useState } from 'react';
import { Icon } from '../Icon';
import { icons } from '../Icons';
import type { ChecklistItem } from '../../types';

interface ChecklistModalProps {
  items: ChecklistItem[];
  onAddItem: (text: string) => void;
  onRemoveItem: (id: string) => void;
  onClose: () => void;
}

export const ChecklistModal: React.FC<ChecklistModalProps> = ({ items, onAddItem, onRemoveItem, onClose }) => {
    const [newItemText, setNewItemText] = useState('');

    const handleAddItem = () => {
        if (!newItemText.trim()) return;
        onAddItem(newItemText);
        setNewItemText('');
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal-header">
                    <h3>Gerenciar Itens de Saída</h3>
                    <p>Adicione ou remova itens da sua lista pessoal.</p>
                </div>
                <div className="modal-body checklist-modal-body">
                    <ul>
                        {items.map(item => (
                            <li key={item.id} className="checklist-modal-item">
                                <span>{item.text}</span>
                                {!item.isDefault && (
                                    <button onClick={() => onRemoveItem(item.id)} className="delete-button" aria-label={`Remover ${item.text}`}>
                                        <Icon path={icons.trash} />
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                     <div className="form-group">
                        <label>Adicionar novo item</label>
                        <div className="subtask-input-group">
                            <input
                                type="text"
                                placeholder="Ex: Fone de ouvido"
                                value={newItemText}
                                onChange={(e) => setNewItemText(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
                            />
                            <button onClick={handleAddItem}><Icon path={icons.plus} /></button>
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="control-button" onClick={onClose}>Fechar</button>
                </div>
            </div>
        </div>
    );
};
