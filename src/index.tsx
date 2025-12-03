
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';
import { UserProvider } from './context/UserContext';
import { UIProvider } from './context/UIContext';
import { ThemeProvider } from './context/ThemeContext';
import { TasksProvider } from './context/TasksContext';
import { PomodoroProvider } from './context/PomodoroContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

// Envolvemos o App com todos os providers na ordem correta de dependência
root.render(
  <React.StrictMode>
    <UIProvider>
      <ThemeProvider>
        <UserProvider>
          <PomodoroProvider>
            <TasksProvider>
              <App />
            </TasksProvider>
          </PomodoroProvider>
        </UserProvider>
      </ThemeProvider>
    </UIProvider>
  </React.StrictMode>
);
