
export interface FrogColorPalette {
  primary: string;
  secondary: string;
  accent: string;
}

export interface FrogSpeciesData {
  name: string;
  colors: FrogColorPalette;
  rarity: 'common' | 'rare' | 'epic';
}

export const frogSpecies: Record<string, FrogSpeciesData> = {
  JUNGLE: {
    name: 'Sapo da Selva',
    colors: {
      primary: '#2E7D32',
      secondary: '#AED581',
      accent: '#FFF176',
    },
    rarity: 'common',
  },
  SUNNY: {
    name: 'Sapo Solar',
    colors: {
      primary: '#FFC107',
      secondary: '#FFF9C4',
      accent: '#FF6F00',
    },
    rarity: 'common',
  },
  OCEAN: {
    name: 'Sapo Oceânico',
    colors: {
      primary: '#0288D1',
      secondary: '#B3E5FC',
      accent: '#00BFA5',
    },
    rarity: 'common',
  },
};
