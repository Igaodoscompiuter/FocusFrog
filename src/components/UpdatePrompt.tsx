import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import styles from './UpdatePrompt.module.css';
import { Icon } from './Icon';
import { icons } from './Icons';

export const UpdatePrompt: React.FC = () => {
  const { offlineReady: [offlineReady, setOfflineReady], needRefresh: [needRefresh, setNeedRefresh], updateServiceWorker } = useRegisterSW({
    onRegistered(r) {
      // console.log('SW Registered: ' + r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  const handleUpdate = () => {
    updateServiceWorker(true);
  };

  if (offlineReady) {
    return (
      <div className={styles.toastContainer}>
        <div className={styles.toast}>
          <span>O aplicativo está pronto para funcionar offline.</span>
          <button className={styles.closeButton} onClick={() => close()}>
            <Icon path={icons.close} />
          </button>
        </div>
      </div>
    );
  }

  if (needRefresh) {
    return (
      <div className={styles.toastContainer}>
        <div className={styles.toast}>
          <span>Nova versão disponível!</span>
          <button className="btn btn-sm btn-primary" onClick={handleUpdate}>Atualizar</button>
          <button className={styles.closeButton} onClick={() => close()}>
            <Icon path={icons.close} />
          </button>
        </div>
      </div>
    );
  }

  return null;
};
