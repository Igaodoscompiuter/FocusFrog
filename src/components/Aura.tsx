
import React from 'react';
import { motion } from 'framer-motion';
import styles from './Aura.module.css';

interface FocusAuraProps {
    progress: number; // 0 a 1
}

const AURA_RADIUS = 120;
const AURA_STROKE_WIDTH = 12;
const AURA_CIRCUMFERENCE = 2 * Math.PI * AURA_RADIUS;

export const FocusAura: React.FC<FocusAuraProps> = ({ progress }) => {
    const strokeDashoffset = AURA_CIRCUMFERENCE * (1 - progress);

    return (
        <div className={styles.auraContainer}>
            <svg className={styles.auraSvg} width="264" height="264" viewBox="0 0 264 264">
                {/* Círculo de fundo (o trilho) */}
                <circle
                    cx="132"
                    cy="132"
                    r={AURA_RADIUS}
                    strokeWidth={AURA_STROKE_WIDTH}
                    className={styles.auraBackground}
                />
                {/* Círculo de progresso (a energia) */}
                <motion.circle
                    cx="132"
                    cy="132"
                    r={AURA_RADIUS}
                    strokeWidth={AURA_STROKE_WIDTH}
                    className={styles.auraProgress}
                    strokeDasharray={AURA_CIRCUMFERENCE}
                    strokeDashoffset={strokeDashoffset}
                    transform="rotate(-90 132 132)" // Começa do topo
                />
            </svg>
        </div>
    );
};
