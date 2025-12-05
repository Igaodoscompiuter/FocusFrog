
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log("This browser does not support desktop notification");
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const showNotification = async (title: string, options?: NotificationOptions): Promise<void> => {
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) {
    return;
  }

  if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
    const registration = await navigator.serviceWorker.ready;
    const defaultOptions: NotificationOptions = {
      body: 'Clique para voltar ao app',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png', 
      vibrate: [100, 50, 100],
      ...options,
    };
    registration.showNotification(title, defaultOptions);
  }
};

export const closeNotification = async (tag: string): Promise<void> => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
        return;
    }

    if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
        const registration = await navigator.serviceWorker.ready;
        const notifications = await registration.getNotifications({ tag });
        notifications.forEach(notification => notification.close());
    }
};
