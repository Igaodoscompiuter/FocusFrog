// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import * as React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import * as ReactDOM from 'react-dom';
import { Capacitor } from '@capacitor/core';
import { useUI } from '../../context/UIContext';
import { Lt, N3, _m, yf } from '../../constants';
import { useUser } from '../../context/UserContext';
import { Icon } from '../Icon';
import { icons } from '../Icons';
import { fd, ni, uh } from '../../domain/routinesLegacy';
import { $n } from '../../domain/frogRarity';
import { dh, nO, ts } from '../../domain/taskKinds';
import { usePomodoro } from '../../context/PomodoroContext';
import { useTasks } from '../../context/TasksContext';
import { C_oi, Ms, ne, yn } from '../ui/Sheet';
import { C_qS, I } from '../routines/RoutineLibrary';
import { m9 } from '../../screens/HomeScreen';
import { b7 } from '../../screens/TasksScreen';
import { EG } from '../../screens/focus/ZenLakeScreen';
import { xY } from '../../screens/RewardsScreen';
import { EQ } from '../../screens/StatsScreen';
import { AQ } from '../modals/MorningReviewModal';
import { Share } from '@capacitor/share';

export const VX = () => {
  const {
      addNotification: e
    } = useUI(),
    {
      tasks: t,
      stepsTaskId: n,
      openSteps: s,
      handleToggleSubtask: r,
      handleCompleteAllSteps: o,
      handleCompleteTask: a,
      startTaskFocus: l,
      openTaskEditor: c
    } = useTasks(),
    u = n ? t.find(y => y.id === n && y.status !== "done") : undefined,
    d = typeof document < "u" ? document.getElementById("modal-root") || document.body : null;
  if (!u || !d) return null;
  const f = Lt(u),
    h = _m(u),
    m = y => {
      var p, g;
      (g = (p = u.subtasks) == null ? undefined : p.find(b => b.id === y)) != null && g.completed || r(u.id, y, {
        autoComplete: false
      });
    },
    v = async () => {
      const y = 'Tô usando o FocusFrog pra organizar o dia e sair do "depois eu faço". É grátis, dá uma olhada:';
      try {
        Capacitor.isNativePlatform() ? await Share.share({
          title: "FocusFrog",
          text: y,
          url: yf,
          dialogTitle: "Mandar o FocusFrog pra um amigo"
        }) : navigator.share ? await navigator.share({
          title: "FocusFrog",
          text: y,
          url: yf
        }) : (await navigator.clipboard.writeText(`${y} ${yf}`), e("Link copiado. Cole pra quem quiser!", "🔗", "info")), m("thx-2");
      } catch {}
    },
    x = async () => {
      try {
        await navigator.clipboard.writeText(N3), e("Código Pix copiado. Cole no app do seu banco. Obrigado!", "☕", "success");
      } catch {
        e("Não deu pra copiar o código agora.", "ℹ️", "info");
      }
      m("thx-3");
    },
    k = () => s(null);
  return ReactDOM.createPortal(<div className={ne.sheetOverlay} onClick={k}><div className={ne.sheet} role="dialog" aria-label={`Passos de ${u.title}`} onClick={y => y.stopPropagation()}><div className={ne.sheetHead}><div style={{
          display: "flex",
          flexDirection: "column",
          gap: 6
        }}><h2 className={ne.sheetTitle}>{u.title}</h2><span><Ms task={u} /></span></div><button className={ne.closeBtn} onClick={k} aria-label="Fechar"><Icon path={icons.close} /></button></div><p className={ne.muted}>{nO(u)}{$n(u) ? " Toque num passo pra marcar ou desmarcar." : ""}</p>{(u.subtasks || []).map(y => <button key={y.id} className={ne.stepRow} onClick={() => r(u.id, y.id)}><span className={`${ne.box} ${y.completed ? ne.on : ""}`}>{y.completed && <C_oi />}</span><span className={`${ne.stepText} ${y.completed ? ne.done : ""}`}>{y.text}</span>{!!y.minutes && <span className={ne.stepMeta}>{"⏱ "}{y.minutes}{" min"}</span>}</button>)}{h && <div className={ne.row}><button className={ne.secondaryBtn} onClick={v}>🔗 Compartilhar</button><button className={ne.secondaryBtn} onClick={x}>☕ Apoiar com Pix</button></div>}{h && <p className={ne.muted}>O apoio é opcional de verdade: dá pra concluir o card sem doar nada.</p>}{ts(u) && <button className={ne.primaryBtn} onClick={() => l(u.id)}><Icon path={icons.play} />{" "}{dh(u)}</button>}<div className={ne.row}>{!f && <button className={ne.secondaryBtn} onClick={() => c(u)}>Editar</button>}{f ? <button className={ne.successBtn} onClick={() => {
          window.open("https://www.instagram.com/focus.frog/", "_blank"), a(u.id, "instagram"), k();
        }}>Visitar o Instagram 🐸</button> : <button className={ne.successBtn} style={{
          flex: 1.5
        }} onClick={() => $n(u) ? o(u.id) : a(u.id, "button")}>{$n(u) ? "Marcar todos e concluir" : "Concluir"}</button>}</div></div></div>, d);
};

export const UX = () => {
  const {
      routinePick: e,
      setRoutinePick: t,
      taskTemplates: n,
      handleAddRoutine: s
    } = useTasks(),
    [r, o] = React.useState([]);
  if (React.useEffect(() => o([]), [e == null ? undefined : e.id]), yn(() => t(null), !!e), !e) return null;
  const a = uh(e, n),
    l = a.filter(f => r.includes(f.id)).reduce((f, h) => f + fd(h), 0),
    c = f => o(h => h.includes(f) ? h.filter(m => m !== f) : [...h, f]),
    u = () => t(null),
    d = () => {
      s(e, {
        only: r
      }), u();
    };
  return ReactDOM.createPortal(<div className={ne.sheetOverlay} onClick={u}><div className={ne.sheet} role="dialog" aria-label={`Escolher tarefas: ${e.name}`} onClick={f => f.stopPropagation()}><div className={ne.sheetHead}><div className={I.cardHead}><h2 className={ne.sheetTitle}>{e.name}</h2><span className={I.desc}>O que entra hoje? Uma ou duas já fazem diferença.</span></div><button className={ne.closeBtn} onClick={u} aria-label="Fechar"><Icon path={icons.close} /></button></div>{a.map(f => {
        var v;
        const h = r.includes(f.id),
          m = ni(fd(f));
        return <button key={f.id} className={`${I.libItem} ${h ? I.on : ""}`} onClick={() => c(f.id)} role="checkbox" aria-checked={h}><span className={I.libBox}>{h ? "✓" : ""}</span><span className={I.rtaskBody}><span className={I.rtaskTitle}>{f.title}</span><span className={I.rtaskMeta}>{m}{(v = f.subtasks) != null && v.length ? `${m ? " · " : ""}${f.subtasks.length} etapas` : ""}</span></span></button>;
      })}<div className={I.footer}><button className={I.cancel} onClick={u}>Agora não</button><button className={I.save} onClick={d} disabled={r.length === 0}>{r.length === 0 ? "Marque ao menos uma" : `Pôr ${r.length} no dia${l ? ` · ${ni(l)}` : ""}`}</button></div></div></div>, document.body);
};

const ib = "focusfrog_hint_sessionEnd";

export const C_qX = () => {
  const {
      tasks: e,
      sessionPrompt: t,
      resolvePrompt: n
    } = useTasks(),
    {
      newlyAcquiredFrog: s
    } = useUser(),
    {
      scaredOutcome: r
    } = usePomodoro(),
    [o, a] = React.useState({}),
    [l] = React.useState(() => {
      try {
        return !localStorage.getItem(ib);
      } catch {
        return false;
      }
    }),
    c = t && "stepId" in t ? t.stepId : null;
  React.useEffect(() => {
    a({});
  }, [t == null ? undefined : t.kind, t == null ? undefined : t.taskId, c]);
  const u = t ? e.find(p => p.id === t.taskId) : undefined,
    d = typeof document < "u" ? document.getElementById("modal-root") || document.body : null;
  if (!t || !u || !d || s || r) return null;
  const f = p => {
      try {
        localStorage.setItem(ib, "1");
      } catch {}
      n(p);
    },
    h = u.subtasks || [],
    m = "stepId" in t && t.stepId ? h.find(p => p.id === t.stepId) : undefined,
    v = m ? `Passo ${h.indexOf(m) + 1} de ${h.length}` : "",
    x = h.filter(p => !p.completed),
    k = x.length;
  let y;
  if (t.kind === "end" && !$n(u)) y = <><h3 className={ne.sheetTitle}>Terminou a tarefa?</h3><p className={ne.muted}>{u.title}</p><button className={ne.primaryBtn} onClick={() => f({
      type: "yes"
    })}>Sim, concluir</button><button className={ne.secondaryBtn} onClick={() => f({
      type: "notYet"
    })}>{t.kind === "end" && (t.focos ?? 1) > 0 ? `Ainda não · conta +${t.focos ?? 1} ${(t.focos ?? 1) === 1 ? "foco" : "focos"}` : "Ainda não"}</button></>;else if (t.kind === "end" && !m) {
    const p = x.length > 0 && x.every(g => o[g.id]);
    y = <><h3 className={ne.sheetTitle}>Marque o que você fez</h3>{x.length === 0 && <p className={ne.muted}>Todos os passos já estão marcados!</p>}{x.map(g => <button key={g.id} className={ne.stepRow} onClick={() => a(b => ({
        ...b,
        [g.id]: !b[g.id]
      }))}><span className={`${ne.box} ${o[g.id] ? ne.on : ""}`}>{o[g.id] && <C_oi />}</span><span className={ne.stepText}>{g.text}</span></button>)}<div className={ne.row}>{x.length > 0 && <button className={ne.secondaryBtn} onClick={() => a(Object.fromEntries(x.map(g => [g.id, true])))}>Fiz todos</button>}<button className={ne.primaryBtn} style={{
          flex: 1.4
        }} onClick={() => f({
          type: "blocoDone",
          stepIds: Object.keys(o).filter(g => o[g])
        })}>{p || x.length === 0 ? "Pronto · concluir a tarefa" : "Pronto"}</button></div></>;
  } else t.kind === "end" ? y = <><h3 className={ne.sheetTitle}>Terminou esse passo?</h3><p className={ne.muted}>{v}{" · "}{m.text}</p><button className={ne.primaryBtn} onClick={() => f({
      type: "stepYes"
    })}>{k <= 1 ? "Sim, concluir a tarefa" : "Sim, próximo passo"}</button><div className={ne.row}><button className={ne.secondaryBtn} onClick={() => f({
        type: "stepMore"
      })}>+5 min</button><button className={ne.secondaryBtn} style={{
        flex: 1.5
      }} onClick={() => f({
        type: "stepNo"
      })}>Ainda não · parar aqui</button></div></> : t.kind === "stop" ? y = <><span className={ne.kicker}>{"Parada rápida · "}{v}</span><h3 className={ne.sheetTitle}>{m == null ? undefined : m.text}</h3><p className={ne.muted}>Passo sem tempo: faça agora e marque, ou pule e marque depois.</p><button className={ne.successBtn} onClick={() => f({
      type: "stopDid"
    })}><C_oi />{" Fiz"}</button><div className={ne.row}><button className={ne.secondaryBtn} onClick={() => f({
        type: "stopSkip"
      })}>Pular</button><button className={ne.secondaryBtn} onClick={() => f({
        type: "end"
      })}>Parar a trilha</button></div></> : y = <><span className={ne.kicker}>{"Próximo · "}{v}</span><h3 className={ne.sheetTitle}>{m == null ? undefined : m.text}</h3><button className={ne.primaryBtn} onClick={() => f({
      type: "startNext"
    })}>{"▶ Começar · "}{m == null ? undefined : m.minutes}{" min"}</button><button className={ne.secondaryBtn} onClick={() => f({
      type: "end"
    })}>Parar por aqui</button></>;
  return ReactDOM.createPortal(<div className={`${ne.sheetOverlay} ${ne.centerOverlay}`}><div className={`${ne.sheet} ${ne.dialog}`} role="dialog" aria-label="Fim do foco"><div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 8
      }}><span className={ne.kicker}>{t.kind === "end" ? `Tempo! · ${Math.round(t.minutes)} min focados` : "Trilha"}</span><Ms task={u} /></div>{y}{l && t.kind === "end" && <span className={ne.hint}>Agora você decide se terminou. Os pontos vêm do tempo focado, não do botão.</span>}</div></div>, d);
};

export const WX = () => {
  const {
    editingTask: e,
    openTaskEditor: t,
    tags: n
  } = useTasks();
  return e ? <C_qS taskToEdit={e} onClose={() => t(null)} tags={n} /> : null;
};

export const HX = {
  dashboard: m9,
  tasks: b7,
  focus: EG,
  stats: EQ,
  rewards: xY,
  moodboard: AQ
};
