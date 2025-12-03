
import React, { useMemo } from 'react';
import styles from './Aura.module.css';

interface AuraProps {
    progress: number; // Progress from 0 to 100
    size?: number;
    mode: 'focus' | 'shortBreak' | 'longBreak';
}

// --- Constants for the new design ---
const NUM_TICKS = 60; // 60 ticks for 60 seconds/steps
const CENTER = 150; // SVG viewbox center
const RADIUS = 135; // Radius of the circle of ticks
const TICK_LENGTH = 10; // Length of each tick mark

/**
 * A component that displays a circular progress indicator made of discrete ticks.
 * This creates a visual countdown effect.
 */
export const Aura: React.FC<AuraProps> = ({ 
    progress,
    size = 300, 
    mode 
}) => {

    const ticks = useMemo(() => {
        const tickArray = [];
        for (let i = 0; i < NUM_TICKS; i++) {
            const angle = (i / NUM_TICKS) * 360 - 90; // -90 to start from the top
            const rad = (angle * Math.PI) / 180;

            // Calculate start and end points for each tick line
            const x1 = CENTER + (RADIUS - TICK_LENGTH) * Math.cos(rad);
            const y1 = CENTER + (RADIUS - TICK_LENGTH) * Math.sin(rad);
            const x2 = CENTER + RADIUS * Math.cos(rad);
            const y2 = CENTER + RADIUS * Math.sin(rad);

            tickArray.push({ x1, y1, x2, y2 });
        }
        return tickArray;
    }, []);

    // Determine how many ticks should be visible based on progress
    const activeTicks = Math.ceil((progress / 100) * NUM_TICKS);

    const modeClass = styles[`aura--${mode}`];

    return (
        <div className={styles.auraContainer} style={{ width: size, height: size }}>
            <svg viewBox="0 0 300 300" className={styles.auraSvg}>
                <g>
                    {ticks.map((tick, i) => (
                        <line
                            key={i}
                            className={`
                                ${styles.tick} 
                                ${i < activeTicks ? styles.tickActive : styles.tickInactive}
                                ${modeClass}
                            `}
                            x1={tick.x1}
                            y1={tick.y1}
                            x2={tick.x2}
                            y2={tick.y2}
                        />
                    ))}
                </g>
            </svg>
        </div>
    );
};
