// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import I from './RoutineLibrary.module.css';
import * as React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import * as ReactDOM from 'react-dom';
import { useUI } from '../../context/UIContext';
import { Icon } from '../Icon';
import { icons } from '../Icons';
import { Hy, Yt } from '../../utils/dates';
import { mS, vc, xf } from '../../domain/frogRarity';
import { kn } from '../../domain/taskKinds';
import { useTasks } from '../../context/TasksContext';
import { Ms, ne, yn } from '../ui/Sheet';

export { I };

const y1 = "focusfrog_hint_trail";

const WD = [{
  id: "inbox",
  name: "Despejo",
  color: "#FCD34D"
}, {
  id: "do",
  name: "Fazer agora",
  color: "#F87171"
}, {
  id: "schedule",
  name: "Planejar",
  color: "#93C5FD"
}, {
  id: "someday",
  name: "Ideias",
  color: "#C4B5FD"
}];

const v1 = [15, 25, 45];

const Nf = ["#3B82F6", "#22C55E", "#F97316", "#EC4899", "#A855F7", "#14B8A6", "#EAB308", "#EF4444"];

export const C_qS = ({
  taskToEdit: e,
  onClose: t
}) => {
  var H, $, je;
  const {
      handleAddTask: n,
      handleUpdateTask: s,
      handleDeleteTask: r,
      handleCreateTemplateFromTask: o,
      taskTemplates: a,
      tags: l,
      handleSaveTag: c
    } = useTasks(),
    [u, d] = React.useState(null),
    [f, h] = React.useState(false),
    {
      addNotification: m
    } = useUI();
  yn(t, !!e);
  const [v, x] = React.useState({}),
    [k, y] = React.useState(""),
    [p, g] = React.useState(false),
    [b, j] = React.useState(false),
    [C, S] = React.useState(false),
    [T, P] = React.useState("Personalizado"),
    [O, V] = React.useState(""),
    U = React.useMemo(() => ["Personalizado", ...Array.from(new Set(a.map(R => R.category))).filter(R => R && R !== "Personalizado")], [a]);
  if (React.useEffect(() => {
    if (e) {
      if (e.id || e.templateId) {
        const R = e.templateId ? a.find(Ae => Ae.id === e.templateId) : undefined;
        P((R == null ? undefined : R.category) || "Personalizado"), x({
          ...e,
          subtasks: e.subtasks ? [...e.subtasks] : [],
          pomodoroEstimate: e.pomodoroEstimate ?? 1
        });
      } else P("Personalizado"), x({
        title: "",
        description: "",
        quadrant: "inbox",
        subtasks: [],
        status: "todo",
        pomodoroEstimate: 1,
        dueDate: Yt(),
        ...e
      });
      y(""), g(false), j(false), S(false), d(null), h(false);
    }
  }, [e]), !e) return null;
  const E = (R, Ae) => x(Ye => ({
      ...Ye,
      [R]: Ae
    })),
    oe = kn(v) === "trilha",
    ve = v.pomodoroEstimate === 0,
    Z = v.pomodoroEstimate || 1,
    D = v.customDuration || 25,
    q = (() => {
      let R = Z * D;
      for (let Ye = 1; Ye < Z; Ye++) R += mS(Ye);
      const Ae = R >= 60 ? `${Math.floor(R / 60)}h${R % 60 ? ` ${String(R % 60).padStart(2, "0")}` : ""}` : `${R} min`;
      return Z === 1 ? `1 foco de ${D} min` : `${Z} focos de ${D} min · pausa de ${vc} min entre eles · total ${Ae}`;
    })(),
    G = () => {
      const R = k.trim();
      if (!R) return;
      const Ae = {
        id: `sub-${Date.now()}`,
        text: R,
        completed: false
      };
      E("subtasks", [...(v.subtasks || []), Ae]), y("");
    },
    de = R => {
      const Ae = (v.subtasks || []).map(Ye => {
        if (Ye.id !== R) return Ye;
        const rt = xf.indexOf(Ye.minutes || 0),
          us = xf[(rt + 1) % xf.length];
        return {
          ...Ye,
          minutes: us || undefined
        };
      });
      if (!oe && kn({
        ...v,
        subtasks: Ae
      }) === "trilha") try {
        localStorage.getItem(y1) || (localStorage.setItem(y1, "1"), m("Virou Trilha: cada passo com tempo é um foco, em sequência", "👣", "info"));
      } catch {}
      E("subtasks", Ae);
    },
    re = () => {
      var Ae;
      if (!((Ae = v.title) != null && Ae.trim())) {
        m("Dê um nome pra tarefa", "✏️", "info");
        return;
      }
      const R = {
        ...v,
        title: v.title.trim(),
        dueDate: v.dueDate || undefined
      };
      R.id ? s(R) : n(R), t();
    },
    X = () => {
      var Ae;
      if (!((Ae = v.title) != null && Ae.trim())) {
        m("Dê um nome pra tarefa antes de salvar o modelo", "✏️", "info");
        return;
      }
      const R = O.trim() || T;
      o(v, R), t();
    },
    Ie = () => {
      const R = u == null ? undefined : u.name.trim();
      if (!u || !R) return;
      const Ae = l.find(rt => rt.name.toLowerCase() === R.toLowerCase()),
        Ye = Ae ? Ae.id : c({
          name: R,
          color: u.color
        });
      Ye && E("tagId", Ye), d(null);
    },
    $e = () => {
      v.id && (r(v.id), t());
    },
    Je = Yt(),
    z = Hy(1),
    F = v.dueDate ? v.dueDate === Je ? "today" : v.dueDate === z ? "tomorrow" : "custom" : "none",
    J = R => {
      const [Ae, Ye, rt] = R.split("-");
      return `${rt}/${Ye}/${Ae}`;
    },
    pe = ((H = v.subtasks) == null ? undefined : H.length) || 0,
    We = ($ = l.find(R => R.id === v.tagId)) == null ? undefined : $.name,
    Ct = [pe ? `${pe} passo${pe > 1 ? "s" : ""}` : "", We || "", (je = v.description) != null && je.trim() ? "descrição" : ""].filter(Boolean);
  return ReactDOM.createPortal(<div className={ne.sheetOverlay} onClick={t}><div className={ne.sheet} role="dialog" aria-label={v.id ? "Editar tarefa" : "Nova tarefa"} onClick={R => R.stopPropagation()}><div className={ne.sheetHead}><div className={I.headText}><h2 className={ne.sheetTitle}>{v.id ? "Editar tarefa" : "Nova tarefa"}</h2><Ms task={v} /></div><button className={ne.closeBtn} onClick={t} aria-label="Fechar"><Icon path={icons.close} /></button></div><input className={I.input} type="text" value={v.title || ""} onChange={R => E("title", R.target.value)} placeholder="O que precisa ser feito?" aria-label="Nome da tarefa" autoFocus={!v.id} onKeyDown={R => {
        R.key === "Enter" && re();
      }} /><div className={I.chipsScroll} role="radiogroup" aria-label="Onde fica">{WD.map(R => <button key={R.id} role="radio" aria-checked={v.quadrant === R.id} className={`${I.chip} ${v.quadrant === R.id ? I.on : ""}`} onClick={() => E("quadrant", R.id)}>{R.name}</button>)}</div><div className={`${I.segment} ${oe ? I.disabled : ""}`} role="radiogroup" aria-label="Tipo"><button role="radio" aria-checked={ve} className={ve ? I.on : ""} onClick={() => {
          E("pomodoroEstimate", 0), E("customDuration", undefined);
        }}>Rápida</button><button role="radio" aria-checked={!ve} className={ve ? "" : I.on} onClick={() => E("pomodoroEstimate", Math.max(1, Z))}>Foco</button></div>{oe && <span className={I.trailNote}>O tempo vem dos passos (Trilha).</span>}{!ve && !oe && <div className={I.focusBox}><div className={I.focusRow}><div className={I.chips} role="radiogroup" aria-label="Minutos por foco">{v1.map(R => <button key={R} role="radio" aria-checked={D === R && !f} className={`${I.chip} ${D === R && !f ? I.on : ""}`} onClick={() => {
              h(false), E("customDuration", R === 25 ? undefined : R);
            }}>{R}{" min"}</button>)}{f || !v1.includes(D) ? <label className={`${I.chip} ${I.on} ${I.customChip}`}><input type="number" min={1} max={180} inputMode="numeric" value={v.customDuration || ""} placeholder="?" aria-label="Outro tempo, em minutos" onChange={R => E("customDuration", R.target.value ? Math.min(180, Math.max(1, parseInt(R.target.value, 10))) : undefined)} autoFocus={f} />min</label> : <button className={`${I.chip} ${I.dashedChip}`} onClick={() => h(true)}>Outro</button>}</div><span className={I.stepper} aria-label="Quantos focos"><button aria-label="Menos focos" onClick={() => E("pomodoroEstimate", Math.max(1, Z - 1))}>−</button><span>{"× "}{Z}</span><button aria-label="Mais focos" onClick={() => E("pomodoroEstimate", Math.min(8, Z + 1))}>+</button></span></div><span className={I.tip}>{q}</span></div>}<div className={I.chips} role="radiogroup" aria-label="Quando"><button role="radio" aria-checked={F === "today"} className={`${I.chip} ${F === "today" ? I.on : ""}`} onClick={() => {
          E("dueDate", Je), j(false);
        }}>Hoje</button><button role="radio" aria-checked={F === "tomorrow"} className={`${I.chip} ${F === "tomorrow" ? I.on : ""}`} onClick={() => {
          E("dueDate", z), j(false);
        }}>Amanhã</button><button role="radio" aria-checked={F === "none"} className={`${I.chip} ${F === "none" ? I.on : ""}`} onClick={() => {
          E("dueDate", undefined), j(false);
        }}>Sem data</button><button role="radio" aria-checked={F === "custom"} className={`${I.chip} ${F === "custom" ? I.on : ""}`} onClick={() => j(true)}>{F === "custom" ? J(v.dueDate) : "📅"}</button></div>{b && <input className={I.timeInput} type="date" value={v.dueDate || ""} onChange={R => E("dueDate", R.target.value || undefined)} aria-label="Data" />}<button className={I.moreToggle} onClick={() => g(R => !R)} aria-expanded={p}><span>{p ? "Menos opções" : "Mais opções"}</span>{!p && <small>{Ct.length ? Ct.join(" · ") : "passos, categoria, descrição"}</small>}<i className={p ? I.chevOpen : ""}>›</i></button>{p && <div className={I.more}><div className={I.field}><span className={I.label}>Passos</span>{(v.subtasks || []).map(R => <div key={R.id} className={I.stepEdit}><input className={`${I.input} ${I.inputSm}`} type="text" value={R.text} aria-label="Texto do passo" onChange={Ae => {
              var Ye;
              return E("subtasks", (Ye = v.subtasks) == null ? undefined : Ye.map(rt => rt.id === R.id ? {
                ...rt,
                text: Ae.target.value
              } : rt));
            }} /><button className={`${I.timeChip} ${R.minutes ? I.on : ""}`} onClick={() => de(R.id)} aria-label="Mudar tempo do passo">{"⏱ "}{R.minutes ? `${R.minutes}′` : "—"}</button><button className={I.iconBtn} aria-label="Remover passo" onClick={() => {
              var Ae;
              return E("subtasks", (Ae = v.subtasks) == null ? undefined : Ae.filter(Ye => Ye.id !== R.id));
            }}>✕</button></div>)}<div className={I.addRow}><input className={`${I.input} ${I.inputSm} ${I.dashed}`} type="text" value={k} placeholder="+ Adicionar passo" aria-label="Novo passo" onChange={R => y(R.target.value)} onKeyDown={R => {
              R.key === "Enter" && G();
            }} />{k.trim() && <button className={I.smallBtn} onClick={G}>Adicionar</button>}</div>{pe > 0 && <span className={I.tip}>⏱ dá tempo a um passo (vira Trilha).</span>}</div><div className={I.field}><span className={I.label}>Categoria</span><div className={I.chips} role="radiogroup" aria-label="Categoria"><button role="radio" aria-checked={!v.tagId} className={`${I.chip} ${v.tagId ? "" : I.on}`} onClick={() => E("tagId", undefined)}>Nenhuma</button>{l.map(R => <button key={R.id} role="radio" aria-checked={v.tagId === R.id} className={`${I.chip} ${v.tagId === R.id ? I.on : ""}`} onClick={() => E("tagId", R.id)}><i className={I.dot} style={{
                background: R.color
              }} />{R.name}</button>)}{!u && <button className={`${I.chip} ${I.dashedChip}`} onClick={() => d({
              name: "",
              color: Nf[l.length % Nf.length]
            })}>+ Nova</button>}</div>{u && <div className={I.panel}><input className={`${I.input} ${I.inputSm}`} type="text" placeholder="Nome da categoria" value={u.name} autoFocus onChange={R => d({
              ...u,
              name: R.target.value
            })} aria-label="Nome da nova categoria" onKeyDown={R => {
              R.key === "Enter" && Ie();
            }} /><div className={I.swatches} role="radiogroup" aria-label="Cor">{Nf.map(R => <button key={R} role="radio" aria-checked={u.color === R} aria-label={`Cor ${R}`} className={`${I.swatch} ${u.color === R ? I.on : ""}`} style={{
                background: R
              }} onClick={() => d({
                ...u,
                color: R
              })} />)}</div><div className={I.addRow}><button className={I.smallBtn} onClick={() => d(null)}>Cancelar</button><button className={I.smallBtn} style={{
                flexGrow: 1
              }} onClick={Ie} disabled={!u.name.trim()}>Criar e usar</button></div></div>}</div><textarea className={I.textarea} placeholder="Descrição, links, notas…" value={v.description || ""} onChange={R => E("description", R.target.value)} aria-label="Descrição" />{C ? <div className={I.field}><span className={I.label}>Guardar o modelo em</span><div className={I.chips}>{U.map(R => <button key={R} className={`${I.chip} ${!O && T === R ? I.on : ""}`} onClick={() => {
              P(R), V("");
            }}>{R}</button>)}</div><input className={`${I.input} ${I.inputSm}`} type="text" placeholder="ou crie uma categoria" value={O} onChange={R => V(R.target.value)} /><button className={I.smallBtn} onClick={X}>{"Salvar modelo em "}{O.trim() || T}</button></div> : <button className={I.linkBtn} onClick={() => S(true)}>Salvar como modelo…</button>}</div>}<div className={I.footer}>{v.id && <button className={I.trash} onClick={$e} aria-label="Excluir tarefa"><Icon path={icons.trash} /></button>}<button className={I.cancel} onClick={t}>Cancelar</button><button className={I.save} onClick={re}>{v.id ? "Salvar" : "Criar tarefa"}</button></div></div></div>, document.body);
};

export const WS = "focusfrog_tour";
