// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import we from "./TasksScreen.module.css";
import * as React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { Lt } from "../constants";
import { Icon } from "../components/Icon";
import { icons } from "../components/Icons";
import { todayISO } from "../utils/dates";
import { $n, md, wm } from "../domain/frogRarity";
import { dh, ts } from "../domain/taskKinds";
import { usePomodoro } from "../context/PomodoroContext";
import { useTasks } from "../context/TasksContext";
import { C_oi, Ms } from "../components/ui/Sheet";
import { TaskCard } from "../components/tasks/TaskCard";
import { TriageSheet } from "../components/tasks/TriageSheet";
import { TaskSheet } from "../components/tasks/TaskSheet";

const lu = 40;

const zf = [
  {
    id: "do",
    name: "Fazer agora",
    sub: "Urgente e importante",
    icon: "zap",
    empty: "Nada pegando fogo. Respira, que tá tudo sob controle.",
  },
  {
    id: "schedule",
    name: "Planejar",
    sub: "Importante, sem pressa",
    icon: "calendar",
    empty: "Nada aqui. Escolhe um dia pra algo que importa?",
  },
  {
    id: "someday",
    name: "Ideias",
    sub: "Algum dia, sem culpa",
    icon: "bookOpen",
    empty: "Sem ideias guardadas por enquanto.",
  },
];

const Vf = ({ size: e = 26 }) => (
  <svg width={e} height={e} viewBox="0 0 100 100" aria-hidden="true">
    <ellipse cx="28" cy="75" rx="12" ry="10" fill="#2E7D32" />
    <ellipse cx="72" cy="75" rx="12" ry="10" fill="#2E7D32" />
    <ellipse cx="50" cy="60" rx="30" ry="25" fill="#2E7D32" />
    <ellipse cx="50" cy="65" rx="20" ry="18" fill="#AED581" opacity="0.8" />
    <circle cx="40" cy="45" r="10" fill="#fff" />
    <circle cx="60" cy="45" r="10" fill="#fff" />
    <circle cx="40" cy="45" r="5" fill="#000" />
    <circle cx="60" cy="45" r="5" fill="#000" />
  </svg>
);

export const TasksScreen = () => {
  const {
      tasks: e,
      tags: t,
      frogTaskId: n,
      handleAddTask: s,
      handleAddRoutine: r,
      handleAddTemplates: o,
      isTriageActive: a,
      triageQueue: l,
      startTriage: c,
      endTriage: u,
      processTriage: d,
      processTriageDone: f,
      handleToggleSubtask: h,
      handleCompleteTask: m,
      startTaskFocus: v,
      openSteps: x,
      openTaskEditor: k,
      handleReopenTask: y,
    } = useTasks(),
    { activeTaskId: p, sessionStatus: g } = usePomodoro(),
    [b, j] = useLocalStorage("focusfrog_tasksQuad", "do"),
    [C, S] = React.useState({}),
    [T, P] = React.useState(false),
    [O, V] = React.useState(""),
    [U, E] = React.useState(false),
    [K, oe] = React.useState(false),
    [ve, Z] = React.useState(false),
    [D, q] = React.useState(0),
    G = todayISO(),
    de = React.useMemo(() => e.filter((L) => L.status !== "done"), [e]),
    re = de.find((L) => L.id === n),
    X = React.useMemo(
      () =>
        e
          .filter(
            (L) =>
              L.status === "done" &&
              L.completedAt &&
              L.completedAt.slice(0, 10) === G
          )
          .sort((L, Ce) => (Ce.completedAt > L.completedAt ? 1 : -1)),
      [e, G]
    ),
    Ie = de.filter((L) => L.quadrant === "do" || (L.dueDate && L.dueDate <= G)),
    $e = X.length + Ie.length,
    Je = Object.values(C).some(Boolean),
    z = (L) => {
      if ((C.prazo && !L.dueDate) || (C.rapidas && wm(L))) return false;
      const Ce = Object.keys(C)
        .filter((Tt) => C[Tt] && Tt.startsWith("tag:"))
        .map((Tt) => Number(Tt.slice(4)));
      return !(Ce.length && !(L.tagId && Ce.includes(L.tagId)));
    },
    F = de.filter(
      (L) =>
        L.quadrant === "inbox" ||
        !["do", "schedule", "someday"].includes(L.quadrant)
    ),
    J = (L) =>
      de
        .filter((Ce) => Ce.quadrant === L && Ce.id !== n && z(Ce))
        .sort((Ce, Tt) =>
          (Ce.dueDate || "9999") < (Tt.dueDate || "9999")
            ? -1
            : (Ce.dueDate || "9999") > (Tt.dueDate || "9999")
            ? 1
            : Ce.displayOrder - Tt.displayOrder
        ),
    pe = zf.find((L) => L.id === b) || zf[0],
    [We, Ct] = React.useState(lu);
  React.useEffect(() => {
    Ct(lu);
  }, [b]);
  const H = J(pe.id),
    $ = () => {
      const L = O.trim();
      L &&
        (s({
          title: L,
          quadrant: "inbox",
          pomodoroEstimate: 0,
          energyNeeded: "medium",
        }),
        V(""));
    },
    je = () => {
      q(F.length), c();
    },
    R = [
      {
        key: "prazo",
        label: "Com prazo",
      },
      {
        key: "rapidas",
        label: "Rápidas",
      },
      ...t.map((L) => ({
        key: `tag:${L.id}`,
        label: L.name,
        color: L.color,
      })),
    ],
    Ae = $e ? Math.round((X.length / $e) * 360) : 0,
    Ye = new Date()
      .toLocaleDateString("pt-BR", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
      .replace(/\./g, "")
      .replace(/ de /g, " "),
    rt = Ye.charAt(0).toUpperCase() + Ye.slice(1),
    us = re && p === re.id && g !== "idle",
    Es = Lt(re),
    wi = () => {
      if (re) {
        if (Es) {
          window.open("https://www.instagram.com/focus.frog/", "_blank"),
            m(re.id, "instagram");
          return;
        }
        ts(re) ? v(re.id) : $n(re) ? x(re.id) : m(re.id, "button");
      }
    },
    bi = re
      ? Es
        ? "Visitar o Instagram 🐸"
        : us
        ? "Focando no sapo"
        : ts(re)
        ? dh(re)
        : $n(re)
        ? "Ver passos"
        : "Engolir o sapo"
      : "",
    ki = D ? D - l.length + 1 : 1;
  return (
    <main className={we.screen}>
      {a && l.length > 0 && (
        <TriageSheet
          task={l[0]}
          onClose={u}
          onTriage={(L) => d(L)}
          onDone={f}
          position={{
            index: Math.min(ki, D || l.length),
            total: D || l.length,
          }}
        />
      )}
      {ve && (
        <TaskSheet
          onAddRoutine={r}
          onAddTemplates={o}
          onClose={() => Z(false)}
        />
      )}
      <header className={we.header}>
        <div
          className={we.ring}
          style={{
            background: `conic-gradient(var(--success-color) ${Ae}deg, var(--background-color-light) 0)`,
          }}
          role="img"
          aria-label={`${X.length} de ${$e} tarefas do dia feitas`}
        >
          <span className={we.ringInner}>
            <Vf />
          </span>
        </div>
        <div className={we.headText}>
          <h1>Tarefas</h1>
          <span>
            {rt}
            {" ·"}{" "}
            <strong>
              {X.length}/{$e}
            </strong>{" "}
            do dia
          </span>
        </div>
        <button className={we.headBtn} onClick={() => Z(true)}>
          <Icon path={icons.rotateCw} />
          {" Rotinas"}
        </button>
        <button
          className={we.iconBtn}
          onClick={() => P((L) => !L)}
          aria-label="Filtros"
          aria-expanded={T}
        >
          <Icon path={icons.filter} />
          {Je && <span className={we.dot} />}
        </button>
      </header>
      {T && (
        <div className={we.filters}>
          {R.map((L) => (
            <button
              key={L.key}
              className={`${we.chip} ${C[L.key] ? we.chipOn : ""}`}
              onClick={() =>
                S((Ce) => ({
                  ...Ce,
                  [L.key]: !Ce[L.key],
                }))
              }
            >
              {L.color && (
                <span
                  className={we.chipDot}
                  style={{
                    background: L.color,
                  }}
                />
              )}
              {L.label}
            </button>
          ))}
          {Je && (
            <button className={we.clear} onClick={() => S({})}>
              Limpar filtros
            </button>
          )}
        </div>
      )}
      <section className={we.dump} aria-label="Despejo mental">
        <div className={we.dumpHead}>
          <div>
            <h2>Despejo mental</h2>
            <span>
              {F.length
                ? `${F.length} ${
                    F.length === 1
                      ? "coisa solta esperando"
                      : "coisas soltas esperando"
                  } um lugar`
                : "Anote sem pensar. Organize depois."}
            </span>
          </div>
          {F.length > 0 && (
            <button className={we.organize} onClick={je}>
              Organizar
            </button>
          )}
        </div>
        <form
          className={we.dumpInput}
          onSubmit={(L) => {
            L.preventDefault(), $();
          }}
        >
          <input
            value={O}
            onChange={(L) => V(L.target.value)}
            placeholder="O que tá na sua cabeça?"
            aria-label="Anotar no despejo mental"
          />
          <button type="submit" disabled={!O.trim()}>
            Anotar
          </button>
        </form>
        {(U ? F : F.slice(0, 3)).map((L) => (
          <TaskCard key={L.id} task={L} tags={t} quadrant="inbox" compact />
        ))}
        {F.length > 3 && (
          <button className={we.more} onClick={() => E((L) => !L)}>
            {U ? "Mostrar menos" : `Ver mais ${F.length - 3}`}
          </button>
        )}
        {F.length > 0 && (
          <span className={we.tip}>
            Deslize pra direita: vitória rápida · pra esquerda: excluir
          </span>
        )}
      </section>
      {re ? (
        <section className={we.frog} aria-label="Sapo do dia">
          <div className={we.frogTop}>
            <Vf size={38} />
            <div className={we.frogText}>
              <span className={we.kicker}>Sapo do dia</span>
              <button className={we.frogTitle} onClick={() => !Es && k(re)}>
                {re.title}
              </button>
              {!Es && (
                <span>
                  <Ms task={re} />
                </span>
              )}
            </div>
          </div>
          {(re.subtasks || []).length > 0 && (
            <div className={we.frogSteps}>
              {re.subtasks.map((L) => (
                <button
                  key={L.id}
                  onClick={() => h(re.id, L.id)}
                  className={we.frogStep}
                >
                  <span className={`${we.box} ${L.completed ? we.boxOn : ""}`}>
                    {L.completed && <C_oi />}
                  </span>
                  <span className={L.completed ? we.stepDone : ""}>
                    {L.text}
                  </span>
                  {!!L.minutes && (
                    <small>
                      {"⏱ "}
                      {L.minutes}
                      {" min"}
                    </small>
                  )}
                </button>
              ))}
            </div>
          )}
          <button className={we.frogCta} onClick={wi} disabled={!!us}>
            {!Es && ts(re) && <Icon path={icons.play} />}
            {bi}
          </button>
          {!Es && (
            <span className={we.tip}>
              {ts(re)
                ? `+${md} pontos ao concluir, se ele tiver pelo menos um foco hoje.`
                : `+${md} pontos ao concluir.`}
            </span>
          )}
        </section>
      ) : X.some((L) => L.id === n) ? (
        <section className={we.frogDone}>
          <strong>Sapo engolido!</strong>
          {" O resto do dia é lucro."}
        </section>
      ) : null}
      <div className={we.quads} role="tablist" aria-label="Quadrantes">
        {zf.map((L) => (
          <button
            key={L.id}
            role="tab"
            aria-selected={L.id === pe.id}
            onClick={() => j(L.id)}
            className={`${we.quad} ${we["q_" + L.id]} ${
              L.id === pe.id ? we.quadOn : ""
            }`}
          >
            <span className={we.quadTop}>
              <span className={we.quadIcon}>
                <Icon path={icons[L.icon]} />
              </span>
              <span className={we.quadCount}>{J(L.id).length}</span>
            </span>
            <span className={we.quadName}>{L.name}</span>
            <span className={we.quadSub}>{L.sub}</span>
          </button>
        ))}
      </div>
      <div className={we.list}>
        {H.slice(0, We).map((L) => (
          <TaskCard key={L.id} task={L} tags={t} quadrant={L.quadrant} />
        ))}
        {H.length > We && (
          <button className={we.more} onClick={() => Ct((L) => L + lu)}>
            {"Mostrar mais "}
            {Math.min(lu, H.length - We)}
            {" de "}
            {H.length - We}
          </button>
        )}
        {H.length === 0 && (
          <div className={we.empty}>
            <Vf size={36} />
            <span>{Je ? "Nada com esses filtros aqui." : pe.empty}</span>
          </div>
        )}
      </div>
      <div className={we.doneBlock}>
        <button
          className={we.doneToggle}
          onClick={() => oe((L) => !L)}
          aria-expanded={K}
        >
          <span>
            <Icon path={icons.check} />
            {" Feitas hoje · "}
            {X.length}
          </span>
          <Icon path={icons.chevronDown} className={K ? we.flip : ""} />
        </button>
        {K &&
          X.map((L) => (
            <div key={L.id} className={we.doneRow}>
              <span className={we.doneCheck}>
                <C_oi />
              </span>
              <span className={we.doneTitle}>{L.title}</span>
              {!Lt(L) && <button onClick={() => y(L.id)}>Reabrir</button>}
            </div>
          ))}
      </div>
      <button
        className={we.fab}
        onClick={() =>
          k({
            quadrant: pe.id,
          })
        }
        aria-label="Nova tarefa"
      >
        <Icon path={icons.plus} />
      </button>
    </main>
  );
};
