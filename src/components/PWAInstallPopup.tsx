
import React from 'react';
import { usePWAInstall } from '../context/PWAInstallProvider';
import { useUI } from '../context/UIContext';
import styles from './PWAInstallPopup.module.css';
import { Icon } from './Icon';
import { icons } from './Icons'; // CORREÇÃO: O caminho correto é './Icons' porque está na mesma diretoria

export const PWAInstallPopup: React.FC = () => {
  const { triggerInstall } = usePWAInstall();
  const { isPWAInstallPopupVisible, hidePWAInstallPopup } = useUI();

  const handleInstall = () => {
    triggerInstall();
    hidePWAInstallPopup();
  };

  const handleDismiss = () => {
    hidePWAInstallPopup();
  };

  if (!isPWAInstallPopupVisible) {
    return null;
  }

  // Componente de botão simples para consistência
  const Button: React.FC<{
    onClick: () => void;
    variant: 'primary' | 'secondary';
    children: React.ReactNode;
  }> = ({ children, onClick, variant }) => (
    <button onClick={onClick} className={`${styles.btn} ${styles[variant]}`}>
      {children}
    </button>
  );

  return (
    <div className={styles.overlay} onClick={handleDismiss}>
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
        <div className={styles.popupHeader}>
          <Icon path={icons.rocket} className={styles.popupIcon} />
          <h3 className={styles.popupTitle}>Uma Experiência Melhor</h3>
        </div>
        <p className={styles.popupText}>
          Instale o FocusFrog no seu dispositivo para um acesso mais rápido e uma experiência de foco imersiva, como se fosse uma aplicação nativa.
        </p>
        <div className={styles.buttonGroup}>
          <Button onClick={handleDismiss} variant="secondary">
            Agora não
          </Button>
          <Button onClick={handleInstall} variant="primary">
            <Icon path={icons.download} />
            Instalar
          </Button>
        </div>
      </div>
    </div>
  );
};
