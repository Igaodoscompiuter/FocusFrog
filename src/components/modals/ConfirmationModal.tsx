// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import Lf from "./ConfirmationModal.module.css";
import * as jsxRuntime from "react/jsx-runtime";
import { Icon } from "../Icon";
import { icons } from "../Icons";
import { yn } from "../ui/Sheet";

export const ConfirmationModal = ({
  title: e,
  message: t,
  onConfirm: n,
  onCancel: s,
  confirmText: r = "Confirmar",
  cancelText: o = "Cancelar",
  variant: a = "default",
  icon: l,
}) => {
  yn(s);
  const c = a === "danger" ? Lf.btnDanger : "btn-primary",
    u = l && icons[l] ? icons[l] : icons.info_2;
  return (
    <div className="g-modal-overlay" onClick={s}>
      <div
        className={`g-modal ${Lf.confirmationModal}`}
        onClick={(d) => d.stopPropagation()}
      >
        <header className="g-modal-header">
          <div className={Lf.headerIcon}>
            <Icon path={u} />
          </div>
          <h3>{e}</h3>
        </header>
        <main className="g-modal-body">
          <p>{t}</p>
        </main>
        <footer className="g-modal-footer">
          <button className="btn btn-secondary" onClick={s}>
            {o}
          </button>
          <button className={`btn ${c}`} onClick={n}>
            {r}
          </button>
        </footer>
      </div>
    </div>
  );
};
