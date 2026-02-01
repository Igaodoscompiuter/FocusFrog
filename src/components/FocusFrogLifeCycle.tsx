
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './FocusFrogLifeCycle.module.css';
import { frogSpecies, FrogSpeciesData } from '../utils/frogSpecies';

interface FocusFrogLifeCycleProps {
  progress: number;
  speciesId: keyof typeof frogSpecies | null | undefined;
}

const STAGES = {
  EGG: { min: 0, max: 0.03 },
  TADPOLE: { min: 0.03, max: 0.515 },
  FROGLET: { min: 0.515, max: 0.75 },
  FROG: { min: 0.75, max: 1 },
};

const getStage = (progress: number) => {
    if (progress < STAGES.TADPOLE.min) return 'EGG';
    if (progress < STAGES.FROGLET.min) return 'TADPOLE';
    if (progress < STAGES.FROG.min) return 'FROGLET';
    return 'FROG';
}

const RipplesSVG = () => (
    <svg className={styles.rippleSvgContainer}><g><circle className={`${styles.ripple} ${styles.ripple1}`} /><circle className={`${styles.ripple} ${styles.ripple2}`} /><circle className={`${styles.ripple} ${styles.ripple3}`} /></g></svg>
);

const EggSVG = () => (
    <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1}} exit={{ scale: 0.5, opacity: 0 }} className={styles.creatureWrapper}>
        <svg viewBox="0 0 50 50"><defs><radialGradient id="eggGradient"><stop offset="0%" stopColor="rgba(255, 255, 255, 0.1)" /><stop offset="70%" stopColor="rgba(255, 255, 255, 0.25)" /><stop offset="100%" stopColor="rgba(255, 255, 255, 0.4)" /></radialGradient></defs><circle cx="25" cy="25" r="24" fill="url(#eggGradient)" className={styles.eggGel} /><circle cx="25" cy="25" r="8" className={styles.eggCore} /><ellipse cx="32" cy="18" rx="7" ry="4" className={styles.eggHighlight} /></svg>
    </motion.div>
);

const TadpoleSVG = () => (
    <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} className={styles.creatureWrapper}>
        <svg viewBox="0 0 80 80" className={styles.tadpoleContainer}>
            <defs><radialGradient id="tadpoleGradient"><stop offset="0%" stopColor="var(--tadpole-color-highlight)" /><stop offset="100%" stopColor="var(--tadpole-color-primary)" /></radialGradient></defs>
            <g className={styles.tadpoleBodyGroup}>
                <g className={styles.tadpoleTailGroup}><path d="M 40,54 Q 30,64 40,74 Q 50,64 40,54 Z" className={styles.tadpoleTail} /></g>
                <ellipse cx="40" cy="40" rx="11" ry="14" fill="url(#tadpoleGradient)" />
                <circle cx="36" cy="33" r="2" className={styles.tadpoleEye} /><circle cx="44" cy="33" r="2" className={styles.tadpoleEye} />
            </g>
        </svg>
    </motion.div>
);

const FrogletSVG = () => (
    <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} className={styles.creatureWrapper}>
        <svg viewBox="0 0 80 80" className={styles.frogletContainer}>
            <defs><radialGradient id="tadpoleGradient"><stop offset="0%" stopColor="var(--tadpole-color-highlight)" /><stop offset="100%" stopColor="var(--tadpole-color-primary)" /></radialGradient></defs>
            <g className={styles.frogletBodyGroup}>
                <g className={styles.tadpoleTailGroup}><path d="M 40,54 Q 55,68 40,78 Q 25,68 40,54 Z" className={styles.tadpoleTail} /></g>
                <g className={styles.frogletBackLegs}><path d="M32,52 C 20,62, 25,40, 30,45 Z" className={styles.frogletLeg} /><path d="M48,52 C 60,62, 55,40, 50,45 Z" className={styles.frogletLeg} /></g>
                <ellipse cx="40" cy="40" rx="11" ry="14" fill="url(#tadpoleGradient)" />
                <g className={styles.frogletFrontLegs}><path d="M35,54 C 30,62, 40,62, 38,55 Z" className={styles.frogletLeg} /><path d="M45,54 C 50,62, 40,62, 42,55 Z" className={styles.frogletLeg} /></g>
                <circle cx="36" cy="33" r="2.5" className={styles.tadpoleEye} /><circle cx="44" cy="33" r="2.5" className={styles.tadpoleEye} />
            </g>
        </svg>
    </motion.div>
);

const FrogSVG = () => (
    <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} className={styles.creatureWrapper}>
        <svg viewBox="0 0 100 100" className={styles.frogContainer}>
            <g className={styles.frogBody}>
                <ellipse cx="28" cy="75" rx="12" ry="10" className={styles.frogLegBack} />
                <ellipse cx="72" cy="75" rx="12" ry="10" className={styles.frogLegBack} />
                <ellipse cx="50" cy="60" rx="30" ry="25" className={styles.frogMainBody} />
                <ellipse cx="50" cy="65" rx="20" ry="18" className={styles.frogBelly} />
                <ellipse cx="38" cy="80" rx="8" ry="6" className={styles.frogLegFront} />
                <ellipse cx="62" cy="80" rx="8" ry="6" className={styles.frogLegFront} />
                <g className={styles.frogEyeGroup}><circle cx="40" cy="45" r="10" className={styles.frogEyeSocket} /><circle cx="40" cy="45" r="5" className={styles.frogPupil} /></g>
                <g className={styles.frogEyeGroup}><circle cx="60" cy="45" r="10" className={styles.frogEyeSocket} /><circle cx="60" cy="45" r="5" className={styles.frogPupil} /></g>
                <path d="M45,68 Q50,72 55,68" className={styles.frogMouth} />
            </g>
        </svg>
    </motion.div>
);

export const FocusFrogLifeCycle: React.FC<FocusFrogLifeCycleProps> = ({ progress, speciesId }) => {
    // Se não houver ID da espécie, não renderiza nada
    if (!speciesId) {
        return null;
    }

    const speciesData: FrogSpeciesData | undefined = frogSpecies[speciesId];

    // Se o ID da espécie não corresponder a nenhuma espécie conhecida, não renderiza nada
    if (!speciesData) {
        console.warn(`[FocusFrogLifeCycle] No species data found for ID: ${speciesId}`);
        return null;
    }

    const stage = getStage(progress);

    const [movement, setMovement] = useState({ top: 80, left: 50, rotation: 0 });
    const lastPosition = useRef({ top: 80, left: 50 });

    useEffect(() => {
        let moveInterval: NodeJS.Timeout;

        if (stage === 'TADPOLE' || stage === 'FROGLET') {
            const move = () => {
                const angle = Math.random() * 2 * Math.PI;
                const radius = Math.random() * 40;
                const newTop = 50 + radius * Math.sin(angle);
                const newLeft = 50 + radius * Math.cos(angle);
                const newRotation = Math.atan2(newTop - lastPosition.current.top, newLeft - lastPosition.current.left) * (180 / Math.PI) + 90;
                lastPosition.current = { top: newTop, left: newLeft };
                setMovement({ top: newTop, left: newLeft, rotation: newRotation });
            };
            move();
            moveInterval = setInterval(move, 6000);
        } else if (stage === 'FROG') {
            setMovement({ top: 80, left: 50, rotation: 0 });
        } else { // EGG
            lastPosition.current = { top: 80, left: 50 };
            setMovement({ top: 80, left: 50, rotation: 0 });
        }

        return () => {
            if (moveInterval) clearInterval(moveInterval);
        };
    }, [stage]);

    // CORREÇÃO: As cores agora são extraídas dos locais corretos dentro do objeto speciesData
    const creatureStyle = {
        '--frog-color-primary': speciesData.stages.adult.colors.primary,
        '--frog-color-secondary': speciesData.stages.adult.colors.secondary,
        '--tadpole-color-primary': speciesData.stages.tadpole.colors.primary,
        '--tadpole-color-highlight': speciesData.stages.tadpole.colors.secondary,
    } as React.CSSProperties;
    
    const movableWrapperStyle = {
        top: `${movement.top}%`,
        left: `${movement.left}%`,
        transform: `translate(-50%, -50%) rotate(${movement.rotation}deg)`,
    };
    
    const movableWrapperClassName = `${styles.movableWrapper} ${styles[stage]}`;

    return (
        <div className={styles.container} style={creatureStyle}>
            <div className={movableWrapperClassName} style={movableWrapperStyle}>
                <AnimatePresence>{stage !== 'FROG' && <RipplesSVG key="ripples" />}</AnimatePresence>
                <AnimatePresence mode="wait">
                    {stage === 'EGG' && <EggSVG key="egg" />}
                    {stage === 'TADPOLE' && <TadpoleSVG key="tadpole" />}
                    {stage === 'FROGLET' && <FrogletSVG key="froglet" />}
                    {stage === 'FROG' && <FrogSVG key="frog" />}
                </AnimatePresence>
            </div>
        </div>
    );
};
