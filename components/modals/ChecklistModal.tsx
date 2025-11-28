import React, { useState } from 'react';
import { Icon } from '../Icon';
import { icons } from '../Icons';
import type { ChecklistItem } from '../../types';
import styles from './ChecklistModal.module.css'; 

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
        <div className="g-modal-overlay"> 
            <div className="g-modal"> {/* <-- Classe local removida */}
                <div className={styles.modalHeader}>
                    <h3>Gerenciar Itens de Saída</h3>
                    <p>Adicione ou remova itens da sua lista pessoal.</p>
                </div>
                <div className={styles.modalBody}>
                    <ul className={styles.itemList}>
                        {items.map(item => (
                            <li key={item.id} className={styles.item}>
                                <span>{item.text}</span>
                                {!item.isDefault && (
                                    <button 
                                      onClick={() => onRemoveItem(item.id)} 
                                      className="btn btn-icon btn-small"
                                      aria-label={`Remover ${item.text}`}
                                    >
                                        <Icon path={icons.trash} />
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                     <div className={styles.formGroup}>
                        <label>Adicionar novo item</label>
                        <div className={styles.inputGroup}>
                            <input
                                type="text"
                                placeholder="Ex: Fone de ouvido"
                                value={newItemText}
                                onChange={(e) => setNewItemText(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
                            />
                            <button onClick={handleAddItem} className="btn btn-primary btn-small">
                                <Icon path={icons.plus} />
                            </button>
                        </div>
                    </div>
                </div>
                <div className={styles.modalFooter}>
                    <button className="btn btn-secondary" onClick={onClose}>Fechar</button>
                </div>
            </div>
        </div>
    );
};