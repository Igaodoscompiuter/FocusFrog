
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
