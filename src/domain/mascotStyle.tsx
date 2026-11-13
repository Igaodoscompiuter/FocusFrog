// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import { lazyImport } from '../utils/lazyImport';
import { FO } from './mascotState';

export const l1 = [{
  id: "acc_none",
  slot: "accessory",
  name: "Sem acessório",
  desc: "Do jeito que veio da lagoa.",
  price: 0
}, {
  id: "acc_leaf",
  slot: "accessory",
  name: "Folha",
  desc: "Uma folhinha presa no topo da cabeça.",
  price: 150
}, {
  id: "acc_bowtie",
  slot: "accessory",
  name: "Gravata-borboleta",
  desc: "Pra dias de reunião.",
  price: 200
}, {
  id: "acc_glasses",
  slot: "accessory",
  name: "Óculos escuros",
  desc: "Foco sem distração.",
  price: 250
}, {
  id: "acc_headphones",
  slot: "accessory",
  name: "Fones de foco",
  desc: "Modo concentração ligado.",
  price: 300
}, {
  id: "acc_crown",
  slot: "accessory",
  name: "Coroa",
  desc: "Pra quem não deixa o sapo do dia escapar.",
  price: 800,
  epic: true
}, {
  id: "scene_pond",
  slot: "scene",
  name: "Lagoa",
  desc: "O verde de sempre.",
  price: 0
}, {
  id: "scene_night",
  slot: "scene",
  name: "Lagoa à noite",
  desc: "Céu escuro e estrelas.",
  price: 250
}, {
  id: "scene_sunset",
  slot: "scene",
  name: "Fim de tarde",
  desc: "Luz quente de pôr do sol.",
  price: 250
}, {
  id: "scene_lotus",
  slot: "scene",
  name: "Flor de lótus",
  desc: "Uma flor aberta na vitória-régia.",
  price: 350
}];

export const RO = [{
  id: "flies",
  name: "Pote de moscas",
  desc: "3 moscas extras pra alimentar o mascote quando quiser.",
  price: 30,
  amount: 3
}, {
  id: "firefly",
  name: "Vagalumes",
  desc: "Vagalumes em volta do mascote por 24 horas.",
  price: 60,
  amount: 1
}];

const $S = "focusfrog_mascotStyle";

export const Vo = "focusfrog:mascot-style";

const c1 = {
  accessory: "acc_none",
  scene: "scene_pond",
  fliesBought: 0,
  fireflyUntil: 0
};

export function ns() {
  try {
    return {
      ...c1,
      ...(JSON.parse(localStorage.getItem($S) || "{}") || {})
    };
  } catch {
    return {
      ...c1
    };
  }
}

export function Pm(e) {
  const t = {
    ...ns(),
    ...e
  };
  try {
    localStorage.setItem($S, JSON.stringify(t));
  } catch {}
  return window.dispatchEvent(new Event(Vo)), t;
}

export function DO(e, t = Date.now()) {
  const n = ns();
  return e === "flies" ? (lazyImport(() => Promise.resolve().then(() => FO), undefined).then(s => s.mascotEvent({
    type: "buyFlies",
    n: 3
  })).catch(() => {}), n) : Pm({
    fireflyUntil: Math.max(t, n.fireflyUntil) + 24 * 36e5
  });
}
