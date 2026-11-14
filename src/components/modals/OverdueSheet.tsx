// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import tn from "./OverdueSheet.module.css";
import * as React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import * as ReactDOM from "react-dom";
import { Lt } from "../../constants";
import { todayISO } from "../../utils/dates";
import { ne, yn } from "../ui/Sheet";

const u6 = {
  do: "Fazer agora",
  schedule: "Planejar",
  someday: "Ideias",
  inbox: "Despejo",
};

const d6 = {
  do: 0,
  schedule: 1,
  inbox: 2,
  someday: 3,
};

const _1 = 5;

export const OverdueSheet = ({
  isOpen: e,
  tasks: t = [],
  selectedTask: n,
  onSelectTask: s,
  onConfirm: r,
  onClose: o,
  onNavigateToTasks: a,
}) => {
  const [l, c] = React.useState(false),
    [u, d] = React.useState(null);
  React.useEffect(() => {
    d(document.getElementById("modal-root") || document.body);
  }, []);
  const [f, h] = React.useState(null);
  React.useEffect(() => {
    e ? h(n) : c(false);
  }, [e]),
    yn(o, e);
  const m = todayISO(),
    v = React.useMemo(() => {
      const y = (b) =>
          (b.dueDate && b.dueDate <= m ? 0 : 10) + (d6[b.quadrant] ?? 5),
        p = t
          .filter((b) => !Lt(b))
          .map((b, j) => ({
            t: b,
            i: j,
          }))
          .sort((b, j) => y(b.t) - y(j.t) || b.i - j.i)
          .map((b) => b.t),
        g = p.find((b) => b.id === f);
      return g ? [g, ...p.filter((b) => b !== g)] : p;
    }, [t, m, f]);
  if (!e || !u) return null;
  const x = v.length > 0,
    k = l ? v : v.slice(0, _1);
  return ReactDOM.createPortal(
    <div className={`${ne.sheetOverlay} g-modal-overlay`} onClick={o}>
      <div
        className={ne.sheet}
        role="dialog"
        aria-label="Escolher o Sapo do Dia"
        onClick={(y) => y.stopPropagation()}
      >
        <div className={tn.head}>
          <h2 className={ne.sheetTitle}>🐸 Sapo do Dia</h2>
          <p className={tn.subtitle}>
            A tarefa mais importante de hoje. Comece por ela.
          </p>
        </div>
        {x ? (
          <ul
            className={`${tn.list} ${l ? tn.listAll : ""}`}
            role="radiogroup"
            aria-label="Tarefas"
          >
            {k.map((y) => {
              const p = n === y.id,
                g = y.dueDate && y.dueDate < m;
              return (
                <li key={y.id}>
                  <button
                    role="radio"
                    aria-checked={p}
                    className={`${tn.row} ${p ? tn.on : ""}`}
                    onClick={() => s(y.id)}
                  >
                    <span className={tn.radio} aria-hidden="true" />
                    <span className={tn.title}>{y.title}</span>
                    <span className={`${tn.when} ${g ? tn.late : ""}`}>
                      {g
                        ? "atrasada"
                        : y.dueDate === m
                        ? "hoje"
                        : u6[y.quadrant] || ""}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className={tn.empty}>
            Nenhuma tarefa aberta ainda. Anote algumas e volte aqui.
          </p>
        )}
        {x && !l && v.length > _1 && (
          <button className={tn.more} onClick={() => c(true)}>
            Ver todas ({v.length})
          </button>
        )}
        <div className={tn.footer}>
          <button className={tn.secondary} onClick={o}>
            Depois
          </button>
          {x ? (
            <button className={tn.primary} onClick={r} disabled={!n}>
              Engolir este sapo
            </button>
          ) : (
            <button className={tn.primary} onClick={a}>
              Ir para Tarefas
            </button>
          )}
        </div>
      </div>
    </div>,
    u
  );
};
