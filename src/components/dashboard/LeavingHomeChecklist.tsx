
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
        if (isEditing) return;
        onToggleItem(itemId);
    };

    return (
        <>
            {isModalOpen && (
                <ChecklistModal 
                    items={items}
                    onAddItem={onAddItem}
                    onRemoveItem={onRemoveItem}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
            
            <div className={styles.card}>
                <div className={styles.header}>
                    <h3><Icon path={icons.briefcase} /> Já pegou?</h3>
                    <div className={styles.buttonGroup}>
                        {!isEditing ? (
                             <button 
                                className="btn btn-icon btn-secondary btn-small"
                                onClick={onResetItems}
                                title="Desmarcar Todos"
                            >
                               <Icon path={icons.rotateCw} />
                            </button>
                        ) : (
                            <button 
                                className="btn btn-icon btn-primary btn-small"
                                onClick={() => setIsModalOpen(true)}
                                title="Adicionar Item"
                            >
                                <Icon path={icons.plus} />
                            </button>
                        )}
                        <button 
                            className="btn btn-icon btn-secondary btn-small"
                            onClick={() => setIsEditing(!isEditing)}
                            title={isEditing ? 'Concluir Edição' : 'Editar Checklist'}
                        >
                            {isEditing ? <Icon path={icons.check} /> : <Icon path={icons.pencil} />}
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
                                    title="Remover Item"
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
