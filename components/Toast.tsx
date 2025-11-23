import React, { useEffect, useCallback } from 'react';
import type { Notification } from '../types';

export const Toast: React.FC<{ notification: Notification, onDismiss: (id: number) => void }> = ({ notification, onDismiss }) => {
    const dismiss = useCallback(() => onDismiss(notification.id), [notification.id, onDismiss]);

    useEffect(() => {
        // Se houver uma ação, o toast deve ser persistente até que o usuário interaja.
        if (!notification.action) {
            const timer = setTimeout(() => {
                dismiss();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification, dismiss]);
    
    const handleActionClick = () => {
        if(notification.action) {
            notification.action.onAction();
        }
        dismiss();
    }

    return (
        <div className="toast-notification">
            <span className="toast-icon">{notification.icon}</span>
            <span className="toast-message">{notification.message}</span>
            {notification.action && (
                <button onClick={handleActionClick} className="toast-action-button">
                    {notification.action.label}
                </button>
            )}
             <button onClick={dismiss} className="toast-close-button">&times;</button>
        </div>
    );
};