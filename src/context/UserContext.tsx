
import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from '../hooks/useAuth'; // Importa o hook de autenticação
import { getAuthInstance } from '../firebase';
import { updateProfile } from 'firebase/auth';

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
  
  const { user: authUser, isGoogleUser } = useAuth(); // Pega o usuário da autenticação

  // Função para definir o nome do usuário
  const setUserName = async (name: string) => {
    setUserNameInternal(name); // Salva localmente
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

  // EFEITO: Pega o nome do usuário do Google durante o onboarding
  useEffect(() => {
    // Condições:
    // 1. É um usuário do Google.
    // 2. O onboarding ainda não foi concluído.
    // 3. O nome de usuário local ainda não foi definido.
    // 4. O objeto de usuário do Google (authUser) existe e tem um nome.
    if (isGoogleUser && !onboardingCompleted && !userName && authUser?.displayName) {
      
      // Pega o primeiro nome do displayName do Google
      const firstName = authUser.displayName.split(' ')[0];
      
      // Define o nome de usuário, que irá acionar a transição para a próxima tela de onboarding
      setUserName(firstName);
    }
    // Dependências: o efeito roda quando o status do usuário muda ou o onboarding é completado
  }, [isGoogleUser, authUser, onboardingCompleted, userName]);

  const value = {
    userName,
    onboardingCompleted,
    setUserName,
    completeOnboarding,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
