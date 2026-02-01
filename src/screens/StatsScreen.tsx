import React, { useMemo } from 'react';
import { Icon } from '../components/Icon';
import { icons } from '../components/Icons';
import { useTasks } from '../context/TasksContext';
import { usePomodoro } from '../context/PomodoroContext';
import { useUser, FROG_SPECIES_DB } from '../context/UserContext';
import { CollectedFrog } from '../components/CollectedFrog';
import styles from './StatsScreen.module.css';

const getStreakStyle = (streakDays: number): React.CSSProperties => {
  if (streakDays === 0) {
    return {
      background: 'linear-gradient(145deg, var(--surface-secondary-color), var(--border-color))',
      color: 'var(--text-color)',
    };
  }
  if (streakDays === 1) {
    return { background: 'linear-gradient(145deg, #3C6DB9, #5D9CEC)' };
  }
  if (streakDays >= 2 && streakDays < 30) {
    const progress = (streakDays - 2) / (29 - 2);
    const spreadPercentage = 100 - progress * 100;
    return {
      background: `linear-gradient(270deg, #FF8C00 0%, #FFD700 50%, #3A7BD5 ${spreadPercentage}%`,
    };
  }
  return { background: 'linear-gradient(145deg, #FF8C00, #E65C00)' };
};

// Paleta de cores padrão para sapos cuja espécie não for encontrada
const DEFAULT_FROG_PALETTE = { primary: '#808080', secondary: '#5A5A5A', tertiary: '#000000' };

export const StatsScreen: React.FC = () => {
  const { tasks } = useTasks();
  const { pomodorosCompleted } = usePomodoro();
  const { collectedFregs } = useUser();

  const populatedFregs = useMemo(() => {
      return collectedFregs.map(collected => {
          const speciesInfo = FROG_SPECIES_DB.find(s => s.id === collected.speciesId);
          return {
              ...collected,
              name: speciesInfo?.name || 'Sapo Perdido',
              palette: speciesInfo?.palette || DEFAULT_FROG_PALETTE, // CORREÇÃO APLICADA AQUI
          };
      }).sort((a, b) => new Date(b.collectedAt).getTime() - new Date(a.collectedAt).getTime());
  }, [collectedFregs]);

  const stats = useMemo(() => {
    const tasksCompleted = tasks.filter(t => t.status === 'done');
    const focusHours = (pomodorosCompleted * 25) / 60;
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
                const diffDays = Math.ceil((currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24));
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
      focusHours: Math.round(focusHours * 10) / 10,
      streakDays: streakDays,
    };
  }, [tasks, pomodorosCompleted]);

  const streakStyle = getStreakStyle(stats.streakDays);

  return (
    <main className="screen-content">
      <div className="contentPadding">
        <div className={styles.statsContainer}>

            <div className={styles.streakHeroCard} style={streakStyle}>
              <div className={styles.streakContent}>
                  <div className={styles.streakInfo}>
                      <span className={styles.streakCount}>{stats.streakDays}</span>
                  </div>
                  <div className={styles.streakSubContent}>
                      <div className={`${styles.streakIcon} ${stats.streakDays > 0 ? styles.burning : ''}`}>
                          <Icon path={icons.flame} />
                      </div>
                      <span className={styles.streakLabel}>Dias de foco consecutivos</span>
                  </div>
              </div>
            </div>

            <div className={styles.keyMetricsGrid}>
              <div className={`card ${styles.metricCard}`}>
                <div className={styles.metricHeader}><Icon path={icons.checkSquare} /><span>Tarefas Concluídas</span></div>
                <div className={styles.value}>{stats.tasksCompletedCount}</div>
              </div>
              <div className={`card ${styles.metricCard}`}>
                <div className={styles.metricHeader}><Icon path={icons.timer} /><span>Horas Focadas</span></div>
                <div className={styles.value}>{stats.focusHours}h</div>
              </div>
            </div>
            
            <div className={`card ${styles.frogPondCard}`}>
                <h4 className={styles.sectionTitle}>
                    <Icon path={icons.leaf} /> Meu Laguinho
                </h4>
                <div className={styles.frogPondGrid}>
                    {populatedFregs.length > 0 ? (
                        populatedFregs.map(frog => (
                            <CollectedFrog key={frog.collectionId} name={frog.name} palette={frog.palette} />
                        ))
                    ) : (
                        <p className={styles.emptyPondMessage}>
                            Complete sessões de foco para colecionar seu primeiro sapo!
                        </p>
                    )}
                </div>
            </div>

        </div>
      </div>
    </main>
  );
};
