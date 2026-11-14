// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import Et from "./LeavingHomeChecklist.module.css";
import * as React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { Capacitor } from "@capacitor/core";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { useUI } from "../../context/UIContext";
import { Icon } from "../Icon";
import { icons } from "../Icons";
import { WO } from "../../widgets/widgetSync";
import { ChecklistModal } from "../modals/ChecklistModal";

export const LeavingHomeChecklist = ({
  items: e,
  onToggleItem: t,
  onAddItem: n,
  onRemoveItem: s,
  onResetItems: r,
}) => {
  const [o, a] = React.useState(false),
    [l, c] = React.useState(false),
    [u, d] = useLocalStorage("focusfrog_checklistOpen", false),
    f = e.filter((x) => x.completed).length,
    { addNotification: h } = useUI(),
    m = async () => {
      const { supported: x, reason: k } = await WO();
      x ||
        h(
          k === "launcher_unsupported"
            ? 'Sua tela inicial não aceita esse atalho — adicione segurando um espaço vazio dela e procurando "FocusFrog" em Widgets.'
            : "Esse atalho precisa do app instalado no celular (não funciona aqui no navegador).",
          "ℹ️",
          "info"
        );
    };
  if (!e || e.length === 0) return null;
  const v = (x) => {
    l || t(x);
  };
  return (
    <>
      {o && (
        <ChecklistModal
          items={e}
          onAddItem={n}
          onRemoveItem={s}
          onClose={() => a(false)}
        />
      )}
      <div className={Et.card}>
        <div className={Et.header}>
          <button
            className={Et.titleToggle}
            onClick={() => d(!u)}
            aria-expanded={u}
          >
            <h3>
              <Icon path={icons.briefcase} />
              {" Já pegou?"}
            </h3>
            <span className={Et.summary}>
              {f}/{e.length}
              <span className={`${Et.chevron} ${u ? Et.chevronOpen : ""}`}>
                ›
              </span>
            </span>
          </button>
        </div>
        {u && (
          <div className={Et.toolbar}>
            {Capacitor.isNativePlatform() && !l && (
              <button
                className={Et.toolButton}
                onClick={m}
                title="Adicionar à tela inicial"
              >
                <Icon path={icons.layoutGrid} />
                {" Widget"}
              </button>
            )}
            {l ? (
              <button
                className={`${Et.toolButton} ${Et.toolPrimary}`}
                onClick={() => a(true)}
                title="Adicionar Item"
              >
                <Icon path={icons.plus} />
                {" Item"}
              </button>
            ) : (
              <button
                className={Et.toolButton}
                onClick={r}
                title="Desmarcar Todos"
              >
                <Icon path={icons.rotateCw} />
                {" Desmarcar"}
              </button>
            )}
            <button
              className={Et.toolButton}
              onClick={() => c(!l)}
              title={l ? "Concluir Edição" : "Editar Checklist"}
            >
              {l ? (
                <>
                  <Icon path={icons.check} />
                  {" Pronto"}
                </>
              ) : (
                <>
                  <Icon path={icons.pencil} />
                  {" Editar"}
                </>
              )}
            </button>
          </div>
        )}
        {u && (
          <ul className={`${Et.checklist} ${l ? Et.editingList : ""}`}>
            {e.map((x) => (
              <li
                key={x.id}
                className={`${Et.checklistItem} ${
                  x.completed ? Et.completed : ""
                } ${l ? Et.editing : ""}`}
                onClick={() => v(x.id)}
              >
                <div className={Et.itemContent}>
                  <span className={Et.checkbox} />
                  <span className={Et.text}>{x.text}</span>
                </div>
                {l && !x.isDefault && (
                  <button
                    className="btn btn-icon btn-small"
                    onClick={() => s(x.id)}
                    title="Remover Item"
                  >
                    <Icon path={icons.trash} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};
