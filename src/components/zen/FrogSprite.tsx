// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import * as React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import { FROG_PATTERNS, FROG_SPECIES } from '../../data/frogs';
import { motion, useAnimation } from 'framer-motion';
import { Nt } from './ZenFrog';
import { Nh, SG, ip, jG } from './FrogCard';

export const C_ro = ({
  speciesId: e,
  stage: t,
  top: n,
  left: s,
  frogId: r,
  size: o = 56,
  clickable: a = true,
  forceColors: l,
  showShadow: c = false,
  enteringDrop: u = false,
  pulseAt: d
}) => {
  var oe, ve;
  const f = FROG_SPECIES[e],
    [h, m] = React.useState(false),
    v = useAnimation(),
    x = useAnimation(),
    k = useAnimation(),
    y = useAnimation(),
    p = useAnimation(),
    g = useAnimation(),
    b = useAnimation(),
    j = useAnimation(),
    C = useAnimation(),
    S = useAnimation(),
    T = React.useMemo(() => ({
      animationDelay: `${-(Math.random() * 4.5).toFixed(2)}s`
    }), []),
    P = Z => {
      const D = {
        duration: Z.duration,
        times: Z.times,
        ease: "linear"
      };
      v.start({
        scaleX: Z.sx,
        scaleY: Z.sy,
        y: Z.y,
        transition: D
      }), k.start({
        scaleX: Z.shadowS,
        scaleY: Z.shadowS,
        opacity: Z.shadowO,
        transition: D
      }), y.start({
        scaleY: Z.squint,
        transition: D
      }), p.start({
        scaleY: Z.lbs,
        transition: D
      }), g.start({
        scaleY: Z.lbs,
        transition: D
      }), b.start({
        scaleY: Z.lft,
        transition: D
      }), j.start({
        scaleY: Z.lft,
        transition: D
      }), C.start({
        y: Z.pupil,
        transition: D
      }), S.start({
        y: Z.pupil,
        transition: D
      });
    },
    O = React.useRef({
      top: n,
      left: s
    }),
    V = React.useRef(false);
  React.useEffect(() => {
    if (!V.current) {
      V.current = true, u && P(jG);
      return;
    }
    const Z = O.current.top !== n || O.current.left !== s;
    O.current = {
      top: n,
      left: s
    }, Z && n !== undefined && P(SG);
  }, [n, s]);
  const U = React.useRef(d);
  if (React.useEffect(() => {
    d && d !== U.current && (U.current = d, x.start({
      scale: ip.scale,
      transition: {
        duration: ip.duration,
        times: ip.times
      }
    }));
  }, [d]), !f) return console.warn(`[ZenFrog] Species with ID "${e}" not found.`), null;
  if (t !== "adult") return null;
  const E = l || f.stages.adult.colors,
    K = {
      "--frog-color-primary": E.primary,
      "--frog-color-secondary": E.secondary,
      "--frog-color-accent": E.accent
    };
  return <div style={K}><motion.div initial={u ? {
      scale: 1,
      opacity: 0
    } : {
      scale: 0.5,
      opacity: 0
    }} animate={{
      scale: 1,
      opacity: 1
    }} transition={u ? {
      opacity: {
        duration: 0.14
      }
    } : undefined} exit={{
      scale: 0.5,
      opacity: 0
    }} className={Nt.creatureWrapper} style={{
      width: o,
      height: o,
      cursor: a ? "pointer" : "default"
    }} onClick={a ? () => m(true) : undefined} role={a ? "button" : undefined} aria-label={a ? `Ver ${f.name}` : undefined}><svg viewBox="0 0 100 100" className={`${Nt.frogContainer} ${!l && f.special && Nt["sp_" + f.special] || ""}`}>{c && <motion.ellipse cx="50" cy="88" rx="26" ry="6" className={Nt.frogShadow} animate={k} initial={{
          opacity: u ? 0.4 : 0.9
        }} style={{
          transformOrigin: "50px 88px"
        }} />}<motion.g animate={x} style={{
          transformOrigin: "50px 85px"
        }}><motion.g animate={v} initial={u ? {
            y: -64
          } : undefined} style={{
            transformOrigin: "50px 85px"
          }}><g className={`${Nt.frogBody} ${Nt.breath}`}><motion.g animate={p} style={{
                transformOrigin: "28px 85px"
              }}><ellipse cx="28" cy="75" rx="12" ry="10" className={Nt.frogLegBack} /></motion.g><motion.g animate={g} style={{
                transformOrigin: "72px 85px"
              }}><ellipse cx="72" cy="75" rx="12" ry="10" className={Nt.frogLegBack} /></motion.g><ellipse cx="50" cy="60" rx="30" ry="25" className={Nt.frogMainBody} />{!l && (((oe = FROG_PATTERNS[f.pattern]) == null ? undefined : oe.dots) || []).map(([Z, D, q], G) => <circle key={G} cx={50 + Z} cy={60 + D} r={q} fill={f.pattern === "speckles" ? "#000" : E.accent} opacity={f.pattern === "speckles" ? 0.35 : 0.6} />)}{!l && (((ve = FROG_PATTERNS[f.pattern]) == null ? undefined : ve.stripes) || []).map(([Z, D, q, G, de, re], X) => <path key={X} d={`M${50 + Z},${60 + D} Q${50 + q},${60 + G} ${50 + de},${60 + re}`} stroke={E.accent} strokeOpacity={0.55} strokeWidth={3.2} strokeLinecap="round" fill="none" />)}{!l && f.special === "stars" && [[-14, -8], [8, -14], [17, -2], [-6, -16], [-20, 2]].map(([Z, D], q) => <circle key={`s${q}`} cx={50 + Z} cy={60 + D} r={q % 2 ? 1 : 1.5} fill="#fff" opacity={0.85} />)}<ellipse cx="50" cy="65" rx="20" ry="18" className={Nt.frogBelly} /><motion.g animate={b} style={{
                transformOrigin: "38px 86px"
              }}><ellipse cx="38" cy="80" rx="8" ry="6" className={Nt.frogLegFront} /></motion.g><motion.g animate={j} style={{
                transformOrigin: "62px 86px"
              }}><ellipse cx="62" cy="80" rx="8" ry="6" className={Nt.frogLegFront} /></motion.g><g className={Nt.eyeBlink} style={T}><motion.g animate={y} style={{
                  transformOrigin: "50px 45px"
                }}><g className={Nt.frogEyeGroup}><circle cx="40" cy="45" r="10" className={Nt.frogEyeSocket} /><motion.circle cx="40" cy="45" r="5" className={Nt.frogPupil} animate={C} /></g><g className={Nt.frogEyeGroup}><circle cx="60" cy="45" r="10" className={Nt.frogEyeSocket} /><motion.circle cx="60" cy="45" r="5" className={Nt.frogPupil} animate={S} /></g></motion.g></g><path d="M45,68 Q50,72 55,68" className={Nt.frogMouth} /></g></motion.g></motion.g></svg></motion.div>{h && <Nh speciesId={e} frogId={r} onClose={() => m(false)} />}</div>;
};

export const CG = e => {
  const t = Math.floor(e / 60),
    n = e % 60;
  return `${t.toString().padStart(2, "0")}:${n.toString().padStart(2, "0")}`;
};
