// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import _e from "./MascotHome.module.css";
import * as React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { Capacitor } from "@capacitor/core";
import { FROG_PATTERNS, FROG_SPECIES } from "../../data/frogs";
import { AO, Am, EO, IO, Nm, PO, TO, fh, vd, zo } from "../../domain/mascot";
import { Vo, ns } from "../../domain/mascotStyle";
import { ph, rr } from "../../domain/mascotState";
import { ev } from "../../widgets/widgetSync";
import { useMascot } from "../../hooks/useMascot";
import { US, qa } from "../../data/tips";
import { Td } from "../dashboard/RoutineSuggestion";
import { Dj } from "./MascotArt";
import { gv } from "../../screens/store/StoreScreen";

const $j = "focusfrog_homeMascotHidden";

const Jm = "focusfrog:home-mascot";

export const Ym = () => {
  try {
    return localStorage.getItem($j) === "true";
  } catch {
    return false;
  }
};

export const Fj = (e) => {
  try {
    localStorage.setItem($j, String(e));
  } catch {}
  window.dispatchEvent(new Event(Jm));
};

const GL = {
  focus: "happy",
  break: "happy",
  task: "happy",
  frog: "happy",
  eat: "joy",
  nofly: "hungry",
  pet: "joy",
  tickled: "joy",
  levelup: "happy",
  mission: "happy",
  streak: "happy",
  combo: "happy",
  missed: "sad",
  sleepy: "sleep",
  hungry: "hungry",
  tired: "tired",
  sad: "sad",
  happy: "happy",
  normal: "open",
};

export const MascotHome = () => {
  const [e] = useMascot(),
    t = ph(),
    [n, s] = React.useState(Ym),
    [r, o] = React.useState(ns),
    [a, l] = React.useState(() => Math.floor(Date.now() / 24e5) % qa.length),
    [c, u] = React.useState(0),
    [d, f] = React.useState(0),
    h = React.useRef(),
    [m, v] = React.useState(false),
    [x, k] = React.useState(Date.now),
    y = React.useRef(false);
  if (
    (React.useEffect(() => {
      const D = () => s(Ym()),
        q = () => o(ns());
      window.addEventListener(Jm, D), window.addEventListener(Vo, q);
      const G = setInterval(() => k(Date.now()), 3e4);
      return (
        y.current ||
          ((y.current = true),
          rr({
            type: "open",
          }).catch(() => {})),
        () => {
          window.removeEventListener(Jm, D),
            window.removeEventListener(Vo, q),
            clearInterval(G);
        }
      );
    }, []),
    React.useEffect(() => {
      k(Date.now());
    }, [t]),
    n || !t)
  )
    return null;
  const p =
      FROG_SPECIES[(e == null ? undefined : e.speciesId) || ""] ||
      FROG_SPECIES.JUNGLE,
    g = p.stages.adult.colors,
    b = FROG_PATTERNS[p.pattern] || {},
    j = AO(t, x),
    C = d ? "eat" : GL[j],
    S = IO(t, j),
    T = qa[a],
    P = Am(t.xp),
    [O, V] = TO(P),
    U = Nm[t.mission.id],
    E = fh(t, x),
    K = EO(t, x),
    oe = () => {
      u((D) => D + 1),
        l((D) => (D + 1 + Math.floor(Math.random() * 5)) % qa.length),
        rr({
          type: "pet",
        }).catch(() => {});
    },
    ve = () => {
      t.flies > 0 &&
        (f((D) => D + 1),
        window.clearTimeout(h.current),
        (h.current = window.setTimeout(() => {
          f(0), u((D) => D + 1);
        }, 1400))),
        rr({
          type: "feed",
        }).catch(() => {});
    },
    Z = (D, q, G) => (
      <div className={_e.need} aria-label={`${D}: ${Math.round(q)}%`}>
        <span className={_e.needLabel}>{D}</span>
        <span className={`${_e.track} ${q < 25 ? _e.low : ""}`}>
          <i
            className={G}
            style={{
              transform: `scaleX(${q / 100})`,
            }}
          />
        </span>
      </div>
    );
  return (
    <section
      className={_e.card}
      aria-label={`Mascote ${(e == null ? undefined : e.name) || "Sapinho"}`}
    >
      <div className={_e.top}>
        <button
          className={_e.tank}
          style={{
            background: Td[r.scene] || Td.scene_pond,
          }}
          onClick={oe}
          aria-label="Fazer carinho no mascote"
        >
          {r.scene === "scene_night" && (
            <span className={_e.stars} aria-hidden="true" />
          )}
          {r.fireflyUntil > x && (
            <span className={_e.fireflies} aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          )}
          <svg viewBox="0 0 100 100" className={_e.layer} aria-hidden="true">
            <ellipse cx="50" cy="88" rx="40" ry="9" fill="#2F8F5B" />
            <ellipse cx="50" cy="87" rx="36" ry="7" fill="#3AA568" />
          </svg>
          <span
            key={`s${c}`}
            className={`${_e.shadow} ${c ? _e.shadowGo : ""}`}
            aria-hidden="true"
          />
          <div
            key={`h${c}`}
            className={`${_e.layer} ${_e.hop} ${c ? _e.hopGo : ""}`}
            aria-hidden="true"
          >
            <div
              className={`${_e.layer} ${
                C === "sleep" || C === "tired" ? _e.breathSlow : _e.breath
              }`}
            >
              <svg viewBox="0 0 100 100" className={_e.body}>
                <ellipse
                  cx="28"
                  cy="75"
                  rx="12"
                  ry="10"
                  fill={g.primary}
                  stroke="rgba(0,0,0,.25)"
                  strokeWidth="1.5"
                />
                <ellipse
                  cx="72"
                  cy="75"
                  rx="12"
                  ry="10"
                  fill={g.primary}
                  stroke="rgba(0,0,0,.25)"
                  strokeWidth="1.5"
                />
                <ellipse cx="50" cy="60" rx="30" ry="25" fill={g.primary} />
                {(b.dots || []).map(([D, q, G], de) => (
                  <circle
                    key={de}
                    cx={50 + D}
                    cy={60 + q}
                    r={G}
                    fill={p.pattern === "speckles" ? "#000" : g.accent}
                    opacity={p.pattern === "speckles" ? 0.35 : 0.6}
                  />
                ))}
                {(b.stripes || []).map(([D, q, G, de, re, X], Ie) => (
                  <path
                    key={Ie}
                    d={`M${50 + D},${60 + q} Q${50 + G},${60 + de} ${50 + re},${
                      60 + X
                    }`}
                    stroke={g.accent}
                    strokeOpacity={0.55}
                    strokeWidth={3.2}
                    strokeLinecap="round"
                    fill="none"
                  />
                ))}
                <ellipse
                  cx="50"
                  cy="65"
                  rx="20"
                  ry="18"
                  fill={g.secondary}
                  opacity=".8"
                />
                <ellipse
                  cx="38"
                  cy="80"
                  rx="8"
                  ry="6"
                  fill={g.primary}
                  stroke="rgba(0,0,0,.25)"
                  strokeWidth="1.5"
                />
                <ellipse
                  cx="62"
                  cy="80"
                  rx="8"
                  ry="6"
                  fill={g.primary}
                  stroke="rgba(0,0,0,.25)"
                  strokeWidth="1.5"
                />
                <JL face={C} primary={g.primary} />
                <YL face={C} color={g.secondary} />
                <Dj id={r.accessory} />
              </svg>
            </div>
          </div>
          {C === "sleep" && (
            <span className={_e.zzz} aria-hidden="true">
              z
            </span>
          )}
          {d > 0 && (
            <svg
              key={d}
              viewBox="0 0 100 100"
              className={_e.layer}
              aria-hidden="true"
            >
              <path className={_e.tongue} d="M50,70 L73,32" pathLength={1} />
              <g className={_e.flyGo}>
                <ellipse cx="74" cy="31" rx="3" ry="2.2" fill="#1F2937" />
                <ellipse
                  cx="71.5"
                  cy="28.5"
                  rx="2.6"
                  ry="1.6"
                  fill="rgba(224,242,254,.85)"
                  className={_e.wing}
                />
                <ellipse
                  cx="76.5"
                  cy="28.5"
                  rx="2.6"
                  ry="1.6"
                  fill="rgba(224,242,254,.85)"
                  className={_e.wing}
                />
              </g>
            </svg>
          )}
          {c > 0 && !d && (
            <span key={`p${c}`} className={_e.heart} aria-hidden="true">
              <svg viewBox="0 0 12 12">
                <path d="M6,11 C0,6 3,0 6,4 C9,0 12,6 6,11Z" fill="#F472B6" />
              </svg>
            </span>
          )}
        </button>
        <div className={_e.side}>
          <div className={_e.head}>
            <strong>{(e == null ? undefined : e.name) || "Sapinho"}</strong>
            <span className={_e.mood}>{PO[j]}</span>
            <button
              className={_e.more}
              onClick={() => v((D) => !D)}
              aria-label="Opções do mascote"
              aria-expanded={m}
            >
              ⋯
            </button>
          </div>
          {m ? (
            <div className={_e.menu}>
              <button
                onClick={() => {
                  v(false), gv();
                }}
              >
                Loja do mascote
              </button>
              {Capacitor.isNativePlatform() && (
                <button
                  onClick={() => {
                    v(false), ev();
                  }}
                >
                  Pôr na tela inicial
                </button>
              )}
              <button onClick={() => Fj(true)}>Esconder da Início</button>
            </div>
          ) : (
            <button
              key={S || a}
              className={`${_e.bubble} ${S ? _e.bubbleSay : ""}`}
              onClick={oe}
            >
              {!S && <span className={_e.kind}>{US[T.kind]}</span>}
              {S || T.text}
            </button>
          )}
          <div className={_e.level} aria-label={`Nível ${P}, ${vd(P)}`}>
            <span>
              {"Nv "}
              {P}
              {" · "}
              {vd(P)}
            </span>
            <span className={_e.xp}>
              <i
                style={{
                  transform: `scaleX(${Math.min(
                    1,
                    (t.xp - O) / Math.max(1, V - O)
                  )})`,
                }}
              />
            </span>
          </div>
        </div>
      </div>
      <div
        className={`${_e.streakRow} ${E.atRisk ? _e.risk : ""} ${
          E.today ? _e.lit : ""
        }`}
      >
        <span className={_e.flame} aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path
              d="M12,2C13,6 17,8 17,13.5A5,5 0 0,1 7,13.5C7,11 8.5,9.5 9.5,8.5C9.5,10.5 10.5,11.5 11.5,11.5C11.5,8 10,5 12,2Z"
              fill="currentColor"
            />
          </svg>
        </span>
        <span className={_e.streakText}>
          <strong>
            {E.days > 0
              ? `${E.days} ${E.days === 1 ? "dia" : "dias"} seguidos`
              : "Comece uma sequência"}
          </strong>
          <small>
            {E.today
              ? "Hoje já conta ✓"
              : E.atRisk
              ? "Um foco ou uma tarefa hoje mantém a sequência"
              : "Um foco ou uma tarefa feita conta o dia"}
          </small>
        </span>
        {E.freezes > 0 && (
          <span
            className={_e.chip}
            title="Protetor de sequência: cobre um dia sem nada feito"
          >
            {"🛡️ "}
            {E.freezes}
          </span>
        )}
        {K >= 2 && (
          <span
            key={K}
            className={`${_e.chip} ${_e.comboChip}`}
            title="Ações seguidas com pouco intervalo. A cada 3, uma mosca extra"
          >
            Combo ×{K}
          </span>
        )}
      </div>
      <div className={_e.needs}>
        {Z("Barriga", t.food, _e.food)}
        {Z("Energia", t.energy, _e.energy)}
        {Z("Humor", t.mood, _e.humor)}
      </div>
      <div className={_e.bottom}>
        <div
          className={`${_e.mission} ${t.mission.done ? _e.missionDone : ""}`}
        >
          <span className={_e.missionKicker}>Missão do dia</span>
          <span>
            {t.mission.done
              ? `Feita: ${U.label}`
              : `${U.label} · ${t.mission.progress}/${U.target}`}
          </span>
          {!t.mission.done && (
            <small>
              +{zo.flies}
              {" moscas · +"}
              {zo.xp}
              {" XP"}
            </small>
          )}
        </div>
        <button
          className={_e.feed}
          onClick={ve}
          disabled={C === "sleep"}
          aria-label={`Alimentar (${t.flies} moscas)`}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path
              fill="rgba(224,242,254,.85)"
              d="M11,10C9,6 5,5 3.5,6.5C2,8 4,11 9,11.5Z M13,10C15,6 19,5 20.5,6.5C22,8 20,11 15,11.5Z"
            />
            <ellipse cx="12" cy="13" rx="3" ry="4.5" fill="currentColor" />
          </svg>
          {"Alimentar · "}
          {t.flies}
        </button>
      </div>
    </section>
  );
};

const JL = ({ face: e, primary: t }) => {
  const n = (
    <>
      <circle cx="40" cy="45" r="10" fill={t} />
      <circle cx="60" cy="45" r="10" fill={t} />
    </>
  );
  if (e === "sleep")
    return (
      <g>
        {n}
        <path
          d="M33,46 Q40,49 47,46 M53,46 Q60,49 67,46"
          stroke="rgba(0,0,0,.45)"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
      </g>
    );
  if (e === "joy")
    return (
      <g>
        {n}
        <path
          d="M33,48 Q40,39 47,48 M53,48 Q60,39 67,48"
          stroke="rgba(0,0,0,.6)"
          strokeWidth="2.6"
          fill="none"
          strokeLinecap="round"
        />
      </g>
    );
  const [s, r, o] =
    e === "eat"
      ? [3, -3.5, 4.6]
      : e === "hungry"
      ? [0, -3.5, 5]
      : e === "sad" || e === "tired"
      ? [0, 3, 5]
      : [0, 0, e === "happy" ? 5.6 : 5];
  return (
    <g className={_e.blink}>
      <circle cx="40" cy="45" r="10" fill="#fff" />
      <circle cx="60" cy="45" r="10" fill="#fff" />
      <g className={e === "open" || e === "happy" ? _e.look : undefined}>
        <circle cx={40 + s} cy={45 + r} r={o} fill="#000" />
        <circle cx={60 + s} cy={45 + r} r={o} fill="#000" />
        <circle
          cx={41.8 + s}
          cy={43 + r}
          r={e === "happy" ? 2 : 1.5}
          fill="#fff"
        />
        <circle
          cx={61.8 + s}
          cy={43 + r}
          r={e === "happy" ? 2 : 1.5}
          fill="#fff"
        />
      </g>
      {(e === "tired" || e === "sad") && (
        <path d="M30,44 Q40,36 50,44 Z M50,44 Q60,36 70,44 Z" fill={t} />
      )}
    </g>
  );
};

const YL = ({ face: e, color: t }) => {
  if (e === "eat")
    return (
      <g>
        <ellipse cx="50" cy="69.5" rx="4.2" ry="3.6" fill="rgba(0,0,0,.55)" />
        <ellipse cx="50" cy="71" rx="2.6" ry="1.6" fill="#F472B6" />
      </g>
    );
  if (e === "hungry")
    return <ellipse cx="50" cy="69" rx="3.2" ry="2.2" fill="rgba(0,0,0,.45)" />;
  const n = (
    <>
      <ellipse cx="33" cy="64" rx="4" ry="2.4" fill="#F472B6" opacity=".35" />
      <ellipse cx="67" cy="64" rx="4" ry="2.4" fill="#F472B6" opacity=".35" />
    </>
  );
  if (e === "happy" || e === "joy")
    return (
      <g>
        {n}
        <path
          d="M42,66 Q50,75 58,66"
          fill="none"
          stroke={t}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </g>
    );
  const s = e === "sad" ? "M45,70 Q50,66 55,70" : "M45,68 Q50,72 55,68";
  return (
    <path d={s} fill="none" stroke={t} strokeWidth="2" strokeLinecap="round" />
  );
};
