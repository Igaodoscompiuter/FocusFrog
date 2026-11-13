// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import Ve from './DevPanel.module.css';
import * as React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import { Capacitor, CapacitorHttp } from '@capacitor/core';
import { useUI } from '../../context/UIContext';
import { W2 } from '../../constants';
import { FiArrowLeft, FiChevronRight } from 'react-icons/fi';
import { ni, qy, xm } from '../../domain/routinesLegacy';
import { useTasks } from '../../context/TasksContext';
import { Y } from '../../screens/RewardsScreen';
import { VJ, cp } from '../../domain/taskImportLegacy';

const fY = {
  inbox: "Despejo",
  do: "Fazer agora",
  schedule: "Planejar",
  delegate: "Delegar",
  someday: "Ideias"
};

async function pY(e) {
  if (Capacitor.isNativePlatform()) {
    const n = await CapacitorHttp.get({
      url: e,
      responseType: "text",
      connectTimeout: 1e4,
      readTimeout: 15e3
    });
    if (n.status < 200 || n.status >= 300) throw new Error(`o link respondeu ${n.status}`);
    return typeof n.data == "string" ? n.data : JSON.stringify(n.data);
  }
  const t = await fetch(e);
  if (!t.ok) throw new Error(`o link respondeu ${t.status}`);
  return t.text();
}

export const C_mY = ({
  onDone: e
}) => {
  const {
      tasks: t,
      tags: n,
      routines: s,
      handleAddTasks: r,
      handleImportRoutines: o
    } = useTasks(),
    {
      addNotification: a
    } = useUI(),
    [l, c] = React.useState(""),
    [u, d] = React.useState(""),
    [f, h] = React.useState(false),
    [m, v] = React.useState(true),
    [x, k] = React.useState(false),
    y = React.useRef(null),
    p = React.useMemo(() => l.trim() ? VJ(l, t, n, s) : null, [l, t, n, s]),
    g = p ? p.ready.filter(E => !(m && E.duplicate)) : [],
    b = p ? p.routines.filter(E => !(m && E.duplicate)) : [],
    j = p ? p.ready.filter(E => E.duplicate).length + p.routines.filter(E => E.duplicate).length : 0,
    C = g.length === 0 && b.length === 0,
    S = (E, K, oe) => `${E} ${E === 1 ? K : oe}`,
    T = [b.length ? S(b.length, "rotina", "rotinas") : "", g.length ? S(g.length, "tarefa", "tarefas") : ""].filter(Boolean).join(" e "),
    P = async E => {
      var oe;
      const K = (oe = E.target.files) == null ? undefined : oe[0];
      if (E.target.value = "", !!K) try {
        c(await K.text());
      } catch {
        a("Não deu pra ler o arquivo", "❌", "error");
      }
    },
    O = async () => {
      const E = u.trim();
      if (!/^https:\/\//i.test(E)) {
        a("Use um link https://", "ℹ️", "info");
        return;
      }
      h(true);
      try {
        c(await pY(E));
      } catch (K) {
        a(`Não deu pra buscar: ${K instanceof Error ? K.message : "erro de rede"}`, "❌", "error");
      } finally {
        h(false);
      }
    },
    V = async () => {
      try {
        await navigator.clipboard.writeText(cp), a("Modelo copiado", "📋", "success");
      } catch {
        c(cp);
      }
    },
    U = () => {
      C || (b.length && o(b.map(E => ({
        routine: {
          ...E.routine,
          icon: W2.includes(E.routine.icon) ? E.routine.icon : "bookOpen"
        },
        templates: E.templates
      }))), g.length && r(g.map(E => E.task)), a(`Importado: ${T}`, "📥", "success"), c(""), e());
    };
  return <div className={Ve.panel}><p className={Ve.lead}>Cole um JSON, abra um arquivo ou busque de um link. Nada é salvo antes de você confirmar.</p><div className={Ve.sources}><button type="button" className={Ve.secondary} onClick={() => {
        var E;
        return (E = y.current) == null ? undefined : E.click();
      }}>Abrir arquivo .json</button><button type="button" className={Ve.secondary} onClick={V}>Copiar modelo</button><input ref={y} type="file" accept=".json,application/json,text/plain" hidden onChange={P} /></div><div className={Ve.urlRow}><input className={Ve.input} type="url" inputMode="url" placeholder="https://…/tarefas.json" value={u} onChange={E => d(E.target.value)} aria-label="Link do JSON" /><button type="button" className={Ve.secondary} onClick={O} disabled={f || !u.trim()}>{f ? "Buscando…" : "Buscar"}</button></div><textarea className={Ve.code} value={l} onChange={E => c(E.target.value)} placeholder={'[ { "title": "Minha tarefa", "quadrant": "fazer" } ]'} spellCheck={false} autoCapitalize="off" autoCorrect="off" aria-label="JSON das tarefas" rows={9} /><button type="button" className={Ve.link} onClick={() => k(E => !E)}>{x ? "Esconder o formato" : "Ver o formato aceito"}</button>{x && <div className={Ve.format}><ul><li><code>title</code>{" (obrigatório), "}<code>description</code></li><li><code>quadrant</code>: fazer, planejar, delegar, ideias ou despejo (padrão: despejo)</li><li><code>dueDate</code>: AAAA-MM-DD, "hoje" ou "amanhã"</li><li><code>pomodoroEstimate</code>{" (focos) e "}<code>customDuration</code>{" (minutos de cada foco)"}</li><li><code>steps</code>{": textos ou "}<code>{'{ "text", "minutes" }'}</code>; com minutos vira Trilha</li><li>{"Rotinas em "}<code>routines</code>{": "}<code>name</code>{", "}<code>days</code>{" (seg, ter… ou 0–6),"}{" "}<code>time</code>{" (HH:MM), "}<code>mode</code>{" (uma, separadas, escolher) e "}<code>tasks</code>{" (com"}{" "}<code>estMinutes</code>)</li><li><code>energyNeeded</code>{" (baixa/média/alta), "}<code>timeOfDay</code>{" (manhã/tarde/noite), "}<code>tag</code>{" "}(nome de uma etiqueta)</li></ul><pre>{cp}</pre></div>}{(p == null ? undefined : p.fatal) && <div className={Ve.fatal} role="alert">{p.fatal}</div>}{p && !p.fatal && <div className={Ve.preview} aria-live="polite"><div className={Ve.counts}>{p.routines.length > 0 && <span className={Ve.ok}>{S(p.routines.length, "rotina", "rotinas")}</span>}{(p.ready.length > 0 || p.routines.length === 0) && <span className={Ve.ok}>{p.ready.length}{" pronta"}{p.ready.length === 1 ? "" : "s"}</span>}{p.errors.length > 0 && <span className={Ve.bad}>{p.errors.length}{" com erro"}</span>}{j > 0 && <span className={Ve.dup}>{j}{" repetida"}{j === 1 ? "" : "s"}</span>}</div>{p.errors.length > 0 && <ul className={Ve.issues}>{p.errors.map(E => <li key={`e${E.routine ? "r" : ""}${E.item}`}><strong>{E.routine ? "Rotina " : ""}#{E.item}{E.title ? ` ${E.title}` : ""}</strong><span>{E.message}</span></li>)}</ul>}{p.warnings.length > 0 && <ul className={`${Ve.issues} ${Ve.warn}`}>{p.warnings.map((E, K) => <li key={`w${K}`}><strong>#{E.item}{" "}{E.title}</strong><span>{E.message}</span></li>)}</ul>}{p.routines.length > 0 && <ul className={Ve.list}>{p.routines.map(E => <li key={`r${E.item}`} className={E.duplicate && m ? Ve.skipped : ""}><span className={Ve.title}>{"Rotina: "}{E.routine.name}</span><span className={Ve.meta}>{S(E.templates.length, "tarefa", "tarefas")}{(() => {
              const K = ni(qy({
                taskTemplateIds: E.templates.map((oe, ve) => ve)
              }, E.templates.map((oe, ve) => ({
                ...oe,
                id: ve
              }))));
              return K ? ` · ${K}` : "";
            })()}{` · ${xm(E.routine.days)}`}{E.routine.scheduledTime ? ` às ${E.routine.scheduledTime}` : ""}{E.routine.asOneTask ? " · uma tarefa" : E.routine.pickSome ? " · escolher" : ""}{E.duplicate ? " · já existe uma com esse nome" : ""}</span></li>)}</ul>}{p.ready.length > 0 && <ul className={Ve.list}>{p.ready.slice(0, 50).map(E => {
          var K;
          return <li key={E.item} className={E.duplicate && m ? Ve.skipped : ""}><span className={Ve.title}>{E.task.title}</span><span className={Ve.meta}>{fY[E.task.quadrant]}{E.task.dueDate ? ` · ${E.task.dueDate}` : ""}{(K = E.task.subtasks) != null && K.length ? ` · ${E.task.subtasks.length} passos` : ""}{E.task.pomodoroEstimate ? ` · ${E.task.pomodoroEstimate} foco(s)` : ""}{E.duplicate ? " · já existe" : ""}</span></li>;
        })}{p.ready.length > 50 && <li className={Ve.more}>+{p.ready.length - 50}{" tarefas"}</li>}</ul>}{j > 0 && <label className={Ve.check}><input type="checkbox" checked={m} onChange={E => v(E.target.checked)} />Pular as repetidas (tarefa com o mesmo título em aberto ou rotina com o mesmo nome)</label>}<button type="button" className={Ve.primary} onClick={U} disabled={C}>{C ? "Nada pra importar" : `Importar ${T}`}</button></div>}</div>;
};

export const Yw = "41988094386";

export const C_la = ({
  title: e,
  children: t
}) => <section className={Y.section}><h3 className={Y.sectionLabel}>{e}</h3><div className={Y.sectionCard}>{t}</div></section>;

export const C__r = ({
  icon: Xe1,
  title: t,
  description: n,
  onClick: s
}) => <div className={Y.settingsGroup} onClick={s}><div className={Y.navRow}><div className={Y.navRowIconWrapper}><Xe1 /></div><div className={Y.navRowText}><h4>{t}</h4><p>{n}</p></div>{s && <span className={Y.navRowChevron}><FiChevronRight /></span>}</div></div>;

export const No = ({
  title: e,
  onBack: t
}) => <div className={Y.subScreenHeader}><button onClick={t} className={Y.backButton}><FiArrowLeft /></button><h3>{e}</h3></div>;

export const C_gY = ({
  options: e,
  value: t,
  onChange: n
}) => <div className={Y.segmentedControl}>{e.map(s => <button key={s.value} className={s.value === t ? Y.active : ""} onClick={() => n(s.value)}>{s.label}</button>)}</div>;

export const up = {
  google: "Google",
  facebook: "Facebook"
};

export const Zw = e => {
  if (!e) return "ainda não sincronizou";
  const t = new Date(e),
    n = new Date(),
    s = t.toDateString() === n.toDateString(),
    r = t.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit"
    });
  return s ? `hoje às ${r}` : `${t.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit"
  })} às ${r}`;
};

export const yY = {
  pushed: ["Tudo salvo na nuvem.", "☁️", "success"],
  pulled: ["Dados atualizados de outro aparelho. Recarregando…", "🔄", "success"],
  offline: ["Sem internet agora. Tentamos de novo depois.", "📶", "info"],
  error: ["Não deu pra sincronizar agora. Tente mais tarde.", "❌", "error"],
  skipped: ["Nada pra sincronizar.", "ℹ️", "info"]
};
