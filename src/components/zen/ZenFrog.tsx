// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import Nt from "./ZenFrog.module.css";
import { FROG_SPECIES, cd } from "../../data/frogs";

export { Nt };

export const Sw = {
  ...Object.fromEntries(
    Object.values(FROG_SPECIES).map((e) => [
      e.id,
      {
        title: `Personalidade: ${cd[e.trait].label}`,
        description: e.lore,
      },
    ])
  ),
  DEFAULT: {
    title: "Personalidade: Amigável",
    description:
      "Um sapo amigável e curioso. Nem muito rápido, nem muito lento, aproveita o dia no próprio ritmo.",
  },
};

const jw = {
  equilibrado: {
    moveInterval: {
      min: 1e4,
      max: 2e4,
    },
    jumpDistance: {
      min: 20,
      max: 40,
    },
  },
  agitado: {
    moveInterval: {
      min: 3e3,
      max: 7e3,
    },
    jumpDistance: {
      min: 5,
      max: 15,
    },
  },
  explorador: {
    moveInterval: {
      min: 6e3,
      max: 12e3,
    },
    jumpDistance: {
      min: 50,
      max: 80,
    },
  },
  timido: {
    moveInterval: {
      min: 15e3,
      max: 25e3,
    },
    jumpDistance: {
      min: 2,
      max: 8,
    },
  },
  zen: {
    moveInterval: {
      min: 6e4,
      max: 12e4,
    },
    jumpDistance: {
      min: 10,
      max: 20,
    },
  },
  cosmico: {
    moveInterval: {
      min: 3e4,
      max: 5e4,
    },
    jumpDistance: {
      min: 70,
      max: 90,
    },
  },
  dorminhoco: {
    moveInterval: {
      min: 4e4,
      max: 8e4,
    },
    jumpDistance: {
      min: 5,
      max: 15,
    },
  },
  nadador: {
    moveInterval: {
      min: 8e3,
      max: 14e3,
    },
    jumpDistance: {
      min: 40,
      max: 70,
    },
  },
  cantor: {
    moveInterval: {
      min: 12e3,
      max: 22e3,
    },
    jumpDistance: {
      min: 15,
      max: 30,
    },
  },
  cacador: {
    moveInterval: {
      min: 5e3,
      max: 1e4,
    },
    jumpDistance: {
      min: 25,
      max: 45,
    },
  },
};

export const ZEN_FROG_COLORS = {
  ...Object.fromEntries(
    Object.values(FROG_SPECIES).map((e) => [e.id, jw[e.trait]])
  ),
  DEFAULT: jw.equilibrado,
};

export const TH = Math.round(0.68 * 620);

export const EH = Math.round(0.55 * 780);

export const Xs = {
  top: 15,
  left: 15,
  right: 85,
  bottom: 85,
};

export const NH = 7;

export const AH = 8;

export const fu = 8;

const PH = 0.7;

export const Tw = 0.7;

export const IH = 2e3;

export const Xn = (e, t) => Math.random() * (t - e) + e;

export const Sg = (e, t) => Math.hypot(e.left - t.left, e.top - t.top);

const OH = (e, t, n) => {
  const s = Xn(0, 2 * Math.PI),
    r = Xn(t.min, t.max) / 5;
  return {
    left: Math.max(n.left, Math.min(e.left + Math.cos(s) * r, n.right)),
    top: Math.max(n.top, Math.min(e.top + Math.sin(s) * r, n.bottom)),
  };
};

export const RH = (e, t, n, s) => {
  if (Math.random() < PH) {
    let r = null,
      o = 1 / 0;
    for (const a of t) {
      if (a.id === e.id || a.merging || a.speciesId !== e.speciesId) continue;
      const l = Sg(e, a);
      l < o && ((o = l), (r = a));
    }
    if (r) {
      const a = Math.atan2(r.top - e.top, r.left - e.left) + Xn(-0.35, 0.35),
        l = Math.min(Xn(n.min, n.max) / 5, Math.max(o - 1, 0.5));
      return {
        left: Math.max(s.left, Math.min(e.left + Math.cos(a) * l, s.right)),
        top: Math.max(s.top, Math.min(e.top + Math.sin(a) * l, s.bottom)),
      };
    }
  }
  return OH(e, n, s);
};

export const Ew = (e, t = "storage") => ({
  ...e,
  top: Xn(Xs.top, Xs.bottom),
  left: Xn(Xs.left, Xs.right),
  scale: 0.5,
  moveAt: Date.now() + Xn(5e3, 1e4),
  location: t,
  count: 1,
  enteredAt: t === "pond" ? Date.now() : undefined,
});
