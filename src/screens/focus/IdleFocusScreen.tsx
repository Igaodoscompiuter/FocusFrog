// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import lt from "./IdleFocusScreen.module.css";
import * as React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { Icon } from "../../components/Icon";
import { icons } from "../../components/Icons";
import { gd, vc } from "../../domain/frogRarity";
import {
  FocusFrogCharacter,
  Q7,
  ax,
  ox,
  rx,
} from "../../components/FocusFrogCharacter";

const X7 = () => {
  const e = new Date().getHours();
  return e < 12
    ? {
        title: "Bom dia",
        phrase: rx[Math.floor(Math.random() * rx.length)],
      }
    : e < 18
    ? {
        title: "Boa tarde",
        phrase: ox[Math.floor(Math.random() * ox.length)],
      }
    : {
        title: "Boa noite",
        phrase: ax[Math.floor(Math.random() * ax.length)],
      };
};

const C_eB = React.memo(FocusFrogCharacter);

export const IdleFocusScreen = ({ onStart: e }) => {
  const [t, n] = React.useState(2),
    [s] = React.useState(X7()),
    r = () => {
      e({
        mode: "quick",
        taskTitle: "Foco rápido",
      });
    },
    o = () => {
      e({
        mode: "classic",
        taskTitle: "Pomodoro",
        cycles: t,
      });
    };
  return (
    <main className={lt.idleContainer}>
      <header className={lt.greetingBanner}>
        <h1>{s.title}</h1>
        <p>{s.phrase}</p>
      </header>
      <div className={lt.idleCharacter}>
        <C_eB status="idle" size={92} />
      </div>
      <div className={lt.optionsContainer}>
        <button className={lt.selectionCardButton} onClick={r}>
          <div className={lt.iconWrapper}>
            <Icon path={icons.zap} className={lt.cardIcon} />
          </div>
          <div className={lt.cardText}>
            <h4>Foco rápido</h4>
            <p>1 foco de 25 min, sem pausa.</p>
          </div>
          <div className={lt.cardActionWrapper}>
            <Icon path={icons.chevronRight} className={lt.cardChevron} />
          </div>
        </button>
        <div id="pomodoro-config-card" className={lt.configCard}>
          <div className={lt.configCardHeader}>
            <div className={lt.iconWrapper}>
              <Icon path={icons.rotateCw} className={lt.cardIcon} />
            </div>
            <div className={lt.cardText}>
              <h4>Pomodoro</h4>
              <p>
                {"Focos de 25 min com pausa de "}
                {vc}
                {" min"}
                {t >= 4 ? ` (a cada 4, pausa de ${gd})` : ""}.
              </p>
            </div>
            <div className={lt.cardActionWrapper} />
          </div>
          <div className={lt.divider} />
          <div className={lt.configCardControls}>
            <p className={lt.controlsLabel}>
              {"Focos "}
              <small>
                {"· total "}
                {Q7(t)}
              </small>
            </p>
            <div className={lt.cycleSelector}>
              <button
                onClick={() => n((a) => Math.max(2, a - 1))}
                className={lt.cycleButton}
              >
                -
              </button>
              <div className={lt.cycleCount}>
                <span>{t}</span>
              </div>
              <button
                onClick={() => n((a) => Math.min(8, a + 1))}
                className={lt.cycleButton}
              >
                +
              </button>
            </div>
          </div>
          <div className={lt.divider} />
          <button className={lt.accentYellow} onClick={o}>
            Iniciar Pomodoro
          </button>
        </div>
      </div>
    </main>
  );
};
