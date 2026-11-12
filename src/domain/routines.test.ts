import { describe, expect, it } from 'vitest';
import { initialRoutines } from '../data/routines';
import { initialTaskTemplates } from '../data/taskTemplates';
import {
  describeDays, formatMinutes, routineAsTask, routineMinutes, routineMode,
  routineProgress, routineRunsOn, routineTemplates, shortVersion, templateMinutes,
} from './routines';

const morning = initialRoutines.find((r) => r.id === 'routine-morning')!;

describe('rotinas', () => {
  it('formata minutos', () => {
    expect(formatMinutes(0)).toBe('');
    expect(formatMinutes(15)).toBe('~15 min');
    expect(formatMinutes(90)).toBe('~1h 30');
    expect(formatMinutes(120)).toBe('~2h');
  });
  it('descreve dias', () => {
    expect(describeDays(undefined)).toBe('todo dia');
    expect(describeDays([1, 2, 3, 4, 5])).toBe('seg a sex');
    expect(describeDays([0, 6])).toBe('fim de semana');
    expect(describeDays([6])).toBe('sáb');
    expect(describeDays([2, 4, 6])).toBe('ter, qui e sáb');
  });
  it('respeita os dias', () => {
    expect(routineRunsOn({}, 3)).toBe(true);
    expect(routineRunsOn({ days: [6] }, 6)).toBe(true);
    expect(routineRunsOn({ days: [6] }, 2)).toBe(false);
  });
  it('modo da rotina', () => {
    expect(routineMode({ pickSome: true })).toBe('pick');
    expect(routineMode({ asOneTask: true })).toBe('one');
    expect(routineMode({})).toBe('separate');
  });
  it('estima minutos', () => {
    expect(templateMinutes({ estMinutes: 7 } as never)).toBe(7);
    expect(routineMinutes(morning, initialTaskTemplates)).toBeGreaterThan(0);
  });
  it('todas as rotinas apontam para modelos existentes', () => {
    for (const r of initialRoutines)
      expect(routineTemplates(r, initialTaskTemplates)).toHaveLength(r.taskTemplateIds.length);
  });
  it('vira uma tarefa com passos e acompanha progresso', () => {
    const t = routineAsTask(morning, routineTemplates(morning, initialTaskTemplates), '2026-11-12', 1);
    expect(t.title).toBe(morning.name);
    expect(t.routineId).toBe(morning.id);
    expect(t.subtasks!.length).toBeGreaterThan(0);
    t.subtasks![0].completed = true;
    const p = routineProgress(t);
    expect(p.done).toBe(1);
    expect(p.nextIndex).toBe(1);
  });
  it('versão curta', () => {
    expect(shortVersion([{}, {}, {}])).toHaveLength(2);
    expect(shortVersion([{ essential: true }, {}])).toHaveLength(1);
  });
});
