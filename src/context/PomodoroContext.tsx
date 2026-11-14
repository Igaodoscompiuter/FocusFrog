// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import * as React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { Capacitor } from "@capacitor/core";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { G3, K3, U3 } from "../analytics";
import { useUser } from "./UserContext";
import { App as CapApp } from "@capacitor/app";
import { useTheme } from "./ThemeContext";
import { Di } from "../utils/effects";
import { JI, KI, YI, bm, gd, vc } from "../domain/frogRarity";
import { $i, Cm, ES, X_, _S, cO, dO, e1, uO, wO, xO } from "../notifications";
import { r1 } from "../domain/focusToday";
import { rr } from "../domain/mascotState";

const d1 = 25 * 60;

const MO = 5 * 60;

const LS = React.createContext(undefined);

/** Valores que mudam a cada segundo do timer. Ficam num context separado para
 *  que só quem mostra o relógio re-renderize a cada tick. */
const LT = React.createContext({
  timeRemaining: 0,
  sessionProgress: 0,
  cycleProgress: 0,
});

export const usePomodoro = () => {
  const e = React.useContext(LS);
  if (!e) throw new Error("usePomodoro must be used within a PomodoroProvider");
  return e;
};

export const usePomodoroTime = () => React.useContext(LT);

const LO = "MYSTERY";

const BO = 6e4;

const h1 = "focusfrog_tutorialFrogGiven";

const zO = "JUNGLE";

export const BS = 0.1;

const VO = 3 * 60 * 1e3;

function ou(e, t, n, s, r, o) {
  e === "focus" && n
    ? uO(
        "✅ Foco concluído!",
        s
          ? `Você terminou seu foco em "${s}". Toque pra ver como foi 🐸`
          : "Você terminou seu bloco de foco. Toque pra ver como foi 🐸",
        t
      )
    : e === "focus"
    ? X_(
        "☕ Hora da pausa",
        `Bom trabalho! Descanse ${Math.round(r / 60)} min.`,
        t
      )
    : X_(
        "🐸 Hora de voltar ao foco",
        `Hora do próximo bloco de ${Math.round(o / 60)} min.`,
        t
      );
}

export const PomodoroProvider = ({ children: e }) => {
  const { activeEffectId: t, isUnlocked: n } = useTheme(),
    { addFrogToCollection: s, collectedFrogs: r } = useUser(),
    [o, a] = useLocalStorage("focusfrog_pomodorosCompleted", 0),
    [l, c] = useLocalStorage("focusfrog_activeTaskId", null),
    [u, d] = useLocalStorage("focusfrog_activeTaskTitle", null),
    [f, h] = useLocalStorage("focusfrog_sessionEndsAt", null),
    [m, v] = React.useState(null),
    [x, k] = useLocalStorage("focusfrog_activeStepId", null),
    [y, p] = useLocalStorage("focusfrog_activeStepLabel", null),
    [g, b] = React.useState(""),
    [j, C] = useLocalStorage("focusfrog_pomodoroMode", null),
    [S, T] = useLocalStorage("focusfrog_sessionStatus", "idle"),
    [P, O] = React.useState(false),
    [V, U] = React.useState(d1),
    Vref = React.useRef(V),
    [E, K] = useLocalStorage("focusfrog_focusDuration", d1),
    [oe, ve] = useLocalStorage("focusfrog_breakDuration", MO),
    [Z, D] = useLocalStorage("focusfrog_totalCycles", 1),
    [q, G] = useLocalStorage("focusfrog_currentCycle", 1),
    [de, re] = useLocalStorage("focusfrog_totalSessionTime", 0),
    [X, Ie] = React.useState(0),
    [$e, Je] = React.useState(0),
    [z, F] = useLocalStorage("focusfrog_sessionFrog", null),
    J = React.useRef(null),
    pe = React.useRef(0),
    [We, Ct] = React.useState(null),
    H = React.useCallback(() => Ct(null), []),
    $ = React.useCallback(() => v(null), []),
    je = React.useCallback(
      (L) => {
        J.current && clearInterval(J.current),
          T("idle"),
          O(false),
          C(null),
          U(E),
          c(null),
          d(null),
          k(null),
          p(null),
          G(1),
          D(1),
          Ie(0),
          Je(0),
          F(null),
          h(null),
          L != null && L.finished ? dO() : e1();
      },
      [E, c, d, k, p, h, F, C, T, G, D]
    ),
    R = React.useCallback(() => {
      if (S === "idle") return 0;
      const L = (q - 1) * E,
        Ce = S === "focus" ? Math.max(0, E - Vref.current) : E;
      return (L + Ce) / 60;
    }, [S, q, E]),
    Ae = React.useCallback(() => {
      if (S === "idle") return;
      v({
        taskId: l,
        stepId: x,
        minutes: R(),
        natural: false,
      }),
        K3(R()),
        R() >= 10 && r1(R());
      const L = E > 0 ? Math.floor((R() * 60 + 1) / E) : 0;
      L >= 1 &&
        E >= 60 &&
        rr({
          type: "focus",
          focos: L,
        }).catch(() => {}),
        Di("end", n, t),
        je();
    }, [S, l, x, R, je, n, t, E]),
    Ye = Ae;
  React.useEffect(() => {
    if ((S === "focus" || S === "break") && !P) {
      const L = S === "focus" ? E : q % bm === 0 ? gd * 60 : oe,
        Ce = L - V,
        Tt = L > 0 ? Ce / L : 0;
      if ((Je(Math.min(Tt, 1)), S === "focus")) {
        const Ns = (q - 1) * E + (E - V),
          Ac = de > 0 ? Ns / de : 0;
        Ie(Math.min(Ac, 1));
      }
    }
  }, [V, S, P, q, E, oe, de]);
  const rt = React.useCallback(() => {
    if ((J.current && clearInterval(J.current), S === "focus")) {
      if ((a((L) => L + 1), j === "quick" || q >= Z)) {
        const L = (j === "quick" ? 1 : Z) * E * 1e3;
        if (l && z && !z.isCollected && L < BO)
          localStorage.getItem(h1) !== "1" &&
            r.length === 0 &&
            (localStorage.setItem(h1, "1"), s(zO));
        else if (l && z && !z.isCollected) {
          const Ce = L,
            Tt = JI(),
            vn = KI({
              minutes: Ce / 6e4,
              hour: new Date().getHours(),
              discovered: new Set(r),
              pity: Tt,
            }),
            Ns = vn.speciesId;
          (Cm() && Ce >= VO ? xO() : Promise.resolve(0)).then((Ko) => {
            Ko <= Ce * BS
              ? (YI(vn.pity),
                s(Ns, {
                  guaranteed: vn.guaranteed,
                  luck: vn.luck,
                }))
              : Ct({
                  speciesId: Ns,
                  distractedMs: Ko,
                  focusMs: Ce,
                });
          });
        }
        v({
          taskId: l,
          stepId: x,
          minutes: ((j === "quick" ? 1 : Z) * E) / 60,
          natural: true,
        }),
          r1(((j === "quick" ? 1 : Z) * E) / 60),
          E >= 60 &&
            rr({
              type: "focus",
              focos: j === "quick" ? 1 : Z,
            }).catch(() => {}),
          U3(
            Math.round(((j === "quick" ? 1 : Z) * E) / 60),
            (() => {
              try {
                return (
                  JSON.parse(
                    localStorage.getItem("focusfrog_frogTaskId") || "null"
                  ) === l
                );
              } catch {
                return false;
              }
            })()
          ),
          Di("end", n, t),
          je({
            finished: true,
          });
      } else {
        Di("break", n), T("break");
        const L = q % bm === 0 ? gd * 60 : oe;
        U(L);
        const Ce = Date.now() + L * 1e3;
        h(Ce), ou("break", Ce, false, u, L, E), $i(u || "Tarefa", "break", Ce);
      }
    } else if (S === "break") {
      Di("start", n),
        rr({
          type: "break",
        }).catch(() => {}),
        G((Ce) => Ce + 1),
        T("focus"),
        U(E);
      const L = Date.now() + E * 1e3;
      h(L), ou("focus", L, q + 1 >= Z, u, oe, E), $i(u || "Tarefa", "focus", L);
    }
    U(0);
  }, [j, S, l, x, u, oe, q, Z, E, n, a, je, s, r, z, h, t]);
  React.useEffect(() => {
    if (!(S === "idle" || P))
      return (
        (J.current = setInterval(() => {
          const L =
            f !== null ? Math.max(0, Math.round((f - Date.now()) / 1e3)) : null;
          if (L !== null && L <= 0) {
            rt();
            return;
          }
          (pe.current += 1),
            pe.current % 30 === 0 &&
              f !== null &&
              $i(u || "Tarefa", S === "break" ? "break" : "focus", f),
            U((Ce) => (L !== null ? L : Math.max(0, Ce - 1)));
        }, 1e3)),
        () => {
          J.current && clearInterval(J.current);
        }
      );
  }, [S, P, f, rt, u]),
    React.useEffect(() => {
      if (!Capacitor.isNativePlatform()) return;
      const L = CapApp.addListener("appStateChange", ({ isActive: Ce }) => {
        if (!Ce || S === "idle" || P || f === null) return;
        const Tt = Math.max(0, Math.round((f - Date.now()) / 1e3));
        Tt <= 0 ? rt() : U(Tt);
      });
      return () => {
        L.then((Ce) => Ce.remove());
      };
    }, [S, P, f, rt]);
  const us = React.useCallback(
      (L) => {
        je();
        const Ce = (L.focusMinutes || 25) * 60,
          Tt = (L.breakMinutes || vc) * 60,
          vn = (L.mode === "classic" && L.cycles) || 1;
        C(L.mode),
          c(L.taskId),
          d(L.taskTitle),
          k(L.stepId ?? null),
          p(L.stepLabel ?? null),
          K(Ce),
          ve(Tt),
          D(vn),
          U(Ce),
          re(Ce * vn),
          F({
            speciesId: LO,
            isCollected: false,
          }),
          G(1),
          T("focus"),
          O(false),
          Di("start", n);
        const Ns = Date.now() + Ce * 1e3;
        h(Ns),
          G3(Math.round((Ce * vn) / 60), L.mode, !!L.stepId),
          wO(),
          ES(Cm()),
          ou("focus", Ns, vn <= 1, L.taskTitle, Tt, Ce),
          $i(L.taskTitle, "focus", Ns);
      },
      [n, c, d, k, p, je, h, F, C, T, K, ve, D, G, re]
    ),
    Es = React.useCallback(
      (L) => {
        _S() ? us(L) : cO().finally(() => us(L));
      },
      [us]
    ),
    wi = React.useCallback(() => {
      S !== "idle" && (O(true), e1());
    }, [S]),
    bi = React.useCallback(() => {
      if (S !== "idle") {
        O(false);
        const L = Date.now() + Vref.current * 1e3;
        h(L),
          $i(u || "Tarefa", S === "focus" ? "focus" : "break", L),
          ou(
            S === "focus" ? "focus" : "break",
            L,
            j === "quick" || q >= Z,
            u,
            oe,
            E
          );
      }
    }, [S, u, j, q, Z, oe, E, h]),
    ki = React.useMemo(() => ({
      pomodorosCompleted: o,
      activeTaskId: l,
      sessionEndsAt: f,
      activeTaskTitle: u,
      scaredOutcome: We,
      clearScaredOutcome: H,
      mode: j,
      sessionStatus: S,
      isPaused: P,
      focusDuration: E,
      breakDuration: oe,
      totalCycles: Z,
      currentCycle: q,
      startPomodoro: Es,
      pauseCycle: wi,
      resumeCycle: bi,
      stopCycle: je,
      finishSession: Ae,
      completeTask: Ye,
      activeStepId: x,
      activeStepLabel: y,
      lastCompletedFocus: m,
      clearLastCompletedFocus: $,
      distractionNotes: g,
      setDistractionNotes: b,
      sessionFrog: z,
    }), [o, l, f, u, We, H, j, S, P, E, oe, Z, q, Es, wi, bi, je, Ae, Ye, x, y, m, $, g, b, z]),
    timeValue = React.useMemo(
      () => ({ timeRemaining: V, sessionProgress: X, cycleProgress: $e }),
      [V, X, $e]
    );
  Vref.current = V;
  return (
    <LS.Provider value={ki}>
      <LT.Provider value={timeValue}>{e}</LT.Provider>
    </LS.Provider>
  );
};
