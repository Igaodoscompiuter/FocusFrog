import React from 'react';
import { useAuth, AuthProviderName } from '../hooks/useAuth';
import './OnboardingNameScreen.css';
import './OnboardingAccountScreen.css';

export const ACCOUNT_CHOICE_KEY = 'focusfrog_account_choice'; // 'local' | 'cloud' (do aparelho)

export const GoogleIcon = () => <img src="/google-logo.svg" alt="" width={20} height={20} />;
export const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#fff" d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.24 2.69.24v2.97h-1.52c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z" />
  </svg>
);

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
          <button className="account-btn account-facebook" onClick={() => go('facebook')} disabled={isSigningIn}>
            <FacebookIcon /> Continuar com Facebook
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
