import { describe, expect, it } from 'vitest';
import { parseImport } from './taskImport';

const now = new Date(2026, 10, 12);
const run = (j: unknown, tasks: { title: string; status: 'todo' | 'done' }[] = []) =>
  parseImport(typeof j === 'string' ? j : JSON.stringify(j), tasks, [{ id: 1, name: 'Casa' }], [], now);

describe('importação de JSON', () => {
  it('rejeita JSON quebrado e formato errado', () => {
    expect(run('{').fatal).toMatch(/JSON inválido/);
    expect(run({ foo: 1 }).fatal).toMatch(/Formato esperado/);
    expect(run([]).fatal).toBe('A lista está vazia.');
  });
  it('lê lista simples com apelidos em português', () => {
    const r = run([{ title: ' Pagar conta ', quadrant: 'Fazer', dueDate: 'amanhã', energyNeeded: 'alta', tag: 'casa' }]);
    expect(r.errors).toEqual([]);
    expect(r.ready[0].task).toMatchObject({ title: 'Pagar conta', quadrant: 'do', dueDate: '2026-11-13', energyNeeded: 'high', tagId: 1 });
  });
  it('quadrante padrão é despejo (inbox)', () => {
    expect(run([{ title: 'x' }]).ready[0].task.quadrant).toBe('inbox');
  });
  it('passos com minutos e done', () => {
    const t = run([{ title: 'Faxina', steps: ['a', { text: 'b', minutes: 5, done: true }] }]).ready[0].task;
    expect(t.subtasks).toHaveLength(2);
    expect(t.subtasks![1]).toMatchObject({ text: 'b', minutes: 5, completed: true });
  });
  it('erros por item não derrubam os outros', () => {
    const r = run([{ title: '' }, { title: 'ok', estMinutes: 3 }, { title: 'ok2' }]);
    expect(r.ready).toHaveLength(1);
    expect(r.errors.map((e) => e.item)).toEqual([1, 2]);
  });
  it('avisa etiqueta inexistente e marca duplicadas', () => {
    const r = run([{ title: 'A', tag: 'nada' }, { title: 'a' }, { title: 'B' }], [{ title: 'b', status: 'todo' }]);
    expect(r.warnings).toHaveLength(1);
    expect(r.ready.map((x) => x.duplicate)).toEqual([false, true, true]);
  });
  it('importa rotina com modo, dias e horário', () => {
    const r = run({ routines: [{ name: 'Noite', days: ['seg', 'qua'], time: '21:30', mode: 'uma', tasks: [{ title: 'Escovar', estMinutes: 3 }] }] });
    expect(r.errors).toEqual([]);
    expect(r.routines[0].routine).toMatchObject({ name: 'Noite', days: [1, 3], scheduledTime: '21:30', asOneTask: true });
    expect(r.routines[0].templates[0]).toMatchObject({ estMinutes: 3, category: 'Noite' });
  });
  it('rotina sem tarefas é erro', () => {
    expect(run({ routines: [{ name: 'X', tasks: [] }] }).errors[0].message).toMatch(/rotina sem tarefas|abaixo do mínimo/);
  });
});
