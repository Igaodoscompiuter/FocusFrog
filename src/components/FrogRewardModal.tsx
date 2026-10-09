import React from 'react';
import { useUser } from '../context/UserContext';
import { frogSpecies } from '../utils/frogSpecies';
import { ZenFrog } from './zen/ZenFrog';
import styles from './FrogRewardModal.module.css';
import { useBackHandler } from '../hooks/useBackHandler';
import { shareFrog } from '../utils/shareFrog';
import { useUI } from '../context/UIContext';

const rarityLabel: Record<string, string> = {
    common: 'Comum',
    rare: 'Rara',
    epic: 'Épica',
};

/**
 * [CORREÇÃO] Antes essa revelação só existia dentro do JSX da StatsScreen —
 * se o usuário completasse um foco estando em qualquer outra aba, o sapo era
 * coletado em silêncio e só aparecia (um overlay preto sem estilo nenhum) se
 * a pessoa abrisse Estatísticas depois, sem nenhuma relação com o que
 * tinha acabado de acontecer. Agora mora no AppLayout (fora de qualquer aba),
 * então aparece na hora, não importa onde o usuário esteja no app.
 */
export const FrogRewardModal: React.FC = () => {
    const { newlyAcquiredFrog, clearNewlyAcquiredFrog, collectedFrogs } = useUser();
    const { addNotification } = useUI();
    const [sharing, setSharing] = React.useState(false);
    useBackHandler(clearNewlyAcquiredFrog, !!newlyAcquiredFrog);
    if (!newlyAcquiredFrog) return null;

    const species = frogSpecies[newlyAcquiredFrog.speciesId];
    // 1ª vez dessa espécie (a coleta já foi registrada, então conta = 1)
    const isFirstOfSpecies = collectedFrogs.filter(id => id === newlyAcquiredFrog.speciesId).length <= 1;
    if (!species) return null;

    return (
        <div className={styles.overlay} data-tour-hide onClick={clearNewlyAcquiredFrog}>
            <div className={styles.card} onClick={(e) => e.stopPropagation()}>
                <div className={`${styles.glow} ${styles[species.rarity]}`} />
                {isFirstOfSpecies
                    ? <p className={styles.newBadge}>✨ NOVA ESPÉCIE DESCOBERTA!</p>
                    : <p className={styles.eyebrow}>🐸 Novo sapo coletado!</p>}
                <div className={styles.frogStage}>
                    <ZenFrog speciesId={species.id} stage="adult" size={130} clickable={false} />
                </div>
                <span className={`${styles.badge} ${styles[species.rarity]}`}>{rarityLabel[species.rarity]}</span>
                <h3 className={styles.name}>{species.name}</h3>
                <p className={styles.description}>Seu foco rendeu — ele já está esperando por você no Jardim Zen.</p>
                <button className={`btn btn-primary ${styles.button}`} onClick={clearNewlyAcquiredFrog}>
                    Oba!
                </button>
                <button
                    className={`btn btn-secondary ${styles.button} ${styles.shareButton}`}
                    disabled={sharing}
                    onClick={async () => {
                        setSharing(true);
                        const r = await shareFrog(species.id, isFirstOfSpecies);
                        setSharing(false);
                        if (r === 'failed') addNotification('Não deu pra compartilhar agora.', '❌', 'error');
                    }}
                >
                    {sharing ? 'Preparando…' : 'Compartilhar 📤'}
                </button>
            </div>
        </div>
    );
};
