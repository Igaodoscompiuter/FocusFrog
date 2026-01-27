
import './global-components.css';
import './App.css';
import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { useUser } from './context/UserContext';
import { useUI } from './context/UIContext';
import { useAuth } from './hooks/useAuth';
import { usePWAInstall } from './context/PWAInstallProvider';
import { OnboardingNameScreen } from './screens/OnboardingNameScreen';
import { OnboardingWelcomeScreen } from './screens/OnboardingWelcomeScreen';
import { SplashScreen } from './screens/SplashScreen';
import { AppLayout } from './components/AppLayout';
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
  const [authFinished, setAuthFinished] = useState(false);
  const [minTimePassed, setMinTimePassed] = useState(false);

  useEffect(() => {
    document.body.className = `font-size-${fontSize}`;
  }, [fontSize]);

  useEffect(() => {
    if (!isLoading) {
      setAuthFinished(true);
    }
  }, [isLoading]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimePassed(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (authFinished && minTimePassed) {
      const fadeOutTimer = setTimeout(() => setIsFadingOut(true), 50);
      const removeSplashTimer = setTimeout(() => {
        if (Capacitor.isNativePlatform()) {
          CapacitorSplashScreen.hide({ fadeOutDuration: 300 });
        }
        setShowSplash(false);
      }, 800);

      return () => {
        clearTimeout(fadeOutTimer);
        clearTimeout(removeSplashTimer);
      };
    }
  }, [authFinished, minTimePassed]);

  useEffect(() => {
    if (canInstall) {
      const timer = setTimeout(() => setShowInstallPopup(true), 3500);
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

  if (showSplash) {
    return <SplashScreen isFadingOut={isFadingOut} />;
  }

  // --- LÓGICA DE RENDERIZAÇÃO CORRIGIDA ---
  let screenContent;
  if (!onboardingCompleted) {
    if (!userName) {
      screenContent = <OnboardingNameScreen />;
    } else {
      screenContent = <OnboardingWelcomeScreen />;
    }
  } else {
    // Se o onboarding estiver concluído, renderize o AppLayout
    screenContent = <AppLayout />;
  }

  return (
    <div id="app-container">
      {screenContent}
      <InstallPromptPopup 
        show={showInstallPopup}
        onInstall={handleInstall}
        onDismiss={handleDismiss}
      />
    </div>
  );
}

export default App;
