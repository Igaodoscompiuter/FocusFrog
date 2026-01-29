
import React from 'react';
import { motion } from 'framer-motion';
import styles from './ZenAssets.module.css';

interface KoiFishProps {
    style?: React.CSSProperties;
    delay?: number;
    isReversed?: boolean; // Para espelhar o peixe
}

export const KoiFish: React.FC<KoiFishProps> = ({ style, delay = 0, isReversed = false }) => {

    const swimAnimation = {
        x: isReversed ? [-20, 100, -20] : [20, -100, 20], // Movimento horizontal
        y: [10, -5, 10], // Leve movimento vertical
        transition: {
            duration: 15 + Math.random() * 5, // Duração variada
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: delay,
        }
    }

    return (
        <motion.div
            className={styles.zenAssetContainer}
            style={style}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay, duration: 2 }}
        >
            <motion.svg 
                width="90" 
                height="40" 
                viewBox="0 0 120 50" 
                className={styles.koiSvg}
                style={{ transform: isReversed ? 'scaleX(-1)' : 'scaleX(1)' }}
                animate={swimAnimation}
            >
                {/* Corpo do Peixe */}
                <path 
                    d="M10,25 C40,0 80,0 110,25 C80,50 40,50 10,25 Z" 
                    fill="#E65100" // Laranja vibrante
                />
                {/* Manchas */}
                <circle cx="45" cy="18" r="7" fill="#FFFFFF" />
                <circle cx="75" cy="28" r="9" fill="#000000" />
                {/* Olho */}
                <circle cx="95" cy="22" r="3" fill="#000000" />
            </motion.svg>
        </motion.div>
    );
};
