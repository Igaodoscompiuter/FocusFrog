// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import * as React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { Capacitor } from "@capacitor/core";
import { useUI } from "./context/UIContext";
import { useUser } from "./context/UserContext";
import { useAuth } from "./hooks/useAuth";
import { oP } from "./context/InstallContext";
import { B_, C_SP, MP, Onboarding } from "./screens/onboarding/Onboarding";
import { SplashScreen } from "./components/SplashScreen";
import { AppLayout, YX } from "./components/AppLayout";
import { SplashScreen as CapSplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style as StatusBarStyle } from "@capacitor/status-bar";

export function App() {
  const { userName: e, onboardingCompleted: t } = useUser(),
    { isLoading: n, isConfigured: s } = useAuth(),
    [r, o] = React.useState(() => localStorage.getItem(B_)),
    { fontSize: a } = useUI(),
    { canInstall: l, triggerInstall: c } = oP(),
    [u, d] = React.useState(false),
    [f, h] = React.useState(true),
    [m, v] = React.useState(false),
    [x, k] = React.useState(false),
    [y, p] = React.useState(false);
  React.useEffect(() => {
    (document.body.className = `font-size-${a}`),
      (document.documentElement.dataset.fontSize = a);
  }, [a]),
    React.useEffect(() => {
      Capacitor.isNativePlatform() &&
        StatusBar.setStyle({
          style: StatusBarStyle.Light,
        }).catch(() => {});
    }, []),
    React.useEffect(() => {
      n || k(true);
    }, [n]),
    React.useEffect(() => {
      const C = setTimeout(() => {
        p(true);
      }, 2500);
      return () => clearTimeout(C);
    }, []),
    React.useEffect(() => {
      if (!x || !y) return;
      const C = setTimeout(() => v(true), 50),
        S = setTimeout(() => {
          Capacitor.isNativePlatform() &&
            CapSplashScreen.hide({
              fadeOutDuration: 300,
            }),
            h(false);
        }, 800);
      return () => {
        clearTimeout(C), clearTimeout(S);
      };
    }, [x, y]),
    React.useEffect(() => {
      if (!l) return;
      const C = setTimeout(() => d(true), 3500);
      return () => clearTimeout(C);
    }, [l]);
  const g = () => {
      d(false), c();
    },
    b = () => {
      d(false);
    };
  if (f && !Capacitor.isNativePlatform())
    return <SplashScreen isFadingOut={m} />;
  let j;
  return (
    t
      ? (j = <AppLayout />)
      : !e && !r && s
      ? (j = (
          <Onboarding
            onContinueWithoutAccount={() => {
              localStorage.setItem(B_, "local"), o("local");
            }}
          />
        ))
      : e
      ? (j = <MP />)
      : (j = <C_SP />),
    (
      <div id="app-container">
        {Capacitor.isNativePlatform() && <div className="statusBarFill" />}
        {j}
        <YX show={u} onInstall={g} onDismiss={b} />
      </div>
    )
  );
}
