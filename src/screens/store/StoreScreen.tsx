// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import se from './StoreScreen.module.css';
import * as React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import { Capacitor } from '@capacitor/core';
import { useUI } from '../../context/UIContext';
import { $_ } from '../../analytics';
import { Va, nu, useTheme } from '../../context/ThemeContext';
import { LI, fl } from '../../data/ambientSounds';
import { uS } from '../../utils/audio';
import { BI, Ua, hS, pd } from '../../utils/effects';
import { DO, Pm, RO, Vo, l1, ns } from '../../domain/mascotStyle';
import { ph } from '../../domain/mascotState';
import { ev } from '../../widgets/widgetSync';
import { mr } from '../../hooks/useMascot';
import { yn } from '../../components/ui/Sheet';
import { Gm } from '../../components/mascot/MascotArt';
import { C_xl } from '../../components/modals/ConfirmationModal';
import { Fj, Ym } from '../../components/mascot/MascotHome';

export const Km = "focusfrog:open-store";

export const gv = () => window.dispatchEvent(new Event(Km));

const G8 = 100;

const K8 = 1e4;

const J8 = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3a9 9 0 1 0 9 9h-9z" /></svg>;

const Q1 = ({
  playing: e
}) => e ? <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg> : <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>;

export const Y8 = ({
  onClose: e
}) => {
  var We, Ct;
  const {
      pontosFoco: t,
      activeThemeId: n,
      setActiveThemeId: s,
      activeSoundId: r,
      setActiveSoundId: o,
      activeEffectId: a,
      setActiveEffectId: l,
      buyItem: c,
      spendPoints: u,
      isUnlocked: d
    } = useTheme(),
    {
      addNotification: f
    } = useUI(),
    [h, m] = React.useState("temas"),
    [v, x] = React.useState(n),
    [k, y] = React.useState(r),
    [p, g] = React.useState(null),
    [b, j] = React.useState(null),
    [C, S] = React.useState(pd),
    T = H => H === "end" ? Ua[2].options.some($ => $.id === a) ? a : Ua[2].options[0].id : C[H],
    P = (H, $) => {
      H === "end" ? l($) : (BI(H, $), S(pd()));
    },
    [O] = mr(),
    [V, U] = React.useState(ns),
    [E, K] = React.useState(() => ({
      accessory: ns().accessory,
      scene: ns().scene
    })),
    [oe, ve] = React.useState(null),
    [Z, D] = React.useState(Ym);
  React.useEffect(() => {
    const H = () => U(ns());
    return window.addEventListener(Vo, H), () => window.removeEventListener(Vo, H);
  }, []);
  const q = ph(),
    G = (q == null ? undefined : q.flies) ?? 0,
    de = Math.max(0, Math.ceil((V.fireflyUntil - Date.now()) / 36e5)),
    re = React.useRef(() => {});
  yn(e);
  const X = () => {
    re.current(), re.current = () => {}, g(null);
  };
  React.useEffect(() => () => re.current(), []);
  const Ie = H => {
      if (p === H.id) {
        X();
        return;
      }
      if (X(), H.id === "none" || !H.ready) return;
      const $ = uS(H, 0.5),
        je = setTimeout(X, K8);
      re.current = () => {
        clearTimeout(je), $();
      }, g(H.id);
    },
    $e = (H, $, je, R = true) => R ? je ? {
      text: "Em uso",
      cls: se.tagOwned
    } : d(H, $) ? {
      text: $ === 0 ? "Grátis" : "Seu",
      cls: se.tagOwned
    } : {
      text: `${$} pontos`,
      cls: se.tagPrice
    } : {
      text: "Em breve",
      cls: se.tagSoon
    },
    Je = () => {
      if (!b) return;
      if (b.kind === "consumable") {
        u(b.price) ? (DO(b.id), $_(b.id, b.price), f(b.id === "flies" ? "3 moscas guardadas pro mascote" : "Vagalumes acesos por 24 h", "🐸", "success")) : f("Ainda faltam pontos pra esse item", "🪙", "info"), j(null);
        return;
      }
      const H = c(b.id, b.price);
      if (H === "ok" && $_(b.id, b.price), H === "ok" || H === "owned") {
        if (b.kind === "theme" && s(b.id), b.kind === "sound" && o(b.id), b.kind === "effect" && l(b.id), b.kind === "cosmetic") {
          const $ = l1.find(je => je.id === b.id);
          $ && Pm({
            [$.slot]: $.id
          });
        }
        f(`${b.name} desbloqueado!`, "🐸", "success");
      } else f("Ainda faltam pontos pra esse item", "🪙", "info");
      j(null);
    },
    z = (() => {
      if (h === "mascote") {
        const $ = oe;
        return $ ? V[$.slot] === $.id ? {
          label: "Em uso no widget",
          disabled: true
        } : d($.id, $.price) ? {
          label: `Usar ${$.name}`,
          onClick: () => Pm({
            [$.slot]: $.id
          })
        } : t < $.price ? F($.price) : {
          label: `Desbloquear ${$.name} · ${$.price} pontos`,
          buy: true,
          onClick: () => j({
            id: $.id,
            name: $.name,
            price: $.price,
            kind: "cosmetic"
          })
        } : {
          label: "Toque num item pra ver no mascote",
          disabled: true
        };
      }
      if (h === "temas") {
        const $ = nu.find(je => je.id === v) || nu[0];
        return $.id === n ? {
          label: "Em uso",
          disabled: true
        } : d($.id, $.price) ? {
          label: "Usar este tema",
          onClick: () => s($.id)
        } : t < $.price ? F($.price) : {
          label: `Desbloquear ${$.name} · ${$.price} pontos`,
          buy: true,
          onClick: () => j({
            id: $.id,
            name: $.name,
            price: $.price,
            kind: "theme"
          })
        };
      }
      const H = fl.find($ => $.id === k) || fl[0];
      return H.ready ? H.id === r ? {
        label: "Tocando nos seus focos",
        disabled: true
      } : d(H.id, H.price) ? {
        label: "Usar nos meus focos",
        onClick: () => o(H.id)
      } : t < H.price ? F(H.price) : {
        label: `Desbloquear ${H.name} · ${H.price} pontos`,
        buy: true,
        onClick: () => j({
          id: H.id,
          name: H.name,
          price: H.price,
          kind: "sound"
        })
      } : {
        label: "Esse som chega numa próxima versão",
        disabled: true
      };
    })();
  function F(H) {
    const $ = H - t,
      je = Math.max(1, Math.ceil($ / G8));
    return {
      label: `Faltam ${$} pontos · uns ${je} ${je === 1 ? "dia" : "dias"} de foco`,
      disabled: true
    };
  }
  const J = ((We = Va[v]) == null ? undefined : We.colors) || Va["dark-theme"].colors,
    pe = ((Ct = nu.find(H => H.id === v)) == null ? undefined : Ct.name) || "";
  return <div className={se.screen} role="dialog" aria-modal="true" aria-label="Loja do Sapo"><header className={se.header}><button className={se.back} onClick={e} aria-label="Voltar"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg></button><h2>Loja do Sapo</h2><span className={se.points} aria-label={`${t} pontos de foco`}><J8 />{" "}{t}</span></header><div className={se.tabs} role="tablist"><button role="tab" aria-selected={h === "temas"} className={h === "temas" ? se.tabOn : ""} onClick={() => {
        X(), m("temas");
      }}>Temas</button><button role="tab" aria-selected={h === "sons"} className={h === "sons" ? se.tabOn : ""} onClick={() => m("sons")}>Sons</button><button role="tab" aria-selected={h === "mascote"} className={h === "mascote" ? se.tabOn : ""} onClick={() => {
        X(), m("mascote");
      }}>Mascote</button></div><div className={se.body}>{h === "mascote" ? <><div className={se.mascotHero}><Gm speciesId={O == null ? undefined : O.speciesId} accessory={E.accessory} scene={E.scene} size={132} /><div className={se.mascotHeroText}><strong>{(O == null ? undefined : O.name) || "Sapinho"}</strong><span>O mascote do widget da tela inicial. Escolha seu mascote na carta de um sapo da lagoa.</span>{Capacitor.isNativePlatform() && <button className={se.smallBtn} onClick={() => ev()}>Pôr na tela inicial</button>}{Z && <button className={se.smallBtn} onClick={() => {
              Fj(false), D(false);
            }}>Mostrar na Início</button>}</div></div>{["accessory", "scene"].map(H => <section key={H} aria-label={H === "accessory" ? "Acessórios" : "Cenários"}><h3 className={se.section}>{H === "accessory" ? "Acessórios" : "Cenários"}</h3><div className={se.grid}>{l1.filter($ => $.slot === H).map($ => {
              const je = $e($.id, $.price, V[H] === $.id),
                R = E[H] === $.id;
              return <button key={$.id} className={`${se.themeCard} ${R ? se.selected : ""}`} aria-pressed={R} onClick={() => {
                K(Ae => ({
                  ...Ae,
                  [H]: $.id
                })), ve($);
              }}><Gm speciesId={O == null ? undefined : O.speciesId} accessory={H === "accessory" ? $.id : "acc_none"} scene={H === "scene" ? $.id : "scene_pond"} size={64} /><span className={se.itemName}>{$.name}</span><span className={`${se.tag} ${$.epic && je.cls === se.tagPrice ? se.tagEpic : je.cls}`}>{$.epic && je.cls === se.tagPrice ? `Épico · ${je.text}` : je.text}</span></button>;
            })}</div></section>)}<h3 className={se.section}>Consumíveis</h3><p className={se.hint}>Usados pelo mascote do widget. Dá pra comprar quantas vezes quiser.</p><ul className={se.list}>{RO.map(H => <li key={H.id} className={se.row}><div className={se.rowMain}><span className={se.itemName}>{H.name}</span><span className={se.itemDesc}>{H.desc}</span><span className={se.itemDesc}>{H.id === "flies" ? `Guardadas: ${G}` : de > 0 ? `Acesos por mais ${de} h` : "Apagados"}</span></div><button className={se.smallBtn} disabled={t < H.price} onClick={() => j({
              id: H.id,
              name: H.name,
              price: H.price,
              kind: "consumable"
            })}>{H.price}{" pontos"}</button></li>)}</ul></> : h === "temas" ? <><div className={se.preview} style={{
          background: J["--background-color"],
          borderColor: J["--border-color"]
        }}><div className={se.previewHead} style={{
            background: J["--primary-color"],
            color: J["--text-on-primary"]
          }}><strong>Bom dia!</strong><span>{"Prévia do tema "}{pe}</span></div><div className={se.previewCard} style={{
            background: J["--surface-color"],
            borderColor: J["--accent-color"]
          }}><span style={{
              color: J["--accent-color"]
            }} className={se.previewLabel}>Sapo do Dia</span><span style={{
              color: J["--text-color"]
            }} className={se.previewTitle}>Estudar capítulo 3</span><span className={se.previewTrack} style={{
              background: J["--border-color"]
            }}><i style={{
                background: J["--accent-color"]
              }} /></span><span className={se.previewBtn} style={{
              background: J["--primary-color"],
              color: J["--text-on-primary"]
            }}>Começar foco</span></div></div><div className={se.grid}>{nu.map(H => {
            const $ = Va[H.id].colors,
              je = $e(H.id, H.price, H.id === n);
            return <button key={H.id} className={`${se.themeCard} ${v === H.id ? se.selected : ""}`} onClick={() => x(H.id)} aria-pressed={v === H.id}><span className={se.swatches} aria-hidden="true"><i style={{
                  background: $["--background-color"]
                }} /><i style={{
                  background: $["--primary-color"]
                }} /><i style={{
                  background: $["--accent-color"]
                }} /></span><span className={se.itemName}>{H.name}</span><span className={`${se.tag} ${H.epic && je.cls === se.tagPrice ? se.tagEpic : je.cls}`}>{H.epic && je.cls === se.tagPrice ? `Épico · ${je.text}` : je.text}</span></button>;
          })}</div></> : <><p className={se.hint}>Tocam em loop enquanto você foca. Toque ▶ pra ouvir uma prévia de 10 segundos.</p>{LI.map(H => <section key={H.id} aria-label={H.title}><h3 className={se.section}>{H.title}{H.hint && <small className={se.sectionHint}>{H.hint}</small>}</h3><ul className={se.list}>{fl.filter($ => $.group === H.id).map($ => {
              const je = $e($.id, $.price, $.id === r, $.ready);
              return <li key={$.id} className={`${se.row} ${k === $.id ? se.selected : ""}`}><button className={`${se.play} ${p === $.id ? se.playOn : ""}`} onClick={() => Ie($)} disabled={!$.ready || $.id === "none"} aria-label={`${p === $.id ? "Parar" : "Ouvir"} prévia: ${$.name}`}><Q1 playing={p === $.id} /></button><button className={se.rowMain} onClick={() => y($.id)} aria-pressed={k === $.id}><span className={se.itemName}>{$.name}</span><span className={se.itemDesc}>{$.desc}</span></button><span className={`${se.tag} ${H.id === "sapos" && je.cls === se.tagPrice ? se.tagEpic : je.cls}`}>{je.text}</span></li>;
            })}</ul></section>)}<h3 className={se.section}>Avisos</h3><p className={se.hint}>Um som curto pra cada momento do foco.</p>{Ua.map(H => <section key={H.id} aria-label={H.title}><h4 className={se.subSection}>{H.title}{" "}<small>{H.desc}</small></h4><ul className={se.list}>{H.options.map($ => {
              const je = d($.id, $.price),
                R = T(H.id) === $.id;
              return <li key={$.id} className={`${se.row} ${R ? se.selected : ""}`}><button className={se.play} onClick={() => {
                  X(), hS($.file);
                }} aria-label={`Ouvir prévia: ${$.name}`}><Q1 playing={false} /></button><div className={se.rowMain}><span className={se.itemName}>{$.name}</span>{$.price > 0 && <span className={se.itemDesc}>Premium · coaxo de um sapo de verdade</span>}</div>{je ? <button className={se.smallBtn} disabled={R} onClick={() => P(H.id, $.id)}>{R ? "Em uso" : "Usar"}</button> : <button className={se.smallBtn} disabled={t < $.price} onClick={() => j({
                  id: $.id,
                  name: $.name,
                  price: $.price,
                  kind: "effect"
                })}>{$.price}{" pontos"}</button>}</li>;
            })}</ul></section>)}</>}</div><footer className={se.footer}><button className={`${se.cta} ${z.buy ? se.ctaBuy : ""}`} disabled={!!z.disabled} onClick={z.onClick}>{z.label}</button><p>+10 pontos por foco · +50 pelo Sapo do Dia</p></footer>{b && <C_xl title={b.kind === "consumable" ? `Comprar ${b.name}?` : `Desbloquear ${b.name}?`} message={`Custa ${b.price} pontos. Você tem ${t} e vão sobrar ${t - b.price}.`} confirmText={b.kind === "consumable" ? "Comprar" : "Desbloquear"} onConfirm={Je} onCancel={() => j(null)} />}</div>;
};
