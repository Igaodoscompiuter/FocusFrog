
import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useAuth } from '../hooks/useAuth';
import { FcGoogle } from 'react-icons/fc';
import './OnboardingNameScreen.css';

const LOGO_URL = '/icon-512.png';

export const OnboardingNameScreen: React.FC = () => {
  const [name, setName] = useState('');
  const { setUserName } = useUser();
  const { upgradeToGoogle } = useAuth();

  const handleNameSubmit = () => {
    if (name.trim()) {
      setUserName(name.trim());
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await upgradeToGoogle();
    } catch (error) {
      console.error("Erro ao fazer login com o Google:", error);
    }
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        <img src={LOGO_URL} alt="FocusFrog Logo" className="onboarding-logo" />
        
        <h1 className="onboarding-title">Bem-vindo(a) ao Focus Frog!</h1>
        <p className="onboarding-subtitle">
          Seu oásis de produtividade para transformar o caos em clareza.
        </p>

        {/* Ação Principal: Login com Google */}
        <div className="onboarding-actions">
          <button onClick={handleGoogleSignIn} className="btn btn-secondary">
            <FcGoogle />
            Entrar com o Google
          </button>
        </div>

        {/* Divisor */}
        <div className="onboarding-divider">
          <span>OU</span>
        </div>

        {/* Ação Secundária: Inserir apenas o nome */}
        <div className="onboarding-actions">
          <div className="onboarding-input-group">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite seu nome aqui"
              className="g-input"
              onKeyPress={(e) => e.key === 'Enter' && handleNameSubmit()}
            />
            <button onClick={handleNameSubmit} className="btn btn-accent">
              Continuar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
