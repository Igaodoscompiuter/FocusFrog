
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
import { StatusBar, Style } from '@capacitor/status-bar';
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

  // [CORREÇÃO DE VERDADE] setOverlaysWebView()/setBackgroundColor() usam uma
  // API do Android anterior ao Android 11 (SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN),
  // que o Android 15 não respeita mais de forma confiável — e brigava com o
  // adjustMarginsForEdgeToEdge:auto (esse sim moderno) que cuida do CONTEÚDO.
  // Resultado: a barra ficava transparente de qualquer jeito. Mantemos só
  // setStyle (API moderna, WindowInsetsControllerCompat, funciona bem) pra
  // cor do ÍCONE; a cor de FUNDO da barra agora é uma div própria no CSS
  // (ver .statusBarFill), desenhada atrás da barra transparente do sistema —
  // é a abordagem que o próprio Google recomenda pra edge-to-edge de verdade.
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    StatusBar.setStyle({ style: Style.Light }).catch(() => {}); // ícones escuros (fundo claro)
  }, []);

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

  {/* [CORREÇÃO] No app nativo, a splash do Capacitor já mostra (fica visível
      até CapacitorSplashScreen.hide() ser chamado). Esse componente React
      mostrava o MESMO logo por baixo dela — a pessoa via a splash nativa
      sumir e revelar essa segunda, quase idêntica, fazendo sua própria
      animação. No nativo pulamos direto pro app real; no PWA/web (sem
      splash nativa nenhuma) ele continua sendo a única splash que existe. */}
  if (showSplash && !Capacitor.isNativePlatform()) {
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
      {Capacitor.isNativePlatform() && <div className="statusBarFill" />}
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
