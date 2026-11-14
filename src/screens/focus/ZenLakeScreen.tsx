// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import Me from "./ZenLakeScreen.module.css";
import * as React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { Capacitor } from "@capacitor/core";
import { useUI } from "../../context/UIContext";
import { App as CapApp } from "@capacitor/app";
import { Icon } from "../../components/Icon";
import { icons } from "../../components/Icons";
import { useTheme } from "../../context/ThemeContext";
import { fl } from "../../data/ambientSounds";
import { kn } from "../../domain/taskKinds";
import { usePomodoro, usePomodoroTime } from "../../context/PomodoroContext";
import { useTasks } from "../../context/TasksContext";
import { useMascot } from "../../hooks/useMascot";
import { C_oi, Ms } from "../../components/ui/Sheet";
import { IdleFocusScreen } from "./IdleFocusScreen";
import { Ed, Lj, Mj } from "../../utils/focusMute";
import { AnimatePresence, motion } from "framer-motion";
import { $d, C_rH, C_sH } from "../../components/FocusFrogLifeCycle";
import { CG, FrogSprite } from "../../components/zen/FrogSprite";

const ZenLakeScreen = () => {
  const [e] = React.useState(() => $d[Math.floor(Math.random() * $d.length)]),
    [t] = useMascot(),
    [n, s] = React.useState(0);
  React.useEffect(() => {
    let E;
    const K = () => {
      E = setTimeout(() => {
        s((oe) => oe + 1), K();
      }, 8e3 + Math.random() * 8e3);
    };
    return K(), () => clearTimeout(E);
  }, []);
  const {
      sessionStatus: r,
      activeTaskTitle: o,
      isPaused: l,
      resumeCycle: c,
      pauseCycle: u,
      finishSession: d,
      activeTaskId: f,
      activeStepId: h,
      sessionFrog: x,
    } = usePomodoro(),
    { timeRemaining: a, cycleProgress: m, sessionProgress: v } = usePomodoroTime(),
    { activeSoundId: k } = useTheme(),
    { soundEnabled: y } = useUI(),
    p =
      y &&
      !!fl.find((E) => E.id === k && E.id !== "none" && E.ready) &&
      r === "focus",
    [g, b] = React.useState(Ed);
  React.useEffect(() => Lj(() => b(Ed())), []);
  const { tasks: j, handleToggleSubtask: C } = useTasks(),
    S = f ? j.find((E) => E.id === f) : undefined,
    T = (S == null ? undefined : S.subtasks) || [],
    P = S ? kn(S) : null,
    O = h ? T.find((E) => E.id === h) : undefined,
    [V, U] = React.useState(true);
  return (
    <motion.main
      className={`${Me.lakeScreen} ${Me[r]}`}
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      transition={{
        duration: 1,
      }}
    >
      <div className={Me.focusPanel}>
        <div className={Me.taskCard}>
          {r === "focus" ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={o || "no-task"}
                className={Me.taskContent}
                initial={{
                  opacity: 0,
                  y: -10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: 10,
                }}
                transition={{
                  duration: 0.3,
                }}
              >
                <span className={Me.taskLabel}>FOCANDO EM:</span>
                <span className={Me.taskTitleText}>{o || "Sessão Livre"}</span>
                {O && (
                  <span className={Me.stepNow}>
                    {"Passo "}
                    {T.indexOf(O) + 1}
                    {" de "}
                    {T.length}
                    {" · "}
                    {O.text}
                  </span>
                )}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className={Me.breakMessage}>Pausa para recarregar.</div>
          )}
          {S && T.length > 0 && (P === "bloco" || P === "trilha") && (
            <div className={Me.stepsPanel}>
              <button
                className={Me.stepsToggle}
                onClick={() => U((E) => !E)}
                aria-expanded={V}
              >
                <Ms task={S} />
                <span>
                  {P === "bloco" ? "Passos · marque durante o foco" : "Trilha"}
                </span>
                <span aria-hidden="true">{V ? "▴" : "▾"}</span>
              </button>
              {V &&
                T.map((E) => (
                  <button
                    key={E.id}
                    className={`${Me.stepItem} ${
                      E.id === h ? Me.stepItemNow : ""
                    }`}
                    disabled={P !== "bloco"}
                    onClick={() =>
                      C(S.id, E.id, {
                        autoComplete: false,
                      })
                    }
                  >
                    <span
                      className={`${Me.stepBox} ${
                        E.completed ? Me.stepBoxOn : ""
                      }`}
                    >
                      {E.completed && <C_oi />}
                    </span>
                    <span className={E.completed ? Me.stepDone : ""}>
                      {E.text}
                    </span>
                    <small>{E.minutes ? `${E.minutes} min` : "rápido"}</small>
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>
      <div className={Me.stage}>
        <div className={Me.timerContainer}>
          <C_rH progress={m} />
          <C_sH progress={v} speciesId={x == null ? undefined : x.speciesId} />
          <div className={Me.timerContentContainer}>
            <div className={Me.timerDisplay}>{CG(a)}</div>
          </div>
        </div>
        <div className={Me.controlsZone}>
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              delay: 0.4,
            }}
          >
            <button
              className={Me.secondaryActionButton}
              onClick={d}
              aria-label="Parar Sessão"
            >
              <Icon path={icons.square} />
            </button>
          </motion.div>
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.5,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              delay: 0.2,
            }}
          >
            {l ? (
              <button
                className={`${Me.mainActionButton} ${Me.play}`}
                onClick={c}
                aria-label="Continuar ciclo"
              >
                <Icon path={icons.play} />
              </button>
            ) : (
              <button
                className={Me.mainActionButton}
                onClick={u}
                aria-label="Pausar ciclo"
              >
                <Icon path={icons.pause} />
              </button>
            )}
          </motion.div>
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              delay: 0.4,
            }}
          >
            {l && r === "focus" && o ? (
              <button
                className={Me.secondaryActionButton}
                onClick={d}
                aria-label="Terminei"
              >
                <Icon path={icons.checkCircle} />
              </button>
            ) : p ? (
              <button
                className={`${Me.secondaryActionButton} ${g ? Me.mutedOn : ""}`}
                onClick={() => Mj(!g)}
                aria-label={
                  g ? "Ligar o som de fundo" : "Silenciar o som de fundo"
                }
                aria-pressed={g}
              >
                <Icon path={g ? icons.volumeX : icons.volume2} />
              </button>
            ) : (
              <div className={Me.placeholder} />
            )}
          </motion.div>
        </div>
      </div>
      <motion.div
        className={Me.frogTip}
        initial={{
          opacity: 0,
          y: 12,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.6,
        }}
      >
        <div className={Me.frogTipAvatar} onClick={() => s((E) => E + 1)}>
          <FrogSprite
            speciesId={(t == null ? undefined : t.speciesId) || "JUNGLE"}
            stage="adult"
            size={58}
            clickable={false}
            top={0}
            left={n}
          />
        </div>
        <p className={Me.frogTipBubble}>
          {t && <span className={Me.frogTipName}>{t.name}</span>}
          {e}
        </p>
      </motion.div>
    </motion.main>
  );
};

export const EG = () => {
  const { sessionStatus: e, startPomodoro: t } = usePomodoro(),
    n = (s) => {
      t({
        taskId: null,
        ...s,
      });
    };
  return e === "idle" ? <IdleFocusScreen onStart={n} /> : <ZenLakeScreen />;
};

export const NG = "https://focusfrog.netlify.app/update.json";

export const Aw = "focusfrog_update_lastCheck";

export const CT = "focusfrog_update_snooze";

export const AG = 60 * 60 * 1e3;

export const PG = 3 * 24 * 60 * 60 * 1e3;

export async function TT() {
  if (!Capacitor.isNativePlatform()) return null;
  try {
    const e = await CapApp.getInfo();
    return {
      versionCode: parseInt(e.build, 10) || 0,
      versionName: e.version,
    };
  } catch {
    return null;
  }
}
