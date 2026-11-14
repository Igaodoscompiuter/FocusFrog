// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import st from "./UpdateAvailableModal.module.css";
import * as React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { Capacitor } from "@capacitor/core";
import { App as CapApp } from "@capacitor/app";
import { yn } from "./ui/Sheet";
import { CT, PG } from "../screens/focus/ZenLakeScreen";
import { OG } from "../utils/updateCheck";

export { st };

const Pw = (e) =>
  localStorage.setItem(
    CT,
    JSON.stringify({
      versionCode: e,
      until: Date.now() + PG,
    })
  );

const RG = (e) => {
  window.open(e, "_blank");
};

export const jg = "focusfrog:check-update";

export const UpdateAvailableModal = () => {
  const [e, t] = React.useState(null),
    [n, s] = React.useState(""),
    r = React.useCallback(async (a) => {
      const { update: l, installed: c } = await OG(a);
      c && s(c.versionName),
        l && t(l),
        a &&
          window.dispatchEvent(
            new CustomEvent("focusfrog:update-result", {
              detail: {
                found: !!l,
              },
            })
          );
    }, []);
  if (
    (React.useEffect(() => {
      if (!Capacitor.isNativePlatform()) return;
      const a = setTimeout(() => r(false), 4e3),
        l = CapApp.addListener("appStateChange", ({ isActive: u }) => {
          u && r(false);
        }),
        c = () => r(true);
      return (
        window.addEventListener(jg, c),
        () => {
          clearTimeout(a),
            l.then((u) => u.remove()),
            window.removeEventListener(jg, c);
        }
      );
    }, [r]),
    yn(() => {
      e && (Pw(e.versionCode), t(null));
    }, !!e),
    !e)
  )
    return null;
  const o = () => {
    Pw(e.versionCode), t(null);
  };
  return (
    <div className={st.overlay} data-tour-hide onClick={o}>
      <div className={st.card} onClick={(a) => a.stopPropagation()}>
        <p className={st.eyebrow}>🐸 Atualização disponível</p>
        <h3 className={st.name}>
          {"FocusFrog "}
          {e.versionName}
        </h3>
        <p
          className={st.description}
          style={{
            marginBottom: 8,
          }}
        >
          {"Você está na "}
          {n || "versão anterior"}. O que tem de novo:
        </p>
        {e.notes && e.notes.length > 0 && (
          <ul
            style={{
              textAlign: "left",
              margin: "0 0 16px",
              paddingLeft: 20,
              color: "var(--text-secondary-color)",
              fontSize: "0.9rem",
              lineHeight: 1.5,
            }}
          >
            {e.notes.slice(0, 5).map((a, l) => (
              <li key={l}>{a}</li>
            ))}
          </ul>
        )}
        <button
          className={`btn btn-primary ${st.button}`}
          onClick={() => {
            RG(e.apkUrl), t(null);
          }}
        >
          Baixar atualização
        </button>
        <button
          className="btn btn-tertiary"
          style={{
            width: "100%",
            marginTop: 8,
          }}
          onClick={o}
        >
          Agora não
        </button>
        <p
          style={{
            fontSize: "0.75rem",
            color: "var(--text-secondary-color)",
            marginTop: 10,
          }}
        >
          Seus dados continuam no app: a atualização instala por cima.
        </p>
      </div>
    </div>
  );
};
