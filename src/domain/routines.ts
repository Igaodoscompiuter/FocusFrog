import type { Routine, Subtask, Task, TaskTemplate } from '../types';

/** Como a rotina entra na lista ao ser adicionada. */
export type RoutineMode = 'one' | 'pick' | 'separate';

export const WEEKDAY_SHORT = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'] as const;

export const routineMode = (r: Pick<Routine, 'asOneTask' | 'pickSome'>): RoutineMode =>
  r.pickSome ? 'pick' : r.asOneTask ? 'one' : 'separate';

/** Minutos estimados de um modelo: valor explícito, soma dos passos ou pomodoros. */
export function templateMinutes(t: TaskTemplate): number {
  if (t.estMinutes) return t.estMinutes;
  const fromSteps = (t.subtasks ?? []).reduce((sum, s) => sum + (s.minutes ?? 0), 0);
  if (fromSteps) return fromSteps;
  return t.pomodoroEstimate ? (t.customDuration ?? 25) * t.pomodoroEstimate : 0;
}

/** Modelos da rotina, na ordem em que ela os lista, ignorando ids que não existem mais. */
export function routineTemplates(r: Routine, templates: TaskTemplate[]): TaskTemplate[] {
  return (r.taskTemplateIds ?? [])
    .map((id) => templates.find((t) => t.id === id))
    .filter((t): t is TaskTemplate => !!t);
}

export const routineMinutes = (r: Routine, templates: TaskTemplate[]): number =>
  routineTemplates(r, templates).reduce((sum, t) => sum + templateMinutes(t), 0);

/** "~15 min", "~1h 30". Vazio quando não há estimativa. */
export function formatMinutes(min: number): string {
  if (!min) return '';
  if (min < 60) return `~${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `~${h}h${m ? ` ${m}` : ''}`;
}

/** A rotina aparece hoje? Sem dias definidos (ou os 7 dias) vale todo dia. */
export const routineRunsOn = (r: Pick<Routine, 'days'>, weekday: number): boolean =>
  !r.days || r.days.length === 0 || r.days.length === 7 || r.days.includes(weekday);

/** Descrição humana dos dias: "todo dia", "seg a sex", "sáb", "ter, qui e sáb". */
export function describeDays(days: number[] | undefined): string {
  const set = [...new Set(days ?? [])].sort();
  if (set.length === 0 || set.length === 7) return 'todo dia';
  const key = set.join();
  if (key === '1,2,3,4,5') return 'seg a sex';
  if (key === '0,6') return 'fim de semana';
  const names = set.map((d) => WEEKDAY_SHORT[d]);
  return names.length === 1 ? names[0] : `${names.slice(0, -1).join(', ')} e ${names[names.length - 1]}`;
}

interface Step {
  text: string;
  minutes?: number;
}

/** Achata modelos em passos: os passos do modelo, ou o próprio título se não tiver. */
export const stepsFromTemplates = (templates: TaskTemplate[]): Step[] =>
  templates.flatMap((t) =>
    t.subtasks && t.subtasks.length ? t.subtasks.map((s) => ({ text: s.text, minutes: s.minutes })) : [{ text: t.title }],
  );

/** Tarefa única que representa a rotina inteira, com as partes como passos. */
export function routineAsTask(
  routine: Routine,
  templates: TaskTemplate[],
  dueDate: string,
  now = Date.now(),
): Omit<Task, 'id' | 'status' | 'displayOrder'> {
  const subtasks: Subtask[] = stepsFromTemplates(templates).map((s, i) => ({
    id: `sub-${now}-${i}`,
    text: s.text,
    completed: false,
    ...(s.minutes ? { minutes: s.minutes } : {}),
  }));
  return {
    title: routine.name,
    description: routine.description,
    quadrant: 'do',
    pomodoroEstimate: 0,
    dueDate,
    routineId: routine.id,
    subtasks,
  };
}

/** Progresso de uma rotina já adicionada como tarefa única. */
export function routineProgress(task: Pick<Task, 'subtasks'>): {
  done: number;
  total: number;
  minutesLeft: number;
  nextIndex: number;
} {
  const subs = task.subtasks ?? [];
  const done = subs.filter((s) => s.completed).length;
  const minutesLeft = subs.filter((s) => !s.completed).reduce((sum, s) => sum + (s.minutes ?? 0), 0);
  return { done, total: subs.length, minutesLeft, nextIndex: subs.findIndex((s) => !s.completed) };
}

/**
 * Versão curta para dias ruins: só as partes marcadas como essenciais ou, na falta
 * de marcação, as duas primeiras (o começo é o que mais importa para arrancar).
 */
export function shortVersion<T extends object>(steps: T[], fallbackCount = 2): T[] {
  const marked = steps.filter((s) => (s as { essential?: boolean }).essential);
  return marked.length ? marked : steps.slice(0, fallbackCount);
}
