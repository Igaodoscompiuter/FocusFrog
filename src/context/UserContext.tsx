
import React, { createContext, useContext, ReactNode, useEffect, useState, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from '../hooks/useAuth';
import { useUserData } from '../hooks/useUserData';

// A forma da informação do sapo que será exibida na recompensa
export interface NewlyAcquiredFrogInfo {
  speciesId: string;
}

interface UserContextType {
  userName: string | null;
  onboardingCompleted: boolean;
  collectedFrogs: string[];
  // NOVO: Estado para o sapo recém-ganho que será exibido na tela de recompensa
  newlyAcquiredFrog: NewlyAcquiredFrogInfo | null;
  setUserName: (name: string) => void;
  completeOnboarding: () => void;
  addFrogToCollection: (speciesId: string) => void;
  // NOVO: Função para o usuário "aceitar" a recompensa e limpar o estado
  clearNewlyAcquiredFrog: () => void;
  setCurrentFrogForSession: (speciesId: string) => void;
  collectCurrentFrog: () => void;
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
  const { getCollectedFrogs, addFrogToCollection: addFrogToCollectionInternal } = useUserData();

  const [collectedFrogs, setCollectedFrogs] = useState<string[]>([]);
  // NOVO: Estado para guardar a informação do sapo recém-adquirido.
  const [newlyAcquiredFrog, setNewlyAcquiredFrog] = useState<NewlyAcquiredFrogInfo | null>(null);
  const [currentFrogForSession, setCurrentFrogForSession] = useState<string | null>(null);

  const { user: authUser } = useAuth();

  useEffect(() => {
    setCollectedFrogs(getCollectedFrogs());
  }, [getCollectedFrogs]);

  // MODIFICADO: Esta função agora define o estado `newlyAcquiredFrog` além de salvar o sapo.
  const addFrogToCollection = useCallback((speciesId: string) => {
    addFrogToCollectionInternal(speciesId);
    setCollectedFrogs(getCollectedFrogs()); // Atualiza a lista de todos os sapos
    setNewlyAcquiredFrog({ speciesId: speciesId }); // Coloca o novo sapo em destaque para a recompensa!
  }, [addFrogToCollectionInternal, getCollectedFrogs]);

  // NOVO: Função para limpar o estado de destaque após o usuário ver a recompensa.
  const clearNewlyAcquiredFrog = useCallback(() => {
    setNewlyAcquiredFrog(null);
  }, []);

  const collectCurrentFrog = useCallback(() => {
    if (currentFrogForSession) {
      addFrogToCollection(currentFrogForSession);
      setCurrentFrogForSession(null);
    }
  }, [currentFrogForSession, addFrogToCollection]);

  const setUserName = (name: string) => {
    setUserNameInternal(name);
  };

  const completeOnboarding = () => {
    setOnboardingCompleted(true);
  };

  useEffect(() => {
    if (authUser && !onboardingCompleted && !userName && authUser.user_metadata?.full_name) {
      const firstName = authUser.user_metadata.full_name.split(' ')[0];
      setUserName(firstName);
    }
  }, [authUser, onboardingCompleted, userName, setUserName]);

  const value = {
    userName,
    onboardingCompleted,
    collectedFrogs,
    newlyAcquiredFrog, // Exposto para ser usado na UI
    setUserName,
    completeOnboarding,
    addFrogToCollection,
    clearNewlyAcquiredFrog, // Exposto para ser usado na UI
    setCurrentFrogForSession,
    collectCurrentFrog,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
