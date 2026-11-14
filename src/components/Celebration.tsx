// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import Gs from "./Celebration.module.css";
import * as React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { useUI } from "../context/UIContext";
import { vd, xc, zo } from "../domain/mascot";
import { ns } from "../domain/mascotStyle";
import { _d } from "../domain/mascotState";
import { useMascot } from "../hooks/useMascot";
import { MascotArt } from "./mascot/MascotArt";

const Vi = "focusfrog_celebrated";

export const Celebration = () => {
  const [e, t] = React.useState(null),
    { addNotification: n } = useUI(),
    [s] = useMascot();
  if (
    (React.useEffect(() => {
      const l = (c) => {
        var v;
        const u = c.detail,
          d = u == null ? undefined : u.comboBonus;
        if (d && d.n > 0) {
          const x = `${d.day}:${d.n}`;
          let k = "";
          try {
            k = localStorage.getItem(Vi + "_combo") || "";
          } catch {}
          if (k !== x) {
            try {
              localStorage.setItem(Vi + "_combo", x);
            } catch {}
            n(
              `Combo de ${
                ((v = u.combo) == null ? undefined : v.n) ?? 3
              }! Uma mosca extra pro sapinho.`,
              "🔥",
              "success"
            );
          }
        }
        const f = u == null ? undefined : u.react;
        if (!f || f.until <= Date.now()) return;
        const h = `${f.kind}:${f.until}`;
        let m = "";
        try {
          m = localStorage.getItem(Vi) || "";
        } catch {}
        if (m !== h) {
          if (f.kind === "streak" || f.kind === "levelup") {
            try {
              localStorage.setItem(Vi, h);
            } catch {}
            window.setTimeout(
              () =>
                t({
                  kind: f.kind,
                  n: f.n ?? 0,
                  freeze: f.kind === "streak" && (f.n ?? 0) % 7 === 0,
                }),
              700
            );
          } else if (f.kind === "mission") {
            try {
              localStorage.setItem(Vi, h);
            } catch {}
            n(
              `Missão do dia cumprida! +${zo.flies} moscas e +${zo.xp} XP.`,
              "🎯",
              "success"
            );
          }
        }
      };
      return (
        window.addEventListener(_d, l), () => window.removeEventListener(_d, l)
      );
    }, [n]),
    !e)
  )
    return null;
  const r = ns(),
    o = () => t(null),
    a = e.kind === "streak" ? xc[e.n] ?? 0 : 2;
  return (
    <div
      className={Gs.backdrop}
      onClick={o}
      role="dialog"
      aria-modal="true"
      aria-labelledby="celebrate-title"
    >
      <div className={Gs.card} onClick={(l) => l.stopPropagation()}>
        <div className={Gs.confetti} aria-hidden="true">
          {Array.from(
            {
              length: 18,
            },
            (l, c) => (
              <i
                key={c}
                style={{
                  "--i": c,
                }}
              />
            )
          )}
        </div>
        <div className={Gs.frog}>
          <MascotArt
            speciesId={s == null ? undefined : s.speciesId}
            accessory={r.accessory}
            scene={r.scene}
            size={120}
          />
        </div>
        {e.kind === "streak" ? (
          <>
            <div className={Gs.big}>
              <span className={Gs.flame} aria-hidden="true">
                🔥
              </span>
              {e.n}
            </div>
            <h2 id="celebrate-title">
              {e.n}
              {" dias seguidos!"}
            </h2>
            <p>
              {"Você apareceu "}
              {e.n}
              {" dias sem falhar. É assim que hábito vira coisa automática."}
            </p>
          </>
        ) : (
          <>
            <div className={Gs.big}>
              {"Nv "}
              {e.n}
            </div>
            <h2 id="celebrate-title">
              {(s == null ? undefined : s.name) || "Sapinho"}
              {" virou "}
              {vd(e.n)}!
            </h2>
            <p>Cada foco e tarefa feita conta. Ele cresce junto com você.</p>
          </>
        )}
        <div className={Gs.gifts}>
          {a > 0 && (
            <span>
              +{a}
              {" moscas"}
            </span>
          )}
          {e.freeze && <span>+1 protetor de sequência 🛡️</span>}
        </div>
        <button className={Gs.cta} onClick={o} autoFocus>
          Bora!
        </button>
      </div>
    </div>
  );
};
