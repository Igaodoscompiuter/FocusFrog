
import React, { useEffect } from 'react';
import { Notification } from '../context/UIContext';
import { notificationConfig } from '../config/notificationConfig';
import styles from './Toast.module.css';

export interface ToastProps {
  notification: Notification;
  onDismiss: (id: number) => void;
}

export const Toast: React.FC<ToastProps> = ({ notification, onDismiss }) => {

    useEffect(() => {
        const dismissTimeout = setTimeout(() => {
            onDismiss(notification.id);
        }, notificationConfig.defaultDuration);

        return () => clearTimeout(dismissTimeout);
    }, [notification, onDismiss]);

    return (
        <div
          className={styles.toast}
          onClick={() => onDismiss(notification.id)}
          // A propriedade de estilo inline foi removida para eliminar as cores de categoria.
          // O componente agora usará apenas os estilos do arquivo CSS, resolvendo o bug visual da borda.
        >
            <span className={styles.toastIcon}>
              {notification.icon}
            </span>
            <div className={styles.toastContent}>
                <p>{notification.message}</p>
            </div>
        </div>
    );
};
