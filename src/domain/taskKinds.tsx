// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import { $n, Ki, Ur, XI, ZI, sr, tO, vc, wm, zs } from './frogRarity';

export const gS = e => tO(e, "foco", "focos");

export function kn(e) {
  return $n(e) ? zs(e).some(t => (t.minutes || 0) > 0) ? "trilha" : wm(e) ? "bloco" : "checklist" : wm(e) ? "foco" : "rapida";
}

const Ky = e => zs(e).reduce((t, n) => t + (n.minutes || 0), 0);

export const ts = e => {
  const t = kn(e);
  return t === "foco" || t === "bloco" || t === "trilha";
};

export const pa = e => !$n(e) || zs(e).every(t => t.completed);

export const Jy = e => ({
  done: zs(e).filter(t => t.completed).length,
  total: zs(e).length
});

export const km = e => $n(e) ? "openSteps" : "complete";

export const si = (e, t = []) => zs(e).find(n => !n.completed && !t.includes(n.id));

export function Sm(e) {
  const t = kn(e),
    n = Jy(e);
  switch (t) {
    case "rapida":
      return "Rápida";
    case "foco":
      return `Foco · ${Ur(e)} min${sr(e) > 1 ? ` · ${Math.min(e.pomodorosDone || 0, sr(e))}/${sr(e)}` : ""}`;
    case "checklist":
      return `Checklist · ${n.done}/${n.total}`;
    case "bloco":
      return `Bloco · ${Ur(e)} min · ${n.done}/${n.total}`;
    case "trilha":
      return `Trilha · ${Ky(e)} min · ${n.done}/${n.total}`;
  }
}

export function yS(e) {
  const t = kn(e),
    n = si(e),
    s = e.pomodorosDone || 0;
  return t === "foco" ? s ? `${gS(s)} ${s === 1 ? "feito" : "feitos"}${sr(e) > 1 ? ` de ${sr(e)}` : ""}` : "" : t === "trilha" && n ? `Próximo: ${n.text}${n.minutes ? ` · ${n.minutes} min` : " · rápido"}` : t === "bloco" && n ? `Falta: ${n.text}` : "";
}

export function nO(e) {
  switch (kn(e)) {
    case "rapida":
      return "É só marcar quando fizer.";
    case "foco":
      return sr(e) > 1 ? `${sr(e)} focos de ${Ur(e)} min com pausa de ${vc} min entre eles. No fim, você diz se terminou.` : `Um foco de ${Ur(e)} min. No fim, você diz se terminou.`;
    case "checklist":
      return "Sem timer. Marque os passos; o último conclui a tarefa.";
    case "bloco":
      return `Um timer de ${Ur(e)} min com os passos na tela. Você marca durante o foco.`;
    case "trilha":
      return `Cada passo com tempo vira um foco; os rápidos são paradas no caminho. Total: ${Ky(e)} min.`;
  }
}

export function dh(e) {
  if (kn(e) === "trilha") {
    const n = si(e);
    return n && n.minutes ? `Próximo: ${n.text} · ${n.minutes} min` : `Começar a trilha · ${Ky(e)} min`;
  }
  return `Focar · ${Ur(e)} min`;
}

export function sO(e, t) {
  const n = kn(e);
  if (n === "trilha") {
    const s = si(e);
    return !s || !s.minutes ? null : {
      minutes: s.minutes,
      cycles: 1,
      stepId: s.id,
      stepLabel: s.text
    };
  }
  return n === "foco" || n === "bloco" ? {
    minutes: Ur(e),
    cycles: n === "foco" ? XI(e) : sr(e)
  } : null;
}

export const rO = (e, t) => !ts(e) || e.lastFocusDate === t;

export function oO(e, t = 0) {
  return e < Ki ? 0 : Math.max(0, Math.min(Math.floor(e), ZI - t));
}

export const aO = (e, t) => ({
  ...e,
  subtasks: zs(e).map(n => n.id === t ? {
    ...n,
    completed: !n.completed
  } : n)
});

export const wf = (e, t) => ({
  ...e,
  subtasks: zs(e).map(n => t.includes(n.id) ? {
    ...n,
    completed: true
  } : n)
});

export function iO(e) {
  let t = false;
  const n = e.map(s => s.status === "done" && $n(s) && !pa(s) ? (t = true, {
    ...s,
    subtasks: zs(s).map(r => ({
      ...r,
      completed: true
    }))
  }) : s);
  return t ? n : e;
}
