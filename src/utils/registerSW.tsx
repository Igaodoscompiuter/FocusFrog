// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import * as React from "react";
import { lazyImport } from "./lazyImport";
import * as workboxWindow from "workbox-window";

function jX(e = {}) {
  const {
    immediate: t = false,
    onNeedRefresh: n,
    onOfflineReady: s,
    onRegistered: r,
    onRegisteredSW: o,
    onRegisterError: a,
  } = e;
  let l, c, u;
  const d = async (h = true) => {
    await c, u == null || u();
  };
  async function f() {
    if ("serviceWorker" in navigator) {
      if (
        ((l = await lazyImport(async () => {
          const { Workbox: h } = await Promise.resolve().then(
            () => workboxWindow
          );
          return {
            Workbox: h,
          };
        }, undefined)
          .then(
            ({ Workbox: h }) =>
              new h("/sw.js", {
                scope: "/",
                type: "classic",
              })
          )
          .catch((h) => {
            a == null || a(h);
          })),
        !l)
      )
        return;
      u = () => {
        l == null || l.messageSkipWaiting();
      };
      {
        let h = false;
        const m = () => {
          (h = true),
            l == null ||
              l.addEventListener("controlling", (v) => {
                v.isUpdate && window.location.reload();
              }),
            n == null || n();
        };
        l.addEventListener("installed", (v) => {
          typeof v.isUpdate > "u"
            ? typeof v.isExternal < "u" && v.isExternal
              ? m()
              : !h && (s == null || s())
            : v.isUpdate || s == null || s();
        }),
          l.addEventListener("waiting", m);
      }
      l.register({
        immediate: t,
      })
        .then((h) => {
          o ? o("/sw.js", h) : r == null || r(h);
        })
        .catch((h) => {
          a == null || a(h);
        });
    }
  }
  return (c = f()), d;
}

export function CX(e = {}) {
  const {
      immediate: t = true,
      onNeedRefresh: n,
      onOfflineReady: s,
      onRegistered: r,
      onRegisteredSW: o,
      onRegisterError: a,
    } = e,
    [l, c] = React.useState(false),
    [u, d] = React.useState(false),
    [f] = React.useState(() =>
      jX({
        immediate: t,
        onOfflineReady() {
          d(true), s == null || s();
        },
        onNeedRefresh() {
          c(true), n == null || n();
        },
        onRegistered: r,
        onRegisteredSW: o,
        onRegisterError: a,
      })
    );
  return {
    needRefresh: [l, c],
    offlineReady: [u, d],
    updateServiceWorker: f,
  };
}
