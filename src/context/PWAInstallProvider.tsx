
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

// Define a interface para o evento 'beforeinstallprompt' para ter tipagem forte
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Define a forma do nosso contexto
interface PWAInstallContextType {
  canInstall: boolean;
  triggerInstall: () => void;
}

// Cria o contexto com um valor default
const PWAInstallContext = createContext<PWAInstallContextType>({
  canInstall: false,
  triggerInstall: () => console.warn('triggerInstall chamado fora de um PWAInstallProvider'),
});

// Hook customizado para usar o contexto facilmente
export const usePWAInstall = () => useContext(PWAInstallContext);

// O componente Provider
export const PWAInstallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Impede o mini-infobar nativo de aparecer para que possamos usar a nossa UI.
      e.preventDefault();
      // Guarda o evento para que possa ser acionado mais tarde.
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      // Define o estado para que a UI possa mostrar o botão de instalação.
      setIsInstallable(true);
      console.log('Evento beforeinstallprompt capturado com sucesso!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleAppInstalled = () => {
        console.log('PWA instalado com sucesso!');
        // Esconde o botão de instalação pois a app já foi instalada.
        setIsInstallable(false);
        deferredPrompt.current = null;
    };
    
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const triggerInstall = async () => {
    if (deferredPrompt.current) {
      console.log('A acionar o prompt de instalação...');
      await deferredPrompt.current.prompt();

      const { outcome } = await deferredPrompt.current.userChoice;
      console.log(`Escolha do utilizador: ${outcome}`);

      // Limpa a referência após o uso. O evento não pode ser usado novamente.
      if (outcome === 'accepted') {
          setIsInstallable(false);
          deferredPrompt.current = null;
      }
    } else {
      console.warn('O evento de instalação não está disponível.');
    }
  };

  const value = {
    canInstall: isInstallable,
    triggerInstall,
  };

  return (
    <PWAInstallContext.Provider value={value}>
      {children}
    </PWAInstallContext.Provider>
  );
};
