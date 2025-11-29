import React, { useEffect, useCallback, useRef } from 'react';
import type { Notification } from '../types';
import styles from './Toast.module.css';

export const Toast: React.FC<{ notification: Notification, onDismiss: (id: number) => void }> = ({ notification, onDismiss }) => {
    // Usamos useRef para evitar que a função dismiss seja recriada a cada renderização,
    // o que poderia reiniciar o useEffect desnecessariamente.
    const onDismissRef = useRef(onDismiss);
    onDismissRef.current = onDismiss;

    useEffect(() => {
        // O timer de auto-dismiss só se aplica se NÃO houver ação.
        // Notificações com ação (como "Desfazer") devem ser dispensadas manualmente.
        if (!notification.action) {
            const timer = setTimeout(() => {
                // Chamamos a função de dismiss através da ref para garantir que temos sempre a mais recente.
                onDismissRef.current(notification.id);
            }, 4000); // Aumentado para 4 segundos para dar mais tempo de leitura.

            // A função de limpeza é crucial para cancelar o timer se o componente for desmontado.
            return () => clearTimeout(timer);
        }
        // O array de dependências está vazio intencionalmente. 
        // Queremos que este efeito seja executado APENAS UMA VEZ, quando o toast aparece.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 
    
    // Envolvemos a chamada de dismiss em useCallback para otimização.
    const dismiss = useCallback(() => {
        onDismissRef.current(notification.id);
    }, [notification.id]);

    const handleActionClick = () => {
        if (notification.action) {
            notification.action.onAction();
        }
        dismiss();
    }

    return (
        <div className={styles.toastNotification}>
            <div className={styles.messageGroup}>
                <span className={styles.toastIcon}>{notification.icon}</span>
                <span className={styles.toastMessage}>{notification.message}</span>
            </div>

            <div className={styles.actionGroup}>
                {notification.action && (
                    <button onClick={handleActionClick} className={styles.toastActionButton}>
                        {notification.action.label}
                    </button>
                )}
                <button onClick={dismiss} className={styles.toastCloseButton} aria-label="Fechar notificação">&times;</button>
            </div>
        </div>
    );
};