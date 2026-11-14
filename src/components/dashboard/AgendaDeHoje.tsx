// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import Hs from "./AgendaDeHoje.module.css";
import * as React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { Capacitor } from "@capacitor/core";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { useUI } from "../../context/UIContext";
import { Icon } from "../Icon";
import { icons } from "../Icons";
import { carriedLabel, todayISO } from "../../utils/dates";
import { ZO } from "../../widgets/widgetSync";
import { useTasks } from "../../context/TasksContext";
import { TaskCard } from "../tasks/TaskCard";

export const AgendaDeHoje = () => {
  const { tasks: e, tags: t } = useTasks(),
    { addNotification: n } = useUI(),
    s = async () => {
      const { supported: u, reason: d } = await ZO();
      u ||
        n(
          d === "launcher_unsupported"
            ? 'Sua tela inicial não aceita esse atalho: segure um espaço vazio dela e procure "FocusFrog" em Widgets.'
            : "Não deu pra abrir o atalho do widget agora.",
          "ℹ️",
          "info"
        );
    },
    [r, o] = useLocalStorage("focusfrog_agendaOpen", false),
    a = todayISO(),
    l = React.useMemo(
      () =>
        e
          .filter((u) => u.dueDate && u.dueDate <= a && u.status !== "done")
          .sort((u, d) =>
            u.dueDate < d.dueDate ? -1 : u.dueDate > d.dueDate ? 1 : 0
          ),
      [e, a]
    ),
    c = l.filter((u) => carriedLabel(u.dueDate)).length;
  return (
    <div className={Hs.card}>
      <button className={Hs.header} onClick={() => o(!r)} aria-expanded={r}>
        <h3>
          <Icon path={icons.calendar} />
          {" Agenda de Hoje"}
        </h3>
        <span className={Hs.summary}>
          {l.length === 0
            ? "livre"
            : `${l.length} tarefa${l.length > 1 ? "s" : ""}${
                c ? ` · ${c} de antes` : ""
              }`}
          <span className={`${Hs.chevron} ${r ? Hs.chevronOpen : ""}`}>›</span>
        </span>
      </button>
      {r && Capacitor.isNativePlatform() && (
        <button className={Hs.widgetBtn} onClick={s}>
          <Icon path={icons.layoutGrid} />
          {" Pôr a agenda na tela inicial"}
        </button>
      )}
      {r &&
        (l.length > 0 ? (
          <div className={Hs.taskList}>
            {l.map((u) => (
              <div key={u.id}>
                {carriedLabel(u.dueDate) && (
                  <span className={Hs.carried}>{carriedLabel(u.dueDate)}</span>
                )}
                <TaskCard task={u} tags={t} quadrant={u.quadrant} />
              </div>
            ))}
          </div>
        ) : (
          <div className={Hs.emptyState}>
            <p>
              Nenhuma tarefa pra hoje. Aproveite o dia ou adicione novas
              tarefas!
            </p>
          </div>
        ))}
    </div>
  );
};
