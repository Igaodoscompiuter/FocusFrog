// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import co from "./RoutineSuggestion.module.css";
import * as React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import {
  formatMinutes,
  qy,
  routineRunsOn,
  uh,
} from "../../domain/routinesLegacy";
import { todayISO } from "../../utils/dates";
import { n1 } from "../../notifications";
import { useTasks } from "../../context/TasksContext";

const Z1 = () => {
  const e = new Date();
  return `${String(e.getHours()).padStart(2, "0")}:${String(
    e.getMinutes()
  ).padStart(2, "0")}`;
};

function n8(e, t, n, s, r, o = new Date().getDay()) {
  return e
    .filter(
      (a) =>
        a.scheduledTime &&
        routineRunsOn(a, o) &&
        a.scheduledTime <= r &&
        t[a.id] !== s &&
        n[a.id] !== s
    )
    .sort((a, l) => (a.scheduledTime < l.scheduledTime ? -1 : 1));
}

export const RoutineSuggestion = () => {
  const {
      routines: e,
      routinesAddedOn: t,
      handleAddRoutine: n,
      taskTemplates: s,
    } = useTasks(),
    [r, o] = useLocalStorage("focusfrog_routineDismissed", {}),
    [a, l] = React.useState(Z1);
  React.useEffect(() => {
    const x = setInterval(() => l(Z1()), 3e4);
    return () => clearInterval(x);
  }, []);
  const c = todayISO(),
    u = n8(e, t, r, c, a);
  if (u.length === 0) return null;
  const d = u[0],
    f = uh(d, s),
    h = f.reduce((x, k) => {
      var y;
      return x + (((y = k.subtasks) == null ? undefined : y.length) || 1);
    }, 0),
    m = formatMinutes(qy(d, s)),
    v = d.pickSome
      ? `${f.length} opções, você escolhe`
      : d.asOneTask
      ? `1 tarefa com ${h} passos`
      : `${f.length} tarefa${f.length === 1 ? "" : "s"}`;
  return (
    <div className={co.card} role="region" aria-label="Rotina na hora">
      <div className={co.kicker}>
        {"⏰ Hora da rotina · "}
        {d.scheduledTime}
      </div>
      <div className={co.title}>{d.name}</div>
      <div className={co.meta}>
        {v}
        {m ? ` · ${m}` : ""}
        {u.length > 1
          ? ` · +${u.length - 1} rotina${u.length > 2 ? "s" : ""} na fila`
          : ""}
      </div>
      <div className={co.actions}>
        <button
          className={co.primary}
          onClick={() => {
            n(d), n1(d.id);
          }}
        >
          Pôr no dia
        </button>
        <button
          className={co.ghost}
          onClick={() => {
            o((x) => ({
              ...x,
              [d.id]: c,
            })),
              n1(d.id);
          }}
        >
          Hoje não
        </button>
      </div>
    </div>
  );
};

export const Td = {
  scene_pond: "linear-gradient(150deg, #14532D, #134E4A 55%, #0F2A33)",
  scene_night: "linear-gradient(160deg, #0B1026, #1E1B4B 60%, #0F172A)",
  scene_sunset: "linear-gradient(160deg, #7C2D12, #9A3412 45%, #1E3A3A)",
  scene_lotus: "linear-gradient(150deg, #14532D, #134E4A 55%, #0F2A33)",
};
