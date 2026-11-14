// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import ca from "./PondDock.module.css";
import * as jsxRuntime from "react/jsx-runtime";
import { FROG_SPECIES } from "../../data/frogs";
import { Nc } from "../../context/ZenContext";

export const PondDock = ({
  collectedFrogs: e,
  onOpenViveiro: t,
  onOpenAlbum: n,
}) => {
  const { pondFrogs: s, storageFrogs: r, maxPond: o } = Nc(),
    a = Object.keys(FROG_SPECIES).length,
    l = new Set(e.map((c) => c.speciesId)).size;
  return (
    <>
      <div className={ca.chipRow}>
        <span className={ca.count}>
          {"Lagoa "}
          {s.filter((c) => !c.merging).length}/{o}
        </span>
        <span className={ca.tip}>Toque nos sapos · iguais se fundem ✨</span>
      </div>
      <div className={ca.dock}>
        <button className={ca.dockBtn} onClick={t}>
          <i>🧺</i>
          {"Viveiro "}
          <b>{r.length}</b>
        </button>
        <button className={ca.dockBtn} onClick={n}>
          <i>📖</i>Álbum{" "}
          <b>
            {l}/{a}
          </b>
        </button>
      </div>
    </>
  );
};
