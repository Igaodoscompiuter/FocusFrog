
import './global-components.css';
import './App.css';
import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { useUser } from './context/UserContext';
import { useUI } from './context/UIContext';
import { useAuth } from './hooks/useAuth';
import { usePWAInstall } from './context/PWAInstallProvider';
import { DashboardScreen } from './screens/DashboardScreen';
import { OnboardingNameScreen } from './screens/OnboardingNameScreen';
import { OnboardingWelcomeScreen } from './screens/OnboardingWelcomeScreen';
import { SplashScreen } from './screens/SplashScreen';
import { Layout } from './components/layout/Layout';
import { SplashScreen as CapacitorSplashScreen } from '@capacitor/splash-screen';
import InstallPromptPopup from './components/InstallPromptPopup';

function App() {
  const { userName, onboardingCompleted } = useUser();
  const { isLoading } = useAuth();
  const { fontSize } = useUI();
  const { canInstall, triggerInstall } = usePWAInstall();

  const [showInstallPopup, setShowInstallPopup] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  // --- LÓGICA DA SPLASH SCREEN MELHORADA ---
  // Estados para controlar as condições de saída da splash
  const [authFinished, setAuthFinished] = useState(false);
  const [minTimePassed, setMinTimePassed] = useState(false);

  useEffect(() => {
    document.body.className = `font-size-${fontSize}`;
  }, [fontSize]);

  // Efeito para verificar quando a autenticação termina
  useEffect(() => {
    if (!isLoading) {
      setAuthFinished(true);
    }
  }, [isLoading]);

  // Efeito para garantir o tempo mínimo de exibição
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimePassed(true);
    }, 2500); // 2.5 segundos de tempo mínimo
    return () => clearTimeout(timer);
  }, []); // Executa apenas uma vez

  // Efeito principal que decide quando esconder a splash
  useEffect(() => {
    // Apenas age quando AMBAS as condições são verdadeiras
    if (authFinished && minTimePassed) {
      const fadeOutTimer = setTimeout(() => setIsFadingOut(true), 50);
      const removeSplashTimer = setTimeout(() => {
        if (Capacitor.isNativePlatform()) {
          CapacitorSplashScreen.hide({ fadeOutDuration: 300 });
        }
        setShowSplash(false);
      }, 800); // Duração da animação de fade-out

      return () => {
        clearTimeout(fadeOutTimer);
        clearTimeout(removeSplashTimer);
      };
    }
  }, [authFinished, minTimePassed]); // Dispara quando uma das condições muda

  // Mostra o pop-up de instalação se possível
  useEffect(() => {
    if (canInstall) {
      const timer = setTimeout(() => setShowInstallPopup(true), 3500); // Atraso maior para não sobrepor a splash
      return () => clearTimeout(timer);
    }
  }, [canInstall]);

  const handleInstall = () => {
    setShowInstallPopup(false);
    triggerInstall();
  };

  const handleDismiss = () => {
    setShowInstallPopup(false);
  };

  // A condição de renderização agora implicitamente depende da nova lógica
  if (showSplash) {
    return <SplashScreen isFadingOut={isFadingOut} />;
  }

  let screenContent;
  if (!onboardingCompleted) {
    if (!userName) {
      screenContent = <OnboardingNameScreen />;
    } else {
      screenContent = <OnboardingWelcomeScreen />;
    }
  } else {
    screenContent = <DashboardScreen />;
  }

  return (
    <div id="app-container">
      <Layout>{screenContent}</Layout>
      <InstallPromptPopup 
        show={showInstallPopup}
        onInstall={handleInstall}
        onDismiss={handleDismiss}
      />
    </div>
  );
}

export default App;
