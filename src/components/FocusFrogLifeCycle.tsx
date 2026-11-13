// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import Se from './FocusFrogLifeCycle.module.css';
import * as React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import { FROG_SPECIES } from '../data/frogs';
import { AnimatePresence, motion } from 'framer-motion';

const YW = {
  ...FROG_SPECIES.JUNGLE,
  stages: {
    tadpole: {
      colors: {
        primary: "#5f7a72",
        secondary: "#9fb7ae"
      }
    },
    adult: {
      colors: {
        primary: "#4f6b63",
        secondary: "#a9c2b8"
      }
    }
  }
};

const op = {
  TADPOLE: {
    min: 0.03
  },
  FROGLET: {
    min: 0.515
  },
  FROG: {
    min: 0.75
  }
};

const ZW = e => e < op.TADPOLE.min ? "EGG" : e < op.FROGLET.min ? "TADPOLE" : e < op.FROG.min ? "FROGLET" : "FROG";

const QW = () => <svg className={Se.rippleSvgContainer}><g><circle className={`${Se.ripple} ${Se.ripple1}`} /><circle className={`${Se.ripple} ${Se.ripple2}`} /><circle className={`${Se.ripple} ${Se.ripple3}`} /></g></svg>;

const XW = () => <motion.div initial={{
  scale: 0.5,
  opacity: 0
}} animate={{
  scale: 1,
  opacity: 1
}} exit={{
  scale: 0.5,
  opacity: 0
}} className={Se.creatureWrapper}><svg viewBox="0 0 50 50"><defs><radialGradient id="eggGradient"><stop offset="0%" stopColor="rgba(255, 255, 255, 0.1)" /><stop offset="70%" stopColor="rgba(255, 255, 255, 0.25)" /><stop offset="100%" stopColor="rgba(255, 255, 255, 0.4)" /></radialGradient></defs><circle cx="25" cy="25" r="24" fill="url(#eggGradient)" className={Se.eggGel} /><circle cx="25" cy="25" r="8" className={Se.eggCore} /><ellipse cx="32" cy="18" rx="7" ry="4" className={Se.eggHighlight} /></svg></motion.div>;

const C_eH = () => <motion.div initial={{
  scale: 0.5,
  opacity: 0
}} animate={{
  scale: 1,
  opacity: 1
}} exit={{
  scale: 0.5,
  opacity: 0
}} className={Se.creatureWrapper}><svg viewBox="0 0 80 80" className={Se.tadpoleContainer}><defs><radialGradient id="tadpoleGradient"><stop offset="0%" stopColor="var(--tadpole-color-highlight)" /><stop offset="100%" stopColor="var(--tadpole-color-primary)" /></radialGradient></defs><g className={Se.tadpoleBodyGroup}><g className={Se.tadpoleTailGroup}><path d="M 40,54 Q 30,64 40,74 Q 50,64 40,54 Z" className={Se.tadpoleTail} /></g><ellipse cx="40" cy="40" rx="11" ry="14" fill="url(#tadpoleGradient)" /><circle cx="36" cy="33" r="2" className={Se.tadpoleEye} /><circle cx="44" cy="33" r="2" className={Se.tadpoleEye} /></g></svg></motion.div>;

const C_tH = () => <motion.div initial={{
  scale: 0.5,
  opacity: 0
}} animate={{
  scale: 1,
  opacity: 1
}} exit={{
  scale: 0.5,
  opacity: 0
}} className={Se.creatureWrapper}><svg viewBox="0 0 80 80" className={Se.frogletContainer}><defs><radialGradient id="tadpoleGradient"><stop offset="0%" stopColor="var(--tadpole-color-highlight)" /><stop offset="100%" stopColor="var(--tadpole-color-primary)" /></radialGradient></defs><g className={Se.frogletBodyGroup}><g className={Se.tadpoleTailGroup}><path d="M 40,54 Q 55,68 40,78 Q 25,68 40,54 Z" className={Se.tadpoleTail} /></g><g className={Se.frogletBackLegs}><path d="M32,52 C 20,62, 25,40, 30,45 Z" className={Se.frogletLeg} /><path d="M48,52 C 60,62, 55,40, 50,45 Z" className={Se.frogletLeg} /></g><ellipse cx="40" cy="40" rx="11" ry="14" fill="url(#tadpoleGradient)" /><g className={Se.frogletFrontLegs}><path d="M35,54 C 30,62, 40,62, 38,55 Z" className={Se.frogletLeg} /><path d="M45,54 C 50,62, 40,62, 42,55 Z" className={Se.frogletLeg} /></g><circle cx="36" cy="33" r="2.5" className={Se.tadpoleEye} /><circle cx="44" cy="33" r="2.5" className={Se.tadpoleEye} /></g></svg></motion.div>;

const C_nH = () => <motion.div initial={{
  scale: 0.5,
  opacity: 0
}} animate={{
  scale: 1,
  opacity: 1
}} exit={{
  scale: 0.5,
  opacity: 0
}} className={Se.creatureWrapper}><svg viewBox="0 0 100 100" className={Se.frogContainer}><g className={Se.frogBody}><ellipse cx="28" cy="75" rx="12" ry="10" className={Se.frogLegBack} /><ellipse cx="72" cy="75" rx="12" ry="10" className={Se.frogLegBack} /><ellipse cx="50" cy="60" rx="30" ry="25" className={Se.frogMainBody} /><ellipse cx="50" cy="65" rx="20" ry="18" className={Se.frogBelly} /><ellipse cx="38" cy="80" rx="8" ry="6" className={Se.frogLegFront} /><ellipse cx="62" cy="80" rx="8" ry="6" className={Se.frogLegFront} /><g className={Se.frogEyeGroup}><circle cx="40" cy="45" r="10" className={Se.frogEyeSocket} /><circle cx="40" cy="45" r="5" className={Se.frogPupil} /></g><g className={Se.frogEyeGroup}><circle cx="60" cy="45" r="10" className={Se.frogEyeSocket} /><circle cx="60" cy="45" r="5" className={Se.frogPupil} /></g><path d="M45,68 Q50,72 55,68" className={Se.frogMouth} /></g></svg></motion.div>;

export const C_sH = ({
  progress: e,
  speciesId: t
}) => {
  const n = ZW(e),
    [s, r] = React.useState({
      top: 80,
      left: 50,
      rotation: 0
    }),
    o = React.useRef({
      top: 80,
      left: 50
    });
  if (React.useEffect(() => {
    let d;
    if (n === "TADPOLE" || n === "FROGLET") {
      const f = () => {
        const h = Math.random() * 2 * Math.PI,
          m = Math.random() * 40,
          v = 50 + m * Math.sin(h),
          x = 50 + m * Math.cos(h),
          k = Math.atan2(v - o.current.top, x - o.current.left) * (180 / Math.PI) + 90;
        o.current = {
          top: v,
          left: x
        }, r({
          top: v,
          left: x,
          rotation: k
        });
      };
      f(), d = setInterval(f, 6e3);
    } else n === "FROG" ? r({
      top: 80,
      left: 50,
      rotation: 0
    }) : (o.current = {
      top: 80,
      left: 50
    }, r({
      top: 80,
      left: 50,
      rotation: 0
    }));
    return () => {
      d && clearInterval(d);
    };
  }, [n]), !t) return null;
  const a = FROG_SPECIES[t] || (t === "MYSTERY" ? YW : undefined);
  if (!a) return console.warn(`[FocusFrogLifeCycle] No species data found for ID: ${t}`), null;
  const l = {
      "--frog-color-primary": a.stages.adult.colors.primary,
      "--frog-color-secondary": a.stages.adult.colors.secondary,
      "--tadpole-color-primary": a.stages.tadpole.colors.primary,
      "--tadpole-color-highlight": a.stages.tadpole.colors.secondary
    },
    c = {
      top: `${s.top}%`,
      left: `${s.left}%`,
      transform: `translate(-50%, -50%) rotate(${s.rotation}deg)`
    },
    u = `${Se.movableWrapper} ${Se[n]}`;
  return <div className={Se.container} style={l}><div className={u} style={c}><AnimatePresence>{n !== "FROG" && <QW key={"ripples"} />}</AnimatePresence><AnimatePresence mode="wait">{n === "EGG" && <XW key={"egg"} />}{n === "TADPOLE" && <C_eH key={"tadpole"} />}{n === "FROGLET" && <C_tH key={"froglet"} />}{n === "FROG" && <C_nH key={"frog"} />}</AnimatePresence></div></div>;
};

const bw = 12;

const kg = 120;

const kw = 2 * Math.PI * kg;

export const C_rH = ({
  progress: e
}) => {
  const t = kw * (1 - e);
  return <svg width="260" height="260" viewBox="0 0 260 260" style={{
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%) rotate(-90deg)",
    overflow: "visible"
  }}><circle cx="130" cy="130" r={kg} fill="transparent" stroke="var(--surface-color)" strokeWidth={bw} /><circle cx="130" cy="130" r={kg} fill="transparent" stroke="var(--accent-color)" strokeWidth={bw} strokeDasharray={kw} strokeDashoffset={t} strokeLinecap="round" style={{
      transition: "stroke-dashoffset 0.35s ease-out",
      filter: "drop-shadow(0 0 5px var(--accent-color))"
    }} /></svg>;
};

export const $d = ["A única maneira de fazer um ótimo trabalho é amar o que você faz.", "A persistência realiza o impossível.", "Comece onde você está. Use o que você tem. Faça o que você pode.", "O segredo de progredir é começar.", "Acredite que você pode, assim você já está no meio do caminho.", "O sucesso é a soma de pequenos esforços repetidos dia após dia.", "Não espere por oportunidades extraordinárias. Agarre as comuns e as torne grandes.", "O futuro pertence àqueles que acreditam na beleza de seus sonhos.", "Feito é melhor que perfeito.", "A jornada de mil milhas começa com um único passo.", "Concentre-se no progresso, não na perfeição.", "Transforme seus obstáculos em oportunidades.", "A disciplina é a ponte entre metas e realizações.", "Um pouco de progresso a cada dia resulta em grandes resultados.", "Travar não é falta de caráter. É só o começo que está grande demais."];
