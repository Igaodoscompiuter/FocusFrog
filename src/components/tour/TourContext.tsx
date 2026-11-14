// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import * as React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { useUI } from "../../context/UIContext";
import { Lt } from "../../constants";
import { W3 } from "../../analytics";
import { usePomodoro } from "../../context/PomodoroContext";
import { useTasks } from "../../context/TasksContext";
import { WS } from "../routines/RoutineLibrary";

export const wd = [
  {
    id: "welcome",
    title: "Oi! Que bom te ver por aqui 🐸",
    text: 'Em 3 passos eu te mostro como sair do "não sei por onde começar" pro foco de verdade.',
    button: "Bora!",
  },
  {
    id: "create",
    target: "#tutorial-step1-form",
    title: "Passo 1 · Tira da cabeça",
    text: "Escreve aqui uma coisa que você precisa fazer hoje e toca no +. Pode ser pequena!",
  },
  {
    id: "frog",
    target: "#frog-card",
    title: "Passo 2 · Escolhe seu Sapo do Dia",
    text: "O Sapo do Dia é a tarefa que mais importa hoje. Toca aqui e escolhe a tarefa que você acabou de criar (ela já vem marcada).",
  },
  {
    id: "start",
    target: "#eat-the-frog-button",
    title: "Passo 3 · Come o sapo!",
    text: 'Toca em "Comer o Sapo". Esse primeiro foco dura só 5 segundos, pra você ver o sapo nascer.',
  },
  {
    id: "focusing",
    target: '[class*="timerContainer"]',
    title: "Olha ele crescendo 👀",
    text: "Enquanto o cronômetro roda, um sapinho cresce com você. Esse é rapidinho, só pra mostrar.",
  },
  {
    id: "done",
    title: "Pronto, você pegou o jeito! 🎉",
    text: "Cada foco concluído traz um sapo novo pro seu Jardim Zen, na aba Jardim. Os próximos focos são de verdade: 25 minutos.",
    button: "Continuar",
  },
  {
    id: "gift",
    target: "#eat-the-frog-button",
    title: "Uma última coisa",
    text: "Deixei o Card Especial FocusFrog como seu Sapo do Dia. Toca aqui pra seguir a gente no Instagram: tem dica de foco e novidade toda semana!",
    button: "Concluir",
  },
];

const HS = React.createContext(null);

export const useTour = () => {
  const e = React.useContext(HS);
  if (!e) throw new Error("useTour precisa estar dentro de <TourProvider>");
  return e;
};

const Af = (e) => {
  try {
    const t = JSON.parse(localStorage.getItem(e) || "[]");
    return Array.isArray(t) ? t : [];
  } catch {
    return [];
  }
};

const HD = () =>
  Af("focusfrog_tasks").some((e) => !Lt(e)) ||
  Af("focusfrog_collectedFrogs").length > 0 ||
  Af("focusfrog_routines").some((e) => !(e != null && e.isDefault)) ||
  Number(localStorage.getItem("focusfrog_pomodorosCompleted")) > 0;

const GD = () => {
  try {
    const e = localStorage.getItem(WS);
    if (e) return JSON.parse(e);
  } catch {}
  return HD()
    ? {
        done: true,
        step: 0,
      }
    : {
        done: false,
        step: 0,
      };
};

export const TourProvider = ({ children: e }) => {
  const [t, n] = React.useState(GD),
    {
      tasks: s,
      frogTaskId: r,
      ensureMarketingFrog: o,
      handleSetFrog: a,
      handleCreateTemplate: l,
      taskTemplates: c,
    } = useTasks(),
    { sessionStatus: u } = usePomodoro(),
    { handleNavigate: d } = useUI();
  React.useEffect(() => {
    localStorage.setItem(WS, JSON.stringify(t));
  }, [t]);
  const f = !t.done,
    h = t.step,
    m = f ? wd[h] ?? null : null,
    v = React.useCallback(() => {
      var C;
      W3();
      const b = s.find((S) => S.id === t.taskId),
        j =
          (C = b == null ? undefined : b.title) == null ? undefined : C.trim();
      j &&
        !c.some((S) => S.title === j) &&
        l(
          {
            title: j,
            quadrant: "do",
            pomodoroEstimate: 0,
          },
          "Saúde"
        ),
        n({
          done: true,
          step: 0,
        });
    }, [s, t.taskId, c, l]),
    x = React.useCallback(
      (b) => {
        if (b >= wd.length) {
          v();
          return;
        }
        n((j) => ({
          ...j,
          done: false,
          step: b,
        }));
      },
      [v]
    ),
    k = React.useCallback(() => x(h + 1), [x, h]),
    y = React.useCallback(
      () =>
        n({
          done: true,
          step: 0,
        }),
      []
    ),
    p = React.useCallback(() => {
      d("dashboard"),
        n({
          done: false,
          step: 0,
        });
    }, [d]),
    g = React.useRef(new Set(s.map((b) => b.id)));
  return (
    React.useEffect(() => {
      (m == null ? undefined : m.id) === "create" &&
        (g.current = new Set(s.map((b) => b.id)));
    }, [m == null ? undefined : m.id]),
    React.useEffect(() => {
      if (!f) return;
      const b =
        (m == null ? undefined : m.id) === "create"
          ? s.find((j) => !g.current.has(j.id))
          : undefined;
      b
        ? n((j) => ({
            ...j,
            step: j.step + 1,
            taskId: b.id,
          }))
        : (((m == null ? undefined : m.id) === "frog" &&
            r &&
            !Lt(s.find((j) => j.id === r)) &&
            s.some((j) => j.id === r && j.status !== "done")) ||
            ((m == null ? undefined : m.id) === "start" && u !== "idle") ||
            ((m == null ? undefined : m.id) === "focusing" && u === "idle")) &&
          k();
    }, [f, m == null ? undefined : m.id, s, r, u, k]),
    React.useEffect(() => {
      f &&
        m &&
        ["create", "frog", "start", "gift"].includes(m.id) &&
        d("dashboard"),
        f &&
          (m == null ? undefined : m.id) === "frog" &&
          Lt(s.find((b) => b.id === r)) &&
          a(null),
        f && (m == null ? undefined : m.id) === "gift" && o();
    }, [f, m == null ? undefined : m.id]),
    (
      <HS.Provider
        value={{
          active: f,
          step: m,
          stepIndex: h,
          tourTaskId: t.taskId ?? null,
          next: k,
          skip: y,
          restart: p,
        }}
      >
        {e}
      </HS.Provider>
    )
  );
};
