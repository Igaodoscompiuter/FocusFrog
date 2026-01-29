
import React from 'react';
import { Icon } from '../Icon';
import { icons } from '../Icons';
import styles from './ConfirmationModal.module.css';

interface ConfirmationModalProps {
  isOpen: boolean; // [CORREÇÃO] Adicionada a propriedade para controlar a visibilidade
  title: string;
  message: string;
  onConfirm: () => void;
  onClose: () => void; // [CORREÇÃO] Padronizado para onClose
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, title, message, onConfirm, onClose, confirmText = 'Confirmar', cancelText = 'Cancelar' }) => {
  // [CORREÇÃO] Se não estiver aberto, não renderiza nada.
  if (!isOpen) {
    return null;
  }

  return (
    <div className="g-modal-overlay" onClick={onClose}>
      <div className={`g-modal ${styles.confirmationModal}`} onClick={(e) => e.stopPropagation()}>
        <header className="g-modal-header">
          <h3>{title}</h3>
          {/* [CORREÇÃO] Botão de fechar agora usa onClose */}
          <button className={styles.closeButton} onClick={onClose}>
            <Icon path={icons.close} />
          </button>
        </header>
        <main className="g-modal-body">
          <p>{message}</p>
        </main>
        <footer className="g-modal-footer">
          {/* [CORREÇÃO] Botão de cancelar agora usa onClose */}
          <button className="btn btn-secondary" onClick={onClose}>{cancelText}</button>
          <button className="btn btn-primary" onClick={onConfirm}>{confirmText}</button>
        </footer>
      </div>
    </div>
  );
};
