
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
        // Não agenda o auto-descarte se houver uma ação, a menos que seja configurado para isso
        const autoDismiss = !notification.action || notificationConfig.dismissActionable;
        if (!autoDismiss) return;

        const dismissTimeout = setTimeout(() => {
            onDismiss(notification.id);
        }, notificationConfig.defaultDuration);

        return () => clearTimeout(dismissTimeout);
    }, [notification, onDismiss]);

    // Mapeia a categoria da notificação para a classe de estilo correspondente
    const categoryClass = styles[notification.category] || '';

    const handleActionClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Impede que o clique no botão descarte o toast
        if(notification.action) {
            notification.action.onAction();
        }
        onDismiss(notification.id); // Descarta o toast após a ação
    };

    return (
        <div
          className={`${styles.toast} ${categoryClass}`}
          onClick={() => onDismiss(notification.id)}
        >
            <span className={styles.toastIcon}>
              {notification.icon}
            </span>
            <div className={styles.toastContent}>
                <p>{notification.message}</p>
            </div>
            {/* Adiciona o botão de ação se ele existir na notificação */}
            {notification.action && (
                <button className={styles.actionButton} onClick={handleActionClick}>
                    {notification.action.label}
                </button>
            )}
        </div>
    );
};
