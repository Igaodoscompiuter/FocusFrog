
import './global-components.css';
import React, { useState, useEffect } from 'react';
import { useUser } from './context/UserContext';
import { useUI } from './context/UIContext';
import { DashboardScreen } from './screens/DashboardScreen';
import { OnboardingNameScreen } from './screens/OnboardingNameScreen';
import { OnboardingWelcomeScreen } from './screens/OnboardingWelcomeScreen';
import { SplashScreen } from './screens/SplashScreen';
import { Layout } from './components/layout/Layout'; // Importa o Layout

function App() {
  const { onboardingCompleted, userName } = useUser();
  const { showWelcomeScreen } = useUI();

  const [showSplash, setShowSplash] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
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
  }, []);

  if (showSplash) {
    return <SplashScreen isFadingOut={isFadingOut} />;
  }

  // Envolve o conteúdo principal com o componente Layout
  return (
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
  );
}

export default App;
