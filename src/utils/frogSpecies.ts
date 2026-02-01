
// src/utils/frogSpecies.ts

export interface FrogColorPalette {
  primary: string;
  secondary: string;
  accent: string;
}

/**
 * Define a aparência de um estágio específico do sapo.
 * A forma pode ser usada para aplicar diferentes estilos CSS.
 */
export interface FrogStage {
  shape: 'circle' | 'oval' | 'frog'; // Girino é um círculo, adulto é a forma de sapo
  colors: FrogColorPalette;
}

export interface FrogSpeciesData {
  name: string;
  rarity: 'common' | 'rare' | 'epic';
  stages: {
    tadpole: FrogStage;
    adult: FrogStage;
  };
}

export const frogSpecies: Record<string, FrogSpeciesData> = {
  JUNGLE: {
    name: 'Sapo da Selva',
    rarity: 'common',
    stages: {
      tadpole: {
        shape: 'circle',
        colors: {
          primary: '#AED581',
          secondary: '#2E7D32',
          accent: '#FFF176',
        },
      },
      adult: {
        shape: 'frog',
        colors: {
          primary: '#2E7D32',
          secondary: '#AED581',
          accent: '#FFF176',
        },
      },
    },
  },
  SUNNY: {
    name: 'Sapo Solar',
    rarity: 'common',
    stages: {
      tadpole: {
        shape: 'circle',
        colors: {
          primary: '#FFF9C4',
          secondary: '#FFC107',
          accent: '#FF6F00',
        },
      },
      adult: {
        shape: 'frog',
        colors: {
          primary: '#FFC107',
          secondary: '#FFF9C4',
          accent: '#FF6F00',
        },
      },
    },
  },
  OCEAN: {
    name: 'Sapo Oceânico',
    rarity: 'common',
    stages: {
      tadpole: {
        shape: 'circle',
        colors: {
          primary: '#B3E5FC',
          secondary: '#0288D1',
          accent: '#00BFA5',
        },
      },
      adult: {
        shape: 'frog',
        colors: {
          primary: '#0288D1',
          secondary: '#B3E5FC',
          accent: '#00BFA5',
        },
      },
    },
  },
  STRAWBERRY: {
    name: 'Sapo Morango',
    rarity: 'rare',
    stages: {
      tadpole: {
        shape: 'circle',
        colors: {
          primary: '#F8BBD0',
          secondary: '#E91E63',
          accent: '#4CAF50',
        },
      },
      adult: {
        shape: 'frog',
        colors: {
          primary: '#E91E63',
          secondary: '#F8BBD0',
          accent: '#4CAF50',
        },
      },
    },
  },
  GHOST: {
    name: 'Sapo Fantasma',
    rarity: 'epic',
    stages: {
      tadpole: {
        shape: 'circle',
        colors: {
          primary: '#F5F5F5',
          secondary: '#E0E0E0',
          accent: '#BDBDBD',
        },
      },
      adult: {
        shape: 'frog',
        colors: {
          primary: '#E0E0E0',
          secondary: '#F5F5F5',
          accent: '#BDBDBD',
        },
      },
    },
  },
  GALAXY: {
    name: 'Sapo Galáxia',
    rarity: 'epic',
    stages: {
      tadpole: {
        shape: 'circle',
        colors: {
          primary: '#483D8B',
          secondary: '#191970',
          accent: '#E6E6FA',
        },
      },
      adult: {
        shape: 'frog',
        colors: {
          primary: '#191970',
          secondary: '#483D8B',
          accent: '#E6E6FA',
        },
      },
    },
  },
};
