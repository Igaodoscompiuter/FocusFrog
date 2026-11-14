// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import * as React from "react";
import { useShallowStable } from "../utils/useShallowStable";
import * as jsxRuntime from "react/jsx-runtime";
import { useLocalStorage } from "../hooks/useLocalStorage";

export const Co = {
  maxVisible: 2,
  minForClearAll: 2,
  duration: {
    info: 3200,
    success: 3200,
    victory: 4200,
    error: 5e3,
  },
  actionableDuration: 5500,
  fastDuration: 1800,
  fastThreshold: 3,
};

const Gn = {
  context: null,
  effectsGain: null,
};

const R_ = () => {
  if (typeof window < "u" && !Gn.context)
    try {
      const e = window.AudioContext || window.webkitAudioContext;
      (Gn.context = new e()),
        (Gn.effectsGain = Gn.context.createGain()),
        (Gn.effectsGain.gain.value = 0.4),
        Gn.effectsGain.connect(Gn.context.destination);
    } catch (e) {
      console.error("Failed to initialize AudioContext:", e);
    }
};

const w3 = (e) => (t, n) => {
  let s;
  switch (n.type) {
    case "ADD_TO_VISIBLE":
      s = {
        ...t,
        visible: [...t.visible, n.payload],
      };
      break;
    case "ADD_TO_QUEUE":
      s = {
        ...t,
        queue: [...t.queue, n.payload],
      };
      break;
    case "REMOVE":
      s = {
        ...t,
        visible: t.visible.filter((r) => r.id !== n.payload.id),
      };
      break;
    case "PROMOTE":
      if (t.visible.length < e.maxVisible && t.queue.length > 0) {
        const [r, ...o] = t.queue;
        s = {
          ...t,
          visible: [...t.visible, r],
          queue: o,
        };
      } else s = t;
      break;
    case "CLEAR_ALL":
      return {
        visible: [],
        queue: [],
        showClearAll: false,
      };
    default:
      return t;
  }
  return (
    (s.showClearAll = s.visible.length + s.queue.length >= e.minForClearAll), s
  );
};

const U2 = React.createContext(undefined);

export const useUI = () => {
  const e = React.useContext(U2);
  if (!e) throw new Error("useUI must be used within a UIProvider");
  return e;
};

export const UIProvider = ({ children: e }) => {
  React.useEffect(() => R_(), []);
  const [t, n] = React.useState("dashboard"),
    [s, r] = React.useState(null),
    [o, a] = React.useState(null),
    [l, c] = React.useState(false),
    [u, d] = React.useState(false),
    [f, h] = React.useState(null),
    [m, v] = useLocalStorage("focusfrog_haptics_enabled", true),
    [x, k] = useLocalStorage("focusfrog_sound_enabled", true),
    [y, p] = useLocalStorage("focusfrog_fontsize", "normal"),
    [g, b] = useLocalStorage("focusfrog_dev_mode", false),
    j = w3(Co),
    [C, S] = React.useReducer(j, {
      visible: [],
      queue: [],
      showClearAll: false,
    }),
    T = React.useCallback(
      (D) => {
        x && Gn.context && Gn.effectsGain
          ? D.generator(Gn.context, Gn.effectsGain)
          : x && console.warn("PlayEffect called, but audio engine not ready.");
      },
      [x]
    ),
    P = React.useCallback(() => {
      R_();
      const D = Gn.context;
      if (!D) {
        console.error(
          "Cannot toggle sound, AudioContext failed to initialize."
        );
        return;
      }
      D.state === "suspended"
        ? D.resume().then(() => {
            k((q) => !q);
          })
        : k((q) => !q);
    }, [k]),
    O = React.useCallback(
      (D, q, G = "info", de) => {
        const re = {
            id: Date.now() + Math.random(),
            message: D,
            icon: q,
            category: G,
            action: de,
          },
          X = [...C.visible, ...C.queue];
        (!de && X.some((Ie) => Ie.message === D && !Ie.action)) ||
          (C.visible.length < Co.maxVisible
            ? S({
                type: "ADD_TO_VISIBLE",
                payload: re,
              })
            : S({
                type: "ADD_TO_QUEUE",
                payload: re,
              }),
          m && navigator.vibrate && navigator.vibrate(50));
      },
      [C.visible, C.queue, m]
    ),
    V = React.useCallback((D) => {
      S({
        type: "REMOVE",
        payload: {
          id: D,
        },
      });
    }, []),
    U = React.useCallback(() => {
      S({
        type: "PROMOTE",
      });
    }, []),
    E = React.useCallback(() => {
      S({
        type: "CLEAR_ALL",
      }),
        m && navigator.vibrate && navigator.vibrate(20);
    }, [m]),
    K = (D) => {
      t === "focus" && D !== "focus" && c(false),
        n(D),
        m && navigator.vibrate && navigator.vibrate(5);
    },
    oe = () => d(true),
    ve = () => d(false),
    Z = {
      activeScreen: t,
      handleNavigate: K,
      taskInFocus: s,
      setTaskInFocus: r,
      subtaskInFocusId: o,
      setSubtaskInFocusId: a,
      quickTaskForCompletion: f,
      setQuickTaskForCompletion: h,
      notifications: C.visible,
      queueCount: C.queue.length,
      showClearAllButton: C.showClearAll,
      addNotification: O,
      removeNotification: V,
      promoteNotification: U,
      clearAllNotifications: E,
      soundEnabled: x,
      toggleSoundEnabled: P,
      playEffect: T,
      hapticsEnabled: m,
      setHapticsEnabled: v,
      isImmersiveMode: l,
      setIsImmersiveMode: c,
      isPWAInstallPopupVisible: u,
      showPWAInstallPopup: oe,
      hidePWAInstallPopup: ve,
      fontSize: y,
      setFontSize: p,
      devModeEnabled: g,
      setDevModeEnabled: b,
    };
  const stableValue = useShallowStable(Z);
  return <U2.Provider value={stableValue}>{e}</U2.Provider>;
};
