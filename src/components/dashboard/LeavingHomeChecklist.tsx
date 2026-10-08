
import React, { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { Icon } from '../Icon';
import { icons } from '../Icons';
import { ChecklistModal } from '../modals/ChecklistModal';
import type { ChecklistItem } from '../../types';
import { useUI } from '../../context/UIContext';
import { requestPinChecklistWidget } from '../../widgetBridge';
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
    // recolhido por padrão na Home (decisão de produto): progresso no título
    const [open, setOpen] = useLocalStorage<boolean>('focusfrog_checklistOpen', false);
    const doneCount = items.filter(i => i.completed).length;
    const { addNotification } = useUI();

    const handlePinWidget = async () => {
        const { supported, reason } = await requestPinChecklistWidget();
        if (!supported) {
            const msg = reason === 'launcher_unsupported'
                ? 'Sua tela inicial não aceita esse atalho — adicione segurando um espaço vazio dela e procurando "FocusFrog" em Widgets.'
                : 'Esse atalho precisa do app instalado no celular (não funciona aqui no navegador).';
            addNotification(msg, 'ℹ️', 'info');
        }
        // Quando suportado, o próprio Android já mostra o diálogo de confirmação —
        // não precisa de mais nada daqui.
    };

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
                    <button className={styles.titleToggle} onClick={() => setOpen(!open)} aria-expanded={open}>
                        <h3><Icon path={icons.briefcase} /> Já pegou?</h3>
                        <span className={styles.summary}>{doneCount}/{items.length}<span className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}>›</span></span>
                    </button>
                    {open && <div className={styles.buttonGroup}>
                        {Capacitor.isNativePlatform() && !isEditing && (
                            <button
                                className="btn btn-icon btn-secondary btn-small"
                                onClick={handlePinWidget}
                                title="Adicionar à tela inicial"
                            >
                                <Icon path={icons.layoutGrid} />
                            </button>
                        )}
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
                    </div>}
                </div>

                {open && <ul className={`${styles.checklist} ${isEditing ? styles.editingList : ""}`}>
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
                </ul>}
            </div>
        </>
    );
};
