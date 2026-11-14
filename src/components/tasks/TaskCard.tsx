// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import Ke from "./TaskCard.module.css";
import * as React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import * as ReactDOM from "react-dom";
import { Lt } from "../../constants";
import { Icon } from "../Icon";
import { icons } from "../Icons";
import { Hy, carriedLabel, todayISO } from "../../utils/dates";
import { $n } from "../../domain/frogRarity";
import { Jy, km, ts, yS } from "../../domain/taskKinds";
import { usePomodoro } from "../../context/PomodoroContext";
import { useTasks } from "../../context/TasksContext";
import { Ms } from "../ui/Sheet";
import { animated, useSpring } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";

const FM = (e) => {
  if (!e) return null;
  const t = carriedLabel(e);
  if (t)
    return {
      text: t,
      tone: "carried",
    };
  if (e === todayISO())
    return {
      text: "Hoje",
      tone: "today",
    };
  if (e === Hy(1))
    return {
      text: "Amanhã",
      tone: "soon",
    };
  const [, n, s] = e.split("-");
  return {
    text: `${s}/${n}`,
    tone: "soon",
  };
};

const iu = 80;

const MM = [
  {
    id: "inbox",
    name: "Despejo mental",
  },
  {
    id: "do",
    name: "Fazer agora",
  },
  {
    id: "schedule",
    name: "Planejar",
  },
  {
    id: "someday",
    name: "Ideias",
  },
];

export const TaskCard = ({
  task: e,
  tags: t,
  quadrant: n,
  compact: s,
  onEdit: r,
}) => {
  const {
      handleCompleteTask: o,
      handleSetFrog: a,
      frogTaskId: l,
      handleDeleteTask: c,
      handleUpdateTaskQuadrant: u,
      handleDuplicateTask: d,
      handlePostponeTask: f,
      tasks: h,
      startTaskFocus: m,
      openSteps: v,
      openTaskEditor: x,
    } = useTasks(),
    { activeTaskId: k, sessionStatus: y } = usePomodoro(),
    [p, g] = React.useState(false),
    [b, j] = React.useState({
      right: 16,
    }),
    C = React.useRef(null),
    S = React.useRef(null),
    T = React.useRef(0),
    P = l === e.id,
    O = Lt(e),
    V = $n(e),
    U = Jy(e),
    E = ts(e),
    K = k === e.id && y !== "idle",
    oe = yS(e),
    ve = FM(e.dueDate),
    Z = e.tagId ? t.find((z) => z.id === e.tagId) : null;
  React.useEffect(() => {
    if (!p) return;
    const z = (pe) => {
        var Ct, H;
        const We = pe.target;
        ((Ct = S.current) != null && Ct.contains(We)) ||
          ((H = C.current) != null && H.contains(We)) ||
          g(false);
      },
      F = Date.now(),
      J = (pe) => {
        var We;
        Date.now() - F < 400 ||
          (pe && (We = C.current) != null && We.contains(pe.target)) ||
          g(false);
      };
    return (
      document.addEventListener("mousedown", z),
      document.addEventListener("touchstart", z),
      window.addEventListener("scroll", J, true),
      window.addEventListener("resize", J),
      () => {
        document.removeEventListener("mousedown", z),
          document.removeEventListener("touchstart", z),
          window.removeEventListener("scroll", J, true),
          window.removeEventListener("resize", J);
      }
    );
  }, [p]);
  const D = () => {
      O || (r ? r(e) : x(e));
    },
    q = () => {
      Date.now() - T.current < 350 ||
        (km(e) === "openSteps" ? v(e.id) : o(e.id, "button"));
    },
    [{ x: G }, de] = useSpring(() => ({
      x: 0,
    })),
    re = useDrag(
      ({ down: z, movement: [F], axis: J, last: pe }) => {
        if (
          (J === "x" &&
            z &&
            de.start({
              x: F,
              immediate: true,
            }),
          pe)
        ) {
          if ((J === "x" && (T.current = Date.now()), J === "x" && F > iu)) {
            de.start({
              x: 0,
            }),
              (T.current = 0),
              q(),
              (T.current = Date.now());
            return;
          }
          if (J === "x" && F < -iu) {
            de.start({
              x: -window.innerWidth,
              onRest: () => c(e.id),
            });
            return;
          }
          de.start({
            x: 0,
          });
        }
      },
      {
        axis: "lock",
        filterTaps: true,
        rubberband: true,
        from: () => [G.get(), 0],
        threshold: 10,
      }
    ),
    X = G.to((z) => Math.max(0, z / iu) * 0.85),
    Ie = G.to((z) => Math.max(0, -z / iu) * 0.85),
    $e = V ? "Ver passos" : n === "inbox" ? "Vitória rápida" : "Concluir",
    Je = (z) => {
      g(false), u(e.id, z, h.filter((F) => F.quadrant === z).length);
    };
  return (
    <div className={`${Ke.cardWrapper} ${p ? Ke.raised : ""}`}>
      <animated.div
        className={`${Ke.swipeBackground} ${Ke.completeBackground}`}
        style={{
          opacity: X,
        }}
      >
        <span className={Ke.swipeIcon}>
          <Icon path={icons.check} />
          {$e}
        </span>
      </animated.div>
      <animated.div
        className={`${Ke.swipeBackground} ${Ke.deleteBackground}`}
        style={{
          opacity: Ie,
        }}
      >
        <span className={Ke.swipeIcon}>
          <Icon path={icons.trash} />
          Excluir
        </span>
      </animated.div>
      <animated.div
        {...re()}
        style={{
          x: G,
          touchAction: "pan-y",
        }}
        className={`${Ke.taskCard} ${s ? Ke.compact : ""} ${
          P ? Ke.isFrog : ""
        } ${K ? Ke.focusing : ""}`}
      >
        <button
          className={`${Ke.checkbox} ${V ? Ke.checkboxSteps : ""}`}
          onClick={q}
          aria-label={V ? `Ver passos: ${e.title}` : `Concluir: ${e.title}`}
        >
          {V && !s ? `${U.done}/${U.total}` : ""}
        </button>
        <button className={Ke.body} onClick={D}>
          <span className={Ke.title}>
            {P && (
              <span className={Ke.frogMark} title="Sapo do Dia">
                🐸
              </span>
            )}
            {e.title}
          </span>
          {!s && (
            <span className={Ke.meta}>
              <Ms task={e} />
              {ve && (
                <span className={`${Ke.due} ${Ke[ve.tone]}`}>{ve.text}</span>
              )}
              {Z && (
                <span className={Ke.tag}>
                  <span
                    className={Ke.tagDot}
                    style={{
                      background: Z.color,
                    }}
                  />
                  {Z.name}
                </span>
              )}
            </span>
          )}
          {!s && oe && <span className={Ke.hint}>{oe}</span>}
        </button>
        {E && !s && (
          <button
            className={`${Ke.play} ${K ? Ke.playActive : ""}`}
            onClick={() => m(e.id)}
            disabled={K}
            aria-label={K ? "Focando nesta tarefa" : `Focar: ${e.title}`}
          >
            <Icon path={K ? icons.zap : icons.play} />
          </button>
        )}
        <div className={Ke.menuWrap} ref={S}>
          <button
            className={Ke.more}
            onClick={() => {
              var F;
              const z =
                (F = S.current) == null ? undefined : F.getBoundingClientRect();
              if (z) {
                const J = Math.max(8, window.innerWidth - z.right);
                j(
                  z.top > window.innerHeight * 0.5
                    ? {
                        right: J,
                        bottom: window.innerHeight - z.top + 4,
                      }
                    : {
                        right: J,
                        top: z.bottom + 4,
                      }
                );
              }
              g((J) => !J);
            }}
            aria-label="Mais ações"
            aria-expanded={p}
          >
            ⋯
          </button>
          {p &&
            ReactDOM.createPortal(
              <div
                ref={C}
                className={Ke.menu}
                role="menu"
                style={{
                  position: "fixed",
                  right: b.right,
                  top: b.top ?? "auto",
                  bottom: b.bottom ?? "auto",
                }}
              >
                {!O && (
                  <button
                    role="menuitem"
                    onClick={() => {
                      g(false), D();
                    }}
                  >
                    Editar
                  </button>
                )}
                {E && s && (
                  <button
                    role="menuitem"
                    onClick={() => {
                      g(false), m(e.id);
                    }}
                  >
                    Focar agora
                  </button>
                )}
                <button
                  role="menuitem"
                  onClick={() => {
                    g(false), a(P ? null : e.id);
                  }}
                >
                  {P ? "Tirar do Sapo do Dia" : "Virar o Sapo do Dia 🐸"}
                </button>
                <span className={Ke.menuLabel}>Mover para</span>
                {MM.filter((z) => z.id !== n).map((z) => (
                  <button key={z.id} role="menuitem" onClick={() => Je(z.id)}>
                    {z.name}
                  </button>
                ))}
                <span className={Ke.menuSep} />
                <button
                  role="menuitem"
                  onClick={() => {
                    g(false), f(e.id, 1);
                  }}
                >
                  Adiar 1 dia
                </button>
                {!O && (
                  <button
                    role="menuitem"
                    onClick={() => {
                      g(false), d(e.id);
                    }}
                  >
                    Duplicar
                  </button>
                )}
                <button
                  role="menuitem"
                  className={Ke.danger}
                  onClick={() => {
                    g(false), c(e.id);
                  }}
                >
                  Excluir
                </button>
              </div>,
              document.body
            )}
        </div>
      </animated.div>
    </div>
  );
};
