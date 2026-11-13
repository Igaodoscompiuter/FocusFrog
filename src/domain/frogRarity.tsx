// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import { FROG_SPECIES, Kr } from '../data/frogs';
import { G_, HI, J_, VI, WI, fS, qI, ra } from '../utils/effects';

function GI(e) {
  const t = fS(e),
    n = {
      ...VI
    };
  return ["rare", "epic", "legendary"].forEach(s => {
    n[s] += G_[s] * t, n.common -= G_[s] * t;
  }), n;
}

export function KI({
  minutes: e,
  hour: t,
  discovered: n,
  pity: s,
  rand: r = Math.random
}) {
  const o = fS(e),
    a = GI(e);
  let l = "common",
    c = r();
  for (const p of ["legendary", "epic", "rare", "common"]) {
    if (c < a[p]) {
      l = p;
      break;
    }
    c -= a[p];
  }
  let u = false;
  const d = [["legendary", s.sinceLegendary], ["epic", s.sinceEpic], ["rare", s.sinceRare]];
  for (const [p, g] of d) if (g + 1 >= (qI[p] ?? 1 / 0) && ra(l) > ra(p)) {
    l = p, u = true;
    break;
  }
  const f = HI(t),
    h = Object.values(FROG_SPECIES).filter(p => p.rarity === l),
    m = p => {
      const g = Kr.find(b => b.id === p);
      return g != null && g.night ? f ? 2 : 0.5 : 1;
    },
    v = p => {
      const g = p.reduce((j, C) => j + m(C.habitat), 0);
      let b = r() * g;
      for (const j of p) if (b -= m(j.habitat), b < 0) return j;
      return p[p.length - 1];
    };
  let x = v(h);
  if (n.has(x.id)) {
    const p = h.filter(g => !n.has(g.id));
    p.length && r() < WI && (x = v(p));
  }
  const k = ra(l),
    y = {
      sinceRare: k <= ra("rare") ? 0 : s.sinceRare + 1,
      sinceEpic: k <= ra("epic") ? 0 : s.sinceEpic + 1,
      sinceLegendary: k <= ra("legendary") ? 0 : s.sinceLegendary + 1
    };
  return {
    speciesId: x.id,
    rarity: l,
    pity: y,
    guaranteed: u,
    luck: o
  };
}

const pS = "focusfrog_frogPity";

export const JI = () => {
  try {
    return {
      ...J_,
      ...JSON.parse(localStorage.getItem(pS) || "{}")
    };
  } catch {
    return {
      ...J_
    };
  }
};

export const YI = e => {
  try {
    localStorage.setItem(pS, JSON.stringify(e));
  } catch {}
};

export const Ki = 10;

export const ZI = 150;

export const md = 40;

export const xf = [0, 5, 10, 15, 25];

const QI = 25;

export const zs = e => e.subtasks || [];

export const $n = e => zs(e).length > 0;

export const wm = e => (e.pomodoroEstimate ?? 0) > 0;

export const Ur = e => e.customDuration || QI;

export const sr = e => Math.max(1, e.pomodoroEstimate || 1);

export const XI = e => Math.max(1, sr(e) - (e.pomodorosDone || 0));

export const vc = 5;

export const gd = 15;

export const bm = 4;

export const mS = e => e % bm === 0 ? gd : vc;

export const eO = (e, t) => Math.max(0, Math.floor((e + 0.01) / Math.max(1, t)));

export const tO = (e, t, n) => `${e} ${e === 1 ? t : n}`;
