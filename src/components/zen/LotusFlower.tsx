
import React from 'react';
import { motion } from 'framer-motion';
import styles from './ZenAssets.module.css';

interface LotusFlowerProps {
    style?: React.CSSProperties;
    delay?: number;
}

export const LotusFlower: React.FC<LotusFlowerProps> = ({ style, delay = 0 }) => {
    return (
        <motion.div
            className={styles.zenAssetContainer}
            style={style}
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: delay, duration: 1.5, ease: 'easeOut' }}
        >
            <svg width="80" height="80" viewBox="0 0 100 100" className={styles.lotusSvg}>
                {/* Folhas Externas */}
                <path d="M50 95 C 30 75, 35 50, 50 50 S 70 75, 50 95 Z" fill="#689F38" />
                <path d="M50 95 C 40 85, 20 60, 50 50 S 60 85, 50 95 Z" fill="#7CB342" transform="rotate(15 50 50)"/>
                
                {/* Pétalas */}
                <path d="M50 50 C 40 30, 45 10, 50 10 S 60 30, 50 50 Z" fill="#F8BBD0" />
                <path d="M50 50 C 45 35, 30 20, 50 10 S 55 35, 50 50 Z" fill="#F48FB1" transform="rotate(-25 50 50)"/>
                <path d="M50 50 C 55 35, 70 20, 50 10 S 45 35, 50 50 Z" fill="#F48FB1" transform="rotate(25 50 50)"/>

                {/* Centro */}
                <circle cx="50" cy="50" r="8" fill="#FFEB3B" />
            </svg>
        </motion.div>
    );
};
