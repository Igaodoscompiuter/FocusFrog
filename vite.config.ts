
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      devOptions: {
        enabled: true
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        // INÍCIO DA NOVA CONFIGURAÇÃO PARA SUPORTE OFFLINE E BACKGROUND SYNC
        runtimeCaching: [
          {
            // Regra para salvar em cache as chamadas à API (ex: buscar tarefas)
            // Estratégia: StaleWhileRevalidate - mostra dados antigos enquanto busca novos.
            urlPattern: ({ url }) => url.protocol === 'https:' && url.hostname.endsWith('supabase.co'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-cache',
              cacheableResponse: {
                statuses: [0, 200], // Salva respostas de sucesso e opacas (necessário para cross-origin)
              },
              expiration: {
                maxEntries: 100, // Limita o número de respostas salvas
                maxAgeSeconds: 60 * 60 * 24, // Salva por até 24 horas
              },
            },
          },
          {
            // Regra para requisições de modificação (criar, atualizar, deletar)
            // Estratégia: NetworkOnly com fallback para Background Sync.
            urlPattern: ({ url }) => url.protocol === 'https:' && url.hostname.endsWith('supabase.co'),
            method: 'POST', // Aplicar para POST
            handler: 'NetworkOnly',
            options: {
              backgroundSync: {
                name: 'mutation-queue', // Nome da fila
                options: {
                  maxRetentionTime: 24 * 60, // Tentar reenviar por até 24 horas
                },
              },
            },
          },
          // Repetir a regra de Background Sync para outros métodos de modificação
          {
            urlPattern: ({ url }) => url.protocol === 'https:' && url.hostname.endsWith('supabase.co'),
            method: 'PUT',
            handler: 'NetworkOnly',
            options: { backgroundSync: { name: 'mutation-queue', options: { maxRetentionTime: 24 * 60 } } },
          },
          {
            urlPattern: ({ url }) => url.protocol === 'https:' && url.hostname.endsWith('supabase.co'),
            method: 'DELETE',
            handler: 'NetworkOnly',
            options: { backgroundSync: { name: 'mutation-queue', options: { maxRetentionTime: 24 * 60 } } },
          },
        ],
        // FIM DA NOVA CONFIGURAÇÃO
      },
      manifest: {
        name: 'Focus Frog',
        short_name: 'FocusFrog',
        description: 'Mantenha o foco e a produtividade com o aplicativo pomodoro Focus Frog.',
        theme_color: '#FBBF24',
        background_color: '#111827',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        id: '/',
        orientation: 'portrait-primary',
        icons: [
          {
            src: 'icon-192.png', 
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        screenshots: [],
        widgets: [] // Widgets removidos para simplificar
      }
    })
  ],
});
