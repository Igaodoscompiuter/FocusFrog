import { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { App as CapApp } from '@capacitor/app';
import { useTasks } from '../context/TasksContext';
import { useUI } from '../context/UIContext';
import { ROUTINE_ACTION_SNOOZE, snoozeRoutineNotification } from '../notifications';
import { OPEN_FROG_PICKER_EVENT } from './FrogWidgetSync';

const STARTED_KEY = 'focusfrog_routines_started'; // { [routineId]: 'AAAA-MM-DD' }
const today = () => new Date().toLocaleDateString('sv-SE');

/**
 * O que acontece ao tocar numa notificação do app:
 *  - rotina (toque ou "Começar agora"): coloca as tarefas da rotina na lista
 *    de hoje (uma vez por dia) e abre a tela de Tarefas;
 *  - rotina "Adiar 10 min": avisa de novo em 10 minutos e fecha o app;
 *  - fim de foco/pausa: abre a tela de Foco; lembrete do Sapo do Dia: abre a Home.
 */
export const NotificationActionHandler: React.FC = () => {
  const { routines, handleAddRoutine } = useTasks();
  const { handleNavigate, addNotification } = useUI();
  const latest = useRef({ routines, handleAddRoutine, handleNavigate, addNotification });
  latest.current = { routines, handleAddRoutine, handleNavigate, addNotification };

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const sub = LocalNotifications.addListener('localNotificationActionPerformed', ({ actionId, notification }) => {
      const { routines, handleAddRoutine, handleNavigate, addNotification } = latest.current;
      const extra = (notification.extra || {}) as { routineId?: string; go?: string };

      if (extra.routineId) {
        const routine = routines.find(r => r.id === extra.routineId);
        if (!routine) { handleNavigate('tasks'); return; }
        if (actionId === ROUTINE_ACTION_SNOOZE) {
          snoozeRoutineNotification(routine.id, routine.name, 10);
          addNotification(`Combinado: lembro de "${routine.name}" em 10 minutos.`, '⏰', 'info');
          setTimeout(() => CapApp.minimizeApp().catch(() => {}), 1200);
          return;
        }
        let started: Record<string, string> = {};
        try { started = JSON.parse(localStorage.getItem(STARTED_KEY) || '{}') || {}; } catch { /* vazio */ }
        if (started[routine.id] !== today()) {
          handleAddRoutine(routine);
          started[routine.id] = today();
          try { localStorage.setItem(STARTED_KEY, JSON.stringify(started)); } catch { /* sem espaço */ }
        } else {
          addNotification(`As tarefas de "${routine.name}" já estão na sua lista de hoje.`, '🐸', 'info');
        }
        handleNavigate('tasks');
        return;
      }
      if (extra.go === 'focus') handleNavigate('focus');
      else if (extra.go === 'home') {
        handleNavigate('dashboard');
        setTimeout(() => window.dispatchEvent(new Event(OPEN_FROG_PICKER_EVENT)), 350);
      }
    });
    return () => { sub.then(h => h.remove()).catch(() => {}); };
  }, []);

  return null;
};
