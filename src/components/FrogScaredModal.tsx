import React from 'react';
import { usePomodoro, MAX_DISTRACTION_RATIO } from '../context/PomodoroContext';
import { frogSpecies } from '../utils/frogSpecies';
import { ZenFrog } from './zen/ZenFrog';
import styles from './FrogRewardModal.module.css';
import { useBackHandler } from '../hooks/useBackHandler';

const fmt = (ms: number) => {
    const s = Math.round(ms / 1000), m = Math.floor(s / 60), r = s % 60;
    return m > 0 ? (r ? `${m} min ${r}s` : `${m} min`) : `${r}s`;
};

/** Sessão concluída, mas as distrações passaram do limite: sem sapo, sem
 *  bronca — explica o critério e convida a tentar de novo. */
export const FrogScaredModal: React.FC = () => {
    const { scaredOutcome, clearScaredOutcome } = usePomodoro();
    useBackHandler(clearScaredOutcome, !!scaredOutcome);
    if (!scaredOutcome) return null;
    const species = frogSpecies[scaredOutcome.speciesId];

    return (
        <div className={styles.overlay} data-tour-hide onClick={clearScaredOutcome}>
            <div className={styles.card} onClick={(e) => e.stopPropagation()}>
                <p className={styles.eyebrow}>💨 O sapinho fugiu</p>
                <div className={styles.frogStage} style={{ filter: 'grayscale(0.85)', opacity: 0.55 }}>
                    {species && <ZenFrog speciesId={species.id} stage="adult" size={110} clickable={false} />}
                </div>
                <h3 className={styles.name}>As distrações assustaram o sapinho</h3>
                <p className={styles.description}>
                    Você passou <strong>{fmt(scaredOutcome.distractedMs)}</strong> em outros apps durante o foco.
                    Pra ganhar o sapo, o limite é {fmt(scaredOutcome.focusMs * MAX_DISTRACTION_RATIO)}.
                    O tempo do foco já conta nas suas estatísticas. Tenta de novo?
                </p>
                <button className={`btn btn-primary ${styles.button}`} onClick={clearScaredOutcome}>
                    Bora tentar de novo
                </button>
            </div>
        </div>
    );
};
