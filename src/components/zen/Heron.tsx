
import React from 'react';
import { motion } from 'framer-motion';
import styles from './ZenAssets.module.css';

interface HeronProps {
    style?: React.CSSProperties;
    delay?: number;
}

export const Heron: React.FC<HeronProps> = ({ style, delay = 0 }) => {
    return (
        <motion.div
            className={styles.zenAssetContainer}
            style={style}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay, duration: 2.5, ease: 'easeOut' }}
        >
            <svg width="150" height="200" viewBox="0 0 150 200" className={styles.heronSvg}>
                {/* Pernas */}
                <path d="M70 180 L 75 140" stroke="#424242" strokeWidth="3" />
                <path d="M80 180 L 85 140" stroke="#424242" strokeWidth="3" />

                {/* Corpo */}
                <path d="M60,140 C40,100 80,60 90,140 Z" fill="#FAFAFA" />
                
                {/* Pescoço e Cabeça */}
                <path d="M80,80 C120,80 110,40 90,30 C70,20 70,50 80,80 Z" fill="#FAFAFA" />

                {/* Bico */}
                <path d="M95,35 L130,25" stroke="#FFC107" strokeWidth="4" />

                 {/* Olho */}
                <circle cx="92" cy="38" r="2" fill="#000000" />

                {/* Animação sutil na cabeça */}
                <motion.g
                    animate={{
                        rotate: [-2, 2, -2],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                >
                    <path d="M80,80 C120,80 110,40 90,30 C70,20 70,50 80,80 Z" fill="#FAFAFA" />
                    <path d="M95,35 L130,25" stroke="#FFC107" strokeWidth="4" />
                    <circle cx="92" cy="38" r="2" fill="#000000" />
                </motion.g>
            </svg>
        </motion.div>
    );
};
