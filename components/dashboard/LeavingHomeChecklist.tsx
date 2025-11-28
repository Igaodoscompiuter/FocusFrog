
import React, { useState } from 'react';
import { Icon } from '../Icon';
import { icons } from '../Icons';
import { ChecklistModal } from '../modals/ChecklistModal';
import type { ChecklistItem } from '../../types';
import styles from './LeavingHomeChecklist.module.css';

interface LeavingHomeChecklistProps {
    items: ChecklistItem[];
    onToggleItem: (itemId: string) => void;
    onAddItem: (text: string) => void;
    onRemoveItem: (itemId: string) => void;
    onResetItems: () => void;
}

export const LeavingHomeChecklist: React.FC<LeavingHomeChecklistProps> = ({ 
    items, onToggleItem, onAddItem, onRemoveItem, onResetItems 
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    if (!items || items.length === 0) {
        return null; 
    }

    const handleToggleItemClick = (itemId: string) => {
        if (isEditing) return; // Desabilita o clique no item durante a edição
        onToggleItem(itemId);
    };

    return (
        <>
            {isModalOpen && (
                <ChecklistModal 
                    items={items} // A modal agora é apenas para adicionar
                    onAddItem={onAddItem}
                    onRemoveItem={onRemoveItem} // Manter por enquanto, pode ser removido depois
                    onClose={() => setIsModalOpen(false)}
                />
            )}
            
            <div className={styles.card}>
                <div className={styles.header}>
                    <h3><Icon path={icons.briefcase} /> Checklist para Sair</h3>
                    <div className={styles.buttonGroup}>
                        {!isEditing ? (
                             <button 
                                className="btn btn-secondary btn-small"
                                onClick={onResetItems}
                            >
                               Desmarcar Todos
                            </button>
                        ) : (
                            <button 
                                className="btn btn-primary btn-small"
                                onClick={() => setIsModalOpen(true)}
                            >
                                <Icon path={icons.plus} /> Adicionar
                            </button>
                        )}
                        <button 
                            className="btn btn-secondary btn-small"
                            onClick={() => setIsEditing(!isEditing)}
                        >
                            {isEditing ? 'Concluir' : 'Editar'}
                        </button>
                    </div>
                </div>

                <ul className={styles.checklist}>
                    {items.map(item => (
                        <li 
                            key={item.id} 
                            className={`${styles.checklistItem} ${item.completed ? styles.completed : ''} ${isEditing ? styles.editing : ''}`}
                            onClick={() => handleToggleItemClick(item.id)}
                        >
                            <div className={styles.itemContent}>
                                <span className={styles.checkbox}></span>
                                <span className={styles.text}>{item.text}</span>
                            </div>
                            {isEditing && !item.isDefault && (
                                <button 
                                    className="btn btn-icon btn-small"
                                    onClick={() => onRemoveItem(item.id)}
                                >
                                    <Icon path={icons.trash} />
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
};