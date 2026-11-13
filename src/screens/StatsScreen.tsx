// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import Wt from './StatsScreen.module.css';
import * as React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import { FROG_SPECIES } from '../data/frogs';
import { useUser } from '../context/UserContext';
import { FiAward, FiClock } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import { usePomodoro } from '../context/PomodoroContext';
import { useTasks } from '../context/TasksContext';
import { gv } from './store/StoreScreen';
import { C_SH } from '../context/ZenContext';
import { C_wZ } from '../components/zen/LagoaCanvas';
import { C_tQ, XZ } from '../components/zen/ViveiroSheet';
import { C_iQ } from '../components/zen/PondDock';
import { CQ, TQ } from '../components/stats/StreakBanner';

export const EQ = () => {
  const {
      tasks: e
    } = useTasks(),
    {
      pomodorosCompleted: t
    } = usePomodoro(),
    {
      collectedFrogs: n
    } = useUser(),
    {
      pontosFoco: s
    } = useTheme(),
    [r, o] = React.useState(false),
    [a, l] = React.useState(false),
    c = React.useMemo(() => n.filter(f => f && FROG_SPECIES[f]), [n]),
    u = React.useMemo(() => c.map((f, h) => ({
      id: `${f}-${h}`,
      speciesId: f
    })), [c]),
    d = React.useMemo(() => {
      const f = e.filter(x => x.status === "done"),
        h = t * 25,
        m = Math.floor(h / 60),
        v = h % 60;
      return {
        tasksCompletedCount: f.length,
        focusDisplay: `${m}h ${v}m`
      };
    }, [e, t]);
  return <main className="screen-content"><div className={Wt.statsContainer}><CQ quote={TQ} /><div className={Wt.keyMetricsGrid}><div className={Wt.metricCard}><div className={Wt.metricValueContainer}><FiAward className={Wt.metricIcon} /><span className={Wt.metricValue}>{d.tasksCompletedCount}</span></div><span className={Wt.metricLabel}>Sessões Concluídas</span></div><div className={Wt.metricCard}><div className={Wt.metricValueContainer}><FiClock className={Wt.metricIcon} /><span className={Wt.metricValue}>{d.focusDisplay}</span></div><span className={Wt.metricLabel}>Tempo Focado</span></div></div><div className={Wt.frogPondCard}><C_SH collectedFrogs={u}><div className={Wt.pondHeaderRow}><h2 className={Wt.sectionTitle}>Jardim Zen</h2><button className={Wt.storeBtn} onClick={gv} aria-label={`Loja do Sapo, ${s} pontos`}>{"Loja "}<span>{s}{" pts"}</span></button></div><C_wZ>{u.length === 0 && <p className={Wt.emptyPondMessage}>Complete sessões de foco para colecionar sapos!</p>}</C_wZ><C_iQ collectedFrogs={u} onOpenViveiro={() => l(true)} onOpenAlbum={() => o(true)} />{r && <C_tQ collectedFrogs={u} onClose={() => o(false)} />}{a && <XZ onClose={() => l(false)} />}</C_SH></div></div></main>;
};
