// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import * as React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import { AH, EH, Ew, IH, NH, RH, Sg, TH, Tw, Xn, Xs, ZEN_FROG_COLORS, fu } from '../components/zen/ZenFrog';

const bT = React.createContext(null);

export const Nc = () => {
  const e = React.useContext(bT);
  if (!e) throw new Error("useZenPond precisa estar dentro de <ZenPondProvider>");
  return e;
};

const kT = "focusfrog_zenState";

const ST = "focusfrog_zenPondFrogs";

const jT = "focusfrog_zenStorageFrogs";

const ap = (e, t) => {
  try {
    const n = localStorage.getItem(e);
    return n ? JSON.parse(n) : t;
  } catch {
    return t;
  }
};

const Nw = (e, t) => {
  const n = new Set(),
    s = a => !a || !a.id || a.merging || n.has(a.id) ? false : (n.add(a.id), true),
    r = e.filter(s).map(a => ({
      ...a,
      location: "pond"
    })),
    o = t.filter(s).map(a => ({
      ...a,
      location: "storage"
    }));
  return {
    pond: r,
    storage: o
  };
};

const DH = e => {
  const t = ap(kT, null);
  if (t && Array.isArray(t.pond) && Array.isArray(t.storage)) return {
    ...Nw(t.pond, t.storage),
    ingested: Array.isArray(t.ingested) ? t.ingested : []
  };
  const n = Nw(ap(ST, []), ap(jT, [])),
    s = n.pond.length + n.storage.length > 0;
  return {
    ...n,
    ingested: s ? e.map(r => r.id) : []
  };
};

export const C_SH = ({
  collectedFrogs: e,
  children: t
}) => {
  const [n, s] = React.useState(() => DH(e)),
    [r, o] = React.useState([]),
    [a, l] = React.useState([]),
    c = React.useCallback(k => {
      if (!k.length) return;
      o(g => [...g, ...k]);
      const y = new Set(k.map(g => g.id)),
        p = Math.max(...k.map(g => g.delayMs || 0)) + 1900;
      setTimeout(() => o(g => g.filter(b => !y.has(b.id))), p);
    }, []),
    u = React.useRef(n);
  u.current = n;
  const d = React.useRef(false),
    f = React.useCallback(k => {
      d.current = k;
    }, []),
    h = React.useCallback((k, y) => {
      s(p => {
        const g = p.pond.find(j => j.id === k),
          b = p.pond.find(j => j.id === y);
        return !g || !b || g.speciesId !== b.speciesId ? p : {
          ...p,
          pond: p.pond.filter(j => j.id !== y).map(j => j.id === k ? {
            ...j,
            count: g.count + b.count,
            scale: Math.min(g.scale * 1.1, 2),
            pulseAt: Date.now()
          } : j)
        };
      });
    }, []);
  React.useEffect(() => {
    try {
      localStorage.setItem(kT, JSON.stringify(n)), localStorage.removeItem(ST), localStorage.removeItem(jT);
    } catch {}
  }, [n]), React.useEffect(() => {
    s(k => {
      const y = new Set(k.ingested),
        p = e.filter(b => !y.has(b.id));
      if (p.length === 0) return k;
      const g = Math.max(0, fu - k.pond.filter(b => !b.merging).length);
      return {
        pond: [...k.pond, ...p.slice(0, g).map(b => Ew(b, "pond"))],
        storage: [...k.storage, ...p.slice(g).map(b => Ew(b, "storage"))],
        ingested: [...k.ingested, ...p.map(b => b.id)]
      };
    });
  }, [e]), React.useEffect(() => {
    const k = setInterval(() => {
      if (d.current) return;
      const y = u.current,
        p = Date.now(),
        g = y.pond.filter(O => !O.merging).map(O => ({
          ...O
        })),
        b = [],
        j = g.map(O => {
          if (p < O.moveAt) return O;
          const V = ZEN_FROG_COLORS[O.speciesId] || ZEN_FROG_COLORS.DEFAULT,
            U = RH(O, g, V.jumpDistance, Xs);
          return g.some(K => K.id !== O.id && K.speciesId !== O.speciesId && Sg(U, K) < NH) ? {
            ...O,
            moveAt: p + Xn(2e3, 4e3)
          } : (b.push({
            id: p + Math.random(),
            top: `${U.top}%`,
            left: `${U.left}%`,
            delayMs: TH
          }), {
            ...O,
            ...U,
            moveAt: p + Xn(V.moveInterval.min, V.moveInterval.max)
          });
        }),
        C = new Set(),
        S = [];
      for (let O = 0; O < j.length; O++) for (let V = O + 1; V < j.length; V++) {
        const U = j[O],
          E = j[V];
        if (!(C.has(U.id) || C.has(E.id)) && !(Sg(U, E) >= AH)) if (U.speciesId === E.speciesId) {
          const K = U.count + E.count;
          j[O] = {
            ...U,
            scale: Math.min(U.scale * 1.1, 2),
            count: K,
            pulseAt: p
          }, j[V] = {
            ...E,
            merging: true,
            left: U.left,
            top: U.top,
            scale: 0.15
          }, C.add(E.id), S.push({
            id: p + Math.random(),
            top: U.top,
            left: U.left,
            text: `×${K}`
          }), b.push({
            id: p + Math.random(),
            top: `${U.top}%`,
            left: `${U.left}%`,
            gold: true,
            delayMs: 560
          });
        } else {
          const K = U.scale > E.scale;
          j[O] = {
            ...U,
            scale: K ? Math.min(U.scale * 1.02, 2) : Math.max(U.scale * 0.98, Tw)
          }, j[V] = {
            ...E,
            scale: K ? Math.max(E.scale * 0.98, Tw) : Math.min(E.scale * 1.02, 2)
          };
        }
      }
      const T = j;
      let P = false;
      s(O => O !== y ? O : (P = true, {
        ...O,
        pond: T
      })), P && (c(b), S.length && setTimeout(() => {
        l(V => [...V, ...S]);
        const O = new Set(S.map(V => V.id));
        setTimeout(() => l(V => V.filter(U => !O.has(U.id))), 1e3);
      }, 560));
    }, IH);
    return () => clearInterval(k);
  }, [c]);
  const m = React.useCallback(k => {
      s(y => {
        const p = y.pond.find(g => g.id === k && !g.merging);
        return p ? {
          ...y,
          pond: y.pond.filter(g => g.id !== k),
          storage: [...y.storage, {
            ...p,
            location: "storage"
          }]
        } : y;
      });
    }, []),
    v = React.useCallback(k => {
      const y = u.current;
      return y.storage.some(g => g.id === k) && y.pond.filter(g => !g.merging).length < fu ? (s(g => {
        const b = g.storage.find(C => C.id === k);
        if (!b || g.pond.filter(C => !C.merging).length >= fu) return g;
        const j = {
          left: Xn(Xs.left, Xs.right),
          top: Xn(Xs.top, Xs.bottom)
        };
        return {
          ...g,
          storage: g.storage.filter(C => C.id !== k),
          pond: [...g.pond, {
            ...b,
            ...j,
            location: "pond",
            enteredAt: Date.now(),
            moveAt: Date.now() + Xn(2500, 6e3)
          }]
        };
      }), true) : false;
    }, []),
    x = React.useRef(new Set());
  return React.useEffect(() => {
    const k = Date.now(),
      y = n.pond.filter(p => p.enteredAt && k - p.enteredAt < 1500 && !x.current.has(p.id + p.enteredAt));
    y.length && (y.forEach(p => x.current.add(p.id + p.enteredAt)), c(y.map(p => ({
      id: k + Math.random(),
      top: `${p.top}%`,
      left: `${p.left}%`,
      delayMs: EH
    }))));
  }, [n.pond, c]), <bT.Provider value={{
    pondFrogs: n.pond,
    storageFrogs: n.storage,
    ripples: r,
    effects: a,
    maxPond: fu,
    sendToStorage: m,
    releaseToPond: v,
    mergeFrogs: h,
    setEngineDriven: f
  }}>{t}</bT.Provider>;
};
