import React from 'react';
import { Icon } from '../Icon';
import { icons, IconName } from '../Icons';
import styles from './ConfirmationModal.module.css';

interface ConfirmationModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void; 
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
  icon?: IconName;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
    title, 
    message, 
    onConfirm, 
    onCancel, 
    confirmText = 'Confirmar', 
    cancelText = 'Cancelar',
    variant = 'default',
    icon
}) => {

  const confirmButtonClass = variant === 'danger' ? styles.btnDanger : 'btn-primary';
  const iconToShow = icon && icons[icon] ? icons[icon] : icons.info_2;

  return (
    <div className="g-modal-overlay" onClick={onCancel}>
      <div className={`g-modal ${styles.confirmationModal}`} onClick={(e) => e.stopPropagation()}>
        <header className="g-modal-header">
            <div className={styles.headerIcon}>
                <Icon path={iconToShow} />
            </div>
            <h3>{title}</h3>
        </header>
        <main className="g-modal-body">
          <p>{message}</p>
        </main>
        <footer className="g-modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>{cancelText}</button>
          <button className={`btn ${confirmButtonClass}`} onClick={onConfirm}>{confirmText}</button>
        </footer>
      </div>
    </div>
  );
};
