import React from 'react';
import { motion } from 'framer-motion';
import styles from './ZenPond.module.css';
import { ZenFrog } from './zen/ZenFrog';
import { LilyPad, LILYPADS } from './zen/LilyPad';
import { KoiFish } from './zen/KoiFish';
import { Fireflies } from './zen/Fireflies';
import { useZenPond } from '../context/ZenPondContext';

interface ZenPondProps {
  children?: React.ReactNode;
}

/**
 * [SIMPLIFICADO] A simulação (movimento, fusão, entrada/saída do viveiro)
 * agora mora inteira em ZenPondContext — este componente só CONSOME esse
 * estado e desenha a lagoa (nenúfares, carpas, vaga-lumes, sapos pulando).
 * Isso também é o que deixa o viveiro (ZenPondContext) acessível de fora da
 * lagoa — pela ViveiroSheet, por exemplo — sem precisar duplicar estado.
 */
export const ZenPond: React.FC<ZenPondProps> = ({ children }) => {
  const { pondFrogs, ripples } = useZenPond();

  return (
    <div className={styles.zenPondContainer}>
      <div className={styles.water}>
        <div className={styles.shine} />
        <svg className={styles.wavelines} viewBox="0 0 380 500" preserveAspectRatio="none">
          <path d="M0 120 Q95 108 190 120 T380 120" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" fill="none" />
          <path d="M0 260 Q95 248 190 260 T380 260" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" fill="none" />
          <path d="M0 380 Q95 368 190 380 T380 380" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" fill="none" />
        </svg>
        {LILYPADS.map((pad, i) => <LilyPad key={i} pad={pad} index={i} />)}
        <KoiFish />
        <Fireflies />
        <div className={styles.shore} />
        {ripples.map(ripple => (
          <div key={ripple.id} className={styles.ripple} style={{ top: ripple.top, left: ripple.left }} />
        ))}

        {pondFrogs.length > 0 ? (
          pondFrogs.map(frog => (
            <motion.div
              key={frog.id}
              animate={{ top: `${frog.top}%`, left: `${frog.left}%`, scale: frog.scale, opacity: frog.merging ? 0 : 1 }}
              transition={frog.merging ? { duration: 0.7, ease: 'easeIn' } : { duration: 2.5, type: 'spring' }}
              className={styles.frogWrapper}
            >
              <div className={styles.collisionBarrier} />
              <ZenFrog speciesId={frog.speciesId} stage="adult" top={frog.top} left={frog.left} frogId={frog.id} />
            </motion.div>
          ))
        ) : (
          children
        )}
      </div>
    </div>
  );
};
