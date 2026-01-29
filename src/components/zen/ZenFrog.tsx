
import React from 'react';
import { motion } from 'framer-motion';
import styles from './ZenAssets.module.css'; // Reutilizaremos o container do frog se necessário

export const ZenFrog: React.FC = () => {
    return (
        <div className={styles.frogContainer}>
            <motion.svg 
                width="120" 
                height="120" 
                viewBox="0 0 100 100"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
            >
                {/* Sombra sutil */}
                <filter id="frog-shadow">
                    <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="rgba(0,0,0,0.2)"/>
                </filter>

                {/* Corpo do Sapo com animação de respiração */}
                <motion.g 
                    filter="url(#frog-shadow)"
                    animate={{
                        scaleY: [1, 0.98, 1],
                        translateY: [0, 2, 0]
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <path 
                        d="M50 85 C 30 85, 25 60, 50 55 C 75 60, 70 85, 50 85 Z"
                        fill="#4CAF50" // Verde Sapo
                    />
                    {/* Olhos fechados (meditando) */}
                    <path d="M42 68 C 44 71, 47 71, 49 68" stroke="#1B5E20" strokeWidth="1.5" fill="none" />
                    <path d="M58 68 C 60 71, 63 71, 65 68" stroke="#1B5E20" strokeWidth="1.5" fill="none" />
                </motion.g>
            </motion.svg>
        </div>
    );
};
