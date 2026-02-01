import React from 'react';
import styles from './FrogLoreCard.module.css';
import { ZenFrog } from '../zen/ZenFrog';
import { FrogSpeciesData } from '../../utils/frogSpecies';
import { frogLore } from '../../config/frogLore';

interface FrogLoreCardProps {
  species: FrogSpeciesData;
}

export const FrogLoreCard: React.FC<FrogLoreCardProps> = ({ species }) => {
  // [CORREÇÃO] A busca da "lore" agora usa o ID da espécie (ex: "SUNNY").
  // O ID é garantido e único, eliminando o bug do texto genérico.
  const lore = frogLore[species.id] || frogLore.DEFAULT;

  // Define uma cor de fundo para o container do sapo baseada nas cores da espécie,
  // com um fallback para uma cor padrão.
  const frogContainerStyle = {
    backgroundColor: species.stages.adult.colors.secondary || 'var(--color-background-deep)'
  };

  return (
    <div className={styles.loreCard}>
      <div className={styles.header}>
        <div className={styles.frogContainer} style={frogContainerStyle}>
          {/* [CORREÇÃO] O ID correto é passado para garantir a exibição do sapo certo. */}
          {/* A prop "isStatic" pode ser usada para desabilitar animações se necessário. */}
          <ZenFrog speciesId={species.id} stage="adult" isStatic={true} />
        </div>
      </div>
      
      <div className={styles.titleContainer}>
        <h2 className={styles.speciesName}>{species.name}</h2>
        <p className={styles.personalityTitle}>{lore.title}</p>
      </div>

      <div className={styles.description}>
        <p>{lore.description}</p>
      </div>
    </div>
  );
};
