
import React, { useMemo } from 'react';
import { Icon } from '../components/Icon';
import { icons } from '../components/Icons';
import { useUI } from '../context/UIContext';
import { useTasks } from '../context/TasksContext';
import { usePomodoro } from '../context/PomodoroContext';
import { useTheme } from '../context/ThemeContext';

export const StatsScreen: React.FC = () => {
  const { handleNavigate } = useUI();
  const { tasks } = useTasks();
  const { pomodorosCompleted } = usePomodoro();
  const { pontosFoco } = useTheme();

  // Heatmap Logic - Timezone Corrected
  const heatmapData = useMemo(() => {
    const today = new Date();
    const days = [];
    const completedTasks = tasks.filter(t => t.status === 'done' && t.dueDate);
    
    // Create a map of date -> count
    const activityMap = new Map<string, number>();
    completedTasks.forEach(task => {
        if (task.dueDate) {
            // task.dueDate is already YYYY-MM-DD local string stored in DB
            const count = activityMap.get(task.dueDate) || 0;
            activityMap.set(task.dueDate, count + 1);
        }
    });

    // Generate last 84 days (approx 3 months)
    for (let i = 83; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        
        // Manual construction to avoid UTC shifting
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;

        const count = activityMap.get(dateStr) || 0;
        
        let level = 0;
        if (count > 0) level = 1;
        if (count > 3) level = 2;
        if (count > 6) level = 3;

        days.push({ date: dateStr, level, count });
    }
    return days;
  }, [tasks]);

  const stats = useMemo(() => {
    const completedTasks = tasks.filter(t => t.status === 'done');
    const tasksCompletedCount = completedTasks.length;
    
    // Calculate streak based on local dates strings
    const completedDatesStr = [...new Set(completedTasks.filter(t => t.dueDate).map(t => t.dueDate!))].sort().reverse();
    
    let streakDays = 0;
    if(completedDatesStr.length > 0) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const todayStr = `${yyyy}-${mm}-${dd}`;

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yyyyY = yesterday.getFullYear();
        const mmY = String(yesterday.getMonth() + 1).padStart(2, '0');
        const ddY = String(yesterday.getDate()).padStart(2, '0');
        const yesterdayStr = `${yyyyY}-${mmY}-${ddY}`;

        // Check if streak is active (completed today OR yesterday)
        if(completedDatesStr[0] === todayStr || completedDatesStr[0] === yesterdayStr) {
            streakDays = 1;
            let currentDate = new Date(completedDatesStr[0] + 'T00:00:00'); // Force local midnight
            
            for(let i = 1; i < completedDatesStr.length; i++) {
                const prevDate = new Date(completedDatesStr[i] + 'T00:00:00');
                const diffTime = Math.abs(currentDate.getTime() - prevDate.getTime());
                const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)); 
                
                if (diffDays === 1) { 
                    streakDays++; 
                    currentDate = prevDate; 
                } else { 
                    break; 
                }
            }
        }
    }
    
    const focusHours = (Number(pomodorosCompleted) * 25) / 60; 

    return { 
        tasksCompletedCount, 
        pomodoroSessions: pomodorosCompleted, 
        streakDays, 
        pointsEarned: pontosFoco, 
        focusHours: parseFloat(focusHours.toFixed(1)) 
    };
  }, [tasks, pomodorosCompleted, pontosFoco]);

  return (
    <main className="stats-screen">
      <div className="stats-header">
        <div className="stats-title">
            <h2>Seu Progresso</h2>
        </div>
      </div>

      {/* Hero Card - Streak */}
      <div className="streak-hero-card">
        <div className="streak-content">
            <div className="streak-icon-large">
                <Icon path={icons.flame} className={stats.streakDays > 0 ? 'burning' : ''} />
            </div>
            <div className="streak-info">
                <span className="streak-count">{stats.streakDays}</span>
                <span className="streak-label">Dias seguidos de foco!</span>
            </div>
        </div>
      </div>

      <div className="key-metrics-grid">
        <div className="card metric-card">
          <div className="metric-header"><Icon path={icons.checkSquare} /><span>Tarefas</span></div>
          <div className="value">{stats.tasksCompletedCount}</div>
        </div>
        <div className="card metric-card">
          <div className="metric-header"><Icon path={icons.timer} /><span>Horas Focadas</span></div>
          <div className="value">{stats.focusHours}h</div>
        </div>
         <div className="card metric-card">
           <div className="metric-header"><Icon path={icons.trophy} /><span>Pontos</span></div>
          <div className="value">{stats.pointsEarned}</div>
        </div>
      </div>
      
      {/* Heatmap Section */}
      <div className="card">
          <h4 style={{marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <Icon path={icons.calendar} /> Consistência
          </h4>
          <div className="heatmap-wrapper">
            <div className="heatmap-grid">
                {heatmapData.map((day) => (
                    <div 
                        key={day.date} 
                        className={`heatmap-cell level-${day.level}`}
                        title={`${day.date}: ${day.count} tarefas`}
                    ></div>
                ))}
            </div>
          </div>
          <p style={{fontSize: '0.8rem', color: 'var(--text-secondary-color)', marginTop: '0.5rem', textAlign: 'right'}}>
              Últimos 3 meses
          </p>
      </div>

      <div className="stats-footer-actions">
         <button className="control-button secondary" onClick={() => handleNavigate('rewards')} style={{width: '100%', justifyContent: 'center'}}>
            <Icon path={icons.trophy} /> Ir para Loja de Recompensas
         </button>
      </div>
    </main>
  );
};
