import React from 'react';
import { useAuth, AuthProviderName } from '../hooks/useAuth';
import './OnboardingNameScreen.css';
import './OnboardingAccountScreen.css';

export const ACCOUNT_CHOICE_KEY = 'focusfrog_account_choice'; // 'local' | 'cloud' (do aparelho)

export const GoogleIcon = () => <img src="/google-logo.svg" alt="" width={20} height={20} />;

/**
 * 1ª abertura: entrar com uma conta (cria se for nova, recupera se já
 * existir — o app descobre sozinho) ou seguir sem conta, 100% local.
 */
export const OnboardingAccountScreen: React.FC<{ onContinueWithoutAccount: () => void }> = ({ onContinueWithoutAccount }) => {
  const { signIn, isSigningIn } = useAuth();
  const go = (p: AuthProviderName) => signIn(p, 'onboarding');

  return (
    <div className="onboarding-container">
      <div className="onboarding-card account-card">
        <img src="/icon-512.png" alt="FocusFrog" className="onboarding-logo" />
        <h1 className="onboarding-title">Bem-vindo(a) ao FocusFrog!</h1>
        <p className="onboarding-subtitle">
          Entre com uma conta pra guardar suas tarefas, rotinas e sapos na nuvem.
          Já usou antes? Entre com a mesma conta e tudo volta.
        </p>

        <div className="account-buttons">
          <button className="account-btn account-google" onClick={() => go('google')} disabled={isSigningIn}>
            <GoogleIcon /> Continuar com Google
          </button>
        </div>

        {isSigningIn && <p className="account-waiting">Esperando o login no navegador…</p>}

        <div className="account-divider"><span>ou</span></div>

        <button className="account-skip" onClick={onContinueWithoutAccount} disabled={isSigningIn}>
          Continuar sem conta
        </button>
        <p className="account-note">
          Sem conta, tudo fica só neste celular. Dá pra entrar depois em Configurações.
        </p>
      </div>
    </div>
  );
};
