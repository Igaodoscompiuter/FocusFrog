import React from 'react';
import { frogSpecies } from '../../utils/frogSpecies';
import { useZenPond, FrogInput } from '../../context/ZenPondContext';
import styles from './PondDock.module.css';

interface PondDockProps {
    collectedFrogs: FrogInput[];
    onOpenViveiro: () => void;
    onOpenAlbum: () => void;
}

/**
 * [PORTADO de lagoa-zen-index.html] Linha "Lagoa X/8 · dica" + dock sob a
 * lagoa. Só os botões que não dependem da economia de pétalas (Viveiro e
 * Álbum) — "＋ Vaga", "Chamar sapo", "Diário" e "Postar" ficam de fora até
 * a decisão sobre gamificação/moeda.
 */
export const PondDock: React.FC<PondDockProps> = ({ collectedFrogs, onOpenViveiro, onOpenAlbum }) => {
    const { pondFrogs, storageFrogs, maxPond } = useZenPond();
    const totalSpecies = Object.keys(frogSpecies).length;
    const foundSpecies = new Set(collectedFrogs.map(f => f.speciesId)).size;

    return (
        <>
            <div className={styles.chipRow}>
                <span className={styles.count}>Lagoa {pondFrogs.filter(f => !f.merging).length}/{maxPond}</span>
                <span className={styles.tip}>Toque nos sapos · iguais se fundem ✨</span>
            </div>
            <div className={styles.dock}>
                <button className={styles.dockBtn} onClick={onOpenViveiro}>
                    <i>🧺</i>Viveiro <b>{storageFrogs.length}</b>
                </button>
                <button className={styles.dockBtn} onClick={onOpenAlbum}>
                    <i>📖</i>Álbum <b>{foundSpecies}/{totalSpecies}</b>
                </button>
            </div>
        </>
    );
};
