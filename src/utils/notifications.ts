export const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;

    const permission = await Notification.requestPermission();
    return permission === 'granted';
};

const postMessageToSW = (message: any) => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage(message);
    } else {
        console.error('Service worker não está pronto ou não está controlando a página.');
    }
}

export const showNotification = async (title: string, options?: NotificationOptions): Promise<void> => {
    const permissionGranted = await requestNotificationPermission();
    if (!permissionGranted) return;

    // Espera o Service Worker estar pronto antes de enviar a mensagem.
    await navigator.serviceWorker.ready; 
    postMessageToSW({ 
        type: 'POST_NOTIFICATION', 
        payload: { title, options } 
    });
};

export const closeNotification = async (tag: string): Promise<void> => {
    await navigator.serviceWorker.ready;
    postMessageToSW({ 
        type: 'CLOSE_NOTIFICATION', 
        payload: { tag } 
    });
};