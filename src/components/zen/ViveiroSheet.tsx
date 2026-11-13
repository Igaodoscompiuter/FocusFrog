// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import Re from './ViveiroSheet.module.css';
import * as React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import { FROG_SPECIES, Kr, ld, q2 } from '../../data/frogs';
import { yn } from '../ui/Sheet';
import { Nc } from '../../context/ZenContext';
import { Nh } from './FrogCard';
import { C_ro } from './FrogSprite';

const LT = Object.fromEntries(Object.entries(ld).map(([e, t]) => [e, t.label]));

const BT = Object.fromEntries(Object.entries(ld).map(([e, t]) => [e, t.color]));

const nb = e => {
  const t = new Map();
  return e.forEach(n => {
    FROG_SPECIES[n.speciesId] && t.set(n.speciesId, [...(t.get(n.speciesId) || []), n]);
  }), [...t.entries()].map(([n, s]) => ({
    speciesId: n,
    frogs: s.sort((r, o) => o.count - r.count)
  })).sort((n, s) => q2(FROG_SPECIES[n.speciesId], FROG_SPECIES[s.speciesId]));
};

export const XZ = ({
  onClose: e
}) => {
  var y;
  yn(e);
  const {
      pondFrogs: t,
      storageFrogs: n,
      maxPond: s,
      sendToStorage: r,
      releaseToPond: o
    } = Nc(),
    [a, l] = React.useState(null),
    c = t.filter(p => !p.merging),
    u = c.length >= s,
    d = React.useMemo(() => {
      const p = {};
      return n.forEach(g => {
        var j;
        const b = (j = FROG_SPECIES[g.speciesId]) == null ? undefined : j.habitat;
        b && (p[b] = p[b] || []).push(g);
      }), p;
    }, [n]),
    f = (y = Kr.find(p => {
      var g;
      return (g = d[p.id]) == null ? undefined : g.length;
    })) == null ? undefined : y.id,
    [h, m] = React.useState(f || "lagoa"),
    v = nb(h === "lagoa" ? c : d[h] || []),
    x = [{
      id: "lagoa",
      label: "Lagoa",
      emoji: "🌊",
      n: c.length
    }, ...Kr.map(p => {
      var g;
      return {
        id: p.id,
        label: p.label,
        emoji: p.emoji,
        n: ((g = d[p.id]) == null ? undefined : g.length) || 0
      };
    })],
    k = x.find(p => p.id === h);
  return <div className={Re.backdrop} onClick={p => {
    p.target === p.currentTarget && e();
  }}><div className={Re.sheet}><div className={Re.header}><div><div className={Re.title}>🧺 Viveiro</div><div className={Re.subtitle}>{"Lagoa "}{c.length}/{s}{" · "}{n.length}{" guardado"}{n.length === 1 ? "" : "s"}</div></div><button className={Re.closeBtn} onClick={e}>Fechar</button></div><div className={Re.boxTabs} role="tablist">{x.map(p => <button key={p.id} role="tab" aria-selected={h === p.id} className={`${Re.boxTab} ${h === p.id ? Re.boxTabOn : ""}`} onClick={() => m(p.id)}><span>{p.emoji}</span>{p.label}<b>{p.n}</b></button>)}</div><div className={Re.boxFrame} data-box={h}><div className={Re.boxTitle}>{k.emoji}{" "}{h === "lagoa" ? `Na lagoa agora · ${c.length}/${s}` : `Caixa ${k.label} · ${k.n} sapo${k.n === 1 ? "" : "s"}`}</div>{v.length === 0 ? <p className={Re.empty}>{h === "lagoa" ? "A lagoa está vazia. Solte um sapo de uma caixa." : "Nenhum sapo guardado aqui. Os sapos deste habitat aparecem quando você guarda um da lagoa."}</p> : <div className={Re.grid}>{v.map(({
            speciesId: p,
            frogs: g
          }) => {
            const b = FROG_SPECIES[p],
              j = g[0],
              C = h === "lagoa";
            return <div key={p} className={`${Re.mini} ${Re[b.rarity]}`} onClick={() => l(j)}>{g.length > 1 && <span className={Re.stackBadge}>×{g.length}</span>}<div className={Re.miniPic}><C_ro speciesId={b.id} stage="adult" size={46} clickable={false} /></div><div className={Re.miniName}>{b.name}</div><div className={Re.miniTag} style={{
                color: BT[b.rarity]
              }}>{LT[b.rarity]}</div><button className={Re.miniBtn} disabled={!C && u} onClick={S => {
                S.stopPropagation(), C ? r(j.id) : o(j.id);
              }}>{C ? "Guardar" : u ? "Lagoa cheia" : "Soltar"}</button></div>;
          })}</div>}</div></div>{a && <Nh speciesId={a.speciesId} frogId={a.id} onClose={() => l(null)} />}</div>;
};

const eQ = {
  primary: "#0b1512",
  secondary: "#101c18",
  accent: "#0b1512"
};

export const C_tQ = ({
  collectedFrogs: e,
  onClose: t
}) => {
  yn(t);
  const [n, s] = React.useState(null),
    r = new Set(e.map(u => u.speciesId)),
    o = {};
  e.forEach(u => {
    o[u.speciesId] = (o[u.speciesId] || 0) + 1;
  });
  const a = Object.values(FROG_SPECIES).sort(q2),
    l = a.filter(u => r.has(u.id)).length,
    c = a.length > 0 ? l / a.length * 100 : 0;
  return <div className={Re.backdrop} onClick={u => {
    u.target === u.currentTarget && t();
  }}><div className={Re.sheet}><div className={Re.header}><div><div className={Re.title}>📖 Álbum</div><div className={Re.subtitle}>{l}/{a.length}{" espécies descobertas"}</div></div><button className={Re.closeBtn} onClick={t}>Fechar</button></div><div className={Re.albumBar}><span style={{
          width: `${c}%`
        }} /></div>{Kr.map(u => {
        const d = a.filter(h => h.habitat === u.id),
          f = d.filter(h => r.has(h.id)).length;
        return <div key={u.id}><div className={Re.habitatHead}>{u.emoji}{" "}{u.label}<span>{f}/{d.length}</span></div><div className={Re.grid}>{d.map(h => {
              const m = r.has(h.id);
              return <div key={h.id} className={`${Re.mini} ${m ? Re[h.rarity] : Re.locked}`} onClick={() => m && s(h.id)}><div className={Re.miniPic}><C_ro speciesId={h.id} stage="adult" size={46} clickable={false} forceColors={m ? undefined : eQ} /></div><div className={Re.miniName}>{m ? h.name : "???"}</div><div className={Re.miniTag} style={{
                  color: BT[h.rarity]
                }}>{LT[h.rarity]}{m && o[h.id] > 1 ? ` · ×${o[h.id]}` : ""}</div></div>;
            })}</div></div>;
      })}</div>{n && <Nh speciesId={n} onClose={() => s(null)} />}</div>;
};
