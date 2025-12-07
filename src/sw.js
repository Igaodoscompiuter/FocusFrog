// @ts-nocheck
// --- Service Worker v5: Unificado com Firebase v9 (Modular) ---

// --- Importações Essenciais ---
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js';
import { getMessaging, onBackgroundMessage } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-messaging-sw.js';
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

// --- Configuração e Inicialização do Firebase (API v9 Modular) ---
const firebaseConfig = {
  apiKey: "AIzaSyC4iDYWSOU9Naqp9O29f1pvzXfS8v6K5fU",
  authDomain: "focusfroggit-81838821-bbab8.firebaseapp.com",
  projectId: "focusfroggit-81838821-bbab8",
  storageBucket: "focusfroggit-81838821-bbab8.firebasestorage.app",
  messagingSenderId: "878346894346",
  appId: "1:878346894346:web:c0517918bd73569e1f73f3",
  measurementId: "G-JKRZJN6W6J"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// --- Configuração do Workbox e Cache ---
const CACHE_NAME = "focusfrog-cache";
const OFFLINE_FALLBACK_PAGE = "offline.html";

if (workbox) {
    workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);
}

// --- Listeners de Eventos do Service Worker ---
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.add(OFFLINE_FALLBACK_PAGE)));
});

self.addEventListener("message", (event) => {
  const { type, payload } = event.data;
  switch (type) {
    case "SKIP_WAITING": self.skipWaiting(); break;
    case 'POST_NOTIFICATION': self.registration.showNotification(payload.title, payload.options); break;
    case 'SCHEDULE_NOTIFICATION': scheduleNotification(payload.endTime, payload.title, payload.body); break;
    case 'CANCEL_NOTIFICATION': cancelNotification(); break;
  }
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const preloadResp = await event.preloadResponse; if (preloadResp) return preloadResp;
        return await fetch(event.request);
      } catch (error) {
        const cache = await caches.open(CACHE_NAME);
        return await cache.match(OFFLINE_FALLBACK_PAGE);
      }
    })());
  }
});

// --- LÓGICA DE NOTIFICAÇÕES ---

// 1. Handler para Notificações REMOTAS (Push do Firebase em Segundo Plano)
onBackgroundMessage(messaging, (payload) => {
  console.log('[SW v9] Mensagem Push recebida em segundo plano:', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = { body: payload.notification.body, icon: payload.notification.icon || './icon-192.png' };
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// 2. Lógica para Notificações LOCAIS (Agendadas pelo Timer do App)
let notificationTimer = null;
function scheduleNotification(endTime, title, body) {
  cancelNotification();
  const delay = endTime - Date.now();
  if (delay > 0) {
    notificationTimer = setTimeout(() => {
      self.registration.showNotification(title, { body: body, icon: './icon-192.png', vibrate: [200, 100, 200] });
      notificationTimer = null;
    }, delay);
  }
}
function cancelNotification() {
  if (notificationTimer) {
    clearTimeout(notificationTimer);
    notificationTimer = null;
  }
}

// --- Estratégia de Cache do Workbox ---
if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}
workbox.routing.registerRoute(
  new RegExp('/*'),
  new workbox.strategies.StaleWhileRevalidate({ cacheName: CACHE_NAME })
);