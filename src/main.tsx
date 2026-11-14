// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import './styles/global.css';
import * as React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import * as ReactDOMClient from "react-dom/client";
import { Capacitor } from "@capacitor/core";
import { UIProvider } from "./context/UIContext";
import { UserProvider } from "./context/UserContext";
import { AuthProvider } from "./hooks/useAuth";
import { InstallProvider } from "./context/InstallContext";
import { ThemeProvider, applyThemeVars, readStoredThemeData } from "./context/ThemeContext";
import { PomodoroProvider } from "./context/PomodoroContext";
import { TasksProvider } from "./context/TasksContext";
import { App } from "./App";
import { Workbox } from "workbox-window";

if (Capacitor.isNativePlatform() && "serviceWorker" in navigator) {
  const e = !!navigator.serviceWorker.controller;
  Promise.all([
    navigator.serviceWorker
      .getRegistrations()
      .then((t) => Promise.all(t.map((n) => n.unregister()))),
    "caches" in window
      ? caches.keys().then((t) => Promise.all(t.map((n) => caches.delete(n))))
      : Promise.resolve([]),
  ])
    .then(() => {
      e && window.location.reload();
    })
    .catch(() => {});
}

// Aplica o tema salvo antes do primeiro render (evita piscar o tema padrão).
applyThemeVars(readStoredThemeData().activeThemeId);

const qT = document.getElementById("root");

if (!qT) throw new Error("Could not find root element to mount to");

if (!Capacitor.isNativePlatform() && "serviceWorker" in navigator) {
  const e = new Workbox("/sw.js");
  e.addEventListener("waiting", () => {
    e.messageSkipWaiting();
  }),
    e.addEventListener("controlling", (t) => {
      t.isUpdate && window.location.reload();
    }),
    e.register();
}

const ree = ReactDOMClient.createRoot(qT);

ree.render(
  <React.StrictMode>
    <InstallProvider>
      <UIProvider>
        <ThemeProvider>
          <AuthProvider>
            <UserProvider>
              <PomodoroProvider>
                <TasksProvider>
                  <App />
                </TasksProvider>
              </PomodoroProvider>
            </UserProvider>
          </AuthProvider>
        </ThemeProvider>
      </UIProvider>
    </InstallProvider>
  </React.StrictMode>
);
