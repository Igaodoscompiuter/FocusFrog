/**
 * Datas no horário LOCAL do aparelho. Antes, partes do app usavam
 * toISOString() (horário universal) e outras o local: depois das 21h no
 * Brasil elas discordavam sobre que dia era "hoje".
 */
const pad = (n: number) => String(n).padStart(2, '0');

export const toISODate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayISO = () => toISODate(new Date());
export const addDaysISO = (days: number) => { const d = new Date(); d.setDate(d.getDate() + days); return toISODate(d); };

/** Dias inteiros de `iso` até hoje (positivo = no passado). */
export const daysAgo = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  const then = new Date(y, m - 1, d).getTime();
  const n = new Date(); const today = new Date(n.getFullYear(), n.getMonth(), n.getDate()).getTime();
  return Math.round((today - then) / 86400000);
};

/** Etiqueta discreta pra tarefa que veio de um dia anterior (sem "ATRASADA"). */
export const carriedLabel = (iso?: string) => {
  if (!iso) return null;
  const n = daysAgo(iso);
  if (n <= 0) return null;
  return n === 1 ? 'de ontem' : `há ${n} dias`;
};
