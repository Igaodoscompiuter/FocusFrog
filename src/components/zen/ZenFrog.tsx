
import React from 'react';
import { motion } from 'framer-motion';
import styles from './ZenFrog.module.css';
import { frogSpecies } from '../../utils/frogSpecies';

interface ZenFrogProps {
  speciesId: string;
  stage: 'tadpole' | 'adult';
}

export const ZenFrog: React.FC<ZenFrogProps> = ({ speciesId, stage }) => {
  const species = frogSpecies[speciesId];

  // Guarda de segurança: Se a espécie não for encontrada, não renderiza nada.
  if (!species) {
    console.warn(`[ZenFrog] Species with ID "${speciesId}" not found.`);
    return null;
  }

  // Ignora o girino por enquanto, focando apenas no sapo adulto.
  if (stage !== 'adult') return null;

  const { colors } = species.stages.adult;

  // As variáveis de cor agora correspondem exatamente às usadas no CSS original.
  const style = {
    '--frog-color-primary': colors.primary,
    '--frog-color-secondary': colors.secondary,
    '--frog-color-accent': colors.accent,
  } as React.CSSProperties;

  return (
    <div style={style}> {/* O contêiner aplica as variáveis CSS */}
        <motion.div 
            initial={{ scale: 0.5, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            exit={{ scale: 0.5, opacity: 0 }} 
            className={styles.creatureWrapper}
        >
            <svg viewBox="0 0 100 100" className={styles.frogContainer}>
                <g className={styles.frogBody}>
                    <ellipse cx="28" cy="75" rx="12" ry="10" className={styles.frogLegBack} />
                    <ellipse cx="72" cy="75" rx="12" ry="10" className={styles.frogLegBack} />
                    <ellipse cx="50" cy="60" rx="30" ry="25" className={styles.frogMainBody} />
                    <ellipse cx="50" cy="65" rx="20" ry="18" className={styles.frogBelly} />
                    <ellipse cx="38" cy="80" rx="8" ry="6" className={styles.frogLegFront} />
                    <ellipse cx="62" cy="80" rx="8" ry="6" className={styles.frogLegFront} />
                    <g className={styles.frogEyeGroup}><circle cx="40" cy="45" r="10" className={styles.frogEyeSocket} /><circle cx="40" cy="45" r="5" className={styles.frogPupil} /></g>
                    <g className={styles.frogEyeGroup}><circle cx="60" cy="45" r="10" className={styles.frogEyeSocket} /><circle cx="60" cy="45" r="5" className={styles.frogPupil} /></g>
                    <path d="M45,68 Q50,72 55,68" className={styles.frogMouth} />
                </g>
            </svg>
        </motion.div>
    </div>
  );
};
