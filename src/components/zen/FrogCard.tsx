import React from 'react';
import { frogSpecies } from '../../utils/frogSpecies';
import { ZenFrog } from './ZenFrog';
import styles from './FrogCard.module.css';

const rarityLabel: Record<string, string> = {
    common: 'Comum',
    rare: 'Rara',
    epic: 'Épica',
};

interface FrogCardProps {
    speciesId: string;
    onClose: () => void;
}

/** Carta de identificação do sapo, aberta ao tocar nele dentro do Lago Zen. */
export const FrogCard: React.FC<FrogCardProps> = ({ speciesId, onClose }) => {
    const species = frogSpecies[speciesId];
    if (!species) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.card} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose} aria-label="Fechar">✕</button>
                <div className={`${styles.glow} ${styles[species.rarity]}`} />
                <div className={styles.frogStage}>
                    <ZenFrog speciesId={species.id} stage="adult" />
                </div>
                <span className={`${styles.badge} ${styles[species.rarity]}`}>{rarityLabel[species.rarity]}</span>
                <h3 className={styles.name}>{species.name}</h3>
            </div>
        </div>
    );
};
