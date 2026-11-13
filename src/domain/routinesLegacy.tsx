// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).


export function fd(e) {
  if (e.estMinutes) return e.estMinutes;
  const t = (e.subtasks || []).reduce((n, s) => n + (s.minutes || 0), 0);
  return t || (e.pomodoroEstimate ? (e.customDuration || 25) * e.pomodoroEstimate : 0);
}

export const uh = (e, t) => (e.taskTemplateIds || []).map(n => t.find(s => s.id === n)).filter(n => !!n);

export const qy = (e, t) => uh(e, t).reduce((n, s) => n + fd(s), 0);

export function ni(e) {
  if (!e) return "";
  if (e < 60) return `~${e} min`;
  const t = Math.floor(e / 60),
    n = e % 60;
  return `~${t}h${n ? ` ${n}` : ""}`;
}

export const lS = (e, t) => !e.days || e.days.length === 0 || e.days.length === 7 || e.days.includes(t);

const DI = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

export function xm(e) {
  const t = [...new Set(e || [])].sort();
  if (t.length === 0 || t.length === 7) return "todo dia";
  if (t.join() === "1,2,3,4,5") return "seg a sex";
  if (t.join() === "0,6") return "fim de semana";
  const n = t.map(s => DI[s]);
  return n.length === 1 ? n[0] : `${n.slice(0, -1).join(", ")} e ${n[n.length - 1]}`;
}

function $I(e) {
  return e.flatMap(t => t.subtasks && t.subtasks.length ? t.subtasks.map(n => ({
    text: n.text,
    minutes: n.minutes
  })) : [{
    text: t.title
  }]);
}

export function FI(e, t, n, s = Date.now()) {
  return {
    title: e.name,
    description: e.description,
    quadrant: "do",
    pomodoroEstimate: 0,
    dueDate: n,
    routineId: e.id,
    subtasks: $I(t).map((r, o) => ({
      id: `sub-${s}-${o}`,
      text: r.text,
      completed: false,
      ...(r.minutes ? {
        minutes: r.minutes
      } : {})
    }))
  };
}

export const Oi = e => e.pickSome ? "pick" : e.asOneTask ? "one" : "separate";

const W_ = e => String(e).padStart(2, "0");

export const Wy = e => `${e.getFullYear()}-${W_(e.getMonth() + 1)}-${W_(e.getDate())}`;
