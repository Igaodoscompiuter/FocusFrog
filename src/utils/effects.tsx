// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import { k3 } from "../data/frogs";
import { Gy, cS } from "./audio";

export const Ua = [
  {
    id: "start",
    title: "Início do foco",
    desc: "Quando o cronômetro começa",
    options: [
      {
        id: "inicio-toque",
        name: "Toque suave",
        file: "inicio-toque.mp3",
        price: 0,
      },
      {
        id: "inicio-clique",
        name: "Clique",
        file: "inicio-clique.mp3",
        price: 0,
      },
      {
        id: "inicio-opcao",
        name: "Clique duplo",
        file: "inicio-opcao.mp3",
        price: 0,
      },
      {
        id: "inicio-sininho",
        name: "Sininho",
        file: "inicio-sininho.mp3",
        price: 0,
      },
    ],
  },
  {
    id: "break",
    title: "Hora da pausa",
    desc: "Quando um bloco de foco acaba",
    options: [
      {
        id: "pausa-sino",
        name: "Sino curto",
        file: "pausa-sino.mp3",
        price: 0,
      },
      {
        id: "pausa-acerto",
        name: "Tom de acerto",
        file: "pausa-acerto.mp3",
        price: 0,
      },
      {
        id: "pausa-positiva",
        name: "Aviso alegre",
        file: "pausa-positiva.mp3",
        price: 0,
      },
      {
        id: "pausa-relaxante",
        name: "Sino relaxante",
        file: "pausa-relaxante.mp3",
        price: 0,
      },
    ],
  },
  {
    id: "end",
    title: "Fim do foco",
    desc: "Quando você termina tudo",
    options: [
      {
        id: "fim-conquista",
        name: "Sino de conquista",
        file: "fim-conquista.mp3",
        price: 0,
      },
      {
        id: "fim-aviso",
        name: "Sino de aviso",
        file: "fim-aviso.mp3",
        price: 0,
      },
      {
        id: "fim-alegre",
        name: "Sinos alegres",
        file: "fim-alegre.mp3",
        price: 0,
      },
      {
        id: "fim-flauta",
        name: "Flauta",
        file: "fim-flauta.mp3",
        price: 0,
      },
      {
        id: "croak",
        name: "Coaxo da vitória",
        file: "coaxo.mp3",
        price: 300,
      },
    ],
  },
];

const dS = "focusfrog_effects";

export function pd() {
  let e = {};
  try {
    e = JSON.parse(localStorage.getItem(dS) || "{}") || {};
  } catch {}
  return {
    start: e.start || Ua[0].options[0].id,
    break: e.break || Ua[1].options[0].id,
  };
}

export function BI(e, t) {
  const n = {
    ...pd(),
    [e]: t,
  };
  try {
    localStorage.setItem(dS, JSON.stringify(n));
  } catch {}
}

const H_ = (e, t) => {
  const n = Ua.find((s) => s.id === e);
  return n.options.find((s) => s.id === t) || n.options[0];
};

const zI = () => {
  try {
    return (
      JSON.parse(localStorage.getItem("focusfrog_sound_enabled") ?? "true") !==
      false
    );
  } catch {
    return true;
  }
};

export function hS(e, t = 0.7) {
  const n = Gy();
  cS(`/sounds/fx/${e}`)
    .then((s) => {
      const r = n.createGain();
      (r.gain.value = t), r.connect(n.destination);
      const o = n.createBufferSource();
      (o.buffer = s),
        o.connect(r),
        o.start(),
        (o.onended = () => r.disconnect());
    })
    .catch(() => {});
}

export function Di(e, t, n = "default") {
  if (!zI()) return;
  let s = H_(e, e === "end" ? n : pd()[e]);
  s.price > 0 && !t(s.id, s.price) && (s = H_(e, "")), hS(s.file);
}

export const VI = {
  common: 0.62,
  rare: 0.27,
  epic: 0.09,
  legendary: 0.02,
};

export const G_ = {
  common: 0,
  rare: 0.06,
  epic: 0.05,
  legendary: 0.015,
};

const K_ = 25;

const UI = 75;

export const qI = {
  rare: 8,
  epic: 25,
  legendary: 70,
};

export const WI = 0.35;

export const J_ = {
  sinceRare: 0,
  sinceEpic: 0,
  sinceLegendary: 0,
};

export const ra = (e) => k3.indexOf(e);

export const fS = (e) => Math.max(0, Math.min(1, (e - K_) / (UI - K_)));

export const HI = (e) => e >= 18 || e < 6;
