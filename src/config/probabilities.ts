// src/config/probabilities.ts

/**
 * CONFIGURAÇÃO CENTRAL DE PROBABILIDADES DOS SAPOS
 * ---------------------------------------------------------------------------
 * 
 * Altere os valores neste arquivo para ajustar a chance de cada sapo aparecer.
 * Os números representam "pesos". Números maiores significam que o sapo é mais comum.
 * 
 * Exemplo: Se JUNGLE tem peso 65 e GHOST tem peso 4, JUNGLE é ~16x mais provável de aparecer.
 * 
 * O sistema calculará a porcentagem automaticamente. Você não precisa fazer a soma dar 100.
 */

export const frogProbabilities: Record<string, number> = {
  // Comuns
  JUNGLE: 65, // Ajustado para ter uma chance de ~48%
  SUNNY: 25,
  OCEAN: 25,

  // Raros
  STRAWBERRY: 12,

  // Épicos
  GHOST: 4,
  GALAXY: 4,
};
