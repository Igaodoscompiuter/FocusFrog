// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import * as React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { FROG_SPECIES } from "../../data/frogs";
import { useMascot } from "../../hooks/useMascot";
import { motion } from "framer-motion";
import { Nc } from "../../context/ZenContext";
import { FrogSprite } from "./FrogSprite";
import { sn } from "./ZenPond";
import { LilyPad, Xw } from "./LilyPad";
import { C_hZ } from "./KoiFish";
import { Fireflies } from "./Fireflies";
import { bZ, tb } from "./LagoaCanvas";

export const PondScene = ({ children: e }) => {
  const { pondFrogs: t, ripples: n, effects: s } = Nc(),
    [r] = useMascot(),
    o = React.useRef(null),
    a = React.useRef(new Map()),
    l = (h) => {
      const m = a.current.get(h.id);
      if (!m) {
        const v = {
          top: [h.top, h.top, h.top, h.top],
          left: [h.left, h.left, h.left, h.left],
        };
        return (
          a.current.set(h.id, {
            top: h.top,
            left: h.left,
            kf: v,
          }),
          v
        );
      }
      return (
        (m.top !== h.top || m.left !== h.left) &&
          ((m.kf = {
            top: [m.top, m.top, h.top, h.top],
            left: [m.left, m.left, h.left, h.left],
          }),
          (m.top = h.top),
          (m.left = h.left)),
        m.kf
      );
    },
    [c, u] = React.useState(new Set()),
    d = React.useRef(new Set());
  React.useEffect(() => {
    const h = o.current;
    if (!h) return;
    const { width: m, height: v } = h.getBoundingClientRect();
    n.forEach((x) => {
      if (x.gold || d.current.has(x.id)) return;
      d.current.add(x.id);
      const k = (parseFloat(x.left) / 100) * m,
        y = (parseFloat(x.top) / 100) * v,
        p = Xw.findIndex(
          (g) =>
            Math.hypot((g.x / 100) * m - k, (g.y / 100) * v - y) < g.size * 0.5
        );
      p < 0 ||
        setTimeout(() => {
          u((g) => new Set(g).add(p)),
            setTimeout(
              () =>
                u((g) => {
                  const b = new Set(g);
                  return b.delete(p), b;
                }),
              900
            );
        }, x.delayMs || 0);
    });
  }, [n]);
  const f = Date.now();
  return (
    <div className={sn.zenPondContainer}>
      <div className={sn.water} ref={o}>
        <div className={sn.shine} />
        <svg
          className={sn.wavelines}
          viewBox="0 0 380 500"
          preserveAspectRatio="none"
        >
          <path
            d="M0 120 Q95 108 190 120 T380 120"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M0 260 Q95 248 190 260 T380 260"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M0 380 Q95 368 190 380 T380 380"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
        {Xw.map((h, m) => (
          <LilyPad key={m} pad={h} index={m} reacting={c.has(m)} />
        ))}
        <C_hZ />
        <Fireflies />
        <div className={sn.shore} />
        {n.map((h) => (
          <div
            key={h.id}
            className={`${sn.ripple} ${h.gold ? sn.ringGold : ""}`}
            style={{
              top: h.top,
              left: h.left,
              animationDelay: `${h.delayMs || 0}ms`,
            }}
          />
        ))}
        {t.length > 0
          ? t.map((h) => {
              var k;
              const m = l(h),
                v =
                  (k = FROG_SPECIES[h.speciesId]) == null
                    ? undefined
                    : k.rarity,
                x = !!h.enteredAt && f - h.enteredAt < 1500;
              return (
                <motion.div
                  key={h.id}
                  className={sn.frogWrapper}
                  initial={{
                    top: `${m.top[0]}%`,
                    left: `${m.left[0]}%`,
                    scale: h.scale,
                    opacity: 1,
                  }}
                  animate={
                    h.merging
                      ? {
                          top: `${h.top}%`,
                          left: `${h.left}%`,
                          y: [0, -16, 0],
                          scale: h.scale * 0.3,
                          opacity: 0,
                        }
                      : {
                          top: m.top.map((y) => `${y}%`),
                          left: m.left.map((y) => `${y}%`),
                          scale: h.scale,
                          opacity: 1,
                        }
                  }
                  transition={
                    h.merging
                      ? {
                          duration: 0.56,
                          ease: "easeIn",
                        }
                      : {
                          top: tb,
                          left: tb,
                          scale: {
                            type: "spring",
                            stiffness: 260,
                            damping: 14,
                          },
                          opacity: {
                            duration: 0.2,
                          },
                        }
                  }
                >
                  {(v === "rare" || v === "epic" || v === "legendary") && (
                    <div className={`${sn.rarityGlow} ${sn[v]}`} />
                  )}
                  {(r == null ? undefined : r.frogId) === h.id &&
                    !h.merging && (
                      <div className={sn.mascotTag}>
                        {"⭐ "}
                        {r.name}
                      </div>
                    )}
                  <div className={sn.collisionBarrier} />
                  <FrogSprite
                    speciesId={h.speciesId}
                    stage="adult"
                    top={h.merging ? undefined : h.top}
                    left={h.merging ? undefined : h.left}
                    frogId={h.id}
                    showShadow
                    enteringDrop={x}
                    pulseAt={h.pulseAt}
                  />
                </motion.div>
              );
            })
          : e}
        {s.map((h) => (
          <React.Fragment key={h.id}>
            {bZ.map((m, v) => {
              const x = 24 + ((v * 37) % 20);
              return (
                <div
                  key={v}
                  className={sn.spark}
                  style={{
                    left: `${h.left}%`,
                    top: `${h.top - 4}%`,
                    "--dx": `${Math.cos(m) * x}px`,
                    "--dy": `${Math.sin(m) * x}px`,
                  }}
                />
              );
            })}
            <div
              className={sn.floatText}
              style={{
                left: `${h.left}%`,
                top: `${h.top - 8}%`,
              }}
            >
              {h.text}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
