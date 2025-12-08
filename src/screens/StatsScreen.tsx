import React, { useMemo } from 'react';
import { Icon } from '../components/Icon';
import { icons } from '../components/Icons';
import { useUI } from '../context/UIContext';
import { useTasks } from '../context/TasksContext';
import { usePomodoro } from '../context/PomodoroContext';
import { useTheme } from '../context/ThemeContext';
import styles from './StatsScreen.module.css';

// Função para gerar o estilo dinâmico do card de streak
const getStreakStyle = (streakDays: number): React.CSSProperties => {
  // Nível 0: Sem streak, card neutro
  if (streakDays === 0) {
    return {
      background: 'linear-gradient(145deg, var(--surface-secondary-color), var(--border-color))',
      color: 'var(--text-color)',
    };
  }

  // Nível 1: Primeiro dia, a faísca azul
  if (streakDays === 1) {
    return { background: 'linear-gradient(145deg, #3C6DB9, #5D9CEC)' };
  }

  // Níveis 2-29: O fogo se espalha dia a dia
  if (streakDays >= 2 && streakDays < 30) {
    // Calcula o progresso da "chama" de 0 (dia 2) a 1 (dia 29)
    const progress = (streakDays - 2) / (29 - 2);
    // A chama avança da direita (0%) para a esquerda (100%)
    const spreadPercentage = 100 - progress * 100;

    return {
      background: `linear-gradient(270deg, #FF8C00 0%, #FFD700 50%, #3A7BD5 ${spreadPercentage}%)`,
    };
  }

  // Nível 30+: Fogo intenso, o auge da consistência
  return { background: 'linear-gradient(145deg, #FF8C00, #E65C00)' };
};

export const StatsScreen: React.FC = () => {
  const { handleNavigate } = useUI();
  const { tasks } = useTasks();
  const { pomodorosCompleted } = usePomodoro();
  const { pontosFoco } = useTheme();

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

        if (daysSinceLastCompletion > 1) {
            streakDays = 0;
        } else {
            streakDays = 1;
             for (let i = 0; i < completionDates.length - 1; i++) {
                const currentDate = new Date(completionDates[i]);
                const previousDate = new Date(completionDates[i+1]);
                const diffTime = currentDate.getTime() - previousDate.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
      pointsEarned: pontosFoco,
      streakDays: streakDays,
    };
  }, [tasks, pomodorosCompleted, pontosFoco]);
  
  const heatmapData = useMemo(() => {
    const taskCountsByDay: { [key: string]: number } = {};
    tasks.filter(t => t.status === 'done' && t.completedAt).forEach(task => {
        const date = new Date(task.completedAt!).toISOString().split('T')[0];
        taskCountsByDay[date] = (taskCountsByDay[date] || 0) + 1;
    });

    const data = [];
    const today = new Date();
    for (let i = 90; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        const count = taskCountsByDay[dateString] || 0;
        
        let level = 0;
        if (count > 0 && count <= 2) level = 1;
        else if (count > 2 && count <= 5) level = 2;
        else if (count > 5) level = 3;

        data.push({ date: dateString, count, level });
    }
    return data;
  }, [tasks]);

  // Gera o estilo dinâmico para o card
  const streakStyle = getStreakStyle(stats.streakDays);

  return (
    <main className="screen-content">
      <div className={styles.statsHeader}>
        <div className={styles.statsTitle}>
            <h2>Seu Progresso</h2>
        </div>
      </div>
      
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
                    <span className={styles.streakLabel}>Dias seguidos de foco</span>
                </div>
            </div>
          </div>

          <div className={styles.keyMetricsGrid}>
            <div className={`card ${styles.metricCard}`}>
              <div className={styles.metricHeader}><Icon path={icons.checkSquare} /><span>Tarefas</span></div>
              <div className={styles.value}>{stats.tasksCompletedCount}</div>
            </div>
            <div className={`card ${styles.metricCard}`}>
              <div className={styles.metricHeader}><Icon path={icons.timer} /><span>Horas Focadas</span></div>
              <div className={styles.value}>{stats.focusHours}h</div>
            </div>
             <div className={`card ${styles.metricCard}`}>
               <div className={styles.metricHeader}><Icon path={icons.trophy} /><span>Pontos</span></div>
              <div className={styles.value}>{stats.pointsEarned}</div>
            </div>
          </div>
          
          <div className={`card ${styles.consistencyCard}`}>
              <h4 className={styles.sectionTitle}>
                  <Icon path={icons.calendar} /> Consistência
              </h4>
              <div className={styles.heatmapWrapper}>
                <div className={styles.heatmapGrid}>
                    {heatmapData.map((day) => (
                        <div 
                            key={day.date} 
                            className={`${styles.heatmapCell} ${styles['level-' + day.level]}`}
                            title={`${day.date}: ${day.count} tarefas`}
                        ></div>
                    ))}
                </div>
              </div>
              <p className={styles.footnote}>
                  Últimos 3 meses
              </p>
          </div>

          <div className={styles.statsFooterActions}>
             <button className="btn btn-secondary" onClick={() => handleNavigate('rewards')}>
                <Icon path={icons.trophy} /> Ir para Loja de Recompensas
             </button>
          </div>
      </div>
    </main>
  );
};
