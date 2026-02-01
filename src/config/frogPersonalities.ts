/**
 * src/config/frogPersonalities.ts
 * 
 * Define as "personalidades" de cada espécie de sapo, controlando seu comportamento no ZenPond.
 * Versão com personalidades EXTREMAS para comportamentos distintos e reconhecíveis.
 */

interface FrogPersonality {
  moveInterval: { min: number; max: number }; // Frequência do salto (ms)
  jumpDistance: { min: number; max: number }; // Distância do salto
}

export const frogPersonalities: Record<string, FrogPersonality> = {
  // --- O Agitado: Pula sem parar, mas quase não sai do lugar.
  SUNNY: {
    moveInterval: { min: 3000, max: 7000 },       // Muito Alta Frequência
    jumpDistance: { min: 5, max: 15 },         // Mínima Distância
  },

  // --- O Explorador: Cruza o lago constantemente.
  OCEAN: {
    moveInterval: { min: 6000, max: 12000 },      // Alta Frequência
    jumpDistance: { min: 50, max: 80 },        // Muito Longa Distância
  },

  // --- O Comum: O ponto de equilíbrio. Nem muito rápido, nem muito lento.
  JUNGLE: {
    moveInterval: { min: 10000, max: 20000 },   // Média Frequência
    jumpDistance: { min: 20, max: 40 },        // Média Distância
  },
  
  // --- O Assustado: Hesita muito e mal se move.
  STRAWBERRY: {
    moveInterval: { min: 15000, max: 25000 },   // Baixa Frequência
    jumpDistance: { min: 2, max: 8 },          // Quase Nula Distância
  },

  // --- O Zen: Uma estátua. Move-se raramente e de forma sutil.
  GHOST: {
    moveInterval: { min: 60000, max: 120000 },  // Quase Nula Frequência
    jumpDistance: { min: 10, max: 20 },        // Muito Curta Distância
  },

  // --- O Viajante Cósmico: Fica parado por muito tempo, depois faz um salto épico.
  GALAXY: {
    moveInterval: { min: 30000, max: 50000 },   // Muito Rara Frequência
    jumpDistance: { min: 70, max: 90 },        // Máxima Distância
  },
  
  // Personalidade Padrão caso a espécie não seja encontrada
  DEFAULT: {
    moveInterval: { min: 10000, max: 20000 },
    jumpDistance: { min: 20, max: 40 },
  },
};
