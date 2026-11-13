// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import * as React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import { Capacitor } from '@capacitor/core';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useUI } from './UIContext';
import { A3, C3, D_, Lt, Qc, _m, gf, ul, za } from '../constants';
import { L3, V3, z3 } from '../analytics';
import { App as CapApp } from '@capacitor/app';
import { useTheme } from './ThemeContext';
import { FI, Wy, uh } from '../domain/routinesLegacy';
import { Yt } from '../utils/dates';
import { Ki, Ur, eO, md } from '../domain/frogRarity';
import { Jy, aO, gS, iO, kn, oO, pa, rO, sO, si, ts, wf } from '../domain/taskKinds';
import { _O, fO } from '../notifications';
import { rr } from '../domain/mascotState';
import { usePomodoro } from './PomodoroContext';
import { GO, HO, qO } from '../widgets/widgetSync';

const Cf = "focusfrog_tasksCompletedTotal";

const Tf = "focusfrog_thanksMilestone";

const VS = React.createContext(undefined);

export const useTasks = () => {
  const e = React.useContext(VS);
  if (!e) throw new Error("useTasks must be used within a TasksProvider");
  return e;
};

const eR = [{
  id: "item-1",
  text: "Chaves",
  completed: false,
  isDefault: true
}, {
  id: "item-2",
  text: "Carteira",
  completed: false,
  isDefault: true
}, {
  id: "item-3",
  text: "Celular",
  completed: false,
  isDefault: true
}];

export const TasksProvider = ({
  children: e
}) => {
  const {
      addNotification: t
    } = useUI(),
    {
      setPontosFoco: n
    } = useTheme(),
    {
      activeTaskId: s,
      activeTaskTitle: r,
      sessionStatus: o,
      stopCycle: a,
      startPomodoro: l,
      lastCompletedFocus: c,
      clearLastCompletedFocus: u
    } = usePomodoro(),
    {
      handleNavigate: d
    } = useUI(),
    f = React.useRef(0),
    h = React.useCallback(() => (f.current += 1, Date.now() * 1e3 + f.current % 1e3), []),
    [m, v] = useLocalStorage("focusfrog_tasks", []),
    [x, k] = useLocalStorage("focusfrog_tags", C3);
  React.useEffect(() => {
    k(A => A.some(N => N.id === 8 && N.name === "Teste") && !m.some(N => N.tagId === 8) ? A.filter(N => !(N.id === 8 && N.name === "Teste")) : A);
  }, []);
  const [y, p] = useLocalStorage("focusfrog_frogTaskId", null),
    [g, b] = useLocalStorage("focusfrog_routines", gf);
  React.useEffect(() => {
    _O(g);
  }, [g]), React.useEffect(() => {
    fO();
  }, []);
  const j = React.useRef(false);
  React.useEffect(() => {
    if (j.current || !m.length) return;
    j.current = true;
    try {
      if (localStorage.getItem("focusfrog_streakSeeded") === "1") return;
      localStorage.setItem("focusfrog_streakSeeded", "1");
    } catch {}
    const {
      days: A,
      lastDay: N
    } = qO(m);
    rr({
      type: "seedStreak",
      days: A,
      lastDay: N
    }).catch(() => {});
  }, [m]);
  const [C, S] = useLocalStorage("focusfrog_taskTemplates", Qc);
  React.useEffect(() => {
    if (Qc.every(B => C.some(W => W.id === B.id && W.isDefault && W.title === B.title && W.estMinutes === B.estMinutes && JSON.stringify(W.subtasks || []) === JSON.stringify(B.subtasks || [])))) return;
    const N = C.filter(B => !B.isDefault && !Qc.some(W => W.id === B.id)),
      M = new Set(N.map(B => B.id));
    S([...Qc, ...N]), b(B => [...gf.map(W => {
      const xe = B.find(ye => ye.id === W.id);
      if (!xe) return W;
      const He = (xe.taskTemplateIds || []).filter(ye => M.has(ye));
      return {
        ...W,
        taskTemplateIds: [...W.taskTemplateIds, ...He],
        scheduledTime: xe.scheduledTime,
        alarmMode: xe.alarmMode,
        days: xe.days ?? W.days,
        asOneTask: xe.asOneTask ?? W.asOneTask,
        pickSome: xe.pickSome ?? W.pickSome
      };
    }), ...B.filter(W => !W.isDefault && !gf.some(xe => xe.id === W.id))]);
  }, [C]);
  const [T, P] = useLocalStorage("focusfrog_leavingHomeItems", eR);
  React.useEffect(() => {
    HO(T);
  }, [T]), React.useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const A = CapApp.addListener("appStateChange", async ({
      isActive: N
    }) => {
      if (!N) return;
      const M = await GO();
      M && JSON.stringify(M) !== JSON.stringify(T) && P(M);
    });
    return () => {
      A.then(N => N.remove());
    };
  }, [T]);
  const [O, V] = React.useState(null),
    [U, E] = React.useState([]),
    K = React.useMemo(() => U.length > 0, [U]),
    oe = React.useCallback(A => {
      const N = [{
        ...A,
        id: `task-${Date.now()}`,
        status: "todo",
        displayOrder: 0
      }];
      v(M => [...M, ...N].map((B, W) => ({
        ...B,
        displayOrder: W
      }))), A.quadrant === "inbox" ? t("Anotado no Despejo mental", "📥", "info") : t("Tarefa criada", "✨", "success");
    }, [v, t]),
    ve = React.useCallback(A => {
      const N = A.map((M, B) => ({
        ...M,
        id: `task-${Date.now()}-${B}`,
        status: "todo",
        displayOrder: 0
      }));
      v(M => [...M, ...N].map((B, W) => ({
        ...B,
        displayOrder: W
      })));
    }, [v]),
    Z = React.useCallback(A => {
      v(N => N.map(M => M.id === A.id ? A : M)), t("Tarefa salva", "✏️", "success");
    }, [v, t]),
    [D, q] = useLocalStorage("focusfrog_frogBonusDate", null),
    [G, de] = useLocalStorage("focusfrog_focusPointsToday", {
      date: "",
      points: 0
    }),
    [re, X] = useLocalStorage("focusfrog_sessionPrompt", null),
    [Ie, $e] = React.useState(null),
    [Je, z] = React.useState(null);
  React.useEffect(() => {
    localStorage.getItem("focusfrog_rules_v2") || (v(A => iO(A)), localStorage.setItem("focusfrog_rules_v2", "1"));
  }, []);
  const F = React.useCallback(A => {
      v(N => N.map(M => {
        if (M.id !== A) return M;
        let B = M.subtasks;
        return B && B.length && B.every(W => W.completed) && (B = B.map((W, xe) => xe === B.length - 1 ? {
          ...W,
          completed: false
        } : W)), {
          ...M,
          subtasks: B,
          status: "todo",
          completedAt: undefined
        };
      }));
    }, [v]),
    J = React.useCallback(A => {
      if (Lt(A) || _m(A)) return;
      let N = Number(localStorage.getItem(Cf)),
        M = Number(localStorage.getItem(Tf));
      localStorage.getItem(Cf) || (N = m.filter(W => W.status === "done" && !Lt(W) && !_m(W)).length, M = Math.floor(N / za)), N += 1;
      const B = Math.floor(N / za);
      if (localStorage.setItem(Cf, String(N)), B > M && B > 0) {
        localStorage.setItem(Tf, String(B));
        const W = A3(B, Yt());
        v(xe => xe.some(He => He.id === W.id) ? xe : [W, ...xe].map((He, ye) => ({
          ...He,
          displayOrder: ye
        }))), setTimeout(() => t(`${B * za} tarefas concluídas! Chegou um card especial pra você`, "🐸", "victory"), 1200);
      } else localStorage.setItem(Tf, String(Math.max(M, B)));
    }, [m, v, t]),
    pe = React.useCallback((A, N) => {
      L3(kn(A), N, A.id === y), J(A), rr(A.id === y ? {
        type: "frog"
      } : {
        type: "task",
        quick: kn(A) === "rapida"
      }).catch(() => {}), A.id === s && o !== "idle" && a(), v(B => B.map(W => W.id === A.id ? {
        ...A,
        status: "done",
        completedAt: new Date().toISOString()
      } : W)), $e(B => B === A.id ? null : B);
      const M = {
        label: "Desfazer",
        onAction: () => F(A.id)
      };
      if (A.id === y) {
        const B = Yt();
        rO(A, B) && D !== B ? (n(W => W + md), q(B), t(`Sapo do dia engolido! +${md} pontos`, "🐸", "victory", M)) : t("Sapo do dia engolido!", "🐸", "victory", M);
      } else t(N === "focus" ? "Tarefa concluída com foco!" : "Tarefa concluída!", N === "focus" ? "🎉" : "✅", "success", M);
    }, [s, o, a, v, y, D, q, n, t, F, J]),
    We = React.useCallback((A, N) => {
      const M = m.find(B => B.id === A);
      if (!M || M.status === "done") return false;
      if (Lt(M)) return N === "instagram" && V3(), N !== "instagram" ? (t('Esse sapo se conclui no botão "Visitar o Instagram"', "🐸", "info"), false) : (v(B => B.map(W => {
        var xe;
        return W.id !== A ? W : {
          ...W,
          subtasks: (xe = W.subtasks) == null ? undefined : xe.map(He => ({
            ...He,
            completed: true
          })),
          status: "done",
          completedAt: new Date().toISOString()
        };
      })), n(B => B + 50), t("Valeu por seguir o FocusFrog! +50 pontos", "🐸", "victory"), true);
      if (!pa(M)) {
        const B = Jy(M);
        return t(`Faltam ${B.total - B.done} ${B.total - B.done === 1 ? "passo" : "passos"} pra concluir.`, "👣", "info"), $e(A), false;
      }
      return pe(M, N), true;
    }, [m, v, n, t, pe]),
    Ct = React.useCallback((A, N, M) => {
      var ye, Ut;
      const B = m.find(Ze => Ze.id === A);
      if (!B) return;
      const W = aO(B, N),
        xe = (Ut = (ye = W.subtasks) == null ? undefined : ye.find(Ze => Ze.id === N)) == null ? undefined : Ut.completed;
      if (B.status === "done" && !xe) {
        v(Ze => Ze.map(Un => Un.id === A ? {
          ...W,
          status: "todo",
          completedAt: undefined
        } : Un)), t("Tarefa reaberta: esse passo voltou pra pendente", "↩️", "info");
        return;
      }
      if (((M == null ? undefined : M.autoComplete) ?? true) && B.status !== "done" && !Lt(B) && pa(W)) {
        pe(W, "steps");
        return;
      }
      v(Ze => Ze.map(Un => Un.id === A ? W : Un));
    }, [m, v, t, pe]),
    H = React.useCallback(A => {
      var M;
      const N = m.find(B => B.id === A);
      if (!(!N || N.status === "done")) {
        if (Lt(N)) {
          We(A, "button");
          return;
        }
        pe({
          ...N,
          subtasks: (M = N.subtasks) == null ? undefined : M.map(B => ({
            ...B,
            completed: true
          }))
        }, "steps");
      }
    }, [m, pe, We]),
    $ = React.useCallback(A => $e(A), []),
    je = React.useCallback(A => {
      $e(null), z(A);
    }, []),
    R = React.useCallback((A, N) => {
      var He;
      const M = m.find(ye => ye.id === A);
      if (!M || M.status === "done" || !ts(M) || o !== "idle" && s !== A && !window.confirm(`Você já tem um foco em andamento${r ? ` em "${r}"` : ""}. Trocar para "${M.title}" agora? O foco atual será interrompido.`)) return false;
      const B = (N == null ? undefined : N.skipped) || [],
        W = N != null && N.stepId ? (He = M.subtasks) == null ? undefined : He.find(ye => ye.id === N.stepId) : si(M, B);
      if (kn(M) === "trilha") {
        if (!W) return t("Todos os passos dessa trilha já foram feitos ou pulados.", "👣", "info"), false;
        if (!W.minutes && !(N != null && N.minutes)) return $e(null), X({
          kind: "stop",
          taskId: A,
          stepId: W.id,
          skipped: B
        }), true;
      }
      const xe = kn(M) === "trilha" ? {
        minutes: (N == null ? undefined : N.minutes) || W.minutes,
        cycles: 1,
        stepId: W.id,
        stepLabel: W.text
      } : N != null && N.minutes ? {
        minutes: N.minutes,
        cycles: 1
      } : sO(M);
      return xe ? ($e(null), X(null), localStorage.setItem("focusfrog_trailSkipped", JSON.stringify({
        taskId: A,
        skipped: B
      })), l({
        mode: xe.cycles > 1 ? "classic" : "quick",
        taskId: A,
        taskTitle: M.title,
        focusMinutes: xe.minutes,
        cycles: xe.cycles,
        stepId: xe.stepId,
        stepLabel: xe.stepLabel
      }), d("focus"), true) : false;
    }, [m, o, s, r, l, d, t, X]);
  React.useEffect(() => {
    const A = c;
    if (!A) return;
    u();
    const N = Yt(),
      M = G.date === N ? G.points : 0,
      B = oO(A.minutes, M),
      W = Math.round(A.minutes);
    if (B > 0 ? (n(ye => ye + B), de({
      date: N,
      points: M + B
    }), t(`+${B} pontos · ${W} min focados`, "⏱️", "success")) : A.minutes >= Ki && t(`${W} min focados · teto de pontos de hoje atingido`, "⏱️", "info"), !A.natural && A.minutes < Ki && A.minutes >= 0 && !A.taskId) {
      t("Começar já conta! A partir de 10 min o foco rende pontos", "🌱", "info");
      return;
    }
    if (!A.taskId) return;
    const xe = m.find(ye => ye.id === A.taskId);
    if (!xe || xe.status === "done" || (A.minutes >= Ki && v(ye => ye.map(Ut => Ut.id === xe.id ? {
      ...Ut,
      lastFocusDate: N
    } : Ut)), A.natural && A.minutes < 1)) return;
    if (!A.natural && A.minutes < Ki) {
      t("Começar já conta! A partir de 10 min o foco rende pontos", "🌱", "info");
      return;
    }
    let He = [];
    try {
      const ye = JSON.parse(localStorage.getItem("focusfrog_trailSkipped") || "null");
      (ye == null ? undefined : ye.taskId) === xe.id && (He = ye.skipped || []);
    } catch {}
    X({
      kind: "end",
      taskId: xe.id,
      stepId: A.stepId,
      minutes: A.minutes,
      skipped: He,
      focos: Math.max(A.natural ? 1 : 0, eO(A.minutes, Ur(xe)))
    });
  }, [c]);
  const Ae = React.useCallback((A, N) => {
      if (pa(A)) {
        X(null), pe(A, "focus");
        return;
      }
      const M = si(A, N);
      if (!M) {
        X(null), t("Trilha pausada. Os passos pulados continuam pendentes.", "👣", "info");
        return;
      }
      X(M.minutes ? {
        kind: "next",
        taskId: A.id,
        stepId: M.id,
        skipped: N
      } : {
        kind: "stop",
        taskId: A.id,
        stepId: M.id,
        skipped: N
      });
    }, [pe, t, X]),
    Ye = React.useCallback(A => {
      var He;
      const N = re;
      if (!N) return;
      const M = m.find(ye => ye.id === N.taskId);
      if (!M || M.status === "done") {
        X(null);
        return;
      }
      const B = ye => v(Ut => Ut.map(Ze => Ze.id === ye.id ? ye : Ze)),
        W = N.kind === "end" ? N.focos ?? 1 : 1,
        xe = ye => ({
          ...ye,
          pomodorosDone: (ye.pomodorosDone || 0) + W
        });
      switch (A.type) {
        case "yes":
          {
            X(null), pe({
              ...xe(M),
              subtasks: (He = M.subtasks) == null ? undefined : He.map(ye => ({
                ...ye,
                completed: true
              }))
            }, "focus");
            return;
          }
        case "notYet":
          X(null), B(xe(M)), t(W > 0 ? `Beleza: tarefa aberta, +${gS(W)} contado${W === 1 ? "" : "s"}` : "Beleza: tarefa aberta", "🐸", "info");
          return;
        case "blocoDone":
          {
            const ye = xe(wf(M, A.stepIds));
            X(null), pa(ye) ? pe(ye, "focus") : (B(ye), t("Os passos que faltam ficam pra próxima.", "👣", "info"));
            return;
          }
        case "stepYes":
        case "stopDid":
          {
            const ye = N.kind === "end" && N.stepId ? wf(M, [N.stepId]) : N.kind !== "end" ? wf(M, [N.stepId]) : M;
            pa(ye) || B(ye), Ae(ye, N.skipped);
            return;
          }
        case "stopSkip":
          N.kind !== "end" && Ae(M, [...N.skipped, N.stepId]);
          return;
        case "startNext":
          N.kind !== "end" && R(M.id, {
            stepId: N.stepId,
            skipped: N.skipped
          });
          return;
        case "stepMore":
          N.stepId && R(M.id, {
            stepId: N.stepId,
            skipped: N.skipped,
            minutes: 5
          });
          return;
        case "stepNo":
          X(null), t("Tudo bem. O passo continua de onde parou.", "🐸", "info");
          return;
        case "end":
          X(null);
          return;
      }
    }, [re, m, v, X, pe, Ae, R, t]),
    rt = React.useCallback((A, N, M) => {
      v(B => {
        const W = B.find(Ze => Ze.id === A);
        if (!W) return B;
        const xe = B.filter(Ze => Ze.quadrant === W.quadrant && Ze.id !== A),
          He = B.filter(Ze => Ze.quadrant === N),
          ye = B.filter(Ze => Ze.quadrant !== W.quadrant && Ze.quadrant !== N);
        return He.splice(M, 0, {
          ...W,
          quadrant: N
        }), [...ye, ...xe, ...He].map((Ze, Un) => ({
          ...Ze,
          displayOrder: Un
        }));
      });
    }, [v]),
    us = React.useCallback(() => {
      O && (v(A => {
        const N = [...A];
        return N.splice(O.index, 0, O.task), N;
      }), V(null), t("Tarefa de volta", "↩️", "info"));
    }, [O, v, t]),
    Es = React.useCallback(A => {
      A === s && a();
      const N = m.findIndex(B => B.id === A);
      if (N === -1) return;
      const M = m[N];
      V({
        task: M,
        index: N
      }), v(B => B.filter(W => W.id !== A)), t("Tarefa excluída", "🗑️", "info", {
        label: "Desfazer",
        onAction: us
      }), setTimeout(() => V(null), 5e3);
    }, [m, v, t, us, s, a]),
    wi = React.useCallback(A => {
      if (y === s && o !== "idle" && y !== A) {
        if (!window.confirm(`Você está em foco${r ? ` em "${r}"` : ""} agora. Trocar o Sapo do Dia vai interromper esse foco. Continuar?`)) return;
        a();
      }
      p(A);
    }, [y, s, r, o, a, p]),
    bi = React.useCallback(() => {
      if (y === s && o !== "idle") {
        if (!window.confirm(`Você está em foco${r ? ` em "${r}"` : ""} agora. Remover o Sapo do Dia vai interromper esse foco. Continuar?`)) return;
        a();
      }
      p(null);
    }, [y, s, r, o, a, p]),
    ki = React.useCallback(A => {
      if (A.id) return k(M => {
        var B;
        return (B = M.find(W => W.id === A.id)) != null && B.isDefault ? (t("Essa etiqueta é padrão e não pode ser editada", "🛡️", "info"), M) : (t("Etiqueta salva", "✏️", "success"), M.map(W => W.id === A.id ? {
          ...W,
          ...A
        } : W));
      }), A.id;
      const N = h();
      return k(M => [...M, {
        id: N,
        name: A.name,
        color: A.color,
        isDefault: false
      }]), t("Categoria criada", "✨", "success"), N;
    }, [k, t, h]),
    L = React.useCallback(A => {
      var N;
      if ((N = x.find(M => M.id === A)) != null && N.isDefault) {
        t("Essa etiqueta é padrão e não pode ser excluída", "🛡️", "info");
        return;
      }
      k(M => M.filter(B => B.id !== A)), v(M => M.map(B => B.tagId === A ? {
        ...B,
        tagId: undefined
      } : B)), t("Etiqueta excluída", "🗑️", "info");
    }, [x, k, v, t]),
    Ce = React.useCallback(A => {
      var M;
      const N = m.find(B => B.id === A);
      if (N) {
        const {
          id: B,
          status: W,
          displayOrder: xe,
          completedAt: He,
          pomodorosDone: ye,
          lastFocusDate: Ut,
          ...Ze
        } = N;
        oe({
          ...Ze,
          title: `${N.title} (Cópia)`,
          subtasks: (M = Ze.subtasks) == null ? undefined : M.map((Un, tt) => ({
            ...Un,
            id: `sub-${Date.now()}-${tt}`,
            completed: false
          }))
        });
      }
    }, [m, oe]),
    Tt = React.useCallback((A, N) => {
      v(M => M.map(B => {
        if (B.id === A) {
          const W = B.dueDate ? new Date(B.dueDate + "T00:00:00") : new Date();
          return W.setDate(W.getDate() + N), {
            ...B,
            dueDate: Wy(W)
          };
        }
        return B;
      })), t(N === 1 ? "Adiada pra amanhã" : `Adiada ${N} dias`, "🗓️", "info");
    }, [v, t]),
    vn = React.useCallback((A, N = "Personalizado") => {
      var B;
      const M = {
        id: h(),
        title: A.title || "Nova Tarefa",
        description: A.description,
        quadrant: A.quadrant,
        pomodoroEstimate: A.pomodoroEstimate,
        customDuration: A.customDuration,
        energyNeeded: A.energyNeeded,
        category: N,
        subtasks: (B = A.subtasks) == null ? undefined : B.map(W => ({
          text: W.text,
          ...(W.minutes ? {
            minutes: W.minutes
          } : {})
        })),
        isDefault: false
      };
      return S(W => [...W, M]), M;
    }, [S, h]),
    Ns = React.useCallback((A, N) => {
      const M = vn(A, N);
      t(`Modelo salvo em ${M.category}`, "📚", "success");
    }, [vn, t]),
    Ac = React.useCallback(A => {
      var N;
      if ((N = C.find(M => M.id === A)) != null && N.isDefault) {
        t("Esse modelo é padrão e não pode ser excluído", "🛡️", "info");
        return;
      }
      S(M => M.filter(B => B.id !== A)), t("Modelo excluído", "🗑️", "info");
    }, [C, S, t]),
    Ko = React.useCallback((A, N) => {
      const M = Date.now(),
        B = A.map((W, xe) => {
          var He;
          return {
            title: W.title,
            description: W.description,
            quadrant: W.quadrant || "inbox",
            pomodoroEstimate: W.pomodoroEstimate ?? 0,
            customDuration: W.customDuration,
            energyNeeded: W.energyNeeded,
            timeOfDay: W.timeOfDay,
            templateId: W.id,
            ...(N != null && N.dueDate ? {
              dueDate: N.dueDate
            } : {}),
            ...(N != null && N.routineId ? {
              routineId: N.routineId
            } : {}),
            subtasks: (He = W.subtasks) == null ? undefined : He.map((ye, Ut) => ({
              id: `sub-${M}-${xe}-${Ut}`,
              text: ye.text,
              completed: false,
              ...(ye.minutes ? {
                minutes: ye.minutes
              } : {})
            }))
          };
        });
      B.length > 0 && (ve(B), N != null && N.silent || t(B.length === 1 ? "1 tarefa adicionada" : `${B.length} tarefas adicionadas`, "✨", "success"));
    }, [ve, t]),
    [WT, Zv] = useLocalStorage("focusfrog_routinesAddedOn", {}),
    [HT, Qv] = React.useState(null),
    Ph = React.useCallback((A, N) => {
      const M = Yt();
      if (A.pickSome && !(N != null && N.only)) {
        Qv(A);
        return;
      }
      const B = m.filter(tt => tt.routineId === A.id && tt.status !== "done"),
        W = B.filter(tt => tt.dueDate === M);
      if (!(N != null && N.force) && W.length > 0) {
        t(`"${A.name}" já está no seu dia (${W.length} em aberto)`, "📋", "info", {
          label: "Adicionar de novo",
          onAction: () => Xv.current(A, {
            force: true,
            only: N == null ? undefined : N.only
          })
        });
        return;
      }
      const xe = uh(A, C),
        He = N != null && N.only ? xe.filter(tt => N.only.includes(tt.id)) : xe;
      if (He.length === 0) {
        t(N != null && N.only ? "Nada marcado pra hoje." : `"${A.name}" está sem tarefas. Edite a rotina pra incluir alguma.`, "ℹ️", "info");
        return;
      }
      const ye = tt => {
        A.isDefault && z3(A.name), Zv(qn => ({
          ...qn,
          [A.id]: M
        })), t(`"${A.name}" entrou no seu dia${tt}`, "🚀", "success");
      };
      if (A.asOneTask) {
        const tt = N != null && N.force ? undefined : B.find(qn => qn.dueDate !== M && !qn.templateId);
        tt ? (v(qn => qn.map(Ih => Ih.id === tt.id ? {
          ...Ih,
          dueDate: M
        } : Ih)), ye(" (a de antes, que ficou aberta)")) : (ve([FI(A, He, M)]), ye(""));
        return;
      }
      const Ut = new Map();
      N != null && N.force || B.filter(tt => tt.dueDate !== M && tt.templateId !== undefined).forEach(tt => {
        Ut.has(tt.templateId) || Ut.set(tt.templateId, tt.id);
      });
      const Ze = new Set([...Ut].filter(([tt]) => He.some(qn => qn.id === tt)).map(([, tt]) => tt));
      Ze.size && v(tt => tt.map(qn => Ze.has(qn.id) ? {
        ...qn,
        dueDate: M
      } : qn));
      const Un = He.filter(tt => !Ut.has(tt.id));
      Un.length && Ko(Un, {
        silent: true,
        dueDate: M,
        routineId: A.id
      }), ye(Ze.size ? ` (${Ze.size} que tinha ficado em aberto veio junto)` : "");
    }, [C, Ko, ve, t, Zv, m, v]),
    GT = React.useCallback(A => {
      const N = [],
        M = A.map(({
          routine: B,
          templates: W
        }) => {
          const xe = W.map(He => {
            const ye = {
              ...He,
              id: h(),
              isDefault: false
            };
            return N.push(ye), ye.id;
          });
          return {
            ...B,
            id: `routine-${h()}`,
            isDefault: false,
            taskTemplateIds: xe
          };
        });
      S(B => [...B, ...N]), b(B => [...B, ...M]);
    }, [h, S, b]),
    Xv = React.useRef(Ph);
  Xv.current = Ph;
  const KT = React.useCallback(A => {
      b(N => {
        const M = N.findIndex(B => B.id === A.id);
        if (M > -1) {
          const B = [...N];
          return B[M] = A, t(`Rotina "${A.name}" salva`, "✏️", "success"), B;
        } else {
          const B = {
            ...A,
            id: `routine-${h()}`,
            isDefault: false,
            taskTemplateIds: A.taskTemplateIds || []
          };
          return t(`Rotina "${B.name}" criada`, "✨", "success"), [...N, B];
        }
      });
    }, [b, t, h]),
    JT = React.useCallback(A => {
      var N;
      if ((N = g.find(M => M.id === A)) != null && N.isDefault) {
        t("Essa rotina é padrão e não pode ser excluída", "🛡️", "info");
        return;
      }
      b(M => M.filter(B => B.id !== A)), t("Rotina excluída", "🗑️", "info");
    }, [g, b, t]),
    YT = A => P(N => N.map(M => M.id === A ? {
      ...M,
      completed: !M.completed
    } : M)),
    ZT = A => P(N => [...N, {
      id: `item-${Date.now()}`,
      text: A,
      completed: false
    }]),
    QT = A => P(N => N.filter(M => M.id !== A)),
    XT = () => P(A => A.map(N => ({
      ...N,
      completed: false
    }))),
    eE = React.useCallback(() => {
      const A = m.filter(N => N.quadrant === "inbox");
      E(A), A.length === 0 && t("Despejo mental vazio. Cabeça leve!", "🎉", "success");
    }, [m, t]),
    Si = React.useCallback(() => E([]), []),
    tE = React.useCallback(A => {
      if (U.length === 0) return;
      const N = U[0];
      rt(N.id, A, m.filter(M => M.quadrant === A).length), E(M => M.slice(1)), U.length === 1 && (t("Despejo organizado!", "✅", "success"), Si());
    }, [U, m, rt, Si, t]),
    nE = React.useCallback(() => {
      var N;
      if (U.length === 0) return;
      const A = m.find(M => M.id === U[0].id);
      A && A.status !== "done" && (Lt(A) ? We(A.id, "triage") : pe({
        ...A,
        subtasks: (N = A.subtasks) == null ? undefined : N.map(M => ({
          ...M,
          completed: true
        }))
      }, "triage")), E(M => M.slice(1)), U.length === 1 && (t("Despejo organizado!", "✅", "success"), Si());
    }, [U, m, pe, We, t, Si]),
    sE = React.useCallback(() => {
      const A = m.find(N => Lt(N) && N.status !== "done");
      if (A) {
        p(A.id);
        return;
      }
      v(N => {
        var W;
        const M = N.find(xe => xe.id === ul);
        return M && M.status !== "done" ? N : [{
          ...D_,
          subtasks: (W = D_.subtasks) == null ? undefined : W.map(xe => ({
            ...xe,
            completed: false
          }))
        }, ...N.filter(xe => xe.id !== ul)];
      }), p(ul);
    }, [m, v, p]),
    rE = React.useMemo(() => {
      const A = Yt();
      return !m.find(N => N.id === y && N.dueDate === A);
    }, [m, y]),
    oE = {
      tasks: m,
      tags: x,
      frogTaskId: y,
      routines: g,
      routinesAddedOn: WT,
      taskTemplates: C,
      handleAddTask: oe,
      handleAddTasks: ve,
      handleUpdateTask: Z,
      handleUpdateTaskQuadrant: rt,
      handleDeleteTask: Es,
      handleCompleteTask: We,
      handleToggleSubtask: Ct,
      handleCompleteAllSteps: H,
      handleReopenTask: F,
      startTaskFocus: R,
      sessionPrompt: re,
      resolvePrompt: Ye,
      stepsTaskId: Ie,
      openSteps: $,
      editingTask: Je,
      openTaskEditor: je,
      processTriageDone: nE,
      handleSetFrog: wi,
      ensureMarketingFrog: sE,
      handleUnsetFrog: bi,
      handleSaveTag: ki,
      handleDeleteTag: L,
      handleDuplicateTask: Ce,
      handlePostponeTask: Tt,
      needsMorningPlan: rE,
      handleCreateTemplateFromTask: Ns,
      handleCreateTemplate: vn,
      handleDeleteTemplate: Ac,
      handleAddRoutine: Ph,
      routinePick: HT,
      setRoutinePick: Qv,
      handleImportRoutines: GT,
      handleSaveRoutine: KT,
      handleDeleteRoutine: JT,
      handleAddTemplates: Ko,
      leavingHomeItems: T,
      handleToggleLeavingHomeItem: YT,
      handleAddLeavingHomeItem: ZT,
      handleRemoveLeavingHomeItem: QT,
      handleResetLeavingHomeItems: XT,
      triageQueue: U,
      isTriageActive: K,
      startTriage: eE,
      processTriage: tE,
      endTriage: Si
    };
  return <VS.Provider value={oE}>{e}</VS.Provider>;
};
