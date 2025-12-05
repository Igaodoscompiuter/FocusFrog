
import React, { ReactNode } from 'react';
import { useClickOutside } from '../../hooks/useClickOutside';
import { Icon } from '../Icon';
import { icons } from '../Icons';
import styles from './ConfirmationModal.module.css';

interface ConfirmationModalProps {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  icon?: keyof typeof icons;
  variant?: 'default' | 'danger';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
    title, 
    message, 
    confirmText, 
    cancelText, 
    onConfirm, 
    onCancel, 
    icon = 'alertTriangle', // Ícone padrão de aviso
    variant = 'default' 
}) => {

    const modalRef = useClickOutside<HTMLDivElement>(onCancel);

    const confirmButtonClasses = `btn ${styles.confirmButton} ${variant === 'danger' ? styles.danger : 'btn-primary'}`;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal} ref={modalRef}>
                
                <div className={styles.iconWrapper}>
                    <Icon path={icons[icon]} />
                </div>

                <h3>{title}</h3>
                <p>{message}</p>

                <div className={styles.buttonGroup}>
                    <button className={confirmButtonClasses} onClick={onConfirm}>
                        {confirmText}
                    </button>
                    <button className={`btn btn-secondary ${styles.cancelButton}`} onClick={onCancel}>
                        {cancelText}
                    </button>
                </div>
            </div>
        </div>
    );
};
