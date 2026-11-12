import { z } from 'zod';
import type { EnergyLevel, Quadrant, Routine, Tag, Task, TaskTemplate, TimeOfDay } from '../types';

/** Máximo de tarefas / rotinas aceitas por importação. */
export const MAX_IMPORT_TASKS = 500;
export const MAX_IMPORT_ROUTINES = 20;

const QUADRANTS: Record<string, Quadrant> = {
  inbox: 'inbox', despejo: 'inbox', do: 'do', fazer: 'do', agora: 'do',
  schedule: 'schedule', agendar: 'schedule', planejar: 'schedule',
  delegate: 'delegate', delegar: 'delegate', someday: 'someday', depois: 'someday', ideias: 'someday',
};
const ENERGY: Record<string, EnergyLevel> = {
  low: 'low', baixa: 'low', medium: 'medium', media: 'medium', média: 'medium', high: 'high', alta: 'high',
};
const PERIOD: Record<string, TimeOfDay> = {
  morning: 'morning', manha: 'morning', manhã: 'morning', afternoon: 'afternoon', tarde: 'afternoon',
  night: 'night', noite: 'night',
};
const WEEKDAYS: Record<string, number> = {
  dom: 0, domingo: 0, seg: 1, segunda: 1, ter: 2, terca: 2, terça: 2, qua: 3, quarta: 3,
  qui: 4, quinta: 4, sex: 5, sexta: 5, sab: 6, sáb: 6, sabado: 6, sábado: 6,
};
const ROUTINE_MODES: Record<string, 'one' | 'separate' | 'pick'> = {
  uma: 'one', 'uma tarefa': 'one', one: 'one', separadas: 'separate', separate: 'separate', escolher: 'pick', pick: 'pick',
};

const pad = (n: number) => String(n).padStart(2, '0');
export const toISODate = (d: Date): string => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (d: Date, n: number): Date => {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
};

/** Aceita as palavras-chave em PT/EN (sem diferenciar maiúsculas) e devolve o valor interno. */
const keyword = <T>(map: Record<string, T>, label: string) =>
  z
    .string()
    .transform((v) => v.trim().toLowerCase())
    .refine((v) => v in map, { message: `${label} inválido; use: ${[...new Set(Object.keys(map))].join(', ')}` })
    .transform((v) => map[v]);

const stepSchema = z.union([
  z.string().trim().min(1, 'passo vazio'),
  z
    .object({
      text: z.string().trim().min(1, 'passo vazio'),
      minutes: z.number().int().min(1).max(240).optional(),
      done: z.boolean().optional(),
    })
    .strict(),
]);

const dueDateSchema = (today: Date) =>
  z
    .string()
    .transform((v) => v.trim().toLowerCase())
    .refine((v) => ['hoje', 'today', 'amanha', 'amanhã', 'tomorrow'].includes(v) || /^\d{4}-\d{2}-\d{2}$/.test(v), {
      message: 'data no formato AAAA-MM-DD, ou "hoje" / "amanhã"',
    })
    .transform((v) => (v === 'hoje' || v === 'today' ? toISODate(today) : v.startsWith('aman') || v === 'tomorrow' ? toISODate(addDays(today, 1)) : v));

const taskSchema = (today: Date) =>
  z
    .object({
      title: z.string().trim().min(1, 'título vazio').max(200, 'título com mais de 200 letras'),
      description: z.string().max(2000).optional(),
      quadrant: keyword(QUADRANTS, 'quadrante').optional(),
      dueDate: dueDateSchema(today).optional(),
      pomodoroEstimate: z.number().int().min(0).max(12).optional(),
      customDuration: z.number().int().min(1).max(180).optional(),
      energyNeeded: keyword(ENERGY, 'energia').optional(),
      timeOfDay: keyword(PERIOD, 'período').optional(),
      steps: z.array(stepSchema).max(50).optional(),
      subtasks: z.array(stepSchema).max(50).optional(),
      tag: z.string().trim().optional(),
    })
    .strict();

const weekdaySchema = z.union([
  z.number().int().min(0).max(6),
  z
    .string()
    .transform((v) => v.trim().toLowerCase().replace(/-feira$/, ''))
    .refine((v) => v in WEEKDAYS, { message: 'dia inválido; use dom, seg, ter, qua, qui, sex, sáb (ou 0 a 6)' })
    .transform((v) => WEEKDAYS[v]),
]);

const routineTaskSchema = z
  .object({
    title: z.string().trim().min(1, 'título vazio').max(200),
    description: z.string().max(2000).optional(),
    quadrant: keyword(QUADRANTS, 'quadrante').optional(),
    pomodoroEstimate: z.number().int().min(0).max(12).optional(),
    customDuration: z.number().int().min(1).max(180).optional(),
    energyNeeded: keyword(ENERGY, 'energia').optional(),
    timeOfDay: keyword(PERIOD, 'período').optional(),
    steps: z.array(stepSchema).max(50).optional(),
    estMinutes: z.number().int().min(1).max(600).optional(),
  })
  .strict();

const routineSchema = z
  .object({
    name: z.string().trim().min(1, 'nome vazio').max(80),
    description: z.string().max(300).optional(),
    icon: z.string().optional(),
    days: z.array(weekdaySchema).max(7).optional(),
    time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'horário no formato HH:MM').optional(),
    alarm: z.boolean().optional(),
    mode: keyword(ROUTINE_MODES, 'modo').optional(),
    tasks: z.array(routineTaskSchema).min(1, 'rotina sem tarefas').max(30),
  })
  .strict();

const TYPE_PT: Record<string, string> = {
  string: 'texto', number: 'número', boolean: 'verdadeiro/falso', array: 'lista', object: 'objeto', undefined: 'vazio', null: 'nulo',
};

/** Traduz um erro do Zod para uma frase curta em português, com o caminho do campo. */
export function describeIssue(issue: z.ZodIssue): string {
  const where = issue.path.length ? `${issue.path.join('.')}: ` : '';
  switch (issue.code) {
    case 'invalid_type':
      return issue.received === 'undefined'
        ? `${where}obrigatório`
        : `${where}esperava ${TYPE_PT[issue.expected] ?? issue.expected}, veio ${TYPE_PT[issue.received] ?? issue.received}`;
    case 'unrecognized_keys':
      return `${where}campo desconhecido: ${issue.keys.join(', ')}`;
    case 'too_small':
      return issue.type === 'string' && issue.minimum === 1 ? issue.message : `${where}valor abaixo do mínimo (${issue.minimum})`;
    case 'too_big':
      return `${where}valor acima do máximo (${issue.maximum})`;
    case 'invalid_union': {
      const inner = issue.unionErrors.flatMap((e) => e.issues).find((i) => i.code !== 'invalid_type' && i.code !== 'invalid_union');
      return inner ? describeIssue(inner) : `${where}valor em formato inválido`;
    }
    default:
      return `${where}${issue.message}`;
  }
}

export type ImportedTask = Omit<Task, 'id' | 'status' | 'displayOrder'>;
export type ImportedTemplate = Omit<TaskTemplate, 'id'>;
export type ImportedRoutine = Omit<Routine, 'id' | 'taskTemplateIds'>;

export interface ImportIssue {
  /** Posição (a partir de 1) na lista enviada. */
  item: number;
  title?: string;
  message: string;
  routine?: boolean;
}
export interface ReadyTask { item: number; task: ImportedTask; duplicate: boolean }
export interface ReadyRoutine { item: number; routine: ImportedRoutine; templates: ImportedTemplate[]; duplicate: boolean }
export interface ImportPreview {
  ready: ReadyTask[];
  routines: ReadyRoutine[];
  errors: ImportIssue[];
  warnings: ImportIssue[];
  /** Erro que impede qualquer importação (JSON quebrado, formato errado, lista vazia). */
  fatal?: string;
}

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');
const titleOf = (v: unknown, key: 'title' | 'name'): string | undefined =>
  v && typeof v === 'object' && typeof (v as Record<string, unknown>)[key] === 'string' ? ((v as Record<string, string>)[key]) : undefined;

/**
 * Lê um JSON colado/aberto/baixado e monta a prévia do que seria importado.
 * Não grava nada: quem chama só salva depois que a pessoa confirma.
 */
export function parseImport(
  text: string,
  existingTasks: Pick<Task, 'title' | 'status'>[],
  tags: Pick<Tag, 'id' | 'name'>[],
  existingRoutines: Pick<Routine, 'name'>[] = [],
  now: Date = new Date(),
): ImportPreview {
  const out: ImportPreview = { ready: [], routines: [], errors: [], warnings: [] };
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch (e) {
    out.fatal = `JSON inválido: ${e instanceof Error ? e.message : String(e)}`;
    return out;
  }
  const obj = data && typeof data === 'object' && !Array.isArray(data) ? (data as Record<string, unknown>) : null;
  const taskList: unknown[] | null = Array.isArray(data) ? data : obj && Array.isArray(obj.tasks) ? obj.tasks : obj ? [] : null;
  const routineList: unknown[] = obj && Array.isArray(obj.routines) ? obj.routines : [];

  if (!taskList || (obj && !Array.isArray(obj.tasks) && !Array.isArray(obj.routines))) {
    out.fatal = 'Formato esperado: uma lista de tarefas [ ... ] ou { "tasks": [ ... ], "routines": [ ... ] }';
    return out;
  }
  if (taskList.length === 0 && routineList.length === 0) { out.fatal = 'A lista está vazia.'; return out; }
  if (taskList.length > MAX_IMPORT_TASKS) { out.fatal = `São ${taskList.length} tarefas; o máximo por vez é ${MAX_IMPORT_TASKS}.`; return out; }
  if (routineList.length > MAX_IMPORT_ROUTINES) { out.fatal = `São ${routineList.length} rotinas; o máximo por vez é ${MAX_IMPORT_ROUTINES}.`; return out; }

  const rSchema = routineSchema;
  const tSchema = taskSchema(now);
  const seenRoutines = new Set(existingRoutines.map((r) => norm(r.name)));

  routineList.forEach((raw, i) => {
    const item = i + 1;
    const parsed = rSchema.safeParse(raw);
    if (!parsed.success) {
      out.errors.push({ item, routine: true, title: titleOf(raw, 'name'), message: parsed.error.issues.map(describeIssue).join(' · ') });
      return;
    }
    const p = parsed.data;
    const days = [...new Set(p.days ?? [])].sort();
    const routine: ImportedRoutine = {
      name: p.name,
      description: p.description ?? '',
      icon: (p.icon ?? 'bookOpen') as Routine['icon'],
      ...(days.length && days.length < 7 ? { days } : {}),
      ...(p.time ? { scheduledTime: p.time, alarmMode: p.alarm ? 'alarm' : 'normal' } : {}),
      ...(p.mode === 'one' ? { asOneTask: true } : p.mode === 'pick' ? { pickSome: true } : {}),
    } as ImportedRoutine;
    const templates: ImportedTemplate[] = p.tasks.map((t) => ({
      title: t.title,
      category: p.name,
      isDefault: false,
      ...(t.description ? { description: t.description } : {}),
      quadrant: t.quadrant ?? 'do',
      pomodoroEstimate: t.pomodoroEstimate ?? 0,
      ...(t.customDuration ? { customDuration: t.customDuration } : {}),
      ...(t.energyNeeded ? { energyNeeded: t.energyNeeded } : {}),
      ...(t.timeOfDay ? { timeOfDay: t.timeOfDay } : {}),
      ...(t.estMinutes ? { estMinutes: t.estMinutes } : {}),
      ...(t.steps?.length
        ? { subtasks: t.steps.map((s) => (typeof s === 'string' ? { text: s } : { text: s.text, ...(s.minutes ? { minutes: s.minutes } : {}) })) }
        : {}),
    })) as ImportedTemplate[];
    const duplicate = seenRoutines.has(norm(p.name));
    seenRoutines.add(norm(p.name));
    out.routines.push({ item, routine, templates, duplicate });
  });

  const open = new Set(existingTasks.filter((t) => t.status !== 'done').map((t) => norm(t.title)));
  const inBatch = new Set<string>();
  const stamp = now.getTime();

  taskList.forEach((raw, i) => {
    const item = i + 1;
    const parsed = tSchema.safeParse(raw);
    if (!parsed.success) {
      out.errors.push({ item, title: titleOf(raw, 'title'), message: parsed.error.issues.map(describeIssue).join(' · ') });
      return;
    }
    const p = parsed.data;
    if (p.steps && p.subtasks) out.warnings.push({ item, title: p.title, message: 'tem "steps" e "subtasks"; usei os dois juntos' });
    const steps = [...(p.steps ?? []), ...(p.subtasks ?? [])];

    let tagId: number | undefined;
    if (p.tag) {
      const found = tags.find((t) => norm(t.name) === norm(p.tag!));
      if (found) tagId = found.id;
      else out.warnings.push({ item, title: p.title, message: `etiqueta "${p.tag}" não existe no app; entrou sem etiqueta` });
    }
    const task = {
      title: p.title,
      quadrant: p.quadrant ?? 'inbox',
      ...(p.description ? { description: p.description } : {}),
      ...(p.dueDate ? { dueDate: p.dueDate } : {}),
      pomodoroEstimate: p.pomodoroEstimate ?? 0,
      ...(p.customDuration ? { customDuration: p.customDuration } : {}),
      ...(p.energyNeeded ? { energyNeeded: p.energyNeeded } : {}),
      ...(p.timeOfDay ? { timeOfDay: p.timeOfDay } : {}),
      ...(tagId !== undefined ? { tagId } : {}),
      ...(steps.length
        ? {
            subtasks: steps.map((s, k) => ({
              id: `sub-${stamp}-${i}-${k}`,
              text: typeof s === 'string' ? s : s.text,
              completed: typeof s === 'string' ? false : !!s.done,
              ...(typeof s !== 'string' && s.minutes ? { minutes: s.minutes } : {}),
            })),
          }
        : {}),
    } as ImportedTask;
    const key = norm(p.title);
    const duplicate = open.has(key) || inBatch.has(key);
    inBatch.add(key);
    out.ready.push({ item, task, duplicate });
  });
  return out;
}

/** Exemplo mostrado no painel de desenvolvedor. */
export const IMPORT_EXAMPLE = `{
  "tasks": [
    { "title": "Responder o e-mail do cliente", "quadrant": "fazer", "dueDate": "hoje" },
    {
      "title": "Estudar capítulo 3",
      "quadrant": "agendar",
      "pomodoroEstimate": 2,
      "customDuration": 25,
      "energyNeeded": "alta"
    },
    {
      "title": "Limpar a cozinha",
      "steps": [
        "Separar a louça",
        { "text": "Lavar tudo", "minutes": 15 },
        { "text": "Passar pano no balcão", "minutes": 5 }
      ]
    }
  ]
}`;
