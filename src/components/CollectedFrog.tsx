import React from 'react';
import styles from './CollectedFrog.module.css';

// Paleta de cores para uma espécie de sapo
export interface FrogColorPalette {
  primary: string;
  secondary: string;
  tertiary: string;
}

// As props que o componente do sapo vai receber
interface CollectedFrogProps {
  palette: FrogColorPalette;
  name: string;
}

// O componente que renderiza o SVG do Sapo Adulto com cores customizadas
export const CollectedFrog: React.FC<CollectedFrogProps> = ({ palette, name }) => {
  const frogStyle: React.CSSProperties = {
    '--frog-color-primary': palette.primary,
    '--frog-color-secondary': palette.secondary,
    '--frog-color-tertiary': palette.tertiary,
  } as React.CSSProperties;

  return (
    <div className={styles.frogContainer} style={frogStyle}>
      <div className={styles.svgWrapper}>
        {/* SVG do Sapo Adulto - o mesmo usado no cronômetro */}
        <svg viewBox="0 0 100 100" className={styles.frogSvg}>
            <path
                className={styles.frogBody}
                d="M 50,35 C 25,35 25,65 50,65 C 75,65 75,35 50,35 Z"
            />
            <circle className={styles.frogEye} cx="40" cy="30" r="5" />
            <circle className={styles.frogEye} cx="60" cy="30" r="5" />
        </svg>
      </div>
      <span className={styles.frogName}>{name}</span>
    </div>
  );
};
