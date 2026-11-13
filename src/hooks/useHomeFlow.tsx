// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import * as React from 'react';
import { Capacitor } from '@capacitor/core';
import { useUI } from '../context/UIContext';
import { FROG_PATTERNS, FROG_SPECIES } from '../data/frogs';
import { Lt } from '../constants';
import { App as CapApp } from '@capacitor/app';
import { lS } from '../domain/routinesLegacy';
import { Yt, hl } from '../utils/dates';
import { $n } from '../domain/frogRarity';
import { Sm, dh, km, si, ts, yS } from '../domain/taskKinds';
import { Em, Tm } from '../domain/focusToday';
import { Vo, ns } from '../domain/mascotStyle';
import { usePomodoro } from '../context/PomodoroContext';
import { JO, QO, XO, YO, jf } from '../widgets/widgetSync';
import { useTasks } from '../context/TasksContext';
import { mr } from './useMascot';
import { qa } from '../data/tips';

export const xd = "focusfrog:open-frog-picker";

export const C_sR = () => {
  const {
      tasks: e,
      frogTaskId: t,
      routines: n,
      handleAddRoutine: s,
      handleCompleteTask: r,
      handleToggleSubtask: o,
      handleCompleteAllSteps: a,
      openSteps: l,
      startTaskFocus: c
    } = useTasks(),
    {
      sessionStatus: u,
      activeTaskId: d,
      sessionEndsAt: f
    } = usePomodoro(),
    {
      handleNavigate: h
    } = useUI(),
    [m] = mr(),
    [v, x] = React.useState(Em),
    [k, y] = React.useState(ns);
  React.useEffect(() => {
    const g = () => y(ns());
    return window.addEventListener(Vo, g), () => window.removeEventListener(Vo, g);
  }, []), React.useEffect(() => {
    const g = () => x(Em());
    window.addEventListener(Tm, g);
    const b = setInterval(g, 10 * 6e4);
    return () => {
      window.removeEventListener(Tm, g), clearInterval(b);
    };
  }, []), React.useEffect(() => {
    const g = Yt(),
      b = FROG_SPECIES[(m == null ? undefined : m.speciesId) || ""] || FROG_SPECIES.JUNGLE || Object.values(FROG_SPECIES)[0],
      j = S => !!S && new Date(S).toDateString() === new Date().toDateString(),
      C = t ? e.find(S => S.id === t) : undefined;
    QO({
      name: (m == null ? undefined : m.name) || "Sapinho",
      speciesId: b.id,
      colors: b.stages.adult.colors,
      pattern: b.pattern,
      patternShapes: FROG_PATTERNS[b.pattern] || {},
      special: b.special,
      focusMinToday: v.date === g ? v.minutes : 0,
      goalMin: 50,
      sessionsToday: v.date === g ? v.sessions : 0,
      tasksDoneToday: e.filter(S => S.status === "done" && j(S.completedAt)).length,
      frogDone: !!C && C.status === "done" && j(C.completedAt),
      date: g,
      accessory: k.accessory,
      scene: k.scene,
      fliesBought: k.fliesBought,
      fireflyUntil: k.fireflyUntil,
      tips: qa.map(S => S.text)
    });
  }, [m, v, e, t, k]), React.useEffect(() => {
    const g = Yt(),
      b = t ? e.find(T => T.id === t) : undefined;
    if (!b) {
      jf({
        state: "none",
        date: g
      });
      return;
    }
    if (b.status === "done") {
      const T = !!b.completedAt && new Date(b.completedAt).toDateString() === new Date().toDateString();
      jf(T ? {
        state: "done",
        title: b.title,
        date: g
      } : {
        state: "none",
        date: g
      });
      return;
    }
    const j = b.subtasks || [],
      C = u === "focus" && d === b.id,
      S = si(b);
    jf({
      state: "active",
      id: b.id,
      title: b.title,
      badge: Sm(b),
      next: S ? `Próximo: ${S.text}` : yS(b) || "",
      cta: ts(b) ? S != null && S.minutes ? `Focar · ${S.minutes} min` : dh(b) : "",
      focusable: ts(b),
      steps: j.map(T => ({
        id: T.id,
        text: T.text,
        completed: !!T.completed,
        ...(T.minutes ? {
          minutes: T.minutes
        } : {})
      })),
      total: j.length,
      done: j.filter(T => T.completed).length,
      focusEndsAt: C ? f : null,
      date: g
    });
  }, [e, t, u, d, f]), React.useEffect(() => {
    const g = Yt();
    let b = {};
    try {
      b = JSON.parse(localStorage.getItem("focusfrog_routinesAddedOn") || "{}");
    } catch {}
    const j = n.filter(S => S.scheduledTime && lS(S, new Date().getDay()) && b[S.id] !== g).sort((S, T) => S.scheduledTime < T.scheduledTime ? -1 : 1).map(S => ({
        id: S.id,
        title: S.name,
        label: "Rotina · toque pra pôr no dia",
        kind: "routine",
        time: S.scheduledTime
      })),
      C = e.filter(S => S.dueDate && S.dueDate <= g && S.status !== "done").sort((S, T) => S.dueDate < T.dueDate ? -1 : S.dueDate > T.dueDate ? 1 : 0).map(S => {
        const T = hl(S.dueDate),
          P = km(S) === "complete" && !Lt(S);
        return {
          id: S.id,
          title: `${S.id === t ? "🐸 " : ""}${S.title}`,
          label: `${Sm(S)}${T ? ` · ${T}` : ""}`,
          kind: P ? "check" : "open"
        };
      });
    JO(g, [...j, ...C]);
  }, [e, n, t]);
  const p = React.useRef({
    tasks: e,
    routines: n,
    handleAddRoutine: s,
    handleCompleteTask: r,
    handleToggleSubtask: o,
    handleCompleteAllSteps: a,
    openSteps: l,
    handleNavigate: h,
    startTaskFocus: c,
    sessionStatus: u,
    activeTaskId: d
  });
  return p.current = {
    tasks: e,
    routines: n,
    handleAddRoutine: s,
    handleCompleteTask: r,
    handleToggleSubtask: o,
    handleCompleteAllSteps: a,
    openSteps: l,
    handleNavigate: h,
    startTaskFocus: c,
    sessionStatus: u,
    activeTaskId: d
  }, React.useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const g = async () => {
        const T = await YO(),
          {
            tasks: P,
            handleCompleteTask: O
          } = p.current;
        T.forEach(V => {
          const U = P.find(E => E.id === V);
          U && U.status !== "done" && km(U) === "complete" && O(V, "button");
        });
      },
      b = async () => {
        const T = await XO();
        if (!T) return;
        const {
            tasks: P,
            handleToggleSubtask: O,
            handleCompleteAllSteps: V,
            handleCompleteTask: U
          } = p.current,
          E = P.find(K => K.id === T.taskId);
        !E || E.status === "done" || (T.toggled.forEach(K => {
          var oe;
          (oe = E.subtasks) != null && oe.some(ve => ve.id === K) && O(E.id, K, {
            autoComplete: false
          });
        }), T.complete && setTimeout(() => {
          $n(E) ? V(E.id) : U(E.id, "button");
        }, 50));
      },
      j = T => {
        if (!T || !T.startsWith("focusfrog://open")) return;
        const P = new URL(T.replace("focusfrog://", "https://x/")).searchParams,
          O = P.get("go"),
          V = P.get("id"),
          {
            routines: U,
            handleAddRoutine: E,
            openSteps: K,
            handleNavigate: oe
          } = p.current;
        if (O === "task" && V) {
          oe("tasks"), setTimeout(() => K(V), 300);
          return;
        }
        if (O === "routine" && V) {
          const ve = U.find(Z => Z.id === V);
          oe("tasks"), ve && setTimeout(() => E(ve), 300);
          return;
        }
        if (O === "dump") {
          oe("tasks"), setTimeout(() => {
            var ve;
            return (ve = document.querySelector('input[aria-label="Anotar no despejo mental"]')) == null ? undefined : ve.focus();
          }, 450);
          return;
        }
        if (O === "focus") {
          oe("focus");
          return;
        }
        if (O === "focustask" && V) {
          const {
            sessionStatus: ve,
            activeTaskId: Z
          } = p.current;
          if (ve !== "idle" && Z === V) {
            oe("focus");
            return;
          }
          setTimeout(() => {
            p.current.startTaskFocus(V) || p.current.handleNavigate("dashboard");
          }, 300);
          return;
        }
        oe("dashboard"), O === "frog" && setTimeout(() => window.dispatchEvent(new Event(xd)), 350);
      };
    g(), b(), CapApp.getLaunchUrl().then(T => j(T == null ? undefined : T.url)).catch(() => {});
    const C = CapApp.addListener("appUrlOpen", ({
        url: T
      }) => j(T)),
      S = CapApp.addListener("appStateChange", ({
        isActive: T
      }) => {
        T && (g(), b());
      });
    return () => {
      C.then(T => T.remove()), S.then(T => T.remove());
    };
  }, []), null;
};
