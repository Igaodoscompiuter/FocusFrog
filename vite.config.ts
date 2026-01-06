
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');

    const firebaseConfig = {
        apiKey: env.VITE_FIREBASE_API_KEY,
        authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: env.VITE_FIREBASE_APP_ID,
        measurementId: env.VITE_FIREBASE_MEASUREMENT_ID
    };

    return {
        base: './',
        plugins: [
            react(),
            VitePWA({
                // A OPÇÃO "selfDestroying" FOI REMOVIDA DAQUI.
                registerType: 'prompt',
                strategies: 'injectManifest',
                srcDir: 'src',
                filename: 'custom-sw.ts',
                injectManifest: {
                    globPatterns: ['**/*.{js,css,html,png,svg,webp}']
                },
                devOptions: {
                  enabled: true,
                  type: 'module',
                },
                manifest: {
                    name: 'FocusFrog',
                    short_name: 'FocusFrog',
                    description: 'Um app de produtividade para mentes criativas e com TDAH.',
                    theme_color: '#1a1a1a',
                    background_color: '#1a1a1a',
                    display: 'standalone',
                    scope: '/',
                    start_url: '/',
                    icons: [
                        { src: 'icon-192.png', type: 'image/png', sizes: '192x192' },
                        { src: 'icon-512.png', type: 'image/png', sizes: '512x512' },
                        { src: 'icon-512.png', type: 'image/png', sizes: '512x512', purpose: 'any maskable' }
                    ]
                },
            })
        ],
        define: {
            'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
            'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
            'process.env.FIREBASE_CONFIG': JSON.stringify(firebaseConfig)
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            }
        },
        server: {
            hmr: {
                host: process.env.IDE_HOST,
                clientPort: 443
            }
        }
    };
});
