
import React from 'react';
import { Icon } from '../Icon';
import { icons } from '../Icons';
import styles from './ConfirmationModal.module.css';

interface ConfirmationModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ title, message, onConfirm, onCancel, confirmText = 'Confirmar', cancelText = 'Cancelar' }) => {
  return (
    <div className="g-modal-overlay">
      <div className={`g-modal ${styles.confirmationModal}`}>
        <header className="g-modal-header">
          <h3>{title}</h3>
          <button className={styles.closeButton} onClick={onCancel}>
            <Icon path={icons.close} />
          </button>
        </header>
        <main className="g-modal-body">
          <p>{message}</p>
        </main>
        <footer className="g-modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>{cancelText}</button>
          <button className="btn btn-primary" onClick={onConfirm}>{confirmText}</button>
        </footer>
      </div>
    </div>
  );
};
