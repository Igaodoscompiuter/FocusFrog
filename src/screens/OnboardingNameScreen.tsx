
import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useUI } from '../context/UIContext'; // Importa o hook da UI
import { usePWAInstall } from '../context/PWAInstallProvider'; // Importa o hook PWA
import './OnboardingNameScreen.css';

const LOGO_URL = '/icon-512.png';

export const OnboardingNameScreen: React.FC = () => {
  const [name, setName] = useState('');
  const { setUserName } = useUser();
  const { showPWAInstallPopup } = useUI(); // Pega a função para mostrar o popup
  const { canInstall } = usePWAInstall(); // Pega o estado que nos diz se a app é instalável

  const handleSubmit = () => {
    if (name.trim()) {
      setUserName(name.trim());
      
      // Se a app for instalável, mostra o popup de sugestão
      if (canInstall) {
        showPWAInstallPopup();
      }
    }
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        <img src={LOGO_URL} alt="FocusFrog Logo" className="onboarding-logo" />
        
        <h1 className="onboarding-title">Bem-vindo(a) ao Focus Frog!</h1>
        <p className="onboarding-subtitle">
          O seu oásis de produtividade para transformar o caos em clareza. Como podemos chamar você?
        </p>

        <div className="onboarding-input-group">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Digite seu nome aqui"
            className="g-input"
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <button onClick={handleSubmit} className="g-button g-button--primary">
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
};
