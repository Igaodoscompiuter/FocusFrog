
/// <reference lib="WebWorker" />

declare const self: ServiceWorkerGlobalScope;

import { precacheAndRoute } from 'workbox-precaching';
import { SWMessage } from './sw-helpers';

// Ponto de injeção do manifesto do Workbox.
// Esta linha garante que todos os seus arquivos de build sejam pré-cacheados.
// @ts-ignore
precacheAndRoute(self.__WB_MANIFEST || []);

// Listener de mensagens para comunicação entre o cliente e o Service Worker.
let notificationTimer: number | undefined;

self.addEventListener('message', (event) => {
    // ESSENCIAL: Permite que o usuário acione a atualização do PWA.
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    const data = event.data as SWMessage;

    if (data.type === 'SCHEDULE_NOTIFICATION') {
        if (notificationTimer) {
            clearTimeout(notificationTimer);
        }

        const { title, body, timestamp } = data.payload!;
        const delay = timestamp - Date.now();

        if (delay > 0) {
            notificationTimer = self.setTimeout(() => {
                self.registration.showNotification(title, {
                    body: body,
                    icon: '/icon-192.png',
                    badge: '/icon-96.png',
                    vibrate: [200, 100, 200],
                });
            }, delay);
        }
    }

    if (data.type === 'CANCEL_NOTIFICATION') {
        if (notificationTimer) {
            clearTimeout(notificationTimer);
        }
    }
});

// --- INÍCIO: NOVA LÓGICA PARA NOTIFICAÇÕES PUSH ---
self.addEventListener('push', (event) => {
    console.log('[Service Worker] Push Recebido.');

    // Extrai os dados da notificação push. 
    // Espera-se que o servidor envie um JSON com o formato { title: '', body: '', ... }
    const notificationData = event.data?.json() ?? {};
    const title = notificationData.title || 'Focus Frog';
    const options = {
        body: notificationData.body || 'Você tem uma nova notificação.',
        icon: '/icon-192.png', // Ícone principal
        badge: '/icon-96.png',  // Ícone pequeno na barra de status
        vibrate: [200, 100, 200], // Padrão de vibração
        // Adicione outros parâmetros que você queira usar, como `data`
        data: { url: '/' }, // Para onde levar o usuário ao clicar
        ...notificationData // Permite que o servidor sobrescreva opções
    };

    // Garante que a notificação só será mostrada depois que o SW estiver ativo
    const promiseChain = self.registration.showNotification(title, options);
    event.waitUntil(promiseChain);
});

// Listener para cliques na notificação
self.addEventListener('notificationclick', (event) => {
    console.log('[Service Worker] Clique na notificação recebido.');

    event.notification.close(); // Fecha a notificação

    // Abre a janela do aplicativo ou a foca se já estiver aberta
    const promiseChain = clients.openWindow(event.notification.data.url || '/');
    event.waitUntil(promiseChain);
});
// --- FIM: NOVA LÓGICA PARA NOTIFICAÇÕES PUSH ---
