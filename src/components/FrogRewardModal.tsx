// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import * as React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { useUI } from "../context/UIContext";
import { FROG_SPECIES, Kr, cd } from "../data/frogs";
import { useUser } from "../context/UserContext";
import { BS, usePomodoro } from "../context/PomodoroContext";
import { yn } from "./ui/Sheet";
import { FrogSprite } from "./zen/FrogSprite";
import { st } from "./UpdateAvailableModal";
import { rX } from "../utils/shareFrogCard";

const oX = {
  common: "Comum",
  rare: "Rara",
  epic: "Épica",
  legendary: "Lendária",
};

export const FrogRewardModal = () => {
  var c, u;
  const {
      newlyAcquiredFrog: e,
      clearNewlyAcquiredFrog: t,
      collectedFrogs: n,
    } = useUser(),
    { addNotification: s } = useUI(),
    [r, o] = React.useState(false);
  if ((yn(t, !!e), !e)) return null;
  const a = FROG_SPECIES[e.speciesId],
    l = n.filter((d) => d === e.speciesId).length <= 1;
  return a ? (
    <div className={st.overlay} data-tour-hide onClick={t}>
      <div className={st.card} onClick={(d) => d.stopPropagation()}>
        <div className={`${st.glow} ${st[a.rarity]}`} />
        {l ? (
          <p className={st.newBadge}>✨ NOVA ESPÉCIE DESCOBERTA!</p>
        ) : (
          <p className={st.eyebrow}>🐸 Novo sapo coletado!</p>
        )}
        <div className={st.frogStage}>
          <FrogSprite
            speciesId={a.id}
            stage="adult"
            size={130}
            clickable={false}
          />
        </div>
        <span className={`${st.badge} ${st[a.rarity]}`}>{oX[a.rarity]}</span>
        <h3 className={st.name}>{a.name}</h3>
        <p className={st.meta}>
          {(c = Kr.find((d) => d.id === a.habitat)) == null
            ? undefined
            : c.emoji}{" "}
          {(u = Kr.find((d) => d.id === a.habitat)) == null
            ? undefined
            : u.label}
          {" · "}
          {cd[a.trait].label}
        </p>
        <p className={st.description}>
          {e.guaranteed
            ? "Sua constância acumulou sorte e garantiu esse aqui. Ele já está te esperando na lagoa."
            : (e.luck ?? 0) > 0
            ? "Foco longo, sorte maior. Ele já está te esperando na lagoa."
            : "Seu foco rendeu. Ele já está te esperando na lagoa."}
        </p>
        <button className={`btn btn-primary ${st.button}`} onClick={t}>
          Oba!
        </button>
        <button
          className={`btn btn-secondary ${st.button} ${st.shareButton}`}
          disabled={r}
          onClick={async () => {
            o(true);
            const d = await rX(a.id, l);
            o(false),
              d === "failed" &&
                s("Não deu pra compartilhar agora.", "❌", "error");
          }}
        >
          {r ? "Preparando…" : "Compartilhar 📤"}
        </button>
      </div>
    </div>
  ) : null;
};

const ab = (e) => {
  const t = Math.round(e / 1e3),
    n = Math.floor(t / 60),
    s = t % 60;
  return n > 0 ? (s ? `${n} min ${s}s` : `${n} min`) : `${s}s`;
};

export const C_iX = () => {
  const { scaredOutcome: e, clearScaredOutcome: t } = usePomodoro();
  if ((yn(t, !!e), !e)) return null;
  const n = FROG_SPECIES[e.speciesId];
  return (
    <div className={st.overlay} data-tour-hide onClick={t}>
      <div className={st.card} onClick={(s) => s.stopPropagation()}>
        <p className={st.eyebrow}>💨 O sapinho fugiu</p>
        <div
          className={st.frogStage}
          style={{
            filter: "grayscale(0.85)",
            opacity: 0.55,
          }}
        >
          {n && (
            <FrogSprite
              speciesId={n.id}
              stage="adult"
              size={110}
              clickable={false}
            />
          )}
        </div>
        <h3 className={st.name}>A distração passou do limite neste foco</h3>
        <p className={st.description}>
          {"Você passou "}
          <strong>{ab(e.distractedMs)}</strong>
          {" em outros apps durante o foco. Pra ganhar o sapo, o limite é "}
          {ab(e.focusMs * BS)}. O tempo do foco já conta nas suas estatísticas.
          O próximo é uma nova chance.
        </p>
        <button className={`btn btn-primary ${st.button}`} onClick={t}>
          Bora tentar de novo
        </button>
      </div>
    </div>
  );
};
