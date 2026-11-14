// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import lo from "./ChecklistModal.module.css";
import * as React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { Icon } from "../Icon";
import { icons } from "../Icons";
import { useClickOutside } from "../../hooks/useClickOutside";

export const ChecklistModal = ({
  items: e,
  onAddItem: t,
  onRemoveItem: n,
  onClose: s,
}) => {
  const [r, o] = React.useState(""),
    a = useClickOutside(s),
    l = () => {
      r.trim() && (t(r), o(""));
    };
  return (
    <div className="g-modal-overlay">
      <div className="g-modal" ref={a}>
        <div className={lo.modalHeader}>
          <h3>Gerenciar Itens de Saída</h3>
          <p>Adicione ou remova itens da sua lista pessoal.</p>
        </div>
        <div className={lo.modalBody}>
          <ul className={lo.itemList}>
            {e.map((c) => (
              <li key={c.id} className={lo.item}>
                <span>{c.text}</span>
                {!c.isDefault && (
                  <button
                    onClick={() => n(c.id)}
                    className="btn btn-icon btn-small"
                    aria-label={`Remover ${c.text}`}
                  >
                    <Icon path={icons.trash} />
                  </button>
                )}
              </li>
            ))}
          </ul>
          <div className={lo.formGroup}>
            <label>Adicionar novo item</label>
            <div className={lo.inputGroup}>
              <input
                type="text"
                placeholder="Ex: Fone de ouvido"
                value={r}
                onChange={(c) => o(c.target.value)}
                onKeyPress={(c) => c.key === "Enter" && l()}
              />
              <button onClick={l} className="btn btn-primary btn-small">
                <Icon path={icons.plus} />
              </button>
            </div>
          </div>
        </div>
        <div className={lo.modalFooter}>
          <button className="btn btn-secondary" onClick={s}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
