// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import fo from "./Toast.module.css";
import * as React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { Co } from "../context/UIContext";
import { motion } from "framer-motion";

export const Toast = ({ notification: e, onDismiss: t, fast: n }) => {
  const { id: s, action: r, category: o } = e,
    a = r
      ? Co.actionableDuration
      : n
      ? Co.fastDuration
      : Co.duration[o] ?? Co.duration.info,
    l = React.useRef(t);
  l.current = t;
  const c = React.useRef(a),
    u = React.useRef(0),
    d = React.useRef(),
    [f, h] = React.useState(false),
    m = () => {
      (u.current = Date.now()),
        clearTimeout(d.current),
        (d.current = setTimeout(() => l.current(s), c.current));
    },
    v = () => {
      f ||
        (clearTimeout(d.current),
        (c.current = Math.max(600, c.current - (Date.now() - u.current))),
        h(true));
    },
    x = () => {
      f && (h(false), m());
    };
  React.useEffect(() => (m(), () => clearTimeout(d.current)), [s]);
  const k = (p, g) => {
      Math.abs(g.offset.x) > 80 || Math.abs(g.velocity.x) > 500
        ? l.current(s)
        : x();
    },
    y = (p) => {
      p.stopPropagation(), r == null || r.onAction(), l.current(s);
    };
  return (
    <motion.div
      className={`${fo.toast} ${fo[o] || ""}`}
      role="status"
      drag="x"
      dragConstraints={{
        left: 0,
        right: 0,
      }}
      dragElastic={0.7}
      onDragStart={v}
      onDragEnd={k}
      onPointerDown={v}
      onPointerUp={x}
      onPointerCancel={x}
      onClick={() => l.current(s)}
    >
      <span className={fo.iconTile} aria-hidden="true">
        {e.icon}
      </span>
      <p className={fo.message}>{e.message}</p>
      {r && (
        <button className={fo.action} onClick={y}>
          {r.label}
        </button>
      )}
      <span className={fo.progress} aria-hidden="true">
        <span
          key={s}
          className={fo.bar}
          style={{
            animationDuration: `${a}ms`,
            animationPlayState: f ? "paused" : "running",
          }}
        />
      </span>
    </motion.div>
  );
};
