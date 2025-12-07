
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useUI } from '../../context/UIContext';
import { useTasks } from '../../context/TasksContext';
import { useClickOutside } from '../../hooks/useClickOutside';
import { Icon } from '../Icon';
import { icons } from '../Icons';
import styles from './QuickCompleteModal.module.css';

export const QuickCompleteModal: React.FC = () => {
    const { quickTaskForCompletion, setQuickTaskForCompletion } = useUI();
    const { handleCompleteTask, frogTaskId, handleUnsetFrog } = useTasks();
    const [modalRoot, setModalRoot] = useState<HTMLElement | null>(null);

    useEffect(() => {
        setModalRoot(document.getElementById('modal-root'));
    }, []);

    const handleCancel = () => {
        setQuickTaskForCompletion(null);
    };

    const modalRef = useClickOutside(handleCancel);

    const handleConfirm = () => {
        if (!quickTaskForCompletion) return;
        
        handleCompleteTask(quickTaskForCompletion.id);

        if (frogTaskId === quickTaskForCompletion.id) {
            handleUnsetFrog();
        }

        setQuickTaskForCompletion(null);
    };

    if (!quickTaskForCompletion || !modalRoot) {
        return null;
    }

    return createPortal(
        <div className="g-modal-overlay">
            <div className={`g-modal ${styles.modalSmall}`} ref={modalRef}>
                <header className="g-modal-header">
                    <h3><Icon path={icons.frog} /> Sapo Comido!</h3>
                    <button onClick={handleCancel} className="btn btn-secondary btn-icon"><Icon path={icons.close} /></button>
                </header>
                <main className="g-modal-body">
                    <div className={styles.content}>
                        <div className={styles.iconContainer}>
                            <Icon path={icons.checkCircle} size={48} />
                        </div>
                        <p className={styles.promptText}>
                            Você finalizou a tarefa e deu um passo importante no seu dia.
                        </p>
                        {/* MODIFICAÇÃO: Usando o estilo de destaque correto */}
                        <div className={styles.taskHighlightBox}>
                            {quickTaskForCompletion.title}
                        </div>
                    </div>
                </main>
                {/* MODIFICAÇÃO: Usando as classes de botão corretas do CSS */}
                 <footer className="g-modal-footer">
                    <button className={`${styles.controlButton} ${styles.secondary}`} onClick={handleCancel}>
                        Ops, ainda não
                    </button>
                    <button className={`${styles.controlButton} ${styles.primary}`} onClick={handleConfirm}>
                        <Icon path={icons.check} /> Confirmar
                    </button>
                </footer>
            </div>
        </div>,
        modalRoot
    );
};