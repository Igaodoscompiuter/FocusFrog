// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import { todayISO } from "../utils/dates";

const NS = "focusfrog_focusToday";

export const Tm = "focusfrog:focus-today";

export function Em() {
  const e = todayISO();
  try {
    const t = JSON.parse(localStorage.getItem(NS) || "null");
    if (t && t.date === e)
      return {
        date: e,
        sessions: t.sessions | 0,
        minutes: Math.round(t.minutes || 0),
      };
  } catch {}
  return {
    date: e,
    sessions: 0,
    minutes: 0,
  };
}

export function r1(e) {
  if (!(e > 0)) return;
  const t = Em(),
    n = {
      date: t.date,
      sessions: t.sessions + 1,
      minutes: t.minutes + Math.round(e),
    };
  try {
    localStorage.setItem(NS, JSON.stringify(n));
  } catch {}
  window.dispatchEvent(new Event(Tm));
}
