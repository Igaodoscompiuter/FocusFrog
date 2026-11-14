// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import Ws from "./QuickCompleteModal.module.css";
import * as React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import * as ReactDOM from "react-dom";
import { useUI } from "../../context/UIContext";
import { Icon } from "../Icon";
import { icons } from "../Icons";
import { useTasks } from "../../context/TasksContext";
import { useClickOutside } from "../../hooks/useClickOutside";

export const QuickCompleteModal = () => {
  const { quickTaskForCompletion: e, setQuickTaskForCompletion: t } = useUI(),
    { handleCompleteTask: n, frogTaskId: s, handleUnsetFrog: r } = useTasks(),
    [o, a] = React.useState(null);
  React.useEffect(() => {
    a(document.getElementById("modal-root"));
  }, []);
  const l = () => {
      t(null);
    },
    c = useClickOutside(l, !!e),
    u = () => {
      e && (n(e.id, "button"), s === e.id && r(), t(null));
    };
  return !e || !o
    ? null
    : ReactDOM.createPortal(
        <div className="g-modal-overlay">
          <div className={`g-modal ${Ws.modalSmall}`} ref={c}>
            <header className="g-modal-header">
              <h3>
                <Icon path={icons.frog} />
                {" Sapo Comido!"}
              </h3>
              <button onClick={l} className="btn btn-secondary btn-icon">
                <Icon path={icons.close} />
              </button>
            </header>
            <main className="g-modal-body">
              <div className={Ws.content}>
                <div className={Ws.iconContainer}>
                  <Icon path={icons.checkCircle} size={48} />
                </div>
                <p className={Ws.promptText}>
                  Você finalizou a tarefa e deu um passo importante no seu dia.
                </p>
                <div className={Ws.taskHighlightBox}>{e.title}</div>
              </div>
            </main>
            <footer className="g-modal-footer">
              <button
                className={`${Ws.controlButton} ${Ws.secondary}`}
                onClick={l}
              >
                Ops, ainda não
              </button>
              <button
                className={`${Ws.controlButton} ${Ws.primary}`}
                onClick={u}
              >
                <Icon path={icons.check} />
                {" Confirmar"}
              </button>
            </footer>
          </div>
        </div>,
        o
      );
};
