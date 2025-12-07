
import { useState, useEffect, useCallback } from 'react';

export const useNotifications = () => {
    const [permission, setPermission] = useState<NotificationPermission>('default');

    useEffect(() => {
        setPermission(Notification.permission);
    }, []);

    const requestPermission = useCallback(async () => {
        if (!('Notification' in window)) {
            console.error('Este navegador não suporta notificações de desktop.');
            return 'denied';
        }

        if (permission === 'default') {
            const newPermission = await Notification.requestPermission();
            setPermission(newPermission);
            return newPermission;
        }
        return permission;
    }, [permission]);

    const showNotification = useCallback((title: string, options?: NotificationOptions) => {
        if (permission !== 'granted') {
            console.warn('Permissão de notificação não concedida.');
            return;
        }

        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'POST_NOTIFICATION',
                payload: { title, options },
            });
        } else {
            // Fallback para o caso de o SW não estar ativo (menos ideal)
            new Notification(title, options);
        }
    }, [permission]);

    return { permission, requestPermission, showNotification };
};
