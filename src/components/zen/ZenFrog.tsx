
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import styles from './ZenFrog.module.css';
import { frogSpecies } from '../../utils/frogSpecies';
import { FrogCard } from './FrogCard';

// [PORTADO EXATO de lagoa-zen-index.html] Amostrado de hopFrame() do jogo,
// rodando a MESMA função: antecipação (agacha) → voo parabólico → pouso com
// mola amortecida. Agora inclui a sombra no chão (encolhe/clareia no ar,
// alarga no impacto) e o "squint" — o sapo aperta os olhos ao pousar.
// DROP é o modo de entrada (soltar do viveiro / sapo novo): cai do alto.
const HOP = {
  duration: 0.62,
  times: [0, .05, .1, .17, .3, .42, .5, .58, .68, .74, .8, .88, 1],
  sx: [1, 1.08, 1.133, 1.16, 0.956, 1.027, 0.986, 0.939, 0.88, 1.032, 0.948, 0.99, 1.006],
  sy: [1, 0.9, 0.834, 0.8, 1.093, 0.975, 1.044, 1.122, 1.22, 0.963, 1.062, 1.012, 0.993],
  y: [0, 1.003, 1.661, 0, -16.714, -21.992, -20.097, -13.872, 0, 0, 0, 0, 0],
  shadowS: [1, 1, 1, 1, 0.734, 0.65, 0.68, 0.779, 1.15, 1.022, 1, 1, 1.004],
  shadowO: [0.9, 0.9, 0.9, 0.9, 0.52, 0.4, 0.443, 0.585, 0.9, 0.9, 0.9, 0.9, 0.9],
  pupil: [0, 0.662, 1.096, 1.32, 0.971, 0.039, -0.582, -1.204, -1.98, -0.221, 0.367, 0.07, -0.042],
  squint: [1, 1, 1, 1, 1, 1, 1, 1, 0.45, 0.921, 1, 1, 0.985],
  lbs: [1, 1, 1, 1, 1.354, 1.173, 1.278, 1.399, 1.55, 1, 1, 1, 1],
  lft: [1, 1, 1, 1, 0.788, 0.704, 0.753, 0.809, 0.88, 1, 1, 1, 1],
};
const DROP = {
  duration: 0.78,
  times: [0, .08, .18, .3, .42, .55, .62, .7, .8, .9, 1],
  sx: [1, 0.985, 0.967, 0.945, 0.924, 0.9, 1.062, 0.953, 0.975, 1.01, 1.006],
  sy: [1, 1.032, 1.072, 1.12, 1.168, 1.22, 0.927, 1.056, 1.03, 0.989, 0.993],
  y: [-64, -62.646, -57.145, -44.959, -26.679, 0, 0, 0, 0, 0, 0],
  shadowS: [0.65, 0.657, 0.687, 0.754, 0.854, 1.15, 1.042, 1, 1, 1.007, 1.004],
  shadowO: [0.4, 0.411, 0.454, 0.549, 0.692, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9],
  pupil: [1.98, 1.404, 0.684, -0.18, -1.044, -1.98, -0.432, 0.332, 0.178, -0.067, -0.042],
  squint: [1, 1, 1, 1, 1, 0.45, 0.846, 1, 1, 0.976, 0.985],
  lbs: [1.55, 1.438, 1.298, 1.2, 1.368, 1.55, 1, 1, 1, 1, 1],
  lft: [0.88, 0.828, 0.762, 0.716, 0.795, 0.88, 1, 1, 1, 1, 1],
};
// Pulso do sapo que absorveu outro na fusão (playPulse do jogo, 560ms).
const PULSE = { duration: 0.56, scale: [1, 1.28, 0.9, 1.06, 1], times: [0, .3, .55, .78, 1] };

interface ZenFrogProps {
  speciesId: string;
  stage: 'tadpole' | 'adult';
  /** Posição atual (0-100) — só serve pra ZenFrog detectar QUANDO um pulo novo
   *  começou (a posição em si é controlada pelo motion.div pai, no ZenPond). */
  top?: number;
  left?: number;
  /** ID da instância (frog.id) — só existe quando chamado de dentro do Lago
   *  Zen (via ZenPond). Permite a carta achar a instância certa no Context
   *  pra saber quantas vezes fundiu (count) e se guardar/soltar faz sentido.
   *  Sem isso (ex.: FrogRewardModal), a carta mostra só os dados da espécie. */
  frogId?: string;
  /** Tamanho em px (padrão 56, igual ao lago). A FrogCard usa um valor maior
   *  pra exibir o retrato — via prop de verdade, não via transform:scale()
   *  externo, que entra em conflito com o transform que o Framer Motion já
   *  aplica inline no mesmo elemento (causava o "achatamento" no card). */
  size?: number;
  /** [CORREÇÃO] Quando a ZenFrog é usada só pra EXIBIR (dentro da própria
   *  FrogCard, ou na FrogRewardModal), ela não deve abrir outra carta ao ser
   *  tocada — sem isso, tocar no retrato da carta abria uma carta por cima
   *  da outra, repetidamente. Padrão true (lago) pra não quebrar o uso normal. */
  clickable?: boolean;
  /** [NOVO] Sobrescreve as cores da espécie — usado só pela silhueta do
   *  Álbum (espécie ainda não descoberta: mesma forma, cores escuras,
   *  sem revelar nada sobre a espécie real). */
  forceColors?: { primary: string; secondary: string; accent: string };
  /** Sombra no chão sob o sapo (só faz sentido dentro da lagoa). */
  showShadow?: boolean;
  /** Entra caindo do alto (soltar do viveiro / sapo recém-coletado). */
  enteringDrop?: boolean;
  /** Muda de valor quando este sapo absorve outro numa fusão → pulso. */
  pulseAt?: number;
}

export const ZenFrog: React.FC<ZenFrogProps> = ({ speciesId, stage, top, left, frogId, size = 56, clickable = true, forceColors, showShadow = false, enteringDrop = false, pulseAt }) => {
  const species = frogSpecies[speciesId];
  const [showCard, setShowCard] = useState(false);

  const rig = useAnimationControls();
  const pulse = useAnimationControls();
  const shadow = useAnimationControls();
  const squint = useAnimationControls();
  const legBackL = useAnimationControls();
  const legBackR = useAnimationControls();
  const legFrontL = useAnimationControls();
  const legFrontR = useAnimationControls();
  const pupilL = useAnimationControls();
  const pupilR = useAnimationControls();
  // cada sapo pisca no seu próprio ritmo (igual blinkDelay() do jogo)
  const blinkStyle = useMemo(() => ({ animationDelay: `${-(Math.random() * 4.5).toFixed(2)}s` }), []);

  const play = (k: typeof HOP) => {
    const t = { duration: k.duration, times: k.times, ease: 'linear' as const };
    rig.start({ scaleX: k.sx, scaleY: k.sy, y: k.y, transition: t });
    shadow.start({ scaleX: k.shadowS, scaleY: k.shadowS, opacity: k.shadowO, transition: t });
    squint.start({ scaleY: k.squint, transition: t });
    legBackL.start({ scaleY: k.lbs, transition: t });
    legBackR.start({ scaleY: k.lbs, transition: t });
    legFrontL.start({ scaleY: k.lft, transition: t });
    legFrontR.start({ scaleY: k.lft, transition: t });
    pupilL.start({ y: k.pupil, transition: t });
    pupilR.start({ y: k.pupil, transition: t });
  };

  const prevPos = useRef<{ top?: number; left?: number }>({ top, left });
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      if (enteringDrop) play(DROP); // entra caindo do alto
      return;
    }
    const moved = prevPos.current.top !== top || prevPos.current.left !== left;
    prevPos.current = { top, left };
    if (moved && top !== undefined) play(HOP);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [top, left]);

  const lastPulse = useRef(pulseAt);
  useEffect(() => {
    if (pulseAt && pulseAt !== lastPulse.current) {
      lastPulse.current = pulseAt;
      pulse.start({ scale: PULSE.scale, transition: { duration: PULSE.duration, times: PULSE.times } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pulseAt]);

  if (!species) {
    console.warn(`[ZenFrog] Species with ID "${speciesId}" not found.`);
    return null;
  }
  if (stage !== 'adult') return null;

  const colors = forceColors || species.stages.adult.colors;
  const style = {
    '--frog-color-primary': colors.primary,
    '--frog-color-secondary': colors.secondary,
    '--frog-color-accent': colors.accent,
  } as React.CSSProperties;

  return (
    <div style={style}>
      <motion.div
        // entrando caindo: só aparece rápido (18% da queda, igual o jogo); senão o "pop" normal
        initial={enteringDrop ? { scale: 1, opacity: 0 } : { scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={enteringDrop ? { opacity: { duration: 0.14 } } : undefined}
        exit={{ scale: 0.5, opacity: 0 }}
        className={styles.creatureWrapper}
        style={{ width: size, height: size, cursor: clickable ? 'pointer' : 'default' }}
        onClick={clickable ? () => setShowCard(true) : undefined}
        role={clickable ? 'button' : undefined}
        aria-label={clickable ? `Ver ${species.name}` : undefined}
      >
        <svg viewBox="0 0 100 100" className={styles.frogContainer}>
          {/* sombra fica no chão: não sobe com o pulo */}
          {showShadow && (
            <motion.ellipse cx="50" cy="88" rx="26" ry="6" className={styles.frogShadow}
              animate={shadow} initial={{ opacity: enteringDrop ? 0.4 : 0.9 }} style={{ transformOrigin: '50px 88px' }} />
          )}
          <motion.g animate={pulse} style={{ transformOrigin: '50px 85px' }}>
          {/* Pivô do pulo inteiro ancorado nos pés — todo o corpo deforma junto. */}
          <motion.g animate={rig} initial={enteringDrop ? { y: -64 } : undefined} style={{ transformOrigin: '50px 85px' }}>
            <g className={`${styles.frogBody} ${styles.breath}`}>
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
              {/* piscar (CSS, ritmo próprio) envolve o squint do pouso (motion) */}
              <g className={styles.eyeBlink} style={blinkStyle}>
                <motion.g animate={squint} style={{ transformOrigin: '50px 45px' }}>
                  <g className={styles.frogEyeGroup}>
                    <circle cx="40" cy="45" r="10" className={styles.frogEyeSocket} />
                    <motion.circle cx="40" cy="45" r="5" className={styles.frogPupil} animate={pupilL} />
                  </g>
                  <g className={styles.frogEyeGroup}>
                    <circle cx="60" cy="45" r="10" className={styles.frogEyeSocket} />
                    <motion.circle cx="60" cy="45" r="5" className={styles.frogPupil} animate={pupilR} />
                  </g>
                </motion.g>
              </g>
              <path d="M45,68 Q50,72 55,68" className={styles.frogMouth} />
            </g>
          </motion.g>
          </motion.g>
        </svg>
      </motion.div>
      {showCard && <FrogCard speciesId={speciesId} frogId={frogId} onClose={() => setShowCard(false)} />}
    </div>
  );
};
