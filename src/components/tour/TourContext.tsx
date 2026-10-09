import React, { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { useTasks } from '../../context/TasksContext';
import { usePomodoro } from '../../context/PomodoroContext';
import { useUI } from '../../context/UIContext';
import { isSpecialFrogTask } from '../../constants';

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
  { id: 'frog', target: '#frog-card', title: 'Passo 2 · Escolhe seu Sapo do Dia', text: 'O Sapo do Dia é a tarefa que mais importa hoje. Toca aqui e escolhe a tarefa que você acabou de criar (ela já vem marcada).' },
  { id: 'start', target: '#eat-the-frog-button', title: 'Passo 3 · Come o sapo!', text: 'Toca em "Comer o Sapo". Esse primeiro foco dura só 5 segundinhos, pra você ver o sapo nascer.' },
  { id: 'focusing', target: '[class*="timerContainer"]', title: 'Olha ele crescendo 👀', text: 'Enquanto o cronômetro roda, um sapinho cresce com você. Esse é rapidinho, só pra mostrar.' },
  { id: 'done', title: 'Pronto, você pegou o jeito! 🎉', text: 'Cada foco concluído traz um sapo novo pro seu Jardim Zen, na aba Jardim. Os próximos focos são de verdade: 25 minutos.', button: 'Continuar' },
  { id: 'gift', target: '#eat-the-frog-button', title: 'Um último presente 🐸', text: 'Deixei o Card Especial FocusFrog como seu Sapo do Dia. Toca aqui pra seguir a gente no Instagram: tem dica de foco e novidade toda semana!', button: 'Concluir' },
];

interface TourState { done: boolean; step: number; taskId?: string }
interface TourContextValue {
  active: boolean;
  step: TourStep | null;
  stepIndex: number;
  /** tarefa criada no passo 1 (vai primeiro e já marcada no seletor) */
  tourTaskId: string | null;
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
  const { tasks, frogTaskId, ensureMarketingFrog, handleSetFrog, handleCreateTemplate, taskTemplates } = useTasks();
  const { sessionStatus } = usePomodoro();
  const { handleNavigate } = useUI();

  useEffect(() => { localStorage.setItem(TOUR_KEY, JSON.stringify(state)); }, [state]);

  const active = !state.done;
  const stepIndex = state.step;
  const step = active ? TOUR_STEPS[stepIndex] ?? null : null;

  // Ao concluir: a tarefa do tutorial vira um modelo de tarefa RÁPIDA na
  // biblioteca (categoria Saúde), uma vez só.
  const finish = useCallback(() => {
    const t = tasks.find(x => x.id === state.taskId);
    const title = t?.title?.trim();
    if (title && !taskTemplates.some(tp => tp.title === title)) {
      handleCreateTemplate({ title, quadrant: 'do', pomodoroEstimate: 0 }, 'Saúde');
    }
    setState({ done: true, step: 0 });
  }, [tasks, state.taskId, taskTemplates, handleCreateTemplate]);
  const goTo = useCallback((i: number) => {
    if (i >= TOUR_STEPS.length) { finish(); return; }
    setState(s => ({ ...s, done: false, step: i }));
  }, [finish]);
  const next = useCallback(() => goTo(stepIndex + 1), [goTo, stepIndex]);
  const skip = useCallback(() => setState({ done: true, step: 0 }), []);
  const restart = useCallback(() => { handleNavigate('dashboard'); setState({ done: false, step: 0 }); }, [handleNavigate]);

  // passos de ação: avança quando a pessoa faz de verdade
  const baseIds = useRef(new Set(tasks.map(t => t.id)));
  useEffect(() => { if (step?.id === 'create') baseIds.current = new Set(tasks.map(t => t.id)); /* eslint-disable-next-line */ }, [step?.id]);
  useEffect(() => {
    if (!active) return;
    const created = step?.id === 'create' ? tasks.find(t => !baseIds.current.has(t.id)) : undefined;
    if (created) { setState(s => ({ ...s, step: s.step + 1, taskId: created.id })); }
    else if (step?.id === 'frog' && frogTaskId && !isSpecialFrogTask(tasks.find(t => t.id === frogTaskId)) && tasks.some(t => t.id === frogTaskId && t.status !== 'done')) next();
    else if (step?.id === 'start' && sessionStatus !== 'idle') next();
    else if (step?.id === 'focusing' && sessionStatus === 'idle') next();
  }, [active, step?.id, tasks, frogTaskId, sessionStatus, next]);

  // passos da Home: garante que a pessoa está na Home
  useEffect(() => {
    if (active && step && ['create', 'frog', 'start', 'gift'].includes(step.id)) handleNavigate('dashboard');
    // passo 2: o Card Especial (padrão de instalação) sai do Sapo do Dia, pra
    // pessoa escolher a tarefa que acabou de criar sem nada no caminho
    if (active && step?.id === 'frog' && isSpecialFrogTask(tasks.find(t => t.id === frogTaskId))) handleSetFrog(null);
    // fecho do tutorial: Card Especial vira o Sapo do Dia, com o botão dele à mostra
    if (active && step?.id === 'gift') ensureMarketingFrog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, step?.id]);

  return (
    <TourContext.Provider value={{ active, step, stepIndex, tourTaskId: state.taskId ?? null, next, skip, restart }}>
      {children}
    </TourContext.Provider>
  );
};
