// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import St from "./HomeScreen.module.css";
import * as React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { Capacitor } from "@capacitor/core";
import { useUI } from "../context/UIContext";
import { Lt } from "../constants";
import { useUser } from "../context/UserContext";
import { Icon } from "../components/Icon";
import { icons } from "../components/Icons";
import { useTheme } from "../context/ThemeContext";
import { $n } from "../domain/frogRarity";
import { dh, ts } from "../domain/taskKinds";
import { usePomodoro } from "../context/PomodoroContext";
import { KO } from "../widgets/widgetSync";
import { useTasks } from "../context/TasksContext";
import { xd } from "../hooks/useHomeFlow";
import { Ms } from "../components/ui/Sheet";
import { RoutineLibrary } from "../components/routines/RoutineLibrary";
import { useTour } from "../components/tour/TourContext";
import { OverdueSheet } from "../components/modals/OverdueSheet";
import { QuickCompleteModal } from "../components/modals/QuickCompleteModal";
import { LeavingHomeChecklist } from "../components/dashboard/LeavingHomeChecklist";
import { AgendaDeHoje } from "../components/dashboard/AgendaDeHoje";
import { RoutineSuggestion } from "../components/dashboard/RoutineSuggestion";
import { MascotHome } from "../components/mascot/MascotHome";

const X1 = [
  "Vamos fazer acontecer hoje?",
  "Que a força do sapo esteja com você.",
  "O dia só começa depois de um bom planejamento.",
  "Defina suas intenções e vá com tudo!",
  "Um pequeno passo hoje, um grande salto para seus objetivos.",
];

const ex = [
  "Mantenha o foco, você está quase lá!",
  "A tarde é perfeita para concluir tarefas importantes.",
  "Não desista agora, o sapo está esperando!",
  "Uma pausa para o café e de volta à produtividade!",
  "Continue o bom trabalho, seu futuro agradece.",
];

const tx = [
  "A noite é uma criança, planeje seu próximo dia.",
  "Descanse e recarregue, amanhã tem mais.",
  "Reflita sobre suas vitórias de hoje.",
  "Ainda dá tempo de planejar um amanhã incrível.",
  "Bom descanso, guerreiro do foco!",
];

const nx = () => {
  const e = new Date().getHours();
  return e < 12
    ? {
        text: "Bom dia",
        icon: icons.sun,
        gradient: "linear-gradient(140deg, #5D9CEC 0%, #3C6DB9 100%)",
        phrase: X1[Math.floor(Math.random() * X1.length)],
      }
    : e < 18
    ? {
        text: "Boa tarde",
        icon: icons.sun,
        gradient: "linear-gradient(140deg, #FFC837 0%, #FF8C00 100%)",
        phrase: ex[Math.floor(Math.random() * ex.length)],
      }
    : {
        text: "Boa noite",
        icon: icons.moon,
        gradient: "linear-gradient(140deg, #8A79F7 0%, #624EC2 100%)",
        phrase: tx[Math.floor(Math.random() * tx.length)],
      };
};

export const HomeScreen = () => {
  const { activeThemeId: e } = useTheme(),
    t = e === "dark-theme",
    {
      tasks: n,
      tags: s,
      frogTaskId: r,
      handleSetFrog: o,
      handleAddTask: a,
      handleUnsetFrog: l,
      handleToggleSubtask: c,
      handleCompleteTask: u,
      handleCompleteAllSteps: d,
      startTaskFocus: f,
      openSteps: h,
      leavingHomeItems: m,
      handleToggleLeavingHomeItem: v,
      handleAddLeavingHomeItem: x,
      handleRemoveLeavingHomeItem: k,
      handleResetLeavingHomeItems: y,
    } = useTasks(),
    {
      handleNavigate: p,
      addNotification: g,
      setQuickTaskForCompletion: b,
    } = useUI(),
    {
      activeTaskId: j,
      activeTaskTitle: C,
      sessionStatus: S,
      startPomodoro: T,
    } = usePomodoro(),
    { userName: P } = useUser(),
    [O, V] = React.useState(null),
    [U, E] = React.useState(""),
    { step: K, tourTaskId: oe } = useTour();
  React.useEffect(() => {
    (K == null ? undefined : K.id) === "create" &&
      E((R) => R || "Beber um copo de água 💧");
  }, [K == null ? undefined : K.id]);
  const ve = (K == null ? undefined : K.id) === "start",
    [Z, D] = React.useState(false);
  React.useEffect(() => {
    const R = () => D(true);
    return (
      window.addEventListener(xd, R), () => window.removeEventListener(xd, R)
    );
  }, []);
  const [q, G] = React.useState(null),
    [de, re] = React.useState(() => nx());
  React.useEffect(() => {
    const R = () => {
      document.visibilityState === "visible" && re(nx());
    };
    return (
      document.addEventListener("visibilitychange", R),
      () => {
        document.removeEventListener("visibilitychange", R);
      }
    );
  }, []);
  const X = React.useMemo(
      () => n.find((R) => R.id === r && R.status !== "done"),
      [n, r]
    ),
    Ie = React.useMemo(() => n.filter((R) => R.status !== "done"), [n]),
    $e = React.useMemo(() => {
      var R;
      return (
        ((R = X == null ? undefined : X.subtasks) == null
          ? undefined
          : R.filter((Ae) => !Ae.completed).length) ?? 0
      );
    }, [X]),
    Je = React.useMemo(() => {
      var R;
      return (
        (((R = X == null ? undefined : X.subtasks) == null
          ? undefined
          : R.length) ?? 0) > 0
      );
    }, [X]),
    z = Lt(X),
    F = React.useMemo(
      () => (X ? X.id === j && S !== "idle" : false),
      [X, j, S]
    ),
    J = (R) => {
      R.preventDefault(),
        U.trim() &&
          (a({
            title: U,
            quadrant: "inbox",
            pomodoroEstimate: 0,
            energyNeeded: "medium",
          }),
          E(""));
    },
    pe = () => {
      const R = q ?? ((K == null ? undefined : K.id) === "frog" ? oe : null);
      R &&
        (o(R), g("Sapo do Dia escolhido", "🐸", "success"), D(false), G(null));
    },
    We = () => {
      D(false), p("tasks");
    },
    Ct = () => {
      if (z) {
        window.open("https://www.instagram.com/focus.frog/", "_blank"),
          u(X.id, "instagram");
        return;
      }
      if (
        X &&
        !(
          S !== "idle" &&
          j !== X.id &&
          !window.confirm(
            `Você já tem um foco em andamento${
              C ? ` em "${C}"` : ""
            }. Trocar para "${X.title}" agora? O foco atual será interrompido.`
          )
        )
      ) {
        if (ve) {
          T({
            mode: "quick",
            taskId: X.id,
            taskTitle: X.title,
            cycles: 1,
            focusMinutes: 5 / 60,
          }),
            p("focus");
          return;
        }
        ts(X) ? f(X.id) : $n(X) ? h(X.id) : b(X);
      }
    },
    H = (R) => {
      var Ye;
      if (!X) return;
      if (
        (c(X.id, R, {
          autoComplete: false,
        }),
        ((Ye = X.subtasks) == null
          ? undefined
          : Ye.every((rt) => (rt.id === R ? !rt.completed : rt.completed))) &&
          !F &&
          !z)
      ) {
        const rt = X.id;
        g("Todos os passos do Sapo marcados", "🐸", "success", {
          label: "Concluir",
          onAction: () => d(rt),
        });
      }
    },
    $ = (R) => (
      <div
        key={R.id}
        className={`${St.frogSubtaskItem} ${R.completed ? St.completed : ""}`}
        onClick={() => X && H(R.id)}
      >
        <div className={St.frogSubtaskCheckbox} />
        <span>{R.text}</span>
        {!!R.minutes && (
          <small
            style={{
              marginLeft: "auto",
              color: "#8b5cf6",
              fontWeight: 700,
            }}
          >
            {"⏱ "}
            {R.minutes}
            {" min"}
          </small>
        )}
      </div>
    ),
    je = () =>
      z ? (
        "Visitar o Instagram 🐸"
      ) : F ? (
        <>
          <Icon path={icons.zap} />
          {" Focando no Sapo"}
        </>
      ) : X && ts(X) ? (
        <>
          <Icon path={icons.play} /> {dh(X)}
        </>
      ) : Je ? (
        $e === 1 ? (
          "Ver passos · falta 1"
        ) : (
          `Ver passos · faltam ${$e}`
        )
      ) : (
        "Comer o Sapo"
      );
  return (
    <div className={St.container}>
      {O && <RoutineLibrary taskToEdit={O} onClose={() => V(null)} tags={s} />}
      <QuickCompleteModal />
      <OverdueSheet
        isOpen={Z}
        onClose={() => D(false)}
        tasks={
          (K == null ? undefined : K.id) === "frog" && oe
            ? [
                ...Ie.filter((R) => R.id === oe),
                ...Ie.filter((R) => R.id !== oe),
              ]
            : Ie
        }
        selectedTask={
          q ?? ((K == null ? undefined : K.id) === "frog" ? oe : null)
        }
        onSelectTask={G}
        onConfirm={pe}
        onNavigateToTasks={We}
      />
      <div className={St.contentWrapper}>
        <div
          className={St.dashboardHeader}
          style={{
            background: t
              ? de.gradient
              : "linear-gradient(140deg, var(--primary-color) 0%, var(--primary-color-hover) 100%)",
          }}
        >
          <div className={St.greetingContent}>
            <img
              src="/icon-192.png"
              alt="FocusFrog App Icon"
              className={St.headerIcon}
            />
            <div>
              <h2>
                {de.text}
                {", "}
                {P || "Usuário"}!
              </h2>
              <p>{de.phrase}</p>
            </div>
          </div>
        </div>
        <form
          id="tutorial-step1-form"
          onSubmit={J}
          className={St.brainDumpForm}
        >
          <input
            type="text"
            placeholder="O que está na sua mente? (Despejo Mental)"
            value={U}
            onChange={(R) => E(R.target.value)}
          />
          <button type="submit" disabled={!U.trim()}>
            <Icon path={icons.plus} />
          </button>
        </form>
        <RoutineSuggestion />
        <MascotHome />
        <div
          id="frog-card"
          className={`${St.frogCard} ${X ? St.hasFrog : ""} ${
            F ? St.frogFocused : ""
          }`}
        >
          <div className={St.frogCardHeader}>
            <h3>
              <Icon path={icons.frog} />
              {" Sapo do Dia"}
            </h3>
            <div className={St.frogCardHeaderActions}>
              {Capacitor.isNativePlatform() && (
                <button
                  className={`btn btn-secondary btn-small ${St.iconButton}`}
                  title="Widget na tela inicial"
                  aria-label="Adicionar widget do Sapo do Dia"
                  onClick={async () => {
                    const { supported: R, reason: Ae } = await KO();
                    R ||
                      g(
                        Ae === "launcher_unsupported"
                          ? 'Sua tela inicial não aceita esse atalho: segure um espaço vazio dela e procure "FocusFrog" em Widgets.'
                          : "Não deu pra abrir o atalho do widget agora.",
                        "ℹ️",
                        "info"
                      );
                  }}
                >
                  <Icon path={icons.layoutGrid} />
                </button>
              )}
              {X && (
                <>
                  <button
                    className={`btn btn-secondary btn-small ${St.iconButton}`}
                    onClick={() => D(true)}
                  >
                    <Icon path={icons.pencil} />
                  </button>
                  <button
                    className={`btn btn-secondary btn-icon btn-small ${St.iconButton}`}
                    onClick={l}
                    title="Remover Sapo"
                    aria-label="Remover Sapo"
                  >
                    <Icon path={icons.close} />
                  </button>
                </>
              )}
            </div>
          </div>
          {X ? (
            <div>
              <div className={St.frogTitleCard}>
                <p className={St.frogTaskTitle}>{X.title}</p>
                {!z && <Ms task={X} />}
              </div>
              {Je && <div className={St.frogSubtasks}>{X.subtasks.map($)}</div>}
              <button
                id="eat-the-frog-button"
                className="btn btn-primary"
                style={{
                  width: "100%",
                }}
                onClick={Ct}
                disabled={F}
              >
                {je()}
              </button>
            </div>
          ) : (
            <div
              id="frog-card-empty-state"
              className={St.frogCardContentEmpty}
              onClick={() => D(true)}
            >
              <Icon path={icons.target} size={24} />
              <strong>Escolha seu Sapo</strong>
              <p>Selecione a tarefa que vai destravar seu dia</p>
            </div>
          )}
        </div>
        <LeavingHomeChecklist
          items={m}
          onToggleItem={v}
          onAddItem={x}
          onRemoveItem={k}
          onResetItems={y}
        />
        <AgendaDeHoje />
      </div>
    </div>
  );
};
