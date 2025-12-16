
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
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
    console.log('Nova versão do Service Worker detetada e pronta para ativar.');
    wb.messageSkipWaiting();
    console.log('Comando skipWaiting enviado para o novo Service Worker.');
  });
  wb.addEventListener('controlling', (event) => {
    if (event.isUpdate) {
        console.log('Novo Service Worker assumiu o controlo. A recarregar a página...');
        window.location.reload();
    }
  });
  wb.register();
  console.log('Service Worker registado com a Workbox.');
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
