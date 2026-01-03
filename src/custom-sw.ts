
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
    // O script do PWA no cliente enviará esta mensagem quando o usuário aceitar a atualização.
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    const data = event.data as SWMessage;

    // Lógica para agendar notificações (sem alterações)
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

    // Lógica para cancelar notificações (sem alterações)
    if (data.type === 'CANCEL_NOTIFICATION') {
        if (notificationTimer) {
            clearTimeout(notificationTimer);
        }
    }
});

// REMOVIDO: Os listeners de 'install' e 'activate' manuais.
// self.skipWaiting() e self.clients.claim() eram muito agressivos e causavam
// o loop de recarregamento. Agora, o fluxo é controlado pelo usuário através
// do prompt de atualização.
