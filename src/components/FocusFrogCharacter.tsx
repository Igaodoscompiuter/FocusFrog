// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import Wn from './FocusFrogCharacter.module.css';
import * as jsxRuntime from 'react/jsx-runtime';
import { mS } from '../domain/frogRarity';

export const Z7 = ({
  status: e,
  size: t = 150
}) => {
  const n = `${Wn.frogEyes} ${Wn.eyesIdle} ${e === "idle" || e === "happy" ? Wn.visible : ""}`,
    s = `${Wn.frogEyes} ${Wn.eyesMeditating} ${e === "meditating" ? Wn.visible : ""}`,
    r = `${Wn.frogMouth} ${e === "happy" ? Wn.visible : ""}`;
  return <div className={`${Wn.frogContainer} ${Wn["status--" + e]}`} style={{
    width: t,
    height: t
  }}><svg viewBox="0 0 100 100" className={Wn.frogSvg}><g className={Wn.frogBody}><path d="M50,95 C25,95 20,70 20,50 C20,25 30,20 50,20 C70,20 80,25 80,50 C80,70 75,95 50,95 Z" fill="#5c8b57" /><path d="M50,90 C35,90 30,70 30,55 C30,40 40,35 50,35 C60,35 70,40 70,55 C70,70 65,90 50,90 Z" fill="#84b87c" /></g><g className={n}><circle cx="38" cy="42" r="6" fill="#fff" /><circle cx="62" cy="42" r="6" fill="#fff" /><circle cx="39" cy="43" r="3" fill="#000" /><circle cx="61" cy="43" r="3" fill="#000" /></g><g className={s}><path d="M34,45 C38,42 42,42 46,45" stroke="#3e603b" strokeWidth="2" fill="none" strokeLinecap="round" /><path d="M54,45 C58,42 62,42 66,45" stroke="#3e603b" strokeWidth="2" fill="none" strokeLinecap="round" /></g><g className={r}><path d="M40,58 C45,65 55,65 60,58" stroke="#3e603b" strokeWidth="2" fill="none" strokeLinecap="round" /></g></svg></div>;
};

export const Q7 = e => {
  let t = e * 25;
  for (let r = 1; r < e; r++) t += mS(r);
  const n = Math.floor(t / 60),
    s = t % 60;
  return n ? `${n}h${s ? ` ${String(s).padStart(2, "0")}` : ""}` : `${s} min`;
};

export const rx = ["Vamos fazer acontecer hoje?", "Que a força do sapo esteja com você.", "Um pequeno passo hoje, um grande salto para seus objetivos."];

export const ox = ["Mantenha o foco, você está quase lá!", "Continue o bom trabalho, seu futuro agradece."];

export const ax = ["A noite é uma criança, planeje seu próximo dia.", "Bom descanso, guerreiro do foco!"];
