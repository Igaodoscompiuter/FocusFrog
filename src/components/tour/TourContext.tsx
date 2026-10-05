import React, { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { useTasks } from '../../context/TasksContext';
import { usePomodoro } from '../../context/PomodoroContext';
import { useUI } from '../../context/UIContext';
import { FOCUS_FROG_MARKETING_TASK_ID } from '../../constants';

export const TOUR_KEY = 'focusfrog_tour';

export interface TourStep {
  id: string;
  /** seletor do elemento iluminado (sem = balão centralizado) */
  target?: string;
  title: string;
  text: string;
  /** passos sem ação esperada mostram um botão pra avançar */
  button?: string;
}

/** Roteiro: o sapo guia a pessoa a FAZER de verdade o ciclo principal —
 *  criar tarefa → escolher Sapo do Dia → iniciar foco. Os passos de ação
 *  avançam sozinhos quando a ação acontece (não por "Próximo"). */
export const TOUR_STEPS: TourStep[] = [
  { id: 'welcome', title: 'Oi! Que bom te ver por aqui 🐸', text: 'Eu sou o sapinho do FocusFrog. Em 3 passos rapidinhos eu te mostro como sair do "não sei por onde começar" pro foco de verdade.', button: 'Bora!' },
  { id: 'create', target: '#tutorial-step1-form', title: 'Passo 1 · Tira da cabeça', text: 'Escreve aqui uma coisa que você precisa fazer hoje e toca no +. Pode ser pequena!' },
  { id: 'frog', target: '#frog-card', title: 'Passo 2 · Escolhe seu Sapo do Dia', text: 'O Sapo do Dia é a tarefa que mais importa hoje. Toca aqui (no ✎) e escolhe a tarefa que você acabou de criar.' },
  { id: 'start', target: '#eat-the-frog-button', title: 'Passo 3 · Come o sapo!', text: 'Tudo pronto. Toca em "Comer o Sapo" pra começar seu primeiro foco.' },
  { id: 'focusing', title: 'Isso! Você começou 🎉', text: 'Enquanto o cronômetro roda, um sapinho cresce com você. Termine o foco e ele vai morar no seu Jardim Zen, em Estatísticas.', button: 'Entendi!' },
];

interface TourState { done: boolean; step: number }
interface TourContextValue {
  active: boolean;
  step: TourStep | null;
  stepIndex: number;
  next: () => void;
  skip: () => void;
  restart: () => void;
}

const TourContext = createContext<TourContextValue | null>(null);
export const useTour = () => {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error('useTour precisa estar dentro de <TourProvider>');
  return ctx;
};

const load = (): TourState => {
  try { const raw = localStorage.getItem(TOUR_KEY); if (raw) return JSON.parse(raw); } catch { /* */ }
  return { done: false, step: 0 }; // 1ª abertura após o onboarding: começa o tour
};

export const TourProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<TourState>(load);
  const { tasks, frogTaskId } = useTasks();
  const { sessionStatus } = usePomodoro();
  const { handleNavigate } = useUI();

  useEffect(() => { localStorage.setItem(TOUR_KEY, JSON.stringify(state)); }, [state]);

  const active = !state.done;
  const stepIndex = state.step;
  const step = active ? TOUR_STEPS[stepIndex] ?? null : null;

  const goTo = useCallback((i: number) => setState(i >= TOUR_STEPS.length ? { done: true, step: 0 } : { done: false, step: i }), []);
  const next = useCallback(() => goTo(stepIndex + 1), [goTo, stepIndex]);
  const skip = useCallback(() => setState({ done: true, step: 0 }), []);
  const restart = useCallback(() => { handleNavigate('dashboard'); setState({ done: false, step: 0 }); }, [handleNavigate]);

  // passos de ação: avança quando a pessoa faz de verdade
  const baseTasks = useRef(tasks.length);
  useEffect(() => { if (step?.id === 'create') baseTasks.current = tasks.length; /* eslint-disable-next-line */ }, [step?.id]);
  useEffect(() => {
    if (!active) return;
    if (step?.id === 'create' && tasks.length > baseTasks.current) next();
    else if (step?.id === 'frog' && frogTaskId && frogTaskId !== FOCUS_FROG_MARKETING_TASK_ID && tasks.some(t => t.id === frogTaskId && t.status !== 'done')) next();
    else if (step?.id === 'start' && sessionStatus !== 'idle') next();
  }, [active, step?.id, tasks, frogTaskId, sessionStatus, next]);

  // passos da Home: garante que a pessoa está na Home
  useEffect(() => {
    if (active && step && ['create', 'frog', 'start'].includes(step.id)) handleNavigate('dashboard');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, step?.id]);

  return (
    <TourContext.Provider value={{ active, step, stepIndex, next, skip, restart }}>
      {children}
    </TourContext.Provider>
  );
};
