// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import dp from "./LagoaCanvas.module.css";
import * as React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { lazyImport } from "../../utils/lazyImport";
import { useMascot } from "../../hooks/useMascot";
import { Nc } from "../../context/ZenContext";
import { FrogCard } from "./FrogCard";
import { sn } from "./ZenPond";
import { PondScene } from "./PondScene";

// Lagoa pausada entre visitas ao Jardim (ver LagoaEngine.park/attach).
let parkedLagoa = null;

const C_xZ = ({ children: e, onUnsupported: t }) => {
  const { pondFrogs: n, mergeFrogs: s, setEngineDriven: r } = Nc(),
    [o] = useMascot(),
    a = React.useRef(null),
    l = React.useRef(null),
    [c, u] = React.useState(false),
    [d, f] = React.useState(null),
    h = React.useRef({
      pondFrogs: n,
      mergeFrogs: s,
      onUnsupported: t,
    });
  return (
    (h.current = {
      pondFrogs: n,
      mergeFrogs: s,
      onUnsupported: t,
    }),
    React.useEffect(() => {
      let m = true;
      return (
        (async () => {
          const v = a.current;
          if (!v) return;
          const callbacks = {
            onFrogTap: (y) => {
              const p = h.current.pondFrogs.find((g) => g.id === y);
              p &&
                f({
                  frogId: p.id,
                  speciesId: p.speciesId,
                });
            },
            onMerge: (y, p) => h.current.mergeFrogs(y, p),
          };
          let k;
          if (parkedLagoa && !parkedLagoa.destroyed) {
            // Reabre a lagoa que ficou pausada na última visita (muito mais rápido que recriar).
            (k = parkedLagoa), (parkedLagoa = null), k.attach(v, callbacks);
          } else {
            const { LagoaEngine: x } = await lazyImport(async () => {
              const { LagoaEngine: y } = await import(
                "../../lagoa/lagoaEngine"
              );
              return {
                LagoaEngine: y,
              };
            }, []);
            k = await x.create(v, callbacks).catch(() => null);
          }
          if (!m) {
            k == null || k.destroy();
            return;
          }
          if (!k) {
            h.current.onUnsupported();
            return;
          }
          (l.current = k), r(true), u(true);
        })(),
        () => {
          var v;
          (m = false), r(false), (v = l.current);
          if (v) {
            // Guarda uma lagoa pausada para a próxima visita; se já houver uma guardada, destrói esta.
            parkedLagoa ? v.destroy() : (v.park(), (parkedLagoa = v));
          }
          l.current = null;
        }
      );
    }, [r]),
    React.useEffect(() => {
      const m = l.current;
      if (!m || !c) return;
      const v = Date.now();
      m.setFrogs(
        n
          .filter((x) => !x.merging)
          .map((x) => ({
            id: x.id,
            speciesId: x.speciesId,
            scale: x.scale,
            count: x.count,
            entering: !!x.enteredAt && v - x.enteredAt < 4e3,
            mascotName:
              (o == null ? undefined : o.frogId) === x.id ? o.name : null,
          }))
      );
    }, [n, o, c]),
    (
      <div className={sn.zenPondContainer}>
        <div className={`${sn.water} ${dp.host}`} ref={a}>
          {!c && <div className={dp.loading}>Enchendo a lagoa…</div>}
          {n.length === 0 && e && <div className={dp.overlay}>{e}</div>}
        </div>
        {d && (
          <FrogCard
            speciesId={d.speciesId}
            frogId={d.frogId}
            onClose={() => f(null)}
          />
        )}
      </div>
    )
  );
};

export const C_wZ = ({ children: e }) => {
  const [t, n] = React.useState(false);
  return t ? (
    <PondScene>{e}</PondScene>
  ) : (
    <C_xZ onUnsupported={() => n(true)}>{e}</C_xZ>
  );
};

export const tb = {
  duration: 0.62,
  times: [0, 0.17, 0.68, 1],
  ease: "linear",
};

export const bZ = Array.from(
  {
    length: 8,
  },
  (e, t) => (t / 8) * Math.PI * 2
);
