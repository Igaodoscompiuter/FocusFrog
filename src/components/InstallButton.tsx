
import React from 'react';
import { usePWAInstall } from '../context/PWAInstallProvider';
import { Icon } from './Icon';
import { icons } from './Icons';
import styles from './InstallButton.module.css';

export const InstallButton: React.FC = () => {
  const { canInstall, triggerInstall } = usePWAInstall();

  if (!canInstall) {
    return null;
  }

  const handleInstallClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    triggerInstall();
  };

  return (
    <button 
      className={`icon-button ${styles.installButton}`}
      onClick={handleInstallClick}
      title="Instalar Aplicação"
    >
      <Icon path={icons.download} />
    </button>
  );
};
