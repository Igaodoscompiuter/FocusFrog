import React from 'react';
import styles from './LoreModal.module.css';
import { FrogLoreCard } from '../rewards/FrogLoreCard'; // Ajuste o caminho conforme sua estrutura
import { FrogSpeciesData } from '../../utils/frogSpecies'; // Ajuste o caminho
import { FiX } from 'react-icons/fi';

interface LoreModalProps {
  species: FrogSpeciesData | null;
  onClose: () => void;
}

export const LoreModal: React.FC<LoreModalProps> = ({ species, onClose }) => {
  // Se nenhuma espécie for fornecida, o modal não renderiza nada.
  if (!species) {
    return null;
  }

  // Impede que o clique dentro do card feche o modal.
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={handleContentClick}>
        <button className={styles.closeButton} onClick={onClose} aria-label="Fechar modal">
          <FiX />
        </button>
        <FrogLoreCard species={species} />
      </div>
    </div>
  );
};
