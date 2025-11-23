import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
      
      // Solicitar permissão para notificações
      if ('Notification' in window) {
        Notification.requestPermission(status => {
          console.log('Notification permission status:', status);
        });
      }

    }, err => {
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);