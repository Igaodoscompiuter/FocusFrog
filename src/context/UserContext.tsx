
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

// Define a estrutura dos dados do contexto do usuário
interface UserContextType {
  userName: string | null;
  onboardingCompleted: boolean;
  setUserName: (name: string) => void;
  completeOnboarding: () => void;
}

// Cria o Context com um valor padrão indefinido
const UserContext = createContext<UserContextType | undefined>(undefined);

// Hook customizado para facilitar o uso do contexto em outros componentes
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser deve ser usado dentro de um UserProvider');
  }
  return context;
};

// Componente Provider que irá envolver a aplicação
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userName, setUserName] = useLocalStorage<string | null>('focusfrog_userName', null);
  const [onboardingCompleted, setOnboardingCompleted] = useLocalStorage<boolean>('focusfrog_onboardingCompleted', false);

  // Função para marcar o onboarding como concluído
  const completeOnboarding = () => {
    setOnboardingCompleted(true);
  };

  const value = {
    userName,
    onboardingCompleted,
    setUserName,
    completeOnboarding,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
