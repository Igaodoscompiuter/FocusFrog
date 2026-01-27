
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
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
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
        widgets: [
          {
            name: 'Sapo do Dia',
            short_name: 'Sapo do Dia',
            description: 'Acompanhe sua tarefa mais importante do dia.',
            tag: 'sapo-do-dia',
            template: 'sapo-widget-template',
            ms_ac_template: '/sapo-widget.html',
            icons: [
              {
                src: 'icon-192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any'
              }
            ],
            screenshots: [
              {
                src: 'sapo-widget-screenshot.png', // Placeholder
                sizes: '320x640',
                type: 'image/png'
              }
            ]
          },
          {
            name: 'Checklist de Saída',
            short_name: 'Checklist',
            description: 'Verifique seus itens essenciais antes de sair.',
            tag: 'checklist-saida',
            template: 'checklist-widget-template',
            ms_ac_template: '/checklist-widget.html',
            icons: [
              {
                src: 'icon-192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any'
              }
            ],
            screenshots: [
              {
                src: 'checklist-widget-screenshot.png', // Placeholder
                sizes: '320x640',
                type: 'image/png'
              }
            ]
          }
        ]
      }
    })
  ],
});
