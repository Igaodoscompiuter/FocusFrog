import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      plugins: [
        react(),
        VitePWA({
          // Muda para a estratégia 'injectManifest' para nos dar controle total sobre o service worker.
          // Isso nos permite lidar com lógica de notificação complexa diretamente no service worker.
          strategies: 'injectManifest',
          // Especifica o nosso arquivo de service worker personalizado.
          srcDir: 'src',
          filename: 'sw.js',
          registerType: 'prompt',
          // O manifesto permanece o mesmo, garantindo a identidade visual do PWA.
          manifest: {
            name: 'Focus Frog',
            short_name: 'FocusFrog',
            description: 'Mantenha o foco e a produtividade com o aplicativo pomodoro Focus Frog.',
            theme_color: '#5c8b57',
            background_color: '#ffffff',
            display: 'standalone',
            start_url: '/',
            scope: '/',
            icons: [
              {
                src: '/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any'
              },
              {
                src: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any'
              },
              {
                src: '/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable'
              },
              {
                src: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable'
              }
            ]
          }
        })
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        }
      }
    };
});
