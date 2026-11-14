// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import * as React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import * as ReactDOM from "react-dom";
import { T3, W2 } from "../../constants";
import { B3 } from "../../analytics";
import { Icon } from "../Icon";
import { icons } from "../Icons";
import {
  describeDays,
  formatMinutes,
  qy,
  routineMode,
  templateMinutes,
} from "../../domain/routinesLegacy";
import { useTasks } from "../../context/TasksContext";
import { Ms, ne, yn } from "../ui/Sheet";
import { I } from "../routines/RoutineLibrary";

const Bf = (e) => {
  var t;
  return {
    pomodoroEstimate: e.pomodoroEstimate ?? 0,
    customDuration: e.customDuration,
    subtasks:
      (t = e.subtasks) == null
        ? undefined
        : t.map((n, s) => ({
            id: String(s),
            text: n.text,
            completed: false,
            minutes: n.minutes,
          })),
  };
};

const sx = {
  do: "Fazer agora",
  schedule: "Planejar",
  someday: "Ideias",
  inbox: "Despejo mental",
};

export const TaskSheet = ({
  onAddRoutine: e,
  onAddTemplates: t,
  onClose: n,
}) => {
  const {
      routines: s,
      taskTemplates: r,
      handleDeleteTemplate: o,
      handleSaveRoutine: a,
      handleDeleteRoutine: l,
      handleCreateTemplate: c,
    } = useTasks(),
    [u, d] = React.useState("routines"),
    [f, h] = React.useState(null),
    [m, v] = React.useState([]),
    [x, k] = React.useState(""),
    [y, p] = React.useState("quick"),
    [g, b] = React.useState("do"),
    [j, C] = React.useState(false),
    [S, T] = React.useState(""),
    [P, O] = React.useState([]),
    V = React.useRef(0),
    U = () => {
      f ? h(null) : n();
    };
  yn(U);
  const E = !!f && !f.id,
    K = !!(f != null && f.isDefault),
    oe = (z) => {
      const F = z
        ? {
            ...z,
          }
        : {
            name: "",
            description: "",
            icon: "zap",
            isDefault: false,
            taskTemplateIds: [],
          };
      h(F),
        v(
          ((z == null ? undefined : z.taskTemplateIds) || [])
            .map((J) => r.find((pe) => pe.id === J))
            .filter((J) => !!J)
            .map((J) => ({
              key: `t${J.id}`,
              templateId: J.id,
              title: J.title,
              quadrant: J.quadrant || "inbox",
              pomodoroEstimate: J.pomodoroEstimate ?? 0,
              isDefault: J.isDefault,
              template: J,
            }))
        ),
        k(""),
        p("quick"),
        b("do"),
        C(false),
        T("");
    },
    ve = () => {
      const z = x.trim();
      z &&
        ((V.current += 1),
        v((F) => [
          ...F,
          {
            key: `n${Date.now()}_${V.current}`,
            title: z,
            quadrant: g,
            pomodoroEstimate: y === "focus" ? 1 : 0,
          },
        ]),
        k(""));
    },
    Z = (z) => {
      m.some((F) => F.templateId === z.id) ||
        v((F) => [
          ...F,
          {
            key: `t${z.id}`,
            templateId: z.id,
            title: z.title,
            quadrant: z.quadrant || "inbox",
            pomodoroEstimate: z.pomodoroEstimate ?? 0,
            isDefault: z.isDefault,
            template: z,
          },
        ]);
    },
    D = () => {
      var F;
      if (!f || !((F = f.name) != null && F.trim()) || m.length === 0) return;
      const z = [];
      m.forEach((J) => {
        if (J.templateId !== undefined) z.push(J.templateId);
        else {
          const pe = c({
            title: J.title,
            quadrant: J.quadrant,
            pomodoroEstimate: J.pomodoroEstimate,
            description: "",
          });
          pe && z.push(pe.id);
        }
      }),
        E && B3(),
        a({
          ...f,
          name: f.name.trim(),
          taskTemplateIds: z,
        }),
        h(null);
    },
    q = (z) => {
      const F = (z.taskTemplateIds || []).length,
        J = routineMode(z),
        pe = formatMinutes(qy(z, r));
      return [
        J === "one"
          ? "1 tarefa com passos"
          : J === "pick"
          ? `${F} opções, escolhe na hora`
          : `${F} tarefa${F === 1 ? "" : "s"}`,
        pe,
        z.scheduledTime
          ? `${z.alarmMode === "alarm" ? "alarme" : "lembrete"} ${describeDays(
              z.days
            )} às ${z.scheduledTime}`
          : "",
      ]
        .filter(Boolean)
        .join(" · ");
    },
    G = (z) =>
      h((F) => ({
        ...F,
        asOneTask: z === "one",
        pickSome: z === "pick",
      })),
    de = (z) =>
      h((F) => {
        const J = F.days && F.days.length ? F.days : [0, 1, 2, 3, 4, 5, 6],
          pe = J.includes(z) ? J.filter((We) => We !== z) : [...J, z].sort();
        return {
          ...F,
          days: pe.length === 7 ? undefined : pe,
        };
      }),
    re = m.reduce(
      (z, F) =>
        z +
        (F.template ? templateMinutes(F.template) : F.pomodoroEstimate * 25),
      0
    ),
    X = React.useMemo(() => {
      const z = S.trim().toLowerCase();
      return r
        .filter(
          (F) =>
            (!K || !F.isDefault) && (!z || F.title.toLowerCase().includes(z))
        )
        .slice(0, 40);
    }, [r, S, K]),
    Ie = React.useMemo(
      () =>
        Array.from(new Set([...r.map((z) => z.category), ...T3])).filter((z) =>
          r.some((F) => F.category === z)
        ),
      [r]
    ),
    $e = () => (
      <>
        <div className={ne.sheetHead}>
          <div className={I.cardHead}>
            <h2 className={ne.sheetTitle}>
              {u === "routines" ? "Rotinas" : "Modelos de tarefa"}
            </h2>
            <span className={I.desc}>
              {u === "routines"
                ? "Ponha no dia, edite as tarefas ou crie a sua."
                : "Escolha tarefas prontas pra pôr na sua lista."}
            </span>
          </div>
          <button className={ne.closeBtn} onClick={n} aria-label="Fechar">
            <Icon path={icons.close} />
          </button>
        </div>
        <div className={I.tabs} role="tablist">
          <button
            role="tab"
            aria-selected={u === "routines"}
            className={u === "routines" ? I.on : ""}
            onClick={() => d("routines")}
          >
            Rotinas
          </button>
          <button
            role="tab"
            aria-selected={u === "templates"}
            className={u === "templates" ? I.on : ""}
            onClick={() => d("templates")}
          >
            Modelos
          </button>
        </div>
        {u === "routines" ? (
          <>
            {s.map((z) => (
              <div key={z.id} className={I.card}>
                <div className={I.cardHead}>
                  <span className={I.cardTitle}>
                    {z.name}
                    <span className={I.tag}>
                      {z.isDefault ? "Padrão" : "Sua"}
                    </span>
                  </span>
                  {z.description && (
                    <span className={I.desc}>{z.description}</span>
                  )}
                  <span className={I.meta}>{q(z)}</span>
                </div>
                <div className={I.cardActions}>
                  <button
                    className={I.addDay}
                    onClick={() => {
                      e(z), n();
                    }}
                  >
                    Adicionar ao dia
                  </button>
                  <button className={I.outlineBtn} onClick={() => oe(z)}>
                    Editar
                  </button>
                  {!z.isDefault && (
                    <button
                      className={I.trashSm}
                      aria-label={`Excluir rotina ${z.name}`}
                      onClick={() => l(z.id)}
                    >
                      <Icon path={icons.trash} />
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button className={I.newDashed} onClick={() => oe(null)}>
              + Criar nova rotina
            </button>
          </>
        ) : (
          <>
            {Ie.map((z) => (
              <React.Fragment key={z}>
                <span className={I.catTitle}>{z}</span>
                {r
                  .filter((F) => F.category === z)
                  .map((F) => {
                    const J = P.includes(F.id);
                    return (
                      <div
                        key={F.id}
                        style={{
                          display: "flex",
                          gap: 6,
                          alignItems: "center",
                        }}
                      >
                        <button
                          className={`${I.libItem} ${J ? I.on : ""}`}
                          onClick={() =>
                            O((pe) =>
                              J ? pe.filter((We) => We !== F.id) : [...pe, F.id]
                            )
                          }
                          aria-pressed={J}
                        >
                          <span className={I.libBox}>{J ? "✓" : ""}</span>
                          <span className={I.rtaskBody}>
                            <span className={I.rtaskTitle}>{F.title}</span>
                            <span className={I.rtaskMeta}>
                              <Ms task={Bf(F)} />
                            </span>
                          </span>
                        </button>
                        {!F.isDefault && (
                          <button
                            className={I.iconBtn}
                            aria-label={`Excluir modelo ${F.title}`}
                            onClick={() => o(F.id)}
                          >
                            <Icon path={icons.trash} />
                          </button>
                        )}
                      </div>
                    );
                  })}
              </React.Fragment>
            ))}
            <div className={I.footer}>
              <button className={I.cancel} onClick={n}>
                Fechar
              </button>
              <button
                className={I.save}
                disabled={!P.length}
                onClick={() => {
                  t(r.filter((z) => P.includes(z.id))), n();
                }}
              >
                {"Adicionar "}
                {P.length || ""}
                {" tarefa"}
                {P.length === 1 ? "" : "s"}
              </button>
            </div>
          </>
        )}
      </>
    ),
    Je = () => {
      var z;
      return (
        f && (
          <>
            <div className={I.backHead}>
              <button
                className={I.backBtn}
                onClick={() => h(null)}
                aria-label="Voltar pras rotinas"
              >
                ‹
              </button>
              <h2 className={ne.sheetTitle}>
                {E ? "Nova rotina" : "Editar rotina"}
              </h2>
            </div>
            {K ? (
              <div className={I.infoBox}>
                <strong>{f.name}</strong>
                {f.description && (
                  <span className={I.desc}>{f.description}</span>
                )}
                <span className={I.tip}>
                  Rotina padrão: nome e tarefas padrão ficam fixos. Você pode
                  adicionar tarefas suas e mudar o lembrete.
                </span>
              </div>
            ) : (
              <>
                <input
                  className={I.input}
                  type="text"
                  value={f.name || ""}
                  placeholder="Nome da rotina"
                  aria-label="Nome da rotina"
                  onChange={(F) =>
                    h((J) => ({
                      ...J,
                      name: F.target.value,
                    }))
                  }
                  autoFocus={E}
                />
                <div className={I.icons} role="radiogroup" aria-label="Ícone">
                  {W2.map((F) => (
                    <button
                      key={F}
                      role="radio"
                      aria-checked={f.icon === F}
                      className={f.icon === F ? I.on : ""}
                      onClick={() =>
                        h((J) => ({
                          ...J,
                          icon: F,
                        }))
                      }
                    >
                      <Icon path={icons[F]} />
                    </button>
                  ))}
                </div>
              </>
            )}
            <span className={I.label}>
              {"Tarefas da rotina · "}
              {m.length}
              {re ? ` · ${formatMinutes(re)}` : ""}
            </span>
            {m.map((F) => (
              <div key={F.key} className={I.rtask}>
                <div className={I.rtaskBody}>
                  <span className={I.rtaskTitle}>{F.title}</span>
                  <span className={I.rtaskMeta}>
                    <Ms
                      task={
                        F.template
                          ? Bf(F.template)
                          : {
                              pomodoroEstimate: F.pomodoroEstimate,
                            }
                      }
                    />
                    {sx[F.quadrant] ? `vai pra ${sx[F.quadrant]}` : ""}
                  </span>
                </div>
                {!(K && F.isDefault) && (
                  <button
                    className={I.iconBtn}
                    aria-label={`Tirar ${F.title} da rotina`}
                    onClick={() => v((J) => J.filter((pe) => pe.key !== F.key))}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            {m.length === 0 && (
              <p className={I.empty}>
                Ainda sem tarefas. Adicione a primeira aqui embaixo.
              </p>
            )}
            <div className={I.panel}>
              <input
                className={`${I.input} ${I.inputSm}`}
                type="text"
                value={x}
                placeholder="Nova tarefa da rotina"
                aria-label="Nova tarefa da rotina"
                onChange={(F) => k(F.target.value)}
                onKeyDown={(F) => {
                  F.key === "Enter" && ve();
                }}
              />
              <div className={I.chips}>
                <button
                  className={`${I.chip} ${y === "quick" ? I.on : ""}`}
                  onClick={() => p("quick")}
                >
                  Rápida
                </button>
                <button
                  className={`${I.chip} ${y === "focus" ? I.on : ""}`}
                  onClick={() => p("focus")}
                >
                  Foco
                </button>
                <button
                  className={`${I.chip} ${g === "do" ? I.on : ""}`}
                  onClick={() => b("do")}
                >
                  Fazer agora
                </button>
                <button
                  className={`${I.chip} ${g === "schedule" ? I.on : ""}`}
                  onClick={() => b("schedule")}
                >
                  Planejar
                </button>
              </div>
              <button className={I.smallBtn} onClick={ve}>
                + Adicionar à rotina
              </button>
              <button className={I.linkBtn} onClick={() => C((F) => !F)}>
                {j ? "− Fechar biblioteca" : "+ Escolher dos modelos prontos"}
              </button>
              {j && (
                <>
                  <input
                    className={`${I.input} ${I.inputSm}`}
                    type="search"
                    value={S}
                    placeholder="Buscar modelo…"
                    aria-label="Buscar modelo"
                    onChange={(F) => T(F.target.value)}
                  />
                  {X.map((F) => {
                    const J = m.some((pe) => pe.templateId === F.id);
                    return (
                      <button
                        key={F.id}
                        className={`${I.libItem} ${J ? I.on : ""}`}
                        onClick={() => Z(F)}
                        disabled={J}
                      >
                        <span className={I.libBox}>{J ? "✓" : "+"}</span>
                        <span className={I.rtaskBody}>
                          <span className={I.rtaskTitle}>{F.title}</span>
                          <span className={I.rtaskMeta}>
                            <Ms task={Bf(F)} />
                            {F.category}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </>
              )}
            </div>
            <span className={I.label}>Como entra no dia</span>
            <div
              className={I.chips}
              role="radiogroup"
              aria-label="Como entra no dia"
            >
              {[
                ["one", "Uma tarefa com passos"],
                ["separate", "Tarefas separadas"],
                ["pick", "Escolher na hora"],
              ].map(([F, J]) => (
                <button
                  key={F}
                  role="radio"
                  aria-checked={routineMode(f) === F}
                  className={`${I.chip} ${routineMode(f) === F ? I.on : ""}`}
                  onClick={() => G(F)}
                >
                  {J}
                </button>
              ))}
            </div>
            <span className={I.tip}>
              {routineMode(f) === "one"
                ? "Entra como um checklist só, sem lotar a agenda."
                : routineMode(f) === "pick"
                ? "Ao pôr no dia, você marca quais tarefas entram."
                : "Cada tarefa entra separada, no quadrante dela."}
            </span>
            <button
              className={I.toggleRow}
              onClick={() =>
                h((F) => ({
                  ...F,
                  scheduledTime: F.scheduledTime ? undefined : "07:00",
                }))
              }
              aria-pressed={!!f.scheduledTime}
            >
              <span>Lembrar num horário</span>
              <span className={`${I.switch} ${f.scheduledTime ? I.on : ""}`} />
            </button>
            {f.scheduledTime && (
              <div className={I.field}>
                <div className={I.durRow}>
                  <input
                    className={I.timeInput}
                    type="time"
                    value={f.scheduledTime}
                    aria-label="Horário do lembrete"
                    onChange={(F) =>
                      h((J) => ({
                        ...J,
                        scheduledTime: F.target.value,
                      }))
                    }
                  />
                  <button
                    className={`${I.chip} ${
                      f.alarmMode !== "alarm" ? I.on : ""
                    }`}
                    onClick={() =>
                      h((F) => ({
                        ...F,
                        alarmMode: "normal",
                      }))
                    }
                  >
                    Normal
                  </button>
                  <button
                    className={`${I.chip} ${
                      f.alarmMode === "alarm" ? I.on : ""
                    }`}
                    onClick={() =>
                      h((F) => ({
                        ...F,
                        alarmMode: "alarm",
                      }))
                    }
                  >
                    ⏰ Alarme
                  </button>
                </div>
                <div
                  className={I.chips}
                  role="group"
                  aria-label="Dias do lembrete"
                >
                  {["D", "S", "T", "Q", "Q", "S", "S"].map((F, J) => {
                    const pe =
                      !f.days || f.days.length === 0 || f.days.includes(J);
                    return (
                      <button
                        key={J}
                        className={`${I.chip} ${pe ? I.on : ""}`}
                        aria-pressed={pe}
                        aria-label={
                          [
                            "domingo",
                            "segunda",
                            "terça",
                            "quarta",
                            "quinta",
                            "sexta",
                            "sábado",
                          ][J]
                        }
                        onClick={() => de(J)}
                      >
                        {F}
                      </button>
                    );
                  })}
                </div>
                <span className={I.tip}>
                  {"Lembra "}
                  {describeDays(f.days)}.
                </span>
                <span className={I.tip}>
                  {f.alarmMode === "alarm"
                    ? "Toca mais forte e aparece por cima de outros apps, pra rotinas que não podem ser ignoradas."
                    : "Lembrete discreto, como as outras notificações do app."}
                </span>
              </div>
            )}
            <div className={I.footer}>
              <button className={I.cancel} onClick={() => h(null)}>
                Cancelar
              </button>
              <button
                className={I.save}
                onClick={D}
                disabled={!((z = f.name) != null && z.trim()) || m.length === 0}
              >
                Salvar rotina
              </button>
            </div>
          </>
        )
      );
    };
  return ReactDOM.createPortal(
    <div className={ne.sheetOverlay} onClick={U}>
      <div
        className={ne.sheet}
        role="dialog"
        aria-label="Rotinas"
        onClick={(z) => z.stopPropagation()}
      >
        {f ? Je() : $e()}
      </div>
    </div>,
    document.body
  );
};
