// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).


const Fi = {
  food: 4,
  foodSleep: 1.5,
  energySleep: 12,
  mood: 1.5,
  moodHungryExtra: 1.5
};

const bO = 22;

const kO = 7;

const pl = 36e5;

export const Nm = {
  focos2: {
    label: "Fazer 2 focos",
    target: 2
  },
  frog: {
    label: "Engolir o Sapo do Dia",
    target: 1
  },
  tasks3: {
    label: "Concluir 3 tarefas",
    target: 3
  },
  break1: {
    label: "Fazer uma pausa até o fim",
    target: 1
  },
  feed2: {
    label: "Alimentar o mascote 2 vezes",
    target: 2
  },
  quick2: {
    label: "Concluir 2 tarefas rápidas",
    target: 2
  },
  pet3: {
    label: "Fazer 3 carinhos",
    target: 3
  }
};

const o1 = ["focos2", "frog", "tasks3", "break1", "feed2", "quick2"];

export const zo = {
  flies: 2,
  xp: 25
};

export const xc = {
  3: 2,
  7: 4,
  14: 5,
  21: 5,
  30: 8,
  50: 10,
  75: 10,
  100: 15,
  150: 15,
  200: 20,
  365: 30
};

const SO = 2;

const a1 = Object.keys(xc).map(Number).sort((e, t) => e - t);

export function jO(e) {
  const t = a1.find(s => s > e) ?? (Math.floor(e / 100) + 1) * 100;
  return {
    prev: [...a1].reverse().find(s => s <= e) ?? 0,
    next: t,
    gift: xc[t] ?? 15
  };
}

const AS = 40 * 6e4;

const bf = 3;

const CO = 3;

const yd = [0, 0, 60, 160, 300, 500, 800, 1200, 1700, 2300, 3e3];

export function Am(e) {
  let t = 1;
  for (let n = 2; n < yd.length; n++) e >= yd[n] && (t = n);
  return e >= 3e3 && (t = 10 + Math.floor((e - 3e3) / 800)), t;
}

export function TO(e) {
  const t = n => n < yd.length ? yd[n] : 3e3 + (n - 10) * 800;
  return [t(e), t(e + 1)];
}

export function vd(e) {
  return e <= 2 ? "Girino" : e <= 4 ? "Sapinho" : e <= 6 ? "Saltador" : e <= 8 ? "Cantor da lagoa" : e === 9 ? "Guardião da lagoa" : "Sábio da lagoa";
}

export const bs = e => {
  const t = new Date(e);
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
};

const ys = e => Math.max(0, Math.min(100, e));

const PS = e => e >= bO || e < kO;

function IS(e) {
  let t = 0;
  for (let n = 0; n < e.length; n++) t = t * 31 + e.charCodeAt(n) >>> 0;
  return o1[t % o1.length];
}

function i1(e, t = 3) {
  const n = bs(e);
  return {
    v: 1,
    food: 70,
    energy: 80,
    mood: 65,
    at: e,
    xp: 0,
    flies: t,
    streak: 0,
    lastCareDay: "",
    best: 0,
    freezes: 0,
    combo: {
      n: 0,
      at: 0
    },
    comboBonus: {
      day: "",
      n: 0
    },
    mission: {
      day: n,
      id: IS(n),
      progress: 0,
      done: false
    },
    react: null,
    pets: {
      start: 0,
      n: 0
    },
    lastSeen: e
  };
}

export function OS(e, t) {
  const n = {
    ...e,
    mission: {
      ...e.mission
    }
  };
  let s = e.at;
  const r = Math.min(t, e.at + 72 * pl),
    o = pl / 4;
  for (; s < r;) {
    const l = Math.min(o, r - s) / pl,
      c = PS(new Date(s).getHours());
    n.food = ys(n.food - (c ? Fi.foodSleep : Fi.food) * l), n.energy = ys(n.energy + (c ? Fi.energySleep : -3) * l), n.mood = ys(n.mood - (Fi.mood + (n.food < 25 ? Fi.moodHungryExtra : 0)) * l), s += o;
  }
  n.at = Math.max(e.at, t);
  const a = bs(t);
  return n.mission.day !== a && (n.mission = {
    day: a,
    id: IS(a),
    progress: 0,
    done: false
  }), n.react && n.react.until <= t && (n.react = null), n;
}

function RS(e, t) {
  if (!e || !t) return 1 / 0;
  const [n, s, r] = e.split("-").map(Number),
    [o, a, l] = t.split("-").map(Number);
  return Math.round((Date.UTC(o, a - 1, l) - Date.UTC(n, s - 1, r)) / 864e5);
}

export function fh(e, t) {
  const n = RS(e.lastCareDay, bs(t)),
    s = n - 1,
    r = e.streak > 0 && (n <= 1 || s <= (e.freezes || 0));
  return {
    days: r ? e.streak : 0,
    today: n === 0,
    atRisk: r && n >= 1,
    freezes: e.freezes || 0,
    freezesUsed: r && n > 1 ? s : 0,
    best: Math.max(e.best || 0, e.streak)
  };
}

function kf(e, t) {
  const n = bs(t);
  if (e.lastCareDay === n) return;
  const s = fh(e, t);
  s.days > 0 ? (e.freezes = Math.max(0, (e.freezes || 0) - s.freezesUsed), e.streak = s.days + 1) : e.streak = 1, e.lastCareDay = n, e.best = Math.max(e.best || 0, e.streak), e.streak % 7 === 0 && (e.freezes = Math.min(SO, (e.freezes || 0) + 1));
  const r = xc[e.streak];
  r && (e.flies += r, e.react = {
    kind: "streak",
    until: t + 30 * 6e4,
    n: e.streak
  });
}

function Sf(e, t, n = 1) {
  const s = e.combo || {
      n: 0,
      at: 0
    },
    r = t - s.at <= AS ? s.n + n : n;
  e.combo = {
    n: r,
    at: t
  };
  const o = bs(t),
    a = e.comboBonus && e.comboBonus.day === o ? e.comboBonus : {
      day: o,
      n: 0
    },
    l = Math.floor(r / bf) > Math.floor((r - n) / bf);
  r >= bf && l && a.n < CO ? (e.flies += 1, e.comboBonus = {
    day: o,
    n: a.n + 1
  }, (!e.react || !["streak", "levelup"].includes(e.react.kind) || e.react.until <= t) && (e.react = {
    kind: "combo",
    until: t + 15 * 6e4,
    n: r
  })) : e.comboBonus = a;
}

export function EO(e, t) {
  return e.combo && t - e.combo.at <= AS ? e.combo.n : 0;
}

function yo(e, t, n) {
  const s = Am(e.xp);
  e.xp += t;
  const r = Am(e.xp);
  r > s && (e.flies += 2, e.react = {
    kind: "levelup",
    until: n + 30 * 6e4,
    n: r
  });
}

function yr(e, t, n, s) {
  e.mission.id !== t || e.mission.done || (e.mission.progress = Math.min(Nm[t].target, e.mission.progress + n), e.mission.progress >= Nm[t].target && (e.mission.done = true, e.flies += zo.flies, yo(e, zo.xp, s), (!e.react || e.react.kind !== "levelup") && (e.react = {
    kind: "mission",
    until: s + 30 * 6e4
  })));
}

const Ps = (e, t, n, s, r) => {
  e.react && ["levelup", "streak", "combo"].includes(e.react.kind) && e.react.until > n && t !== "levelup" || (e.react = {
    kind: t,
    until: n + s * 6e4,
    ...(r !== undefined ? {
      n: r
    } : {})
  });
};

export function NO(e, t, n) {
  const s = OS(e, n);
  switch (t.type) {
    case "focus":
      {
        const r = Math.max(1, t.focos);
        s.flies += r, s.energy = ys(s.energy - 10 * r), s.mood = ys(s.mood + 4), Ps(s, "focus", n, 20, r), Sf(s, n, r), kf(s, n), yo(s, 10 * r, n), yr(s, "focos2", r, n);
        break;
      }
    case "break":
      s.energy = ys(s.energy + 12), Ps(s, "break", n, 5), yo(s, 2, n), yr(s, "break1", 1, n);
      break;
    case "task":
      s.mood = ys(s.mood + 6), Ps(s, "task", n, 10), Sf(s, n), kf(s, n), yo(s, 4, n), yr(s, "tasks3", 1, n), t.quick && yr(s, "quick2", 1, n);
      break;
    case "frog":
      s.mood = ys(s.mood + 15), Ps(s, "frog", n, 30), Sf(s, n), kf(s, n), yo(s, 20, n), yr(s, "tasks3", 1, n), yr(s, "frog", 1, n);
      break;
    case "feed":
      if (s.flies <= 0) {
        Ps(s, "nofly", n, 0.15);
        break;
      }
      s.flies -= 1, s.food = ys(s.food + 28), s.mood = ys(s.mood + 3), Ps(s, "eat", n, 0.15), yo(s, 2, n), yr(s, "feed2", 1, n);
      break;
    case "pet":
      {
        n - s.pets.start > pl && (s.pets = {
          start: n,
          n: 0
        }), s.pets.n < 5 ? (s.mood = ys(s.mood + 5), s.pets = {
          ...s.pets,
          n: s.pets.n + 1
        }, yo(s, 1, n), Ps(s, "pet", n, 0.15)) : Ps(s, "tickled", n, 0.15), yr(s, "pet3", 1, n);
        break;
      }
    case "open":
      {
        s.streak > 0 && fh(s, n).days === 0 ? (Ps(s, "missed", n, 10, s.streak), s.streak = 0) : n - s.lastSeen > 24 * pl && Ps(s, "missed", n, 10);
        break;
      }
    case "buyFlies":
      s.flies += Math.max(0, t.n);
      break;
    case "seedStreak":
      return s.seeded || (s.seeded = true, t.days > s.streak && RS(t.lastDay, bs(n)) <= 1 && (s.streak = t.days, s.lastCareDay = t.lastDay), s.best = Math.max(s.best || 0, s.streak, t.days)), {
        ...s,
        lastSeen: e.lastSeen
      };
  }
  return s.lastSeen = n, s;
}

export function AO(e, t) {
  return e.react && e.react.until > t ? e.react.kind : PS(new Date(t).getHours()) ? "sleepy" : e.food < 25 ? "hungry" : e.energy < 25 ? "tired" : e.mood < 30 ? "sad" : e.mood > 75 && e.food > 50 ? "happy" : "normal";
}

export const PO = {
  focus: "Animado",
  break: "Descansando",
  task: "Contente",
  frog: "Orgulhoso",
  eat: "Comendo",
  nofly: "Com fome",
  pet: "Feliz",
  tickled: "Rindo",
  levelup: "Subiu de nível",
  mission: "Orgulhoso",
  missed: "Com saudade",
  streak: "Comemorando",
  combo: "No embalo",
  sleepy: "Dormindo",
  hungry: "Com fome",
  tired: "Cansado",
  sad: "Pra baixo",
  happy: "Feliz",
  normal: "Tranquilo"
};

export function IO(e, t) {
  var s;
  const n = ((s = e.react) == null ? undefined : s.n) ?? 0;
  switch (t) {
    case "focus":
      return `Mandou bem! Ganhei ${n === 1 ? "uma mosca" : `${n} moscas`}.`;
    case "break":
      return "Pausa feita. Recarreguei a energia.";
    case "task":
      return "Mais uma concluída. Bora!";
    case "frog":
      return "Você engoliu o Sapo do Dia. O resto é lucro.";
    case "eat":
      return "Valeu pela mosca.";
    case "nofly":
      return "Sem moscas. Cada foco completo rende uma.";
    case "pet":
      return null;
    case "tickled":
      return "Haha, já chega. Bora focar?";
    case "levelup":
      return `Subi pro nível ${n}: ${vd(n)}! Ganhei 2 moscas.`;
    case "mission":
      return `Missão do dia cumprida! +${zo.flies} moscas.`;
    case "streak":
      return `${n} dias seguidos! Ganhei ${xc[n] ?? 0} moscas de presente.`;
    case "combo":
      return `Combo de ${n}! Uma mosca extra pra mim.`;
    case "missed":
      return n > 1 ? `A sequência de ${n} dias acabou, mas o recorde fica. Bora começar outra hoje?` : "Senti sua falta. Bora começar com algo pequeno?";
    case "sleepy":
      return "Zzz… descansar também faz parte.";
    case "hungry":
      return e.flies > 0 ? `Tô com fome. Tem ${e.flies === 1 ? "uma mosca guardada" : `${e.flies} moscas guardadas`}.` : "Tô com fome. Um foco me traz uma mosca.";
    case "tired":
      return "Tô cansado. Que tal uma pausa de 5 min?";
    case "sad":
      return "Tô meio pra baixo. Um carinho ajuda.";
    default:
      return null;
  }
}

export const DS = "mascotState";

export function OO(e, t, n = 0) {
  try {
    const s = e ? JSON.parse(e) : null;
    if (s && s.v === 1 && typeof s.at == "number") return {
      ...i1(t),
      ...s
    };
  } catch {}
  return i1(t, 3 + Math.max(0, n));
}
