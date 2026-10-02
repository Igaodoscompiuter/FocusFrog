
import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import styles from './ZenFrog.module.css';
import { frogSpecies } from '../../utils/frogSpecies';
import { FrogCard } from './FrogCard';

// Curvas de pulo amostradas da física do protótipo (antecipação -> arco -> pouso
// com mola) e convertidas em keyframes do Framer Motion. Ver notas do projeto:
// a mesma função contínua foi usada pra gerar esses pontos, só que aqui cada
// "trecho" (corpo, pernas, pupilas) tem sua própria curva, presa a um pivô
// próprio — é o que dá a sensação de partes conectadas, não um bloco só.
const HOP_TIMES = [0, 0.05, 0.1, 0.17, 0.3, 0.42, 0.5, 0.58, 0.68, 0.78, 0.88, 1];
const HOP_DURATION = 0.62;
const RIG = {
  scaleX: [1, 1.08, 1.133, 1.16, 0.956, 1.027, 0.986, 0.939, 0.88, 0.958, 0.99, 1.006],
  scaleY: [1, 0.9, 0.834, 0.8, 1.093, 0.975, 1.044, 1.122, 1.22, 1.05, 1.012, 0.993],
  y: [0, 0, 0, 0, -16.714, -21.992, -20.097, -13.872, 0, 0, 0, 0],
};
const LEG_BACK_SCALE_Y = [1, 1, 1, 1, 1.354, 1.173, 1.278, 1.399, 1.55, 1, 1, 1];
const LEG_BACK_SPLAY = [0, 1.505, 2.491, 3, 0, 0, 0, 0, 4, 0, 0, 0.108];
const LEG_FRONT_SCALE_Y = [1, 1, 1, 1, 0.788, 0.704, 0.753, 0.809, 0.88, 1, 1, 1];
const LEG_FRONT_Y = [0, 0, 0, 0, -1.694, -2.372, -1.976, -1.525, -0.96, 0, 0, 0];
const PUPIL_Y = [0, 0.482, 0.797, 0.96, 0.706, 0.028, -0.424, -0.875, -1.44, 0.215, 0.051, -0.03];

interface ZenFrogProps {
  speciesId: string;
  stage: 'tadpole' | 'adult';
  /** Posição atual (0-100) — só serve pra ZenFrog detectar QUANDO um pulo novo
   *  começou (a posição em si é controlada pelo motion.div pai, no ZenPond). */
  top?: number;
  left?: number;
}

export const ZenFrog: React.FC<ZenFrogProps> = ({ speciesId, stage, top, left }) => {
  const species = frogSpecies[speciesId];
  const [showCard, setShowCard] = useState(false);

  const rig = useAnimationControls();
  const legBackL = useAnimationControls();
  const legBackR = useAnimationControls();
  const legFrontL = useAnimationControls();
  const legFrontR = useAnimationControls();
  const pupilL = useAnimationControls();
  const pupilR = useAnimationControls();

  const prevPos = useRef<{ top?: number; left?: number }>({ top, left });

  useEffect(() => {
    const moved = prevPos.current.top !== top || prevPos.current.left !== left;
    prevPos.current = { top, left };
    if (!moved || top === undefined) return; // 1ª renderização — sem pulo, só aparece parado

    const transition = { duration: HOP_DURATION, times: HOP_TIMES, ease: 'linear' as const };
    rig.start({ scaleX: RIG.scaleX, scaleY: RIG.scaleY, y: RIG.y, transition });
    legBackL.start({ scaleY: LEG_BACK_SCALE_Y, x: LEG_BACK_SPLAY.map(v => -v), transition });
    legBackR.start({ scaleY: LEG_BACK_SCALE_Y, x: LEG_BACK_SPLAY, transition });
    legFrontL.start({ scaleY: LEG_FRONT_SCALE_Y, y: LEG_FRONT_Y, transition });
    legFrontR.start({ scaleY: LEG_FRONT_SCALE_Y, y: LEG_FRONT_Y, transition });
    pupilL.start({ y: PUPIL_Y, transition });
    pupilR.start({ y: PUPIL_Y, transition });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [top, left]);

  if (!species) {
    console.warn(`[ZenFrog] Species with ID "${speciesId}" not found.`);
    return null;
  }
  if (stage !== 'adult') return null;

  const { colors } = species.stages.adult;
  const style = {
    '--frog-color-primary': colors.primary,
    '--frog-color-secondary': colors.secondary,
    '--frog-color-accent': colors.accent,
  } as React.CSSProperties;

  return (
    <div style={style}>
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        className={styles.creatureWrapper}
        onClick={() => setShowCard(true)}
        role="button"
        aria-label={`Ver ${species.name}`}
      >
        <svg viewBox="0 0 100 100" className={styles.frogContainer}>
          {/* Pivô do pulo inteiro ancorado nos pés — todo o corpo deforma junto. */}
          <motion.g animate={rig} style={{ transformOrigin: '50px 85px' }}>
            <g className={styles.frogBody}>
              <motion.g animate={legBackL} style={{ transformOrigin: '28px 85px' }}>
                <ellipse cx="28" cy="75" rx="12" ry="10" className={styles.frogLegBack} />
              </motion.g>
              <motion.g animate={legBackR} style={{ transformOrigin: '72px 85px' }}>
                <ellipse cx="72" cy="75" rx="12" ry="10" className={styles.frogLegBack} />
              </motion.g>
              <ellipse cx="50" cy="60" rx="30" ry="25" className={styles.frogMainBody} />
              <ellipse cx="50" cy="65" rx="20" ry="18" className={styles.frogBelly} />
              <motion.g animate={legFrontL} style={{ transformOrigin: '38px 86px' }}>
                <ellipse cx="38" cy="80" rx="8" ry="6" className={styles.frogLegFront} />
              </motion.g>
              <motion.g animate={legFrontR} style={{ transformOrigin: '62px 86px' }}>
                <ellipse cx="62" cy="80" rx="8" ry="6" className={styles.frogLegFront} />
              </motion.g>
              <g className={styles.frogEyeGroup}>
                <circle cx="40" cy="45" r="10" className={styles.frogEyeSocket} />
                <motion.circle cx="40" cy="45" r="5" className={styles.frogPupil} animate={pupilL} />
              </g>
              <g className={styles.frogEyeGroup}>
                <circle cx="60" cy="45" r="10" className={styles.frogEyeSocket} />
                <motion.circle cx="60" cy="45" r="5" className={styles.frogPupil} animate={pupilR} />
              </g>
              <path d="M45,68 Q50,72 55,68" className={styles.frogMouth} />
            </g>
          </motion.g>
        </svg>
      </motion.div>
      {showCard && <FrogCard speciesId={speciesId} onClose={() => setShowCard(false)} />}
    </div>
  );
};
