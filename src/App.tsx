
import './global-components.css';
import './App.css';
import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { useUser } from './context/UserContext';
import { useUI } from './context/UIContext';
import { useAuth } from './hooks/useAuth';
import { PWAInstallProvider } from './context/PWAInstallProvider';
import { DashboardScreen } from './screens/DashboardScreen';
import { OnboardingNameScreen } from './screens/OnboardingNameScreen';
import { OnboardingWelcomeScreen } from './screens/OnboardingWelcomeScreen';
import { SplashScreen } from './screens/SplashScreen';
import { Layout } from './components/layout/Layout';
import { SplashScreen as CapacitorSplashScreen } from '@capacitor/splash-screen';

function App() {
  const { userName, onboardingCompleted } = useUser();
  // Hook de autenticação simplificado
  const { isLoading } = useAuth(); 
  const { fontSize } = useUI();

  const [showSplash, setShowSplash] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    document.body.className = `font-size-${fontSize}`;
  }, [fontSize]);

  useEffect(() => {
    // A splash só deve sumir APÓS a autenticação carregar
    if (!isLoading) {
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
  }, [isLoading]);

  // Mostra a splash enquanto a autenticação está carregando
  if (isLoading || showSplash) {
    return <SplashScreen isFadingOut={isFadingOut} />;
  }

  // --- LÓGICA DE ROTEAMENTO SIMPLIFICADA ---
  let screenContent;
  if (!onboardingCompleted) {
    // Se o nome ainda não foi definido, pede o nome.
    if (!userName) {
      screenContent = <OnboardingNameScreen />;
    } else {
      // Se o nome já existe, mostra a tela de boas-vindas.
      screenContent = <OnboardingWelcomeScreen />;
    }
  } else {
    // Se o onboarding estiver completo, mostra o dashboard.
    screenContent = <DashboardScreen />;
  }

  return (
    <PWAInstallProvider>
      <div id="app-container">
        <Layout>{screenContent}</Layout>
      </div>
    </PWAInstallProvider>
  );
}

export default App;
