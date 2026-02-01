import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from '../hooks/useAuth';
import { FrogColorPalette } from '../components/CollectedFrog'; // Importa a interface da paleta

// A "planta" de uma espécie de sapo, agora com a paleta de cores
export interface FrogSpecies {
  id: string;
  name: string;
  rarity: 'common' | 'uncommon' | 'rare';
  palette: FrogColorPalette;
}

// Uma instância única de um sapo que o usuário colecionou
export interface CollectedFrog {
  collectionId: string; 
  speciesId: string;
  collectedAt: string;
}

// A NOVA "Base de Dados" de espécies de sapos com paletas de cores
export const FROG_SPECIES_DB: FrogSpecies[] = [
    {
        id: '1',
        name: 'Sapo de Jardim',
        rarity: 'common',
        palette: { primary: '#2E7D32', secondary: '#1B5E20', tertiary: '#000000' },
    },
    {
        id: '2',
        name: 'Sapo do Riacho Azul',
        rarity: 'common',
        palette: { primary: '#1976D2', secondary: '#0D47A1', tertiary: '#FFFFFF' },
    },
    {
        id: '3',
        name: 'Sapo do Pântano',
        rarity: 'uncommon',
        palette: { primary: '#8D6E63', secondary: '#5D4037', tertiary: '#FFB74D' },
    },
    {
        id: '4',
        name: 'Sapo-morango',
        rarity: 'uncommon',
        palette: { primary: '#D32F2F', secondary: '#B71C1C', tertiary: '#212121' },
    },
    {
        id: '5',
        name: 'Sapo Dourado Raro',
        rarity: 'rare',
        palette: { primary: '#FFC107', secondary: '#FFA000', tertiary: '#424242' },
    },
];

interface UserContextType {
  userName: string | null;
  onboardingCompleted: boolean;
  collectedFregs: CollectedFrog[];
  setUserName: (name: string) => void;
  completeOnboarding: () => void;
  addRandomFrogToCollection: () => void;
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
  const [collectedFregs, setCollectedFregs] = useLocalStorage<CollectedFrog[]>('focusfrog_collectedFregs', []);

  const { user: authUser } = useAuth(); 

  const addRandomFrogToCollection = () => {
    const randomSpecies = FROG_SPECIES_DB[Math.floor(Math.random() * FROG_SPECIES_DB.length)];
    const newFrog: CollectedFrog = {
        collectionId: `frog_${Date.now()}`,
        speciesId: randomSpecies.id,
        collectedAt: new Date().toISOString(),
    };
    setCollectedFregs(prevFregs => [...prevFregs, newFrog]);
    console.log(`Sapo Coletado: ${randomSpecies.name}`)
  };

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
    collectedFregs,
    setUserName,
    completeOnboarding,
    addRandomFrogToCollection,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
