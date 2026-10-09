import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { useTasks } from '../context/TasksContext';
import { usePomodoro } from '../context/PomodoroContext';
import { useUI } from '../context/UIContext';
import { syncFrogToWidget } from '../widgetBridge';
import { todayISO } from '../utils/dates';

export const OPEN_FROG_PICKER_EVENT = 'focusfrog:open-frog-picker';

/**
 * Mantém o widget "Sapo do Dia" igual ao app e trata os toques nele
 * (focusfrog://open?go=frog abre a escolha do sapo; go=home abre a Home).
 * Não desenha nada.
 */
export const FrogWidgetSync: React.FC = () => {
    const { tasks, frogTaskId } = useTasks();
    const { sessionStatus, activeTaskId, sessionEndsAt } = usePomodoro();
    const { handleNavigate } = useUI();

    // app → widget
    useEffect(() => {
        const today = todayISO();
        const frog = frogTaskId ? tasks.find(t => t.id === frogTaskId) : undefined;
        if (!frog) { syncFrogToWidget({ state: 'none', date: today }); return; }
        if (frog.status === 'done') {
            const doneToday = !!frog.completedAt && new Date(frog.completedAt).toDateString() === new Date().toDateString();
            syncFrogToWidget(doneToday ? { state: 'done', title: frog.title, date: today } : { state: 'none', date: today });
            return;
        }
        const subs = frog.subtasks || [];
        const focusingFrog = sessionStatus === 'focus' && activeTaskId === frog.id;
        syncFrogToWidget({
            state: 'active',
            title: frog.title,
            total: subs.length,
            done: subs.filter(s => s.completed).length,
            focusEndsAt: focusingFrog ? sessionEndsAt : null,
            date: today,
        });
    }, [tasks, frogTaskId, sessionStatus, activeTaskId, sessionEndsAt]);

    // widget → app
    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;
        const handle = (url?: string | null) => {
            if (!url || !url.startsWith('focusfrog://open')) return;
            const go = new URL(url.replace('focusfrog://', 'https://x/')).searchParams.get('go');
            handleNavigate('dashboard');
            if (go === 'frog') setTimeout(() => window.dispatchEvent(new Event(OPEN_FROG_PICKER_EVENT)), 350);
        };
        CapApp.getLaunchUrl().then(r => handle(r?.url)).catch(() => {});
        const sub = CapApp.addListener('appUrlOpen', ({ url }) => handle(url));
        return () => { sub.then(s => s.remove()); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
};
