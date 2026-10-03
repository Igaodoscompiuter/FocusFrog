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
    frogId?: string;
    onClose: () => void;
}

/**
 * [PORTADO EXATO do zen-lake-v3.html] Mesma estrutura, cores e tamanhos do
 * protótipo — não uma reinterpretação: moldura externa colorida por raridade
 * (.card), painel interno escuro (.cardInner), retrato com fundo de água
 * próprio (.frogStage) e o brilho (.shine) varrendo só o retrato, igual lá.
 *
 * Renderizado via Portal direto em document.body: a carta é aberta de dentro
 * de um motion.div que anima `scale` (o sapo pulando no lago) — um
 * position:fixed comum ficaria preso dentro dos limites daquele elemento
 * pequeno em vez de cobrir a tela inteira.
 */
export const FrogCard: React.FC<FrogCardProps> = ({ speciesId, frogId, onClose }) => {
    const species = frogSpecies[speciesId];
    const zenPond = useZenPond();
    if (!species) return null;

    const lore = frogLore[species.id] || frogLore.DEFAULT;
    const rarityKey = species.rarity;

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

    const pondFull = zenPond.pondFrogs.filter(f => !f.merging).length >= zenPond.maxPond;

    return createPortal(
        <div className={styles.overlay} onClick={onClose}>
            <div className={`${styles.card} ${styles[rarityKey]}`} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose} aria-label="Fechar">✕</button>

                <div className={styles.cardInner}>
                    <div className={styles.topRow}>
                        <h3 className={styles.name}>
                            {species.name}
                            {frog && frog.count > 1 && <span className={styles.countTag}> ×{frog.count}</span>}
                        </h3>
                        <span className={`${styles.badge} ${styles[rarityKey]}`}>{rarityLabel[rarityKey]}</span>
                    </div>

                    <div className={`${styles.frogStage} ${styles[rarityKey]}`}>
                        <div className={styles.portraitGlow} />
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
                        <div className={styles.actionsWrap}>
                            <button className={styles.actionBtn} onClick={handleAction} disabled={frog.location === 'storage' && pondFull}>
                                {frog.location === 'pond'
                                    ? '🧺 Guardar no viveiro'
                                    : pondFull ? `Lagoa cheia (${zenPond.maxPond}/${zenPond.maxPond})` : '🌊 Soltar na lagoa'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};
