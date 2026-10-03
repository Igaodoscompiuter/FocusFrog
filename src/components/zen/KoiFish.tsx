import React from 'react';
import styles from './KoiFish.module.css';

// Caminhos e cores IDÊNTICOS ao protótipo zen-lake-v3.html — duas carpas
// nadando por uma trajetória em curva (CSS offset-path), com cauda bífida
// articulada e reflexo desfocado acompanhando por baixo.
const KOI_VARIANTS = [
    { base: '#E65100', spot1: '#FFFFFF', spot2: '#1b1b1b' },
    { base: '#FF7043', spot1: '#1b1b1b', spot2: '#FFFFFF' },
];
const KOI_PATHS = [
    'M 20,60 C 80,20 160,100 240,50 C 300,15 340,70 360,100',
    'M 360,220 C 300,260 220,190 150,230 C 90,265 50,210 20,180',
];

interface KoiBodyProps {
    base: string;
    spot1: string;
    spot2: string;
}

const KoiBody: React.FC<KoiBodyProps> = ({ base, spot1, spot2 }) => (
    <svg width="50" height="26" viewBox="-16 0 116 52" style={{ overflow: 'visible', display: 'block' }}>
        <g className={styles.koiTail}>
            <path d="M18 26 C6 14 2 10 -6 8 C0 18 0 26 -8 36 C0 34 8 32 18 26Z" fill={base} opacity="0.85" />
            <path d="M18 26 C10 20 6 22 -2 20 M18 26 C10 30 6 30 -2 32" stroke="#ffffff40" strokeWidth="1" fill="none" />
        </g>
        <path d="M18 26 C22 8 46 2 68 8 C86 13 96 20 100 26 C96 32 86 39 68 44 C46 50 22 44 18 26Z" fill={base} />
        <path d="M30 12 C42 8 58 8 70 12 C60 16 42 16 30 12Z" fill="#ffffff28" />
        <path d="M40 10 Q46 4 54 8 Q50 14 40 10Z" fill={spot1} />
        <path d="M62 34 Q72 30 78 38 Q68 42 62 34Z" fill={spot2} />
        <path d="M34 32 Q40 28 44 34 Q38 38 34 32Z" fill={spot1} opacity="0.85" />
        <path d="M26 20 C22 17 17 17 12 20 C17 22 22 22 26 24Z" fill={base} opacity="0.55" />
        <circle cx="86" cy="22" r="2.4" fill="#1b1b1b" />
        <circle cx="85.3" cy="21.2" r="0.8" fill="#ffffff" />
        <path d="M76 15 Q80 17 78 21" stroke="#00000030" strokeWidth="1" fill="none" />
    </svg>
);

/** Renderiza as duas carpas do protótipo, cada uma com seu reflexo desfocado,
 *  nadando por uma trajetória em curva via CSS offset-path (sem depender de
 *  JS pra posição — o navegador anima sozinho, como no protótipo original). */
export const KoiFish: React.FC = () => (
    <>
        {KOI_VARIANTS.map((kv, i) => {
            const duration = 16 + i * 4;
            const delay = i * 3;
            const pathStyle: React.CSSProperties = {
                offsetPath: `path("${KOI_PATHS[i]}")`,
                // @ts-ignore — offsetRotate não está no typing padrão de CSSProperties
                offsetRotate: 'auto',
                animationDuration: `${duration}s`,
                animationDelay: `${delay}s`,
            };
            return (
                <React.Fragment key={i}>
                    <div className={styles.koiReflection} style={pathStyle} />
                    <div className={styles.koi} style={pathStyle}>
                        <KoiBody {...kv} />
                    </div>
                </React.Fragment>
            );
        })}
    </>
);
