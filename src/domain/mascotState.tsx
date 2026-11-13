// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import * as React from 'react';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { Preferences } from '@capacitor/preferences';
import { DS, NO, OO, OS } from './mascot';
import { ns } from './mascotStyle';

export const _d = "focusfrog:mascot-state";

const Im = _d;

const $O = registerPlugin("WidgetBridge");

let u1 = Promise.resolve();

async function FS(e) {
  const {
      value: t
    } = await Preferences.get({
      key: DS
    }),
    n = (() => {
      const s = ns();
      return Math.max(0, s.fliesBought);
    })();
  return OO(t, e, t ? 0 : n);
}

export function rr(e) {
  const t = u1.then(async () => {
    const n = Date.now(),
      s = NO(await FS(n), e, n);
    return await Preferences.set({
      key: DS,
      value: JSON.stringify(s)
    }), window.dispatchEvent(new CustomEvent(Im, {
      detail: s
    })), Capacitor.isNativePlatform() && $O.refreshMascotWidget().catch(() => {}), s;
  });
  return u1 = t.catch(() => {}), t;
}

async function MS() {
  const e = Date.now();
  return OS(await FS(e), e);
}

export function ph() {
  const [e, t] = React.useState(null);
  return React.useEffect(() => {
    let n = true;
    const s = () => MS().then(l => {
      n && t(l);
    });
    s();
    const r = l => t(l.detail);
    window.addEventListener(Im, r);
    const o = setInterval(s, 6e4),
      a = Capacitor.isNativePlatform() ? CapApp.addListener("appStateChange", ({
        isActive: l
      }) => {
        l && s();
      }) : null;
    return () => {
      n = false, window.removeEventListener(Im, r), clearInterval(o), a == null || a.then(l => l.remove());
    };
  }, []), e;
}

export const FO = Object.freeze(Object.defineProperty({
  __proto__: null,
  MASCOT_STATE_EVENT: _d,
  mascotEvent: rr,
  readMascotState: MS,
  useMascotState: ph
}, Symbol.toStringTag, {
  value: "Module"
}));
