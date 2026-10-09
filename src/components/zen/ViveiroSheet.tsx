import React, { useState } from 'react';
import { frogSpecies } from '../../utils/frogSpecies';
import { useZenPond, PondFrog } from '../../context/ZenPondContext';
import { ZenFrog } from './ZenFrog';
import { FrogCard } from './FrogCard';
import styles from './ViveiroSheet.module.css';
import { useBackHandler } from '../../hooks/useBackHandler';

const rarityRank: Record<string, number> = { epic: 0, rare: 1, common: 2 };
export const RARITY_LABEL: Record<string, string> = { common: 'Comum', rare: 'Rara', epic: 'Épica' };
export const RARITY_COLOR: Record<string, string> = { common: '#8BC34A', rare: '#4FC3F7', epic: '#FBBF24' };

interface ViveiroSheetProps {
    onClose: () => void;
}

/**
 * [PORTADO de lagoa-zen-index.html — terrário] Mesmo renderSheet/miniCard do
 * arquivo: "Na lagoa" / "No viveiro", cartão inteiro abre a carta completa,
 * raridade escrita colorida, botão Guardar/Soltar em cada um.
 * Deliberadamente SEM o botão "✨ Fundir iguais" do arquivo (pedido do
 * usuário) — a fusão continua só a natural, dentro da lagoa.
 */
export const ViveiroSheet: React.FC<ViveiroSheetProps> = ({ onClose }) => {
    useBackHandler(onClose);
    const { pondFrogs, storageFrogs, maxPond, sendToStorage, releaseToPond } = useZenPond();
    const [cardFrog, setCardFrog] = useState<PondFrog | null>(null);

    const activePond = pondFrogs.filter(f => !f.merging);
    const pondFull = activePond.length >= maxPond;

    const sorter = (a: PondFrog, b: PondFrog) => {
        const sa = frogSpecies[a.speciesId], sb = frogSpecies[b.speciesId];
        return (rarityRank[sa?.rarity] ?? 9) - (rarityRank[sb?.rarity] ?? 9) || (sa?.name || '').localeCompare(sb?.name || '');
    };

    const sections: [string, PondFrog[]][] = [
        ['Na lagoa', [...activePond].sort(sorter)],
        ['No viveiro', [...storageFrogs].sort(sorter)],
    ];

    return (
        <div className={styles.backdrop} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className={styles.sheet}>
                <div className={styles.header}>
                    <div>
                        <div className={styles.title}>Coleção</div>
                        <div className={styles.subtitle}>Lagoa {activePond.length}/{maxPond} · Viveiro {storageFrogs.length}</div>
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
                                    const blocked = frog.location === 'storage' && pondFull;
                                    return (
                                        <div key={frog.id} className={`${styles.mini} ${styles[species.rarity]}`} onClick={() => setCardFrog(frog)}>
                                            <div className={styles.miniPic}>
                                                <ZenFrog speciesId={species.id} stage="adult" size={46} clickable={false} />
                                            </div>
                                            <div className={styles.miniName}>
                                                {species.name}{frog.count > 1 ? ` ×${frog.count}` : ''}
                                            </div>
                                            <div className={styles.miniTag} style={{ color: RARITY_COLOR[species.rarity] }}>
                                                {RARITY_LABEL[species.rarity]}
                                            </div>
                                            <button
                                                className={styles.miniBtn}
                                                disabled={blocked}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (frog.location === 'pond') sendToStorage(frog.id); else releaseToPond(frog.id);
                                                }}
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
            {cardFrog && <FrogCard speciesId={cardFrog.speciesId} frogId={cardFrog.id} onClose={() => setCardFrog(null)} />}
        </div>
    );
};
