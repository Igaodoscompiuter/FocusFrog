// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import nn from "./TourOverlay.module.css";
import * as React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { useMascot } from "../../hooks/useMascot";
import { useTour, wd } from "./TourContext";
import { AnimatePresence, motion } from "framer-motion";
import { FrogSprite } from "../zen/FrogSprite";

export const TourOverlay = () => {
  const { active: e, step: t, stepIndex: n, next: s, skip: r } = useTour(),
    [o] = useMascot(),
    [a, l] = React.useState(null),
    [c, u] = React.useState(false),
    [d, f] = React.useState(0),
    [h, m] = React.useState(false);
  if (
    (React.useEffect(() => {
      if (!e || !t) return;
      let C = false;
      const S = () => {
        if (
          (u(!!document.querySelector(".g-modal-overlay")),
          m(!!document.querySelector("[data-tour-hide]")),
          !t.target)
        ) {
          l(null);
          return;
        }
        const P = document.querySelector(t.target);
        if (!P) {
          l(null);
          return;
        }
        C ||
          (P.scrollIntoView({
            block: "center",
            behavior: "smooth",
          }),
          (C = true));
        const O = P.getBoundingClientRect();
        l({
          top: O.top,
          left: O.left,
          width: O.width,
          height: O.height,
        });
      };
      S();
      const T = setInterval(S, 250);
      return f((P) => P + 1), () => clearInterval(T);
    }, [e, t]),
    !e || !t || h || c)
  )
    return null;
  const v = 8,
    x =
      a && !c
        ? {
            top: a.top - v,
            left: a.left - v,
            width: a.width + v * 2,
            height: a.height + v * 2,
          }
        : null,
    k = 190,
    y = 80,
    p = x ? x.top : 0,
    g = x ? window.innerHeight - y - (x.top + x.height) : 0,
    b = c
      ? {
          top: "calc(var(--safe-top, 0px) + 12px)",
        }
      : x
      ? g >= k && g >= p
        ? {
            top: x.top + x.height + 14,
          }
        : p >= k
        ? {
            bottom: window.innerHeight - x.top + 14,
          }
        : {
            bottom: `calc(${y + 8}px + var(--safe-bottom, 0px))`,
          }
      : {
          top: "50%",
          transform: "translateY(-50%)",
        },
    j = !t.button;
  return (
    <div className={nn.root}>
      {!c &&
        (x ? (
          <div className={nn.hole} style={x}>
            <div className={nn.ring} />
          </div>
        ) : (
          <div className={nn.dim} />
        ))}
      <AnimatePresence mode="wait">
        <motion.div
          key={t.id}
          className={nn.bubbleWrap}
          style={b}
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
          }}
          transition={{
            duration: 0.25,
          }}
        >
          <div className={nn.avatar} onClick={() => f((C) => C + 1)}>
            <FrogSprite
              speciesId={(o == null ? undefined : o.speciesId) || "JUNGLE"}
              stage="adult"
              size={60}
              clickable={false}
              top={0}
              left={d}
            />
          </div>
          <div className={nn.bubble}>
            <div className={nn.progress}>
              {wd.map((C, S) => (
                <span key={S} className={S <= n ? nn.dotOn : nn.dot} />
              ))}
            </div>
            <strong className={nn.title}>{t.title}</strong>
            <p className={nn.text}>{t.text}</p>
            <div className={nn.actions}>
              <button className={nn.skip} onClick={r}>
                {n === wd.length - 1 ? "" : "Pular tutorial"}
              </button>
              {j ? (
                <span className={nn.waiting}>esperando você ✨</span>
              ) : (
                <button className={nn.primary} onClick={s}>
                  {t.button}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
