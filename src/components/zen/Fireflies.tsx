import React, { useMemo } from 'react';
import styles from './Fireflies.module.css';

const FIREFLY_COUNT = 9;

/** Vaga-lumes com profundidade variada — cada um com tamanho, brilho, raio de
 *  deriva e velocidade de piscar próprios, igual ao protótipo. Como CSS não
 *  aceita valor aleatório em @keyframes, cada instância usa suas PRÓPRIAS
 *  variáveis customizadas (--dx/--dy) lidas pela mesma keyframe compartilhada. */
export const Fireflies: React.FC = () => {
    const flies = useMemo(() => Array.from({ length: FIREFLY_COUNT }, (_, i) => {
        const depth = Math.random();
        const size = 2.5 + depth * 3.5;
        const dur = (5 + Math.random() * 7).toFixed(1);
        const blinkDur = (1.3 + Math.random() * 2.2).toFixed(1);
        const dx = (Math.random() * 46 - 23).toFixed(0) + 'px';
        const dy = (Math.random() * 46 - 23).toFixed(0) + 'px';
        return {
            id: i,
            left: `${Math.random() * 90 + 5}%`,
            top: `${Math.random() * 65 + 5}%`,
            size,
            glow: `0 0 ${(4 + depth * 6).toFixed(1)}px ${(1 + depth * 2).toFixed(1)}px #FBBF24`,
            opacity: 0.5 + depth * 0.5,
            style: {
                animation: `drift ${dur}s ease-in-out infinite, blink ${blinkDur}s ease-in-out infinite`,
                '--dx': dx,
                '--dy': dy,
            } as React.CSSProperties,
        };
    }), []);

    return (
        <>
            {flies.map(f => (
                <div
                    key={f.id}
                    className={styles.firefly}
                    style={{
                        left: f.left,
                        top: f.top,
                        width: f.size,
                        height: f.size,
                        boxShadow: f.glow,
                        opacity: f.opacity,
                        ...f.style,
                    }}
                />
            ))}
        </>
    );
};
