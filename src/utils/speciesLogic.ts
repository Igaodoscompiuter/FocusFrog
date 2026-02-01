
import { frogSpecies } from './frogSpecies';

// Define os pesos para cada nível de raridade. Um número maior significa que é mais comum.
const RARITY_WEIGHTS = {
  common: 15, // Alta chance
  rare: 5,    // Chance média
  epic: 1,    // Chance baixa
};

/**
 * Seleciona aleatoriamente um ID de espécie de sapo com base na raridade.
 * Existe uma chance de 50% de retornar a espécie padrão 'JUNGLE'.
 * Para os outros 50%, seleciona uma das outras espécies com base em um sorteio ponderado pela raridade.
 */
export const selectRandomFrog = (): string => {
  // Passo 1: 50% de chance de selecionar o sapo padrão.
  if (Math.random() < 0.5) {
    return 'JUNGLE';
  }

  // Passo 2: Preparar para o sorteio ponderado das outras espécies.
  const otherSpecies = Object.entries(frogSpecies).filter(([id]) => id !== 'JUNGLE');

  // Se, por algum motivo, não houver outras espécies, retorne o padrão como fallback.
  if (otherSpecies.length === 0) {
    return 'JUNGLE';
  }

  // Calcular o peso total de todas as espécies elegíveis.
  let totalWeight = 0;
  for (const [, speciesData] of otherSpecies) {
    totalWeight += RARITY_WEIGHTS[speciesData.rarity];
  }

  // Gerar um número aleatório dentro do intervalo do peso total.
  let randomWeight = Math.random() * totalWeight;

  // Encontrar a qual espécie o número aleatório corresponde.
  for (const [id, speciesData] of otherSpecies) {
    randomWeight -= RARITY_WEIGHTS[speciesData.rarity];
    if (randomWeight <= 0) {
      return id; // Este é o nosso sapo sorteado!
    }
  }

  // Fallback de segurança: se algo der errado, retorna o último da lista.
  return otherSpecies[otherSpecies.length - 1][0];
};
