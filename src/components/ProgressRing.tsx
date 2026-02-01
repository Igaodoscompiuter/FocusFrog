import React from 'react';

interface ProgressRingProps {
    progress: number; // 0 a 1
}

const STROKE_WIDTH = 12; // Mais espesso para uma sensação mais presente
const RADIUS = 120;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const ProgressRing: React.FC<ProgressRingProps> = ({ progress }) => {
    const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

    return (
        <svg
            width="260"
            height="260"
            viewBox="0 0 260 260"
            style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) rotate(-90deg)',
                overflow: 'visible'
            }}
        >
            {/* Anel de fundo (trilho) */}
            <circle
                cx="130"
                cy="130"
                r={RADIUS}
                fill="transparent"
                stroke="var(--surface-color)" // Uma cor de base sutil
                strokeWidth={STROKE_WIDTH}
            />
            {/* Anel de progresso (a "água energizada") */}
            <circle
                cx="130"
                cy="130"
                r={RADIUS}
                fill="transparent"
                stroke="var(--accent-color)" // A cor de destaque vibrante
                strokeWidth={STROKE_WIDTH}
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round" // Ponta arredondada bonita
                style={{
                    transition: 'stroke-dashoffset 0.35s ease-out',
                    // O efeito de "aura" para dar vida
                    filter: 'drop-shadow(0 0 5px var(--accent-color))' 
                }}
            />
        </svg>
    );
};