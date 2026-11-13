// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import * as React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import { Capacitor } from '@capacitor/core';
import { isSupabaseConfigured, supabase } from '../supabaseClient';
import { $3, F3 } from '../analytics';
import { App as CapApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { L_, X2, Xc, lh, sP } from '../sync/cloudSync';

const na = "focusfrog_auth_origin";

export const dl = "focusfrog_pending_first_upload";

const vf = "com.focusfrog.app://auth-callback";

const nS = React.createContext(undefined);

const eu = () => setTimeout(() => window.location.reload(), 150);

export const AuthProvider = ({
  children: e
}) => {
  const [t, n] = React.useState(null),
    [s, r] = React.useState(true),
    [o, a] = React.useState(false),
    [l, c] = React.useState(Xc()),
    u = React.useRef(null),
    d = React.useCallback(async v => {
      var k;
      const x = localStorage.getItem(na);
      if (!(!x || u.current === v.id)) {
        u.current = v.id, localStorage.removeItem(na);
        try {
          const y = await sP(v.id, x),
            p = ((k = v.app_metadata) == null ? undefined : k.provider) || "unknown";
          if (y === "new-account" || y === "uploaded" ? $3(p) : F3(p), c(Xc()), y === "restored") {
            localStorage.setItem("focusfrog_account_choice", "cloud"), eu();
            return;
          }
          y === "new-account" && (localStorage.removeItem("focusfrog_userName"), localStorage.setItem(dl, v.id), localStorage.setItem("focusfrog_account_choice", "cloud"), eu());
        } catch (y) {
          console.warn("[auth] pós-login falhou:", y);
        } finally {
          a(false);
        }
      }
    }, []);
  React.useEffect(() => {
    supabase.auth.getSession().then(({
      data: {
        session: k
      }
    }) => {
      const y = (k == null ? undefined : k.user) ?? null;
      n(y), r(false), y && !localStorage.getItem(na) && !localStorage.getItem(dl) && L_(y.id).then(p => {
        c(Xc()), p === "pulled" && eu();
      });
    });
    const {
      data: v
    } = supabase.auth.onAuthStateChange((k, y) => {
      const p = (y == null ? undefined : y.user) ?? null;
      n(p), r(false), k === "SIGNED_IN" && p && d(p);
    });
    let x;
    return Capacitor.isNativePlatform() && (CapApp.addListener("appUrlOpen", async ({
      url: k
    }) => {
      if (!k.startsWith(vf)) return;
      Browser.close().catch(() => {});
      const p = new URL(k.replace(vf, "https://x/cb")).searchParams.get("code");
      if (p) {
        const {
          error: g
        } = await supabase.auth.exchangeCodeForSession(p);
        g && (console.warn("[auth] troca do código falhou:", g.message), a(false));
      } else a(false);
    }).then(k => {
      x = k;
    }), CapApp.addListener("appStateChange", ({
      isActive: k
    }) => {
      k && setTimeout(() => a(y => y && !localStorage.getItem(na) ? false : y), 1500);
    })), () => {
      v.subscription.unsubscribe(), x == null || x.remove();
    };
  }, [d]);
  const f = React.useCallback(async (v, x) => {
      a(true), localStorage.setItem(na, x), u.current = null;
      const k = Capacitor.isNativePlatform(),
        {
          data: y,
          error: p
        } = await supabase.auth.signInWithOAuth({
          provider: v,
          options: {
            redirectTo: k ? vf : window.location.origin,
            skipBrowserRedirect: k,
            queryParams: v === "google" ? {
              prompt: "select_account"
            } : undefined
          }
        });
      if (p || !(y != null && y.url)) {
        console.warn("[auth] login falhou:", p == null ? undefined : p.message), localStorage.removeItem(na), a(false);
        return;
      }
      k && (await Browser.open({
        url: y.url,
        presentationStyle: "popover"
      }));
    }, []),
    h = React.useCallback(async () => {
      if (t) try {
        await lh(t.id);
      } catch {}
      await supabase.auth.signOut(), X2(), localStorage.removeItem(dl), c(null);
    }, [t]),
    m = React.useCallback(async () => {
      if (!t) return "skipped";
      const v = await L_(t.id, {
        force: true
      });
      return c(Xc()), v === "pulled" && eu(), v;
    }, [t]);
  return <nS.Provider value={{
    user: t,
    isLoading: s,
    isConfigured: isSupabaseConfigured,
    isSigningIn: o,
    lastSyncAt: l,
    signIn: f,
    signOut: h,
    syncNowManual: m
  }}>{e}</nS.Provider>;
};

export const useAuth = () => {
  const e = React.useContext(nS);
  if (e === undefined) throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  return e;
};
