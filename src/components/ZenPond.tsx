import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import styles from './ZenPond.module.css';
import { ZenFrog } from './zen/ZenFrog';
import { LilyPad, LILYPADS } from './zen/LilyPad';
import { KoiFish } from './zen/KoiFish';
import { Fireflies } from './zen/Fireflies';
import { useZenPond, PondFrog } from '../context/ZenPondContext';
import { frogSpecies } from '../utils/frogSpecies';
import { useMascot } from '../hooks/useMascot';

interface ZenPondProps {
  children?: React.ReactNode;
}

// Deslocamento horizontal SÓ durante o voo do pulo, sincronizado com a
// parábola do ZenFrog (antecipação até 17%, pouso aos 68% de 0,62s) — igual
// animateHop() do jogo. Antes era uma mola de 2,5s: o sapo pousava e ainda
// ficava deslizando depois.
const HOP_MOVE = { duration: 0.62, times: [0, 0.17, 0.68, 1], ease: 'linear' as const };
const SPARK_ANGLES = Array.from({ length: 8 }, (_, i) => (i / 8) * Math.PI * 2);

/**
 * Desenha a lagoa e consome o estado do ZenPondContext. [PORTADO de
 * lagoa-zen-index.html]: deslocamento sincronizado com o arco, queda ao
 * entrar, fusão com deslize em arco + faíscas + "×N" + anel dourado, brilho
 * de raridade sob o sapo e nenúfar que inclina quando alguém pousa nele.
 */
export const ZenPond: React.FC<ZenPondProps> = ({ children }) => {
  const { pondFrogs, ripples, effects } = useZenPond();
  const [mascot] = useMascot();
  const waterRef = useRef<HTMLDivElement>(null);

  // Keyframes de posição estáveis por sapo: só mudam quando ele muda de lugar
  // (assim um re-render qualquer não reinicia a animação do pulo).
  const motionRef = useRef(new Map<string, { top: number; left: number; kf: { top: number[]; left: number[] } }>());
  const kfFor = (f: PondFrog) => {
    const m = motionRef.current.get(f.id);
    if (!m) {
      const kf = { top: [f.top, f.top, f.top, f.top], left: [f.left, f.left, f.left, f.left] };
      motionRef.current.set(f.id, { top: f.top, left: f.left, kf });
      return kf;
    }
    if (m.top !== f.top || m.left !== f.left) {
      m.kf = { top: [m.top, m.top, f.top, f.top], left: [m.left, m.left, f.left, f.left] };
      m.top = f.top; m.left = f.left;
    }
    return m.kf;
  };

  // Nenúfar inclina quando um sapo pousa nele (padTilt do jogo).
  const [reacting, setReacting] = useState<Set<number>>(new Set());
  const seenRipples = useRef(new Set<number>());
  useEffect(() => {
    const el = waterRef.current;
    if (!el) return;
    const { width: W, height: H } = el.getBoundingClientRect();
    ripples.forEach(r => {
      if (r.gold || seenRipples.current.has(r.id)) return;
      seenRipples.current.add(r.id);
      const x = parseFloat(r.left) / 100 * W, y = parseFloat(r.top) / 100 * H;
      const hit = LILYPADS.findIndex(p => Math.hypot(p.x / 100 * W - x, p.y / 100 * H - y) < p.size * 0.5);
      if (hit < 0) return;
      setTimeout(() => {
        setReacting(prev => new Set(prev).add(hit));
        setTimeout(() => setReacting(prev => { const n = new Set(prev); n.delete(hit); return n; }), 900);
      }, r.delayMs || 0);
    });
  }, [ripples]);

  const now = Date.now();

  return (
    <div className={styles.zenPondContainer}>
      <div className={styles.water} ref={waterRef}>
        <div className={styles.shine} />
        <svg className={styles.wavelines} viewBox="0 0 380 500" preserveAspectRatio="none">
          <path d="M0 120 Q95 108 190 120 T380 120" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" fill="none" />
          <path d="M0 260 Q95 248 190 260 T380 260" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" fill="none" />
          <path d="M0 380 Q95 368 190 380 T380 380" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" fill="none" />
        </svg>
        {LILYPADS.map((pad, i) => <LilyPad key={i} pad={pad} index={i} reacting={reacting.has(i)} />)}
        <KoiFish />
        <Fireflies />
        <div className={styles.shore} />
        {ripples.map(ripple => (
          <div
            key={ripple.id}
            className={`${styles.ripple} ${ripple.gold ? styles.ringGold : ''}`}
            style={{ top: ripple.top, left: ripple.left, animationDelay: `${ripple.delayMs || 0}ms` }}
          />
        ))}

        {pondFrogs.length > 0 ? (
          pondFrogs.map(frog => {
            const kf = kfFor(frog);
            const rarity = frogSpecies[frog.speciesId]?.rarity;
            const entering = !!frog.enteredAt && now - frog.enteredAt < 1500;
            return (
              <motion.div
                key={frog.id}
                className={styles.frogWrapper}
                initial={{ top: `${kf.top[0]}%`, left: `${kf.left[0]}%`, scale: frog.scale, opacity: 1 }}
                animate={frog.merging
                  // absorvido: desliza em arco até quem ficou, encolhe e some (mergeInto do jogo)
                  ? { top: `${frog.top}%`, left: `${frog.left}%`, y: [0, -16, 0], scale: frog.scale * 0.3, opacity: 0 }
                  : { top: kf.top.map(v => `${v}%`), left: kf.left.map(v => `${v}%`), scale: frog.scale, opacity: 1 }}
                transition={frog.merging
                  ? { duration: 0.56, ease: 'easeIn' }
                  : { top: HOP_MOVE, left: HOP_MOVE, scale: { type: 'spring', stiffness: 260, damping: 14 }, opacity: { duration: 0.2 } }}
              >
                {(rarity === 'rare' || rarity === 'epic') && <div className={`${styles.rarityGlow} ${styles[rarity]}`} />}
                {mascot?.frogId === frog.id && !frog.merging && <div className={styles.mascotTag}>⭐ {mascot.name}</div>}
                <div className={styles.collisionBarrier} />
                <ZenFrog
                  speciesId={frog.speciesId}
                  stage="adult"
                  top={frog.merging ? undefined : frog.top}
                  left={frog.merging ? undefined : frog.left}
                  frogId={frog.id}
                  showShadow
                  enteringDrop={entering}
                  pulseAt={frog.pulseAt}
                />
              </motion.div>
            );
          })
        ) : (
          children
        )}

        {/* fusão: faíscas + "×N" flutuando sobre quem ficou (burst/floatText do jogo) */}
        {effects.map(e => (
          <React.Fragment key={e.id}>
            {SPARK_ANGLES.map((a, i) => {
              const r = 24 + ((i * 37) % 20);
              return (
                <div key={i} className={styles.spark} style={{
                  left: `${e.left}%`, top: `${e.top - 4}%`,
                  ['--dx' as string]: `${Math.cos(a) * r}px`, ['--dy' as string]: `${Math.sin(a) * r}px`,
                } as React.CSSProperties} />
              );
            })}
            <div className={styles.floatText} style={{ left: `${e.left}%`, top: `${e.top - 8}%` }}>{e.text}</div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
