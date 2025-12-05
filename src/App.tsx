
import './global-components.css';
import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { useUser } from './context/UserContext';
import { useUI } from './context/UIContext';
import { PWAInstallProvider } from './context/PWAInstallProvider';
import { DashboardScreen } from './screens/DashboardScreen';
import { OnboardingNameScreen } from './screens/OnboardingNameScreen';
import { OnboardingWelcomeScreen } from './screens/OnboardingWelcomeScreen';
import { SplashScreen } from './screens/SplashScreen';
import { Layout } from './components/layout/Layout';

function App() {
  const { onboardingCompleted, userName } = useUser();
  const { showWelcomeScreen } = useUI();

  const [showSplash, setShowSplash] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      if (Capacitor.isNativePlatform()) {
        // Importa e esconde a splash screen nativa dinamicamente
        const { SplashScreen: CapacitorSplashScreen } = await import('@capacitor/splash-screen');
        await CapacitorSplashScreen.hide();
      }

      // Lógica da animação da splash screen web
      const fadeOutTimer = setTimeout(() => {
        setIsFadingOut(true);
      }, 2000);

      const removeSplashTimer = setTimeout(() => {
        setShowSplash(false);
      }, 2800);

      return () => {
        clearTimeout(fadeOutTimer);
        clearTimeout(removeSplashTimer);
      };
    };

    initializeApp();
  }, []);

  if (showSplash) {
    return <SplashScreen isFadingOut={isFadingOut} />;
  }

  return (
    <PWAInstallProvider>
      <Layout>
        {!onboardingCompleted ? (
          !userName ? (
            <OnboardingNameScreen />
          ) : (
            <OnboardingWelcomeScreen />
          )
        ) : (
          <DashboardScreen />
        )}
      </Layout>
    </PWAInstallProvider>
  );
}

export default App;
