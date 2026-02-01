import React, { createContext, useContext, ReactNode, useEffect, useState, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from '../hooks/useAuth';
import { useUserData } from '../hooks/useUserData';

export interface NewlyAcquiredFrogInfo {
  speciesId: string;
}

interface UserContextType {
  userName: string | null;
  onboardingCompleted: boolean;
  collectedFrogs: string[];
  newlyAcquiredFrog: NewlyAcquiredFrogInfo | null;
  setUserName: (name: string) => void;
  completeOnboarding: () => void;
  addFrogToCollection: (speciesId: string) => void;
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
  const [newlyAcquiredFrog, setNewlyAcquiredFrog] = useState<NewlyAcquiredFrogInfo | null>(null);
  const [currentFrogForSession, setCurrentFrogForSession] = useState<string | null>(null);

  const { user: authUser } = useAuth();

  useEffect(() => {
    setCollectedFrogs(getCollectedFrogs());
  }, [getCollectedFrogs]);

  const addFrogToCollection = useCallback((speciesId: string) => {
    // [CORREÇÃO DEFINITIVA] Adiciona uma guarda para garantir que um ID de espécie válido foi fornecido.
    // Isso impede que `undefined` ou strings vazias sejam adicionadas à coleção.
    if (!speciesId) {
      console.error('Tentativa de adicionar um sapo com ID inválido:', speciesId);
      return; // Interrompe a execução se o ID for inválido.
    }

    addFrogToCollectionInternal(speciesId);
    setCollectedFrogs(getCollectedFrogs());
    setNewlyAcquiredFrog({ speciesId: speciesId });
  }, [addFrogToCollectionInternal, getCollectedFrogs]);

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
    newlyAcquiredFrog,
    setUserName,
    completeOnboarding,
    addFrogToCollection,
    clearNewlyAcquiredFrog,
    setCurrentFrogForSession,
    collectCurrentFrog,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
