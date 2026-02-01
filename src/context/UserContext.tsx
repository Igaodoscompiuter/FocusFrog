
import React, { createContext, useContext, ReactNode, useEffect, useState, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from '../hooks/useAuth';
import { useUserData } from '../hooks/useUserData';

interface UserContextType {
  userName: string | null;
  onboardingCompleted: boolean;
  collectedFrogs: string[];
  setUserName: (name: string) => void;
  completeOnboarding: () => void;
  addFrogToCollection: (speciesId: string) => void; // <-- Adicionado aqui
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
  const { getCollectedFrogs, addFrogToCollection: addFrogToCollectionInternal } = useUserData(); // Renomeado para evitar conflito

  const [collectedFrogs, setCollectedFrogs] = useState<string[]>([]);
  const [currentFrogForSession, setCurrentFrogForSession] = useState<string | null>(null);

  const { user: authUser } = useAuth();

  useEffect(() => {
    setCollectedFrogs(getCollectedFrogs());
  }, [getCollectedFrogs]);

  // Wrapper para expor a função
  const addFrogToCollection = useCallback((speciesId: string) => {
    addFrogToCollectionInternal(speciesId);
    setCollectedFrogs(getCollectedFrogs()); // Atualiza o estado local
  }, [addFrogToCollectionInternal, getCollectedFrogs]);

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
    setUserName,
    completeOnboarding,
    addFrogToCollection, // <-- Exposto no valor do contexto
    setCurrentFrogForSession,
    collectCurrentFrog,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
