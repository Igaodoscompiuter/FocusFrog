
import React from 'react';
import './UpdatePrompt.css';
import { useRegisterSW } from 'virtual:pwa-register/react';

/**
 * Este componente usa a abordagem de render-props do `useRegisterSW`
 * para evitar re-renderizações e loops de efeito colateral.
 */
export function UpdatePrompt() {
  const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW({
    onRegistered(r) {
      console.log('Service Worker registrado com sucesso.');
    },
    onRegisterError(error) {
      console.error('Erro ao registrar o Service Worker:', error);
    },
  });

  const handleUpdate = () => {
    // O `true` aqui força o service worker a pular a fase de "espera" e ativar imediatamente.
    updateServiceWorker(true);
  };

  // Renderiza o pop-up apenas quando uma atualização é necessária.
  if (needRefresh) {
    return (
      <div className="update-prompt-container" role="alert">
        <div className="update-prompt-content">
          <p>Uma nova versão está disponível!</p>
          <button 
            onClick={handleUpdate} 
            // Aplicando o estilo de botão padrão do app
            className="btn btn-primary update-prompt-button"
          >
            Atualizar Agora
          </button>
        </div>
      </div>
    );
  }

  // Não renderiza nada se não houver necessidade de atualização.
  return null;
}
