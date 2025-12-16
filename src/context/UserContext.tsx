
import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from '../hooks/useAuth'; // Importa nosso novo hook de autenticação Supabase

interface UserContextType {
  userName: string | null;
  onboardingCompleted: boolean;
  setUserName: (name: string) => void;
  completeOnboarding: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser deve ser usado dentro de um UserProvider');
  }
  return context;
};

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userName, setUserNameInternal] = useLocalStorage<string | null>('focusfrog_userName', null);
  const [onboardingCompleted, setOnboardingCompleted] = useLocalStorage<boolean>('focusfrog_onboardingCompleted', false);
  
  // Pega o usuário do novo hook useAuth (Supabase)
  const { user: authUser } = useAuth(); 

  // Função para definir o nome do usuário - agora salva APENAS localmente.
  // A sincronização com a nuvem será tratada em outro lugar.
  const setUserName = (name: string) => {
    setUserNameInternal(name);
  };

  // Função para marcar o onboarding como concluído
  const completeOnboarding = () => {
    setOnboardingCompleted(true);
  };

  // EFEITO: Pega o nome do usuário do perfil do Google (via Supabase) durante o onboarding
  useEffect(() => {
    // Condições:
    // 1. O usuário está logado (authUser existe).
    // 2. O onboarding ainda não foi concluído.
    // 3. O nome de usuário local ainda não foi definido.
    // 4. O objeto de usuário do Supabase tem o nome completo em user_metadata.
    if (authUser && !onboardingCompleted && !userName && authUser.user_metadata?.full_name) {
      
      // Pega o primeiro nome do full_name do Supabase
      const firstName = authUser.user_metadata.full_name.split(' ')[0];
      
      // Define o nome de usuário localmente
      setUserName(firstName);
    }
    // Dependências: o efeito roda quando o status do usuário muda ou o onboarding é completado
  }, [authUser, onboardingCompleted, userName, setUserName]);

  const value = {
    userName,
    onboardingCompleted,
    setUserName,
    completeOnboarding,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
