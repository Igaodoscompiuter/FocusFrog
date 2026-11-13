// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import * as React from 'react';

const Rm = "focusfrog_mascot";

const Ef = "focusfrog:mascot-changed";

const m1 = () => {
  try {
    const e = localStorage.getItem(Rm);
    return e ? JSON.parse(e) : null;
  } catch {
    return null;
  }
};

export const mr = () => {
  const [e, t] = React.useState(m1);
  React.useEffect(() => {
    const s = () => t(m1());
    return window.addEventListener(Ef, s), () => window.removeEventListener(Ef, s);
  }, []);
  const n = React.useCallback(s => {
    s ? localStorage.setItem(Rm, JSON.stringify(s)) : localStorage.removeItem(Rm), window.dispatchEvent(new Event(Ef));
  }, []);
  return [e, n];
};
