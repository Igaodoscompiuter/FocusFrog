
// --- Estratégia: Cache-First com Fallback Offline e Atualização Automática ---

const CACHE_NAME = 'focusfrog-cache-v3'; // NOVA VERSÃO! Dispara o ciclo de atualização.
const OFFLINE_URL = 'offline.html';

// Lista de ficheiros essenciais para o App Shell.
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon-192.png',
  '/icon-512.png',
  OFFLINE_URL
];

// NOVO: Adiciona um listener para a mensagem de skipWaiting vinda da aplicação.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('SW v3: Comando skipWaiting recebido. A assumir o controlo.');
    self.skipWaiting();
  }
});

// Evento de Instalação: Guardar o App Shell em cache.
self.addEventListener('install', (event) => {
  console.log('SW v3: A instalar...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('SW v3: A guardar App Shell e página offline em cache.');
        return cache.addAll(URLS_TO_CACHE);
      })
      // A chamada a self.skipWaiting() foi REMOVIDA daqui.
      // Agora, o novo SW irá entrar em 'waiting' se uma versão antiga estiver ativa.
  );
});

// Evento de Ativação: Limpar caches antigos.
self.addEventListener('activate', (event) => {
  console.log('SW v3: A ativar...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('SW v3: A limpar cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Torna-se o controlador de todas as abas abertas
  );
});

// Evento Fetch: Servir do cache, fallback para a rede, e fallback final para a página offline.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachedResponse = await cache.match(event.request);
      if (cachedResponse) {
        return cachedResponse;
      }
      try {
        const networkResponse = await fetch(event.request);
        if (networkResponse.ok && event.request.url.startsWith('http')) {
          await cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      } catch (error) {
        console.log('SW v3: Fetch falhou; o utilizador está offline.', event.request.url);
        if (event.request.mode === 'navigate') {
          const offlinePage = await cache.match(OFFLINE_URL);
          return offlinePage;
        }
        return new Response('Recurso não disponível offline', {
          status: 404,
          statusText: 'Recurso não disponível offline',
        });
      }
    })
  );
});
