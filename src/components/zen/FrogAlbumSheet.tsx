import React, { useState } from 'react';
import { frogSpecies } from '../../utils/frogSpecies';
import { ZenFrog } from './ZenFrog';
import { FrogCard } from './FrogCard';
import type { FrogInput } from '../../context/ZenPondContext';
import styles from './ViveiroSheet.module.css';
import { RARITY_LABEL, RARITY_COLOR } from './ViveiroSheet';
import { useBackHandler } from '../../hooks/useBackHandler';

const rarityRank: Record<string, number> = { epic: 0, rare: 1, common: 2 };
const LOCKED_COLORS = { primary: '#0b1512', secondary: '#101c18', accent: '#0b1512' };

interface FrogAlbumSheetProps {
    /** Log de tudo que já foi coletado (de UserContext, via StatsScreen) —
     *  usado só pra saber QUAIS espécies já foram descobertas alguma vez,
     *  independente de onde o sapo está agora (lagoa/viveiro). */
    collectedFrogs: FrogInput[];
    onClose: () => void;
}

/**
 * [NOVO — portado do jogo zen-lake separado] Grid com TODAS as espécies do
 * jogo, não só as que estão na lagoa/viveiro agora: descobertas aparecem
 * com a arte real; as que faltam aparecem como silhueta escura com "???",
 * sem revelar nada sobre a espécie real — dá uma meta clara de "faltam
 * só N" pra continuar voltando, no mesmo espírito do protótipo.
 */
export const FrogAlbumSheet: React.FC<FrogAlbumSheetProps> = ({ collectedFrogs, onClose }) => {
    useBackHandler(onClose);
    const [cardSpeciesId, setCardSpeciesId] = useState<string | null>(null);

    const foundIds = new Set(collectedFrogs.map(f => f.speciesId));
    const countBySpecies: Record<string, number> = {};
    collectedFrogs.forEach(f => { countBySpecies[f.speciesId] = (countBySpecies[f.speciesId] || 0) + 1; });

    const allSpecies = Object.values(frogSpecies).sort(
        (a, b) => (rarityRank[a.rarity] ?? 9) - (rarityRank[b.rarity] ?? 9) || a.name.localeCompare(b.name)
    );
    const foundCount = allSpecies.filter(sp => foundIds.has(sp.id)).length;
    const progressPct = allSpecies.length > 0 ? (foundCount / allSpecies.length) * 100 : 0;

    return (
        <div className={styles.backdrop} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className={styles.sheet}>
                <div className={styles.header}>
                    <div>
                        <div className={styles.title}>📖 Álbum</div>
                        <div className={styles.subtitle}>{foundCount}/{allSpecies.length} espécies descobertas</div>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}>Fechar</button>
                </div>

                <div className={styles.albumBar}><span style={{ width: `${progressPct}%` }} /></div>

                <div className={styles.grid}>
                    {allSpecies.map(sp => {
                        const known = foundIds.has(sp.id);
                        return (
                            <div
                                key={sp.id}
                                className={`${styles.mini} ${known ? styles[sp.rarity] : styles.locked}`}
                                onClick={() => known && setCardSpeciesId(sp.id)}
                            >
                                <div className={styles.miniPic}>
                                    <ZenFrog
                                        speciesId={sp.id}
                                        stage="adult"
                                        size={46}
                                        clickable={false}
                                        forceColors={known ? undefined : LOCKED_COLORS}
                                    />
                                </div>
                                <div className={styles.miniName}>{known ? sp.name : '???'}</div>
                                {/* igual o arquivo: raridade aparece mesmo bloqueada (dá a "pista" do que falta) */}
                                <div className={styles.miniTag} style={{ color: RARITY_COLOR[sp.rarity] }}>
                                    {RARITY_LABEL[sp.rarity]}{known && countBySpecies[sp.id] > 1 ? ` · ×${countBySpecies[sp.id]}` : ''}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            {cardSpeciesId && <FrogCard speciesId={cardSpeciesId} onClose={() => setCardSpeciesId(null)} />}
        </div>
    );
};
