
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Capacitor } from '@capacitor/core';

// [CORREÇÃO] No APK não existe service worker: os arquivos já vêm dentro do
// app. Um service worker herdado de versões anteriores (o UpdatePrompt o
// registrava) guardava uma cópia dos arquivos e podia servir o código ANTIGO
// depois de instalar um APK novo, até alguém tocar em "atualizar". Aqui ele
// é removido junto com o cache; se ele estava no controle desta abertura,
// recarrega uma única vez pra já abrir com os arquivos novos.
if (Capacitor.isNativePlatform() && 'serviceWorker' in navigator) {
  const hadController = !!navigator.serviceWorker.controller;
  Promise.all([
    navigator.serviceWorker.getRegistrations().then(regs => Promise.all(regs.map(r => r.unregister()))),
    'caches' in window ? caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))) : Promise.resolve([]),
  ]).then(() => { if (hadController) window.location.reload(); }).catch(() => {});
}
import './App.css';
// A importação agora aponta explicitamente para o arquivo .tsx
import { AuthProvider } from './hooks/useAuth.tsx'; 
import { UserProvider } from './context/UserContext';
import { UIProvider } from './context/UIContext';
import { ThemeProvider } from './context/ThemeContext';
import { TasksProvider } from './context/TasksContext';
import { PomodoroProvider } from './context/PomodoroContext';
import { PWAInstallProvider } from './context/PWAInstallProvider';
import { Workbox } from 'workbox-window';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

if ('serviceWorker' in navigator) {
  const wb = new Workbox('/sw.js');
  wb.addEventListener('waiting', (event) => {
    wb.messageSkipWaiting();
  });
  wb.addEventListener('controlling', (event) => {
    if (event.isUpdate) {
        window.location.reload();
    }
  });
  wb.register();
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <PWAInstallProvider>
      <UIProvider>
        <ThemeProvider>
          {/* AuthProvider envolve os contextos que dependem da autenticação */}
          <AuthProvider>
            <UserProvider>
              <PomodoroProvider>
                <TasksProvider>
                  <App />
                </TasksProvider>
              </PomodoroProvider>
            </UserProvider>
          </AuthProvider>
        </ThemeProvider>
      </UIProvider>
    </PWAInstallProvider>
  </React.StrictMode>
);
