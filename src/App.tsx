
import './global-components.css';
import './App.css'; // Garantindo que App.css seja importado
import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { useUser } from './context/UserContext';
import { useUI } from './context/UIContext';
import { PWAInstallProvider } from './context/PWAInstallProvider';
import { DashboardScreen } from './screens/DashboardScreen';
import { OnboardingNameScreen } from './screens/OnboardingNameScreen';
import { SplashScreen } from './screens/SplashScreen';
import { Layout } from './components/layout/Layout';
import { SplashScreen as CapacitorSplashScreen } from '@capacitor/splash-screen';

function App() {
  const { onboardingCompleted } = useUser();
  const { fontSize } = useUI(); // Obtendo o estado do tamanho da fonte

  const [showSplash, setShowSplash] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  // EFEITO GLOBAL PARA O TAMANHO DA FONTE
  useEffect(() => {
    const body = document.body;
    // Limpa classes de fonte anteriores
    body.classList.remove('font-size-small', 'font-size-normal', 'font-size-large');
    // Adiciona a classe atual
    body.classList.add(`font-size-${fontSize}`);
  }, [fontSize]); // Roda sempre que o `fontSize` mudar


  useEffect(() => {
    const fadeOutTimer = setTimeout(() => setIsFadingOut(true), 2000);
    const removeSplashTimer = setTimeout(() => {
      if (Capacitor.isNativePlatform()) {
        CapacitorSplashScreen.hide({ fadeOutDuration: 300 });
      }
      setShowSplash(false);
    }, 2800);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(removeSplashTimer);
    };
  }, []);

  // A lógica da splash screen e do onboarding permanece a mesma
  if (showSplash) {
    return <SplashScreen isFadingOut={isFadingOut} />;
  }

  if (!onboardingCompleted) {
        return (
            <PWAInstallProvider>
                <div id="app-container">
                    <Layout>
                        <OnboardingNameScreen />
                    </Layout>
                </div>
            </PWAInstallProvider>
        );
    }

  return (
    <PWAInstallProvider>
      <div id="app-container">
        <Layout>
          <DashboardScreen />
        </Layout>
      </div>
    </PWAInstallProvider>
  );
}

export default App;
