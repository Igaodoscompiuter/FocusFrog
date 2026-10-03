// src/utils/frogSpecies.ts

export interface FrogColorPalette {
  primary: string;
  secondary: string;
  accent: string;
}

export interface FrogStage {
  shape: 'circle' | 'oval' | 'frog';
  colors: FrogColorPalette;
}

// [CORREÇÃO] Adicionado o campo `id` à interface de dados da espécie.
export interface FrogSpeciesData {
  id: string;
  name: string;
  rarity: 'common' | 'rare' | 'epic';
  stages: {
    tadpole: FrogStage;
    adult: FrogStage;
  };
  /** Atributos mostrados na carta (0-10) — alinhados com o texto de
   *  personalidade em frogLore.ts e o comportamento real em frogPersonalities.ts. */
  stats: { agilidade: number; camuflagem: number; charme: number };
}

// [CORREÇÃO] Cada objeto de sapo agora inclui seu próprio `id`.
// Isso garante que os componentes que recebem esses objetos sempre saibam qual sapo estão manipulando.
export const frogSpecies: Record<string, FrogSpeciesData> = {
  JUNGLE: {
    id: 'JUNGLE',
    name: 'Sapo da Selva',
    rarity: 'common',
    stages: {
      tadpole: { shape: 'circle', colors: { primary: '#AED581', secondary: '#2E7D32', accent: '#FFF176' } },
      adult: { shape: 'frog', colors: { primary: '#2E7D32', secondary: '#AED581', accent: '#FFF176' } },
    },
    stats: { agilidade: 6, camuflagem: 7, charme: 6 },
  },
  SUNNY: {
    id: 'SUNNY',
    name: 'Sapo Solar',
    rarity: 'common',
    stages: {
      tadpole: { shape: 'circle', colors: { primary: '#FFF9C4', secondary: '#FFC107', accent: '#FF6F00' } },
      adult: { shape: 'frog', colors: { primary: '#FFC107', secondary: '#FFF9C4', accent: '#FF6F00' } },
    },
    stats: { agilidade: 8, camuflagem: 4, charme: 7 },
  },
  OCEAN: {
    id: 'OCEAN',
    name: 'Sapo Oceânico',
    rarity: 'common',
    stages: {
      tadpole: { shape: 'circle', colors: { primary: '#B3E5FC', secondary: '#0288D1', accent: '#00BFA5' } },
      adult: { shape: 'frog', colors: { primary: '#0288D1', secondary: '#B3E5FC', accent: '#00BFA5' } },
    },
    stats: { agilidade: 7, camuflagem: 5, charme: 6 },
  },
  STRAWBERRY: {
    id: 'STRAWBERRY',
    name: 'Sapo Morango',
    rarity: 'rare',
    stages: {
      tadpole: { shape: 'circle', colors: { primary: '#F8BBD0', secondary: '#E91E63', accent: '#4CAF50' } },
      adult: { shape: 'frog', colors: { primary: '#E91E63', secondary: '#F8BBD0', accent: '#4CAF50' } },
    },
    stats: { agilidade: 4, camuflagem: 8, charme: 8 },
  },
  GHOST: {
    id: 'GHOST',
    name: 'Sapo Fantasma',
    rarity: 'epic',
    stages: {
      tadpole: { shape: 'circle', colors: { primary: '#F5F5F5', secondary: '#E0E0E0', accent: '#BDBDBD' } },
      adult: { shape: 'frog', colors: { primary: '#E0E0E0', secondary: '#F5F5F5', accent: '#BDBDBD' } },
    },
    stats: { agilidade: 2, camuflagem: 10, charme: 9 },
  },
  GALAXY: {
    id: 'GALAXY',
    name: 'Sapo Galáxia',
    rarity: 'epic',
    stages: {
      tadpole: { shape: 'circle', colors: { primary: '#483D8B', secondary: '#191970', accent: '#E6E6FA' } },
      adult: { shape: 'frog', colors: { primary: '#191970', secondary: '#483D8B', accent: '#E6E6FA' } },
    },
    stats: { agilidade: 9, camuflagem: 6, charme: 10 },
  },
};
