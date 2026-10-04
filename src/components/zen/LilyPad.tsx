import React from 'react';
import styles from './LilyPad.module.css';

// Três silhuetas (variante por índice) — mesmos contornos do protótipo, pra
// não repetir a mesma forma em todo nenúfar da lagoa.
const OUTLINES = [
    'M50 6 C74 6 92 16 94 42 C96 66 82 92 56 94 C30 96 8 78 6 52 C4 28 26 6 50 6 Z',
    'M50 8 C72 4 94 20 92 46 C90 70 74 94 48 92 C24 90 4 72 8 48 C11 28 30 12 50 8 Z',
    'M48 6 C70 8 90 24 90 48 C90 72 70 92 46 92 C22 92 6 74 8 50 C10 26 28 4 48 6 Z',
];

export interface LilyPadData {
    x: number; // % dentro da lagoa
    y: number;
    size: number; // px
}

export const LILYPADS: LilyPadData[] = [
    { x: 22, y: 30, size: 62 },
    { x: 68, y: 22, size: 54 },
    { x: 40, y: 48, size: 76 },
    { x: 78, y: 55, size: 60 },
    { x: 25, y: 68, size: 56 },
    { x: 55, y: 75, size: 64 },
];

const TINTS = ['#2f8f5b', '#3aa568', '#279874'];

interface LilyPadProps {
    pad: LilyPadData;
    index: number;
    /** um sapo acabou de pousar aqui → inclina (padTilt do jogo) */
    reacting?: boolean;
}

export const LilyPad: React.FC<LilyPadProps> = ({ pad, index, reacting = false }) => {
    const outline = OUTLINES[index % OUTLINES.length];
    const tint = TINTS[index % TINTS.length];

    return (
        <div className={styles.wrap} style={{ left: `${pad.x}%`, top: `${pad.y}%` }}>
            <div className={styles.shadow} style={{ width: pad.size * 0.9, height: pad.size * 0.45 }} />
            <div className={`${styles.pad} ${reacting ? styles.reacting : ''}`} style={{ width: pad.size, height: pad.size, animationDelay: reacting ? '0s' : `${index * 0.7}s` }}>
                <svg width={pad.size} height={pad.size} viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
                    {/* corte em V apontando pra fora, estilo nenúfar de verdade */}
                    <path d={outline} fill={tint} stroke="#00000022" strokeWidth={1} />
                    <path d="M50 50 L92 42 L86 52 L92 62 Z" fill="#114f49" />
                    <ellipse cx="42" cy="40" rx="24" ry="18" fill="#bfe6a8" opacity="0.35" />
                    <g stroke="#ffffff33" strokeWidth={1.4} fill="none">
                        <path d="M50 50 L50 12" />
                        <path d="M50 50 L18 28" />
                        <path d="M50 50 L14 58" />
                        <path d="M50 50 L28 86" />
                        <path d="M50 50 L58 90" />
                    </g>
                    <path d={outline} fill="none" stroke="#ffffff26" strokeWidth={1.5} />
                </svg>
            </div>
        </div>
    );
};
