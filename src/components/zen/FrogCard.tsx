import React from 'react';
import { createPortal } from 'react-dom';
import { frogSpecies } from '../../utils/frogSpecies';
import { frogLore } from '../../config/frogLore';
import { useZenPond } from '../../context/ZenPondContext';
import { ZenFrog } from './ZenFrog';
import styles from './FrogCard.module.css';

const rarityLabel: Record<string, string> = {
    common: 'Comum',
    rare: 'Rara',
    epic: 'Épica',
};

const statLabels: Record<string, string> = {
    agilidade: 'Agilidade',
    camuflagem: 'Camuflagem',
    charme: 'Charme',
};

interface FrogCardProps {
    speciesId: string;
    /** Instância específica (frog.id) — só existe vindo do Lago Zen. Sem ela
     *  (ex.: outros lugares que só mostram a espécie), a carta vira só
     *  informativa, sem contagem nem botão de guardar/soltar. */
    frogId?: string;
    onClose: () => void;
}

/**
 * [COMPLETO] Antes só mostrava nome+raridade+brilho — essa é a versão
 * inteira do cartão do protótipo zen-lake-v3.html: flavor text (reaproveita
 * frogLore.ts, mesma fonte que já existe pro app), 3 barras de stat, contagem
 * de fusões ("×N"), e o botão de guardar no viveiro / soltar na lagoa — que
 * agora funciona de verdade, via ZenPondContext.
 *
 * Renderizado via Portal direto em document.body: a carta é aberta de dentro
 * de um motion.div que anima `scale` (o sapo pulando no lago) — um
 * position:fixed comum ficaria PRESO dentro dos limites daquele elemento
 * pequeno (bug real, visto em produção) em vez de cobrir a tela inteira.
 */
export const FrogCard: React.FC<FrogCardProps> = ({ speciesId, frogId, onClose }) => {
    const species = frogSpecies[speciesId];
    const zenPond = useZenPond(); // ok chamar sempre — o Provider já envolve toda tela de Estatísticas
    if (!species) return null;

    const lore = frogLore[species.id] || frogLore.DEFAULT;
    const rarityKey = species.rarity; // 'common' | 'rare' | 'epic' já bate com as classes do CSS

    const frog = frogId
        ? zenPond.pondFrogs.find(f => f.id === frogId) || zenPond.storageFrogs.find(f => f.id === frogId)
        : undefined;

    const handleAction = () => {
        if (!frog) return;
        if (frog.location === 'pond') {
            zenPond.sendToStorage(frog.id);
        } else {
            zenPond.releaseToPond(frog.id);
        }
        onClose();
    };

    const pondFull = zenPond.pondFrogs.length >= zenPond.maxPond;

    return createPortal(
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.card} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose} aria-label="Fechar">✕</button>
                <div className={`${styles.glow} ${styles[rarityKey]}`} />

                <div className={styles.topRow}>
                    <h3 className={styles.name}>
                        {species.name}
                        {frog && frog.count > 1 && <span className={styles.countTag}> ×{frog.count}</span>}
                    </h3>
                    <span className={`${styles.badge} ${styles[rarityKey]}`}>{rarityLabel[rarityKey]}</span>
                </div>

                <div className={styles.frogStage}>
                    <ZenFrog speciesId={species.id} stage="adult" size={110} clickable={false} />
                    {rarityKey !== 'common' && <div className={styles.shine} />}
                </div>

                <p className={styles.flavor}>"{lore.description}"</p>

                <div className={styles.statsWrap}>
                    {Object.entries(statLabels).map(([key, label]) => (
                        <div key={key} className={styles.statRow}>
                            <span className={styles.statLabel}>{label}</span>
                            <span className={styles.statTrack}>
                                <span className={styles.statFill} style={{ width: `${species.stats[key as keyof typeof species.stats] * 10}%` }} />
                            </span>
                        </div>
                    ))}
                </div>

                {frog && (
                    <button className={styles.actionBtn} onClick={handleAction} disabled={frog.location === 'storage' && pondFull}>
                        {frog.location === 'pond'
                            ? '🧺 Guardar no viveiro'
                            : pondFull ? `Lagoa cheia (${zenPond.maxPond}/${zenPond.maxPond})` : '🌊 Soltar na lagoa'}
                    </button>
                )}
            </div>
        </div>,
        document.body
    );
};
