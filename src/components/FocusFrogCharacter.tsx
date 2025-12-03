
import React from 'react';
import styles from './FocusFrogCharacter.module.css';

interface FocusFrogCharacterProps {
    status: 'idle' | 'meditating' | 'happy';
    size?: number;
}

export const FocusFrogCharacter: React.FC<FocusFrogCharacterProps> = ({ status, size = 150 }) => {

    // FIX: A lógica de classes foi movida para variáveis para maior clareza
    // e para facilitar a animação entre os estados.
    const idleEyesClass = `${styles.frogEyes} ${styles.eyesIdle} ${status === 'idle' || status === 'happy' ? styles.visible : ''}`;
    const meditatingEyesClass = `${styles.frogEyes} ${styles.eyesMeditating} ${status === 'meditating' ? styles.visible : ''}`;
    const happyMouthClass = `${styles.frogMouth} ${status === 'happy' ? styles.visible : ''}`;

    return (
        <div className={`${styles.frogContainer} ${styles['status--' + status]}`} style={{ width: size, height: size }}>
            <svg viewBox="0 0 100 100" className={styles.frogSvg}>
                {/* Corpo do Sapo */}
                <g className={styles.frogBody}>
                    <path d="M50,95 C25,95 20,70 20,50 C20,25 30,20 50,20 C70,20 80,25 80,50 C80,70 75,95 50,95 Z" fill="#5c8b57" />
                    <path d="M50,90 C35,90 30,70 30,55 C30,40 40,35 50,35 C60,35 70,40 70,55 C70,70 65,90 50,90 Z" fill="#84b87c" />
                </g>

                {/* Olhos - Ociosos (Abertos) */}
                <g className={idleEyesClass}>
                    <circle cx="38" cy="42" r="6" fill="#fff" />
                    <circle cx="62" cy="42" r="6" fill="#fff" />
                    <circle cx="39" cy="43" r="3" fill="#000" />
                    <circle cx="61" cy="43" r="3" fill="#000" />
                </g>

                {/* Olhos - Meditando (Fechados/Curvados) */}
                <g className={meditatingEyesClass}>
                    <path d="M34,45 C38,42 42,42 46,45" stroke="#3e603b" strokeWidth="2" fill="none" strokeLinecap="round"/>
                    <path d="M54,45 C58,42 62,42 66,45" stroke="#3e603b" strokeWidth="2" fill="none" strokeLinecap="round"/>
                </g>

                {/* Sorriso - Feliz */}
                <g className={happyMouthClass}>
                     <path d="M40,58 C45,65 55,65 60,58" stroke="#3e603b" strokeWidth="2" fill="none" strokeLinecap="round"/>
                </g>
            </svg>
        </div>
    );
};
