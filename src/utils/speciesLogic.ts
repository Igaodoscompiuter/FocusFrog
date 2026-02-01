// src/utils/speciesLogic.ts
import { frogSpecies } from './frogSpecies';
import { frogProbabilities } from '../config/probabilities';

/**
 * [LÓGICA ATUALIZADA]
 * Seleciona uma espécie de sapo aleatoriamente com base nos pesos definidos 
 * no arquivo de configuração central: src/config/probabilities.ts.
 * 
 * A regra antiga e codificada (50% de chance para 'JUNGLE') foi removida em favor
 * deste sistema centralizado e mais flexível.
 */
export const selectRandomSpecies = (): string => {
  const totalWeight = Object.values(frogProbabilities).reduce((sum, weight) => sum + weight, 0);
  let randomRoll = Math.random() * totalWeight;

  for (const speciesId in frogProbabilities) {
    const weight = frogProbabilities[speciesId];
    if (randomRoll < weight) {
      return speciesId;
    }
    randomRoll -= weight;
  }

  // Fallback: caso algo dê errado, retorna o primeiro da lista de probabilidades
  return Object.keys(frogProbabilities)[0];
};

/**
 * Simula a coleta de um novo sapo.
 */
export const collectNewFrog = () => {
  const speciesId = selectRandomSpecies();
  const collectedAt = new Date().toISOString();
  return { speciesId, collectedAt };
};
