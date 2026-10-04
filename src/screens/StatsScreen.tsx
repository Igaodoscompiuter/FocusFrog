import React, { useMemo, useState } from 'react';
import styles from './StatsScreen.module.css';
import { useTasks } from '../context/TasksContext';
import { usePomodoro } from '../context/PomodoroContext';
import { useUser } from '../context/UserContext';
import { ZenPond } from '../components/ZenPond';
import { ZenPondProvider, useZenPond } from '../context/ZenPondContext';
import { ViveiroSheet } from '../components/zen/ViveiroSheet';
import { FrogAlbumSheet } from '../components/zen/FrogAlbumSheet';
import { motivationalQuotes } from '../utils/quotes';
import { FiAward, FiClock } from 'react-icons/fi';
import { frogSpecies } from '../utils/frogSpecies';

const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

/** Cabeçalho "Lagoa X/8 · Viveiro N" — precisa estar DENTRO do
 *  ZenPondProvider pra ler os contadores reais via contexto. */
const ZenPondHeader: React.FC<{ onOpenViveiro: () => void; onOpenAlbum: () => void }> = ({ onOpenViveiro, onOpenAlbum }) => {
    const { pondFrogs, storageFrogs, maxPond } = useZenPond();
    const totalSpecies = Object.keys(frogSpecies).length;
    const foundSpecies = new Set([...pondFrogs, ...storageFrogs].map(f => f.speciesId)).size;
    return (
        <div className={styles.pondHeaderRow}>
            <h2 className={styles.sectionTitle}>Jardim Zen</h2>
            <div className={styles.pondHeaderButtons}>
                <button className={styles.viveiroBtn} onClick={onOpenAlbum}>
                    📖 {foundSpecies}/{totalSpecies}
                </button>
                <button className={styles.viveiroBtn} onClick={onOpenViveiro}>
                    Lagoa {pondFrogs.filter(f => !f.merging).length}/{maxPond} · 🧺 {storageFrogs.length}
                </button>
            </div>
        </div>
    );
};

export const StatsScreen: React.FC = () => {
  const { tasks } = useTasks();
  const { pomodorosCompleted } = usePomodoro();
  const { collectedFrogs } = useUser();
  
  const [showAlbum, setShowAlbum] = useState(false);
  const [showViveiro, setShowViveiro] = useState(false);

  // [CORREÇÃO] Filtra a lista de sapos para remover quaisquer valores inválidos ou `undefined`.
  // Isso garante que apenas IDs de espécies existentes sejam usados nos cálculos seguintes.
  const validCollectedFrogs = useMemo(() => {
    return collectedFrogs.filter(id => id && frogSpecies[id]);
  }, [collectedFrogs]);

  const frogsForPond = useMemo(() => {
    // Usa a lista já filtrada e segura.
    return validCollectedFrogs.map((speciesId, index) => ({
      id: `${speciesId}-${index}`,
      speciesId: speciesId,
    }));
  }, [validCollectedFrogs]);

  const stats = useMemo(() => {
    const tasksCompleted = tasks.filter(t => t.status === 'done');
    const focusTimeMinutes = pomodorosCompleted * 25;
    const focusHours = Math.floor(focusTimeMinutes / 60);
    const focusMinutes = focusTimeMinutes % 60;
    
    const completionDates = [...new Set(tasksCompleted.map(t => new Date(t.completedAt!).toDateString()))];
    completionDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    let streakDays = 0;
    if (completionDates.length > 0) {
        let today = new Date();
        const lastCompletionDate = new Date(completionDates[0]);
        const daysSinceLastCompletion = (today.setHours(0,0,0,0) - lastCompletionDate.setHours(0,0,0,0)) / (1000*60*60*24);
        if (daysSinceLastCompletion <= 1) {
            streakDays = 1;
            for (let i = 0; i < completionDates.length - 1; i++) {
                const currentDate = new Date(completionDates[i]);
                const previousDate = new Date(completionDates[i+1]);
                const diffDays = (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24);
                if (diffDays === 1) {
                    streakDays++;
                } else {
                    break;
                }
            }
        }
    }

    return {
      tasksCompletedCount: tasksCompleted.length,
      focusDisplay: `${focusHours}h ${focusMinutes}m`,
      streakDays: streakDays,
    };
  }, [tasks, pomodorosCompleted]);

  return (
    <main className="screen-content">
      <div className={styles.statsContainer}>

        <div className={styles.centeredStreakCard}>
            <span className={styles.streakNumber}>{stats.streakDays}</span>
            <span className={styles.streakText}>Dias de Foco</span>
            <p className={styles.streakQuote}>{`"${randomQuote}"`}</p>
        </div>

        <div className={styles.keyMetricsGrid}>
            <div className={styles.metricCard}>
                <div className={styles.metricValueContainer}>
                    <FiAward className={styles.metricIcon} />
                    <span className={styles.metricValue}>{stats.tasksCompletedCount}</span>
                </div>
                <span className={styles.metricLabel}>Sessões Concluídas</span>
            </div>
            <div className={styles.metricCard}>
                <div className={styles.metricValueContainer}>
                    <FiClock className={styles.metricIcon} />
                    <span className={styles.metricValue}>{stats.focusDisplay}</span>
                </div>
                <span className={styles.metricLabel}>Tempo Focado</span>
            </div>
        </div>
        
        <div className={styles.frogPondCard}>
            <ZenPondProvider collectedFrogs={frogsForPond}>
                <ZenPondHeader onOpenViveiro={() => setShowViveiro(true)} onOpenAlbum={() => setShowAlbum(true)} />
                <ZenPond>
                    {frogsForPond.length === 0 && (
                        <p className={styles.emptyPondMessage}>
                            Complete sessões de foco para colecionar sapos!
                        </p>
                    )}
                </ZenPond>
                {showAlbum && <FrogAlbumSheet collectedFrogs={frogsForPond} onClose={() => setShowAlbum(false)} />}
                {showViveiro && <ViveiroSheet onClose={() => setShowViveiro(false)} />}
            </ZenPondProvider>
        </div>

      </div>
    </main>
  );
};
