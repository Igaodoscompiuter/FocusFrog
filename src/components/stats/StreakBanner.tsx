// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import Ht from "./StreakBanner.module.css";
import * as React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { bs, fh, jO } from "../../domain/mascot";
import { ph } from "../../domain/mascotState";
import { $d } from "../FocusFrogLifeCycle";

const jQ = ["D", "S", "T", "Q", "Q", "S", "S"];

const mu = [
  [37, 99, 235],
  [6, 182, 212],
  [250, 204, 21],
  [249, 115, 22],
  [239, 68, 68],
];

function sb(e) {
  const t = Math.max(0, Math.min(1, e)) * (mu.length - 1),
    n = Math.min(mu.length - 2, Math.floor(t)),
    s = t - n,
    r = mu[n].map((o, a) => Math.round(o + (mu[n + 1][a] - o) * s));
  return `rgb(${r[0]}, ${r[1]}, ${r[2]})`;
}

export const StreakBanner = ({ quote: e }) => {
  const t = ph(),
    [n, s] = React.useState(0),
    r = Date.now(),
    o = t ? fh(t, r) : null,
    a = (o == null ? undefined : o.days) ?? 0;
  if (
    (React.useEffect(() => {
      if (!a) {
        s(0);
        return;
      }
      let y = 0;
      const p = performance.now(),
        g = Math.min(900, 300 + a * 40),
        b = (C) => {
          const S = Math.min(1, (C - p) / g);
          s(Math.round(a * (1 - Math.pow(1 - S, 3)))),
            S < 1 && (y = requestAnimationFrame(b));
        };
      y = requestAnimationFrame(b);
      const j = window.setTimeout(() => s(a), g + 80);
      return () => {
        cancelAnimationFrame(y), window.clearTimeout(j);
      };
    }, [a]),
    !t || !o)
  )
    return null;
  const { prev: l, next: c, gift: u } = jO(a),
    d = a === 0 ? 0 : Math.max(0.06, Math.min(1, (a - l) / Math.max(1, c - l))),
    f = Math.min(1, a / 30),
    h = 0.25 + f * 0.7,
    m = sb(h),
    v = `linear-gradient(90deg, ${[0, 0.25, 0.5, 0.75, 1]
      .map((y) => sb(y * h))
      .join(", ")})`,
    x = t.lastCareDay,
    k = Array.from(
      {
        length: 7,
      },
      (y, p) => {
        const g = r - (6 - p) * 864e5,
          b = bs(g),
          j = x
            ? Math.round(
                (new Date(x + "T12:00:00").getTime() -
                  new Date(b + "T12:00:00").getTime()) /
                  864e5
              )
            : -1,
          C = a > 0 && j >= 0 && j < a;
        return {
          label: jQ[new Date(g).getDay()],
          on: C,
          today: p === 6,
        };
      }
    );
  return (
    <section
      className={`${Ht.banner} ${o.atRisk ? Ht.risk : ""}`}
      style={{
        "--heat": f,
        "--pct": d,
        "--tip": m,
        "--bar": v,
      }}
      aria-label={`${a} dias de foco seguidos. Próximo marco: ${c} dias`}
    >
      <div className={Ht.glow} aria-hidden="true" />
      <div className={Ht.top}>
        <span
          className={`${Ht.flame} ${a ? Ht.flameOn : ""}`}
          aria-hidden="true"
        >
          🔥
        </span>
        <div className={Ht.count}>
          <strong>{n}</strong>
          <span>{a === 1 ? "dia de foco" : "dias de foco"}</span>
        </div>
        <div className={Ht.meta}>
          {o.freezes > 0 && (
            <span title="Protetor de sequência: cobre um dia sem nada feito">
              {"🛡️ "}
              {o.freezes}
            </span>
          )}
          {o.best > a && (
            <span title="Seu recorde">
              {"Recorde "}
              {o.best}
            </span>
          )}
        </div>
      </div>
      <div className={Ht.track} aria-hidden="true">
        <div key={a} className={Ht.fill} />
        {a > 0 && (
          <span key={`t${a}`} className={Ht.tip}>
            🔥
          </span>
        )}
      </div>
      <div className={Ht.goal}>
        <span>
          {o.today
            ? "Hoje já contou ✓"
            : o.atRisk
            ? "Falta o de hoje: um foco ou uma tarefa"
            : "Um foco ou uma tarefa feita começa a sequência"}
        </span>
        <span>
          {c}
          {" dias · +"}
          {u}
          {" moscas"}
        </span>
      </div>
      <div className={Ht.week} aria-hidden="true">
        {k.map((y, p) => (
          <span
            key={p}
            className={`${Ht.day} ${y.on ? Ht.dayOn : ""} ${
              y.today ? Ht.dayToday : ""
            }`}
            style={{
              "--d": p,
            }}
          >
            <i>{y.on ? "✓" : ""}</i>
            {y.label}
          </span>
        ))}
      </div>
      {e && <p className={Ht.quote}>“{e}”</p>}
    </section>
  );
};

export const TQ = $d[Math.floor(Math.random() * $d.length)];
