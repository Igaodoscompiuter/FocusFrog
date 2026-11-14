// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import { Hy, todayISO } from "../utils/dates";
import { zArray, zBoolean, zNumber, zObject, zString, zUnion } from "./zodShim";

const Gw = 500;

const $T = {
  inbox: "inbox",
  despejo: "inbox",
  do: "do",
  fazer: "do",
  agora: "do",
  schedule: "schedule",
  agendar: "schedule",
  planejar: "schedule",
  delegate: "delegate",
  delegar: "delegate",
  someday: "someday",
  depois: "someday",
  ideias: "someday",
};

const FT = {
  low: "low",
  baixa: "low",
  medium: "medium",
  media: "medium",
  média: "medium",
  high: "high",
  alta: "high",
};

const MT = {
  morning: "morning",
  manha: "morning",
  manhã: "morning",
  afternoon: "afternoon",
  tarde: "afternoon",
  night: "night",
  noite: "night",
};

const Ro = (e, t) =>
  zString()
    .transform((n) => n.trim().toLowerCase())
    .refine((n) => n in e, {
      message: `${t} inválido; use: ${[...new Set(Object.keys(e))].join(", ")}`,
    })
    .transform((n) => e[n]);

const DJ = /^\d{4}-\d{2}-\d{2}$/;

const $J = zString()
  .transform((e) => e.trim().toLowerCase())
  .refine(
    (e) =>
      ["hoje", "today", "amanha", "amanhã", "tomorrow"].includes(e) ||
      DJ.test(e),
    {
      message: 'data no formato AAAA-MM-DD, ou "hoje" / "amanhã"',
    }
  )
  .transform((e) =>
    e === "hoje" || e === "today"
      ? todayISO()
      : e.startsWith("aman") || e === "tomorrow"
      ? Hy(1)
      : e
  );

const Ig = zUnion([
  zString().trim().min(1, "passo vazio"),
  zObject({
    text: zString().trim().min(1, "passo vazio"),
    minutes: zNumber().int().min(1).max(240).optional(),
    done: zBoolean().optional(),
  }).strict(),
]);

const FJ = zObject({
  title: zString()
    .trim()
    .min(1, "título vazio")
    .max(200, "título com mais de 200 letras"),
  description: zString().max(2e3).optional(),
  quadrant: Ro($T, "quadrante").optional(),
  dueDate: $J.optional(),
  pomodoroEstimate: zNumber().int().min(0).max(12).optional(),
  customDuration: zNumber().int().min(1).max(180).optional(),
  energyNeeded: Ro(FT, "energia").optional(),
  timeOfDay: Ro(MT, "período").optional(),
  steps: zArray(Ig).max(50).optional(),
  subtasks: zArray(Ig).max(50).optional(),
  tag: zString().trim().optional(),
}).strict();

const Kw = {
  dom: 0,
  domingo: 0,
  seg: 1,
  segunda: 1,
  ter: 2,
  terca: 2,
  terça: 2,
  qua: 3,
  quarta: 3,
  qui: 4,
  quinta: 4,
  sex: 5,
  sexta: 5,
  sab: 6,
  sáb: 6,
  sabado: 6,
  sábado: 6,
};

const MJ = zUnion([
  zNumber().int().min(0).max(6),
  zString()
    .transform((e) =>
      e
        .trim()
        .toLowerCase()
        .replace(/-feira$/, "")
    )
    .refine((e) => e in Kw, {
      message: "dia inválido; use dom, seg, ter, qua, qui, sex, sáb (ou 0 a 6)",
    })
    .transform((e) => Kw[e]),
]);

const LJ = {
  uma: "one",
  "uma tarefa": "one",
  one: "one",
  separadas: "separate",
  separate: "separate",
  escolher: "pick",
  pick: "pick",
};

const BJ = zObject({
  title: zString().trim().min(1, "título vazio").max(200),
  description: zString().max(2e3).optional(),
  quadrant: Ro($T, "quadrante").optional(),
  pomodoroEstimate: zNumber().int().min(0).max(12).optional(),
  customDuration: zNumber().int().min(1).max(180).optional(),
  energyNeeded: Ro(FT, "energia").optional(),
  timeOfDay: Ro(MT, "período").optional(),
  steps: zArray(Ig).max(50).optional(),
  estMinutes: zNumber().int().min(1).max(600).optional(),
}).strict();

const zJ = zObject({
  name: zString().trim().min(1, "nome vazio").max(80),
  description: zString().max(300).optional(),
  icon: zString().optional(),
  days: zArray(MJ).max(7).optional(),
  time: zString()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "horário no formato HH:MM")
    .optional(),
  alarm: zBoolean().optional(),
  mode: Ro(LJ, "modo").optional(),
  tasks: zArray(BJ).min(1, "rotina sem tarefas").max(30),
}).strict();

const Jw = {
  string: "texto",
  number: "número",
  boolean: "verdadeiro/falso",
  array: "lista",
  object: "objeto",
  undefined: "vazio",
  null: "nulo",
};

function Og(e) {
  const t = e.path.length ? `${e.path.join(".")}: ` : "";
  switch (e.code) {
    case "invalid_type":
      return e.received === "undefined"
        ? `${t}obrigatório`
        : `${t}esperava ${Jw[e.expected] ?? e.expected}, veio ${
            Jw[e.received] ?? e.received
          }`;
    case "unrecognized_keys":
      return `${t}campo desconhecido: ${e.keys.join(", ")}`;
    case "too_small":
      return e.message.startsWith("Number") ||
        e.message.startsWith("String") ||
        e.message.startsWith("Array")
        ? `${t}valor abaixo do mínimo (${e.minimum})`
        : `${t}${e.message}`;
    case "too_big":
      return e.message.startsWith("Number") ||
        e.message.startsWith("String") ||
        e.message.startsWith("Array")
        ? `${t}valor acima do máximo (${e.maximum})`
        : `${t}${e.message}`;
    case "invalid_union": {
      const s = e.unionErrors
        .flatMap((r) => r.issues)
        .find((r) => r.code !== "invalid_type" && r.code !== "invalid_union");
      return s ? Og(s) : `${t}valor em formato inválido`;
    }
    default:
      return `${t}${e.message}`;
  }
}

const ho = (e) => e.trim().toLowerCase().replace(/\s+/g, " ");

export function parseImport(e, t, n, s = []) {
  const r = {
    ready: [],
    routines: [],
    errors: [],
    warnings: [],
  };
  let o;
  try {
    o = JSON.parse(e);
  } catch (m) {
    return (
      (r.fatal = `JSON inválido: ${
        m instanceof Error ? m.message : String(m)
      }`),
      r
    );
  }
  const a = o && typeof o == "object" && !Array.isArray(o) ? o : null,
    l = Array.isArray(o)
      ? o
      : a && Array.isArray(a.tasks)
      ? a.tasks
      : a
      ? []
      : null,
    c = a && Array.isArray(a.routines) ? a.routines : [];
  if (!l || (a && !Array.isArray(a.tasks) && !Array.isArray(a.routines)))
    return (
      (r.fatal =
        'Formato esperado: uma lista de tarefas [ ... ] ou { "tasks": [ ... ], "routines": [ ... ] }'),
      r
    );
  if (l.length === 0 && c.length === 0)
    return (r.fatal = "A lista está vazia."), r;
  if (l.length > Gw)
    return (r.fatal = `São ${l.length} tarefas; o máximo por vez é ${Gw}.`), r;
  if (c.length > 20)
    return (r.fatal = `São ${c.length} rotinas; o máximo por vez é 20.`), r;
  const u = new Set(s.map((m) => ho(m.name)));
  c.forEach((m, v) => {
    const x = v + 1,
      k = zJ.safeParse(m),
      y =
        m && typeof m == "object" && typeof m.name == "string"
          ? m.name
          : undefined;
    if (!k.success) {
      r.errors.push({
        item: x,
        routine: true,
        title: y,
        message: k.error.issues.map(Og).join(" · "),
      });
      return;
    }
    const p = k.data,
      g = [...new Set(p.days ?? [])].sort(),
      b = {
        name: p.name,
        description: p.description ?? "",
        icon: p.icon ?? "bookOpen",
        ...(g.length && g.length < 7
          ? {
              days: g,
            }
          : {}),
        ...(p.time
          ? {
              scheduledTime: p.time,
              alarmMode: p.alarm ? "alarm" : "normal",
            }
          : {}),
        ...(p.mode === "one"
          ? {
              asOneTask: true,
            }
          : p.mode === "pick"
          ? {
              pickSome: true,
            }
          : {}),
      },
      j = p.tasks.map((S) => {
        var T;
        return {
          title: S.title,
          category: p.name,
          isDefault: false,
          ...(S.description
            ? {
                description: S.description,
              }
            : {}),
          quadrant: S.quadrant ?? "do",
          pomodoroEstimate: S.pomodoroEstimate ?? 0,
          ...(S.customDuration
            ? {
                customDuration: S.customDuration,
              }
            : {}),
          ...(S.energyNeeded
            ? {
                energyNeeded: S.energyNeeded,
              }
            : {}),
          ...(S.timeOfDay
            ? {
                timeOfDay: S.timeOfDay,
              }
            : {}),
          ...(S.estMinutes
            ? {
                estMinutes: S.estMinutes,
              }
            : {}),
          ...((T = S.steps) != null && T.length
            ? {
                subtasks: S.steps.map((P) =>
                  typeof P == "string"
                    ? {
                        text: P,
                      }
                    : {
                        text: P.text,
                        ...(P.minutes
                          ? {
                              minutes: P.minutes,
                            }
                          : {}),
                      }
                ),
              }
            : {}),
        };
      }),
      C = u.has(ho(p.name));
    u.add(ho(p.name)),
      r.routines.push({
        item: x,
        routine: b,
        templates: j,
        duplicate: C,
      });
  });
  const d = new Set(
      t.filter((m) => m.status !== "done").map((m) => ho(m.title))
    ),
    f = new Set(),
    h = Date.now();
  return (
    l.forEach((m, v) => {
      const x = v + 1,
        k = FJ.safeParse(m),
        y =
          m && typeof m == "object" && typeof m.title == "string"
            ? m.title
            : undefined;
      if (!k.success) {
        r.errors.push({
          item: x,
          title: y,
          message: k.error.issues.map(Og).join(" · "),
        });
        return;
      }
      const p = k.data;
      p.steps &&
        p.subtasks &&
        r.warnings.push({
          item: x,
          title: p.title,
          message: 'tem "steps" e "subtasks"; usei os dois juntos',
        });
      const g = [...(p.steps ?? []), ...(p.subtasks ?? [])];
      let b;
      if (p.tag) {
        const T = n.find((P) => ho(P.name) === ho(p.tag));
        T
          ? (b = T.id)
          : r.warnings.push({
              item: x,
              title: p.title,
              message: `etiqueta "${p.tag}" não existe no app; entrou sem etiqueta`,
            });
      }
      const j = {
          title: p.title,
          quadrant: p.quadrant ?? "inbox",
          ...(p.description
            ? {
                description: p.description,
              }
            : {}),
          ...(p.dueDate
            ? {
                dueDate: p.dueDate,
              }
            : {}),
          pomodoroEstimate: p.pomodoroEstimate ?? 0,
          ...(p.customDuration
            ? {
                customDuration: p.customDuration,
              }
            : {}),
          ...(p.energyNeeded
            ? {
                energyNeeded: p.energyNeeded,
              }
            : {}),
          ...(p.timeOfDay
            ? {
                timeOfDay: p.timeOfDay,
              }
            : {}),
          ...(b !== undefined
            ? {
                tagId: b,
              }
            : {}),
          ...(g.length
            ? {
                subtasks: g.map((T, P) =>
                  typeof T == "string"
                    ? {
                        id: `sub-${h}-${v}-${P}`,
                        text: T,
                        completed: false,
                      }
                    : {
                        id: `sub-${h}-${v}-${P}`,
                        text: T.text,
                        completed: !!T.done,
                        ...(T.minutes
                          ? {
                              minutes: T.minutes,
                            }
                          : {}),
                      }
                ),
              }
            : {}),
        },
        C = ho(p.title),
        S = d.has(C) || f.has(C);
      f.add(C),
        r.ready.push({
          item: x,
          task: j,
          duplicate: S,
        });
    }),
    r
  );
}

export const IMPORT_EXAMPLE = `{
  "tasks": [
    { "title": "Responder o e-mail do cliente", "quadrant": "fazer", "dueDate": "hoje" },
    {
      "title": "Estudar capítulo 3",
      "quadrant": "agendar",
      "pomodoroEstimate": 2,
      "customDuration": 25,
      "energyNeeded": "alta"
    },
    {
      "title": "Limpar a cozinha",
      "steps": [
        "Separar a louça",
        { "text": "Lavar tudo", "minutes": 15 },
        { "text": "Passar pano no balcão", "minutes": 5 }
      ]
    }
  ]
}`;
