
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
  // Usamos useRef para guardar o evento. É mais seguro que useState para objetos não-reativos.
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);
  
  // Estado para indicar à UI se o botão de instalar deve ser mostrado
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Impede o mini-infobar do Chrome de aparecer
      e.preventDefault();
      // Guarda o evento para que possa ser acionado mais tarde.
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      // Define o estado para que a UI possa mostrar o botão de instalação.
      setIsInstallable(true);
      console.log('Evento beforeinstallprompt capturado!');
    };

    // Adiciona o event listener
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listener para quando a app é instalada com sucesso
    window.addEventListener('appinstalled', () => {
        console.log('PWA instalado com sucesso!');
        // Esconde o botão de instalação pois a app já foi instalada
        setIsInstallable(false);
        deferredPrompt.current = null;
    });

    // Cleanup: remove o listener quando o componente é desmontado
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', () => {
        console.log('PWA instalado com sucesso!');
        setIsInstallable(false);
        deferredPrompt.current = null;
    });
    };
  }, []);

  // Função que será chamada pelo nosso botão de instalação
  const triggerInstall = async () => {
    if (deferredPrompt.current) {
      console.log('A acionar o prompt de instalação...');
      // Mostra o prompt de instalação
      await deferredPrompt.current.prompt();

      // Espera pela escolha do utilizador
      const { outcome } = await deferredPrompt.current.userChoice;
      console.log(`Escolha do utilizador: ${outcome}`);

      // O evento só pode ser usado uma vez, limpamos a referência.
      // O browser não vai disparar 'beforeinstallprompt' novamente na mesma sessão.
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
