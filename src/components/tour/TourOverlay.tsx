import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTour, TOUR_STEPS } from './TourContext';
import { ZenFrog } from '../zen/ZenFrog';
import { useMascot } from '../../hooks/useMascot';
import styles from './TourOverlay.module.css';

type Rect = { top: number; left: number; width: number; height: number };

/**
 * Camada do tutorial: escurece a tela deixando um "buraco" iluminado no
 * elemento do passo, e o sapinho (o mascote, se houver) explica num balão.
 * Não bloqueia toques — a pessoa interage com o app normalmente.
 */
export const TourOverlay: React.FC = () => {
  const { active, step, stepIndex, next, skip } = useTour();
  const [mascot] = useMascot();
  const [rect, setRect] = useState<Rect | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [hop, setHop] = useState(0);

  // acompanha o elemento alvo (posição muda com rolagem/teclado/layout)
  useEffect(() => {
    if (!active || !step) return;
    let scrolled = false;
    const tick = () => {
      setModalOpen(!!document.querySelector('.g-modal-overlay'));
      if (!step.target) { setRect(null); return; }
      const el = document.querySelector(step.target) as HTMLElement | null;
      if (!el) { setRect(null); return; }
      if (!scrolled) { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); scrolled = true; }
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    tick();
    const id = setInterval(tick, 250);
    setHop(h => h + 1); // o sapinho pula a cada passo novo
    return () => clearInterval(id);
  }, [active, step]);

  if (!active || !step) return null;

  const pad = 8;
  const hole = rect && !modalOpen ? { top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 } : null;
  // balão no lado com mais espaço livre; se o alvo for alto demais pra caber
  // balão em qualquer lado, fica fixo embaixo, logo acima da barra de navegação
  const BUBBLE_H = 190, NAV = 80;
  const spaceAbove = hole ? hole.top : 0;
  const spaceBelow = hole ? window.innerHeight - NAV - (hole.top + hole.height) : 0;
  const bubbleStyle: React.CSSProperties = modalOpen
    ? { top: 'calc(var(--safe-top, 0px) + 12px)' }
    : !hole
      ? { top: '50%', transform: 'translateY(-50%)' }
      : spaceBelow >= BUBBLE_H && spaceBelow >= spaceAbove
        ? { top: hole.top + hole.height + 14 }
        : spaceAbove >= BUBBLE_H
          ? { bottom: window.innerHeight - hole.top + 14 }
          : { bottom: `calc(${NAV + 8}px + var(--safe-bottom, 0px))` };
  const actionStep = !step.button;

  return (
    <div className={styles.root}>
      {!modalOpen && (hole
        ? <div className={styles.hole} style={hole}><div className={styles.ring} /></div>
        : <div className={styles.dim} />)}
      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          className={styles.bubbleWrap}
          style={bubbleStyle}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className={styles.avatar} onClick={() => setHop(h => h + 1)}>
            <ZenFrog speciesId={mascot?.speciesId || 'JUNGLE'} stage="adult" size={60} clickable={false} top={0} left={hop} />
          </div>
          <div className={styles.bubble}>
            <div className={styles.progress}>
              {TOUR_STEPS.map((_, i) => <span key={i} className={i <= stepIndex ? styles.dotOn : styles.dot} />)}
            </div>
            <strong className={styles.title}>{step.title}</strong>
            <p className={styles.text}>{step.text}</p>
            <div className={styles.actions}>
              <button className={styles.skip} onClick={skip}>{stepIndex === TOUR_STEPS.length - 1 ? '' : 'Pular tutorial'}</button>
              {actionStep
                ? <span className={styles.waiting}>esperando você ✨</span>
                : <button className={styles.primary} onClick={next}>{step.button}</button>}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
