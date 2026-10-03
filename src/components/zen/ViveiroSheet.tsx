import React from 'react';
import { frogSpecies } from '../../utils/frogSpecies';
import { useZenPond, PondFrog } from '../../context/ZenPondContext';
import { ZenFrog } from './ZenFrog';
import styles from './ViveiroSheet.module.css';

const rarityRank: Record<string, number> = { epic: 0, rare: 1, common: 2 };

interface ViveiroSheetProps {
    onClose: () => void;
}

/**
 * [NOVO] Bottom sheet que mostra a coleção inteira — "Na lagoa" e "No
 * viveiro" — com um mini-cartão por sapo e um botão de guardar/soltar em
 * cada um. Porta o `renderSheet`/`miniCard` do protótipo zen-lake-v3.html
 * pro React, usando o mesmo ZenPondContext que a FrogCard.
 */
export const ViveiroSheet: React.FC<ViveiroSheetProps> = ({ onClose }) => {
    const { pondFrogs, storageFrogs, maxPond, sendToStorage, releaseToPond } = useZenPond();

    const sorter = (a: PondFrog, b: PondFrog) => {
        const sa = frogSpecies[a.speciesId], sb = frogSpecies[b.speciesId];
        return (rarityRank[sa?.rarity] ?? 9) - (rarityRank[sb?.rarity] ?? 9) || (sa?.name || '').localeCompare(sb?.name || '');
    };

    const sections: [string, PondFrog[]][] = [
        ['Na lagoa', [...pondFrogs].filter(f => !f.merging).sort(sorter)],
        ['No viveiro', [...storageFrogs].sort(sorter)],
    ];

    return (
        <div className={styles.backdrop} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className={styles.sheet}>
                <div className={styles.header}>
                    <div>
                        <div className={styles.title}>Coleção</div>
                        <div className={styles.subtitle}>Lagoa {pondFrogs.filter(f => !f.merging).length}/{maxPond} · Viveiro {storageFrogs.length}</div>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}>Fechar</button>
                </div>

                {sections.map(([label, frogs]) => (
                    <div key={label}>
                        <div className={styles.sectionTitle}>{label}</div>
                        {frogs.length === 0 ? (
                            <p className={styles.empty}>Nenhum sapo aqui.</p>
                        ) : (
                            <div className={styles.grid}>
                                {frogs.map(frog => {
                                    const species = frogSpecies[frog.speciesId];
                                    if (!species) return null;
                                    return (
                                        <div key={frog.id} className={`${styles.mini} ${styles[species.rarity]}`}>
                                            <div className={styles.miniPic}>
                                                <ZenFrog speciesId={species.id} stage="adult" size={44} frogId={frog.id} />
                                            </div>
                                            <div className={styles.miniName}>
                                                {species.name}{frog.count > 1 ? ` ×${frog.count}` : ''}
                                            </div>
                                            <button
                                                className={styles.miniBtn}
                                                onClick={() => frog.location === 'pond' ? sendToStorage(frog.id) : releaseToPond(frog.id)}
                                                disabled={frog.location === 'storage' && pondFrogs.filter(f => !f.merging).length >= maxPond}
                                            >
                                                {frog.location === 'pond' ? 'Guardar' : 'Soltar'}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
