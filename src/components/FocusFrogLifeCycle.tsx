import React from 'react';
import styles from './FocusFrogLifeCycle.module.css';
import { frogSpecies, FrogSpeciesData } from '../utils/frogSpecies';

interface FocusFrogLifeCycleProps {
  progress: number; // 0 to 1
  speciesId: keyof typeof frogSpecies; // e.g., 'JUNGLE', 'OCEAN'
}

// Placeholder SVG para o Sapo (Fase Final)
// As cores são controladas por variáveis CSS
const FrogSVG = () => (
  <svg viewBox="0 0 100 100" className={styles.frogSvg}>
    {/* Corpo Principal */}
    <circle cx="50" cy="50" r="40" className={styles.frogBody} />
    {/* Barriga */}
    <circle cx="50" cy="60" r="25" className={styles.frogBelly} />
  </svg>
);

export const FocusFrogLifeCycle: React.FC<FocusFrogLifeCycleProps> = ({ progress, speciesId }) => {
  const speciesData: FrogSpeciesData = frogSpecies[speciesId];

  // Define as variáveis CSS com base na espécie selecionada
  const frogStyle = {
    '--frog-color-primary': speciesData.colors.primary,
    '--frog-color-secondary': speciesData.colors.secondary,
    '--frog-color-accent': speciesData.colors.accent,
  } as React.CSSProperties;

  // TODO: Adicionar lógica para trocar de SVG (ovo, girino) com base no `progress`

  return (
    <div className={styles.container} style={frogStyle}>
      <FrogSVG />
    </div>
  );
};
