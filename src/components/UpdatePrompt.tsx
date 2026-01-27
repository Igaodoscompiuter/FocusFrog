
import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import styles from './UpdatePrompt.module.css';

function UpdatePrompt() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  const handleUpdate = () => {
    updateServiceWorker(true);
  };

  if (!needRefresh) {
    return null;
  }

  return (
    <div className={styles.updatePrompt}>
      <div className={styles.message}>
        Uma nova versão do aplicativo está disponível!
      </div>
      <button className={styles.updateButton} onClick={handleUpdate}>
        Atualizar
      </button>
    </div>
  );
}

export default UpdatePrompt;
