// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import Le from './FrogCard.module.css';
import * as React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import * as ReactDOM from 'react-dom';
import { Capacitor } from '@capacitor/core';
import { FROG_SPECIES, Kr, cd } from '../../data/frogs';
import { ev } from '../../widgets/widgetSync';
import { mr } from '../../hooks/useMascot';
import { US, nR } from '../../data/tips';
import { yn } from '../ui/Sheet';
import { Sw } from './ZenFrog';
import { Nc } from '../../context/ZenContext';
import { C_ro } from './FrogSprite';

const bG = {
  common: "Comum",
  rare: "Rara",
  epic: "Épica",
  legendary: "Lendária"
};

const kG = {
  agilidade: "Agilidade",
  camuflagem: "Camuflagem",
  charme: "Charme"
};

export const Nh = ({
  speciesId: e,
  frogId: t,
  onClose: n
}) => {
  var j, C;
  yn(n);
  const s = FROG_SPECIES[e],
    r = Nc(),
    [o, a] = mr(),
    [l, c] = React.useState(null),
    [u, d] = React.useState(false),
    [f, h] = React.useState("");
  if (!s) return null;
  const m = !!o && (t ? o.frogId === t : !o.frogId && o.speciesId === s.id),
    v = () => {
      h(m ? o.name : s.name.replace(/^Sapo\s+(da|do|de)?\s*/i, "")), d(true);
    },
    x = () => {
      const S = f.trim().slice(0, 16);
      S && (a({
        speciesId: s.id,
        name: S,
        frogId: t
      }), d(false));
    },
    k = Sw[s.id] || Sw.DEFAULT,
    y = s.rarity,
    p = t ? r.pondFrogs.find(S => S.id === t) || r.storageFrogs.find(S => S.id === t) : undefined,
    g = () => {
      p && (p.location === "pond" ? r.sendToStorage(p.id) : r.releaseToPond(p.id), n());
    },
    b = r.pondFrogs.filter(S => !S.merging).length >= r.maxPond;
  return ReactDOM.createPortal(<div className={Le.overlay} onClick={n}><div className={`${Le.card} ${Le[y]}`} onClick={S => S.stopPropagation()}><button className={Le.closeButton} onClick={n} aria-label="Fechar">✕</button><div className={Le.cardInner}><div className={Le.topRow}><h3 className={Le.name}>{s.name}{p && p.count > 1 && <span className={Le.countTag}>{" ×"}{p.count}</span>}</h3><span className={`${Le.badge} ${Le[y]}`}>{bG[y]}</span></div>{u ? <div className={Le.mascotForm}><input className={Le.mascotInput} value={f} maxLength={16} autoFocus placeholder="Nome do mascote" onChange={S => h(S.target.value)} onKeyDown={S => {
            S.key === "Enter" && x();
          }} /><button className={Le.mascotSave} onClick={x}>Salvar</button></div> : m ? <div className={Le.mascotRow}><button className={Le.mascotChip} onClick={v}>{"⭐ "}{o.name}{" · seu mascote ✎"}</button>{Capacitor.isNativePlatform() && <button className={Le.mascotLink} onClick={async () => {
            const {
              supported: S,
              reason: T
            } = await ev();
            c(S ? null : T === "launcher_unsupported" ? 'Segure um espaço vazio da tela inicial e procure "FocusFrog" em Widgets.' : "Não deu pra abrir o atalho do widget agora.");
          }}>📱 Pôr na tela inicial</button>}{l && <span className={Le.mascotHint}>{l}</span>}</div> : <button className={Le.mascotLink} onClick={v}>⭐ Escolher como mascote</button>}<div className={`${Le.frogStage} ${Le[y]}`}><div className={Le.portraitGlow} /><C_ro speciesId={s.id} stage="adult" size={110} clickable={false} />{y !== "common" && <div className={Le.shine} />}</div><p className={Le.flavor}>"{k.description}"</p><p className={Le.traitLine}>{(j = Kr.find(S => S.id === s.habitat)) == null ? undefined : j.emoji}{" "}{(C = Kr.find(S => S.id === s.habitat)) == null ? undefined : C.label}{" · "}<b>{cd[s.trait].label}</b>:{" "}{cd[s.trait].hint}</p>{(() => {
          const S = nR(t || s.id);
          return <div className={Le.tip}><span className={Le.tipKind}>{"🐸 "}{US[S.kind]}</span><span>{S.text}</span></div>;
        })()}<div className={Le.statsWrap}>{Object.entries(kG).map(([S, T]) => <div key={S} className={Le.statRow}><span className={Le.statLabel}>{T}</span><span className={Le.statTrack}><span className={Le.statFill} style={{
                width: `${s.stats[S] * 10}%`
              }} /></span></div>)}</div>{p && <div className={Le.actionsWrap}><button className={Le.actionBtn} onClick={g} disabled={p.location === "storage" && b}>{p.location === "pond" ? "🧺 Guardar no viveiro" : b ? `Lagoa cheia (${r.maxPond}/${r.maxPond})` : "🌊 Soltar na lagoa"}</button></div>}</div></div></div>, document.body);
};

export const SG = {
  duration: 0.62,
  times: [0, 0.05, 0.1, 0.17, 0.3, 0.42, 0.5, 0.58, 0.68, 0.74, 0.8, 0.88, 1],
  sx: [1, 1.08, 1.133, 1.16, 0.956, 1.027, 0.986, 0.939, 0.88, 1.032, 0.948, 0.99, 1.006],
  sy: [1, 0.9, 0.834, 0.8, 1.093, 0.975, 1.044, 1.122, 1.22, 0.963, 1.062, 1.012, 0.993],
  y: [0, 1.003, 1.661, 0, -16.714, -21.992, -20.097, -13.872, 0, 0, 0, 0, 0],
  shadowS: [1, 1, 1, 1, 0.734, 0.65, 0.68, 0.779, 1.15, 1.022, 1, 1, 1.004],
  shadowO: [0.9, 0.9, 0.9, 0.9, 0.52, 0.4, 0.443, 0.585, 0.9, 0.9, 0.9, 0.9, 0.9],
  pupil: [0, 0.662, 1.096, 1.32, 0.971, 0.039, -0.582, -1.204, -1.98, -0.221, 0.367, 0.07, -0.042],
  squint: [1, 1, 1, 1, 1, 1, 1, 1, 0.45, 0.921, 1, 1, 0.985],
  lbs: [1, 1, 1, 1, 1.354, 1.173, 1.278, 1.399, 1.55, 1, 1, 1, 1],
  lft: [1, 1, 1, 1, 0.788, 0.704, 0.753, 0.809, 0.88, 1, 1, 1, 1]
};

export const jG = {
  duration: 0.78,
  times: [0, 0.08, 0.18, 0.3, 0.42, 0.55, 0.62, 0.7, 0.8, 0.9, 1],
  sx: [1, 0.985, 0.967, 0.945, 0.924, 0.9, 1.062, 0.953, 0.975, 1.01, 1.006],
  sy: [1, 1.032, 1.072, 1.12, 1.168, 1.22, 0.927, 1.056, 1.03, 0.989, 0.993],
  y: [-64, -62.646, -57.145, -44.959, -26.679, 0, 0, 0, 0, 0, 0],
  shadowS: [0.65, 0.657, 0.687, 0.754, 0.854, 1.15, 1.042, 1, 1, 1.007, 1.004],
  shadowO: [0.4, 0.411, 0.454, 0.549, 0.692, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9],
  pupil: [1.98, 1.404, 0.684, -0.18, -1.044, -1.98, -0.432, 0.332, 0.178, -0.067, -0.042],
  squint: [1, 1, 1, 1, 1, 0.45, 0.846, 1, 1, 0.976, 0.985],
  lbs: [1.55, 1.438, 1.298, 1.2, 1.368, 1.55, 1, 1, 1, 1, 1],
  lft: [0.88, 0.828, 0.762, 0.716, 0.795, 0.88, 1, 1, 1, 1, 1]
};

export const ip = {
  duration: 0.56,
  scale: [1, 1.28, 0.9, 1.06, 1],
  times: [0, 0.3, 0.55, 0.78, 1]
};
