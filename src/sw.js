import { precacheAndRoute } from 'workbox-precaching';

// @ts-ignore: __WB_MANIFEST is injected by workbox-build.
precacheAndRoute(self.__WB_MANIFEST);

// @ts-ignore
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'POST_NOTIFICATION') {
    const { title, options } = event.data.payload;

    // @ts-ignore
    self.registration.getNotifications({ tag: options.tag }).then((notifications) => {
      notifications.forEach((notification) => notification.close());
      // @ts-ignore
      self.registration.showNotification(title, {
        ...options,
        icon: './icon-192.png', // Caminho relativo para o ícone na pasta de build
      });
    });
  }
});

// @ts-ignore
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  // @ts-ignore
  event.waitUntil(
    // @ts-ignore
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        let client = clientList.find(c => c.focused) || clientList[0];
        return client.focus();
      }
      // @ts-ignore
      return clients.openWindow('/');
    })
  );
});

// Forçar o novo Service Worker a assumir o controle imediatamente.
// @ts-ignore
self.addEventListener('install', () => self.skipWaiting());
// @ts-ignore
self.addEventListener('activate', () => self.clients.claim());
