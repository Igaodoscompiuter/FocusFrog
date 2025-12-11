
import React, { createContext, useContext, ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { getAuthInstance } from '../firebase';
import { updateProfile } from 'firebase/auth';

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
  const [userName, setUserNameInternal] = useLocalStorage<string | null>('focusfrog_userName', null);
  const [onboardingCompleted, setOnboardingCompleted] = useLocalStorage<boolean>('focusfrog_onboardingCompleted', false);

  // Função para definir o nome do usuário e atualizar o perfil do Firebase
  const setUserName = async (name: string) => {
    setUserNameInternal(name); // Salva localmente para acesso rápido
    const auth = getAuthInstance();
    if (auth.currentUser) {
      try {
        await updateProfile(auth.currentUser, { displayName: name });
      } catch (error) {
        console.error("Erro ao atualizar o perfil do Firebase:", error);
      }
    }
  };

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
