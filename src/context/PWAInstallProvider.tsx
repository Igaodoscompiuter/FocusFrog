
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { trackPWAInstall } from '../analytics'; // Importa a nossa nova função de tracking

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
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      setIsInstallable(true);
      console.log('Evento beforeinstallprompt capturado com sucesso!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleAppInstalled = () => {
        console.log('PWA instalado com sucesso!');
        // Aqui também poderíamos rastrear, mas rastrear no userChoice é mais direto
        // para atribuir a fonte do clique.
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

      if (outcome === 'accepted') {
          console.log('O utilizador aceitou a instalação. A rastrear o evento...');
          // Rastreia o evento de instalação com a fonte correta, como definido no manual!
          trackPWAInstall('install_button');
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
