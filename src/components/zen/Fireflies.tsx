// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import pZ from "./Fireflies.module.css";
import * as React from "react";
import * as jsxRuntime from "react/jsx-runtime";

const mZ = 9;

export const Fireflies = () => {
  const e = React.useMemo(
    () =>
      Array.from(
        {
          length: mZ,
        },
        (t, n) => {
          const s = Math.random(),
            r = 2.5 + s * 3.5,
            o = (5 + Math.random() * 7).toFixed(1),
            a = (1.3 + Math.random() * 2.2).toFixed(1),
            l = (Math.random() * 46 - 23).toFixed(0) + "px",
            c = (Math.random() * 46 - 23).toFixed(0) + "px";
          return {
            id: n,
            left: `${Math.random() * 90 + 5}%`,
            top: `${Math.random() * 65 + 5}%`,
            size: r,
            glow: `0 0 ${(4 + s * 6).toFixed(1)}px ${(1 + s * 2).toFixed(
              1
            )}px #FBBF24`,
            opacity: 0.5 + s * 0.5,
            style: {
              animation: `drift ${o}s ease-in-out infinite, blink ${a}s ease-in-out infinite`,
              "--dx": l,
              "--dy": c,
            },
          };
        }
      ),
    []
  );
  return (
    <>
      {e.map((t) => (
        <div
          key={t.id}
          className={pZ.firefly}
          style={{
            left: t.left,
            top: t.top,
            width: t.size,
            height: t.size,
            boxShadow: t.glow,
            opacity: t.opacity,
            ...t.style,
          }}
        />
      ))}
    </>
  );
};
