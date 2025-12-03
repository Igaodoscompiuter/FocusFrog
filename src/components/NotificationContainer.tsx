
import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useUI } from '../context/UIContext';
import { Toast } from './Toast';
import styles from './NotificationContainer.module.css';
import { AnimatePresence, motion } from 'framer-motion';

export const NotificationContainer: React.FC = () => {
    const { 
        notifications, 
        removeNotification, 
        promoteNotification,
        showClearAllButton,
        clearAllNotifications,
        queueCount
    } = useUI();

    const handleDismiss = (id: number) => {
        removeNotification(id);
        // O atraso foi reduzido para uma experiência mais fluida
        setTimeout(() => {
            promoteNotification();
        }, 300); // Atraso reduzido de 1000ms para 300ms
    };

    const portalElement = useMemo(() => document.getElementById('notification-root'), []);

    if (!portalElement) {
        console.warn('Notification root element not found.');
        return null;
    }

    return createPortal(
        <div className={styles.notificationContainer}>
            <div className={styles.toastListContainer}>
                {/* O botão vem primeiro para ter uma posição estável no topo */}
                <AnimatePresence>
                    {showClearAllButton && (
                        <motion.button
                            className={styles.clearButton}
                            onClick={clearAllNotifications}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                            layout
                        >
                            Limpar Notificações ({queueCount + notifications.length})
                        </motion.button>
                    )}
                </AnimatePresence>

                {/* As notificações aparecem abaixo do botão */}
                <AnimatePresence initial={false}>
                    {notifications.map(notification => (
                        <motion.div
                            key={notification.id}
                            layout
                            initial={{ opacity: 0, y: -50, scale: 0.3 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                        >
                            <Toast 
                                notification={notification} 
                                onDismiss={handleDismiss} 
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>,
        portalElement
    );
};
