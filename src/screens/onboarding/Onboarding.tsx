// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import Qe from "./Onboarding.module.css";
import * as React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { useUser } from "../../context/UserContext";
import { lh } from "../../sync/cloudSync";
import { dl, useAuth } from "../../hooks/useAuth";

const Uy = ({
  step: e,
  frog: t = "open",
  frogSize: n = 150,
  title: s,
  subtitle: r,
  children: o,
  footer: a,
}) => (
  <div className={Qe.screen}>
    <div className={Qe.glow} aria-hidden="true" />
    <div className={Qe.top}>
      <div
        className={Qe.steps}
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={3}
        aria-valuenow={e}
        aria-label={`Etapa ${e} de 3`}
      >
        {[1, 2, 3].map((l) => (
          <span key={l} className={l <= e ? Qe.stepOn : Qe.step} />
        ))}
      </div>
    </div>
    <div className={Qe.body}>
      <DP face={t} size={n} />
      <h1 className={Qe.title}>{s}</h1>
      {r && <p className={Qe.subtitle}>{r}</p>}
      {o}
    </div>
    <div className={Qe.footer}>{a}</div>
  </div>
);

const DP = ({ face: e = "open", size: t = 150 }) => {
  const n = "#2E7D32",
    s = "#AED581";
  return (
    <div
      className={Qe.frogWrap}
      style={{
        width: t,
        height: t,
      }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className={Qe.frogSvg}>
        <ellipse cx="50" cy="88" rx="40" ry="9" fill="#2F8F5B" />
        <ellipse cx="50" cy="87" rx="36" ry="7" fill="#3AA568" />
        <ellipse
          cx="50"
          cy="85"
          rx="24"
          ry="4"
          fill="rgba(0,0,0,.25)"
          className={Qe.frogShadow}
        />
        <g className={Qe.frogHop}>
          <g className={Qe.frogBreath}>
            <ellipse
              cx="28"
              cy="75"
              rx="12"
              ry="10"
              fill={n}
              stroke="rgba(0,0,0,.25)"
              strokeWidth="1.5"
            />
            <ellipse
              cx="72"
              cy="75"
              rx="12"
              ry="10"
              fill={n}
              stroke="rgba(0,0,0,.25)"
              strokeWidth="1.5"
            />
            <ellipse cx="50" cy="60" rx="30" ry="25" fill={n} />
            <circle cx="40" cy="45" r="10" fill={n} />
            <circle cx="60" cy="45" r="10" fill={n} />
            <ellipse cx="50" cy="65" rx="20" ry="18" fill={s} opacity=".8" />
            <ellipse
              cx="38"
              cy="80"
              rx="8"
              ry="6"
              fill={n}
              stroke="rgba(0,0,0,.25)"
              strokeWidth="1.5"
            />
            {e === "wave" ? (
              <g className={Qe.frogWave}>
                <ellipse
                  cx="64"
                  cy="76"
                  rx="8"
                  ry="6"
                  fill={n}
                  stroke="rgba(0,0,0,.25)"
                  strokeWidth="1.5"
                />
              </g>
            ) : (
              <ellipse
                cx="62"
                cy="80"
                rx="8"
                ry="6"
                fill={n}
                stroke="rgba(0,0,0,.25)"
                strokeWidth="1.5"
              />
            )}
            <g className={Qe.frogBlink}>
              <circle cx="40" cy="45" r="10" fill="#fff" />
              <circle cx="60" cy="45" r="10" fill="#fff" />
              <circle cx="40" cy="45" r={e === "happy" ? 5.6 : 5} fill="#000" />
              <circle cx="60" cy="45" r={e === "happy" ? 5.6 : 5} fill="#000" />
              <circle cx="41.8" cy="43" r="1.8" fill="#fff" />
              <circle cx="61.8" cy="43" r="1.8" fill="#fff" />
            </g>
            {e !== "open" && (
              <>
                <ellipse
                  cx="33"
                  cy="64"
                  rx="4"
                  ry="2.4"
                  fill="#F472B6"
                  opacity=".35"
                />
                <ellipse
                  cx="67"
                  cy="64"
                  rx="4"
                  ry="2.4"
                  fill="#F472B6"
                  opacity=".35"
                />
              </>
            )}
            <path
              d={e === "open" ? "M45,68 Q50,72 55,68" : "M42,66 Q50,75 58,66"}
              fill="none"
              stroke={s}
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </g>
        </g>
      </svg>
    </div>
  );
};

export const C_SP = () => {
  const [e, t] = React.useState(""),
    { setUserName: n } = useUser(),
    s = (r) => {
      if ((r == null || r.preventDefault(), !e.trim())) return;
      n(e.trim());
      const o = localStorage.getItem(dl);
      o &&
        setTimeout(() => {
          lh(o)
            .then(() => localStorage.removeItem(dl))
            .catch(() => {});
        }, 400);
    };
  return (
    <form onSubmit={s}>
      <Uy
        step={2}
        frog="wave"
        title="Como você quer ser chamado?"
        subtitle="É assim que o app vai falar com você."
        footer={
          <button type="submit" className={Qe.primary} disabled={!e.trim()}>
            Continuar
          </button>
        }
      >
        <div className={Qe.field}>
          <label htmlFor="ob-name">Seu nome</label>
          <input
            id="ob-name"
            type="text"
            value={e}
            onChange={(r) => t(r.target.value)}
            placeholder="Ex.: Ana"
            className={Qe.input}
            autoComplete="given-name"
            maxLength={40}
          />
        </div>
      </Uy>
    </form>
  );
};

const FP = [
  {
    icon: "🐸",
    bg: "rgba(251, 191, 36, .16)",
    title: "Um sapo por dia",
    text: "Escolha a tarefa que mais pesa hoje. Feita ela, o dia já valeu.",
  },
  {
    icon: "📝",
    bg: "rgba(96, 165, 250, .16)",
    title: "Tudo fora da cabeça",
    text: "Jogue tudo no Despejo mental e separe depois: fazer agora, planejar ou guardar como ideia.",
  },
  {
    icon: "⚡️",
    bg: "rgba(52, 211, 153, .16)",
    title: "Rotinas prontas",
    text: 'Sequências curtas, como "arrumar em 5 min" ou "preparar pra dormir", pra só seguir o passo a passo.',
  },
  {
    icon: "✅",
    bg: "rgba(244, 114, 182, .16)",
    title: "Já pegou?",
    text: "Uma checklist rápida antes de sair: chaves, carteira, celular.",
  },
];

export const MP = () => {
  const { userName: e, completeOnboarding: t } = useUser();
  return (
    <Uy
      step={3}
      frog="happy"
      frogSize={112}
      title={
        <>
          {"Prazer, "}
          {e}.
        </>
      }
      subtitle="O que o FocusFrog faz por você:"
      footer={
        <button className={Qe.primary} onClick={t}>
          Começar
        </button>
      }
    >
      <div className={Qe.features}>
        {FP.map((n) => (
          <div key={n.title} className={Qe.feature}>
            <span
              className={Qe.featureIcon}
              style={{
                background: n.bg,
              }}
              aria-hidden="true"
            >
              {n.icon}
            </span>
            <div>
              <strong>{n.title}</strong>
              <span>{n.text}</span>
            </div>
          </div>
        ))}
      </div>
    </Uy>
  );
};

export const B_ = "focusfrog_account_choice";

export const C_rS = () => (
  <img src="/google-logo.svg" alt="" width={20} height={20} />
);

export const Onboarding = ({ onContinueWithoutAccount: e }) => {
  const { signIn: t, isSigningIn: n } = useAuth(),
    s = (r) => t(r, "onboarding");
  return (
    <Uy
      step={1}
      frog="open"
      title={<>Bem-vindo(a) ao FocusFrog</>}
      subtitle="Organize o dia, comece pelo que importa e foque um passo de cada vez."
      footer={
        <>
          <button
            className={Qe.google}
            onClick={() => s("google")}
            disabled={n}
          >
            <C_rS />
            {" Continuar com Google"}
          </button>
          {n && <p className={Qe.waiting}>Esperando o login no navegador…</p>}
          <div className={Qe.or}>ou</div>
          <button className={Qe.ghost} onClick={e} disabled={n}>
            Continuar sem conta
          </button>
          <p className={Qe.note}>
            Já usou antes? Entre com a mesma conta e tudo volta. Sem conta, tudo
            fica só neste celular, e dá pra entrar depois em Ajustes.
          </p>
        </>
      }
    />
  );
};
