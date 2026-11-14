// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import ne from "./Sheet.module.css";
import * as React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { Capacitor } from "@capacitor/core";
import { App as CapApp } from "@capacitor/app";
import { Sm, kn } from "../../domain/taskKinds";

export { ne };

export const Ms = ({ task: e, className: t }) => (
  <span className={`${ne.badge} ${ne[kn(e)]} ${t || ""}`}>{Sm(e)}</span>
);

export const C_oi = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M5 12l5 5 9-10" />
  </svg>
);

const ml = [];

export function yn(e, t = true) {
  const n = React.useRef(e);
  (n.current = e),
    React.useEffect(() => {
      if (!t) return;
      const s = {
        fn: () => n.current(),
      };
      return (
        ml.push(s),
        () => {
          const r = ml.lastIndexOf(s);
          r >= 0 && ml.splice(r, 1);
        }
      );
    }, [t]);
}

function g1() {
  const e = ml[ml.length - 1];
  return e ? (e.fn(), true) : false;
}

export function RR(e) {
  const t = React.useRef(e);
  (t.current = e),
    React.useEffect(() => {
      if (!Capacitor.isNativePlatform()) {
        const s = (r) => {
          r.key === "Escape" && g1() && r.preventDefault();
        };
        return (
          window.addEventListener("keydown", s),
          () => window.removeEventListener("keydown", s)
        );
      }
      const n = CapApp.addListener("backButton", () => {
        g1() || t.current() || CapApp.minimizeApp().catch(() => {});
      });
      return () => {
        n.then((s) => s.remove());
      };
    }, []);
}
