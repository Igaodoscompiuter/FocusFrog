// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import { Wy } from '../domain/routinesLegacy';

export const Yt = () => Wy(new Date());

export const Hy = e => {
  const t = new Date();
  return t.setDate(t.getDate() + e), Wy(t);
};

const MI = e => {
  const [t, n, s] = e.split("-").map(Number),
    r = new Date(t, n - 1, s).getTime(),
    o = new Date(),
    a = new Date(o.getFullYear(), o.getMonth(), o.getDate()).getTime();
  return Math.round((a - r) / 864e5);
};

export const hl = e => {
  if (!e) return null;
  const t = MI(e);
  return t <= 0 ? null : t === 1 ? "de ontem" : `há ${t} dias`;
};
