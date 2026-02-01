import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styles from './ZenPond.module.css';
import { ZenFrog } from './zen/ZenFrog';
import { PondDecorations } from './zen/PondDecorations'; // Importa o novo componente

interface Frog {
  id: string;
  speciesId: string;
}

interface Position {
  top: string;
  left: string;
}

interface Ripple extends Position {
  id: number;
}

interface ZenPondProps {
  collectedFrogs: Frog[];
  children?: React.ReactNode;
}

const getRandomPosition = (): Position => {
  const top = `${Math.random() * 70 + 15}%`;
  const left = `${Math.random() * 70 + 15}%`;
  return { top, left };
};

export const ZenPond: React.FC<ZenPondProps> = ({ collectedFrogs, children }) => {
  const [frogPositions, setFrogPositions] = useState<Map<string, Position>>(new Map());
  const [ripples, setRipples] = useState<Ripple[]>([]);

  useEffect(() => {
    setFrogPositions(prevPositions => {
      const newPositions = new Map(prevPositions);
      let hasChanged = false;
      collectedFrogs.forEach(frog => {
        if (!newPositions.has(frog.id)) {
          newPositions.set(frog.id, getRandomPosition());
          hasChanged = true;
        }
      });
      prevPositions.forEach((_, id) => {
        if (!collectedFrogs.some(f => f.id === id)) {
          newPositions.delete(id);
          hasChanged = true;
        }
      });
      return hasChanged ? newPositions : prevPositions;
    });
  }, [collectedFrogs]);

  useEffect(() => {
    const timers = new Map<string, NodeJS.Timeout>();

    const moveFrog = (frog: Frog) => {
      const currentPosition = frogPositions.get(frog.id);
      if (currentPosition) {
        const newRipple: Ripple = { id: Date.now() + Math.random(), ...currentPosition };
        setRipples(prev => [...prev, newRipple]);
        setTimeout(() => {
          setRipples(prev => prev.filter(r => r.id !== newRipple.id));
        }, 1000);
      }

      const newPosition = getRandomPosition();
      setFrogPositions(prev => new Map(prev).set(frog.id, newPosition));

      const nextMoveTimeout = Math.random() * 8000 + 4000;
      timers.set(frog.id, setTimeout(() => moveFrog(frog), nextMoveTimeout));
    };

    collectedFrogs.forEach(frog => {
      if (frogPositions.has(frog.id)) {
        const initialTimeout = Math.random() * 5000 + 2000;
        timers.set(frog.id, setTimeout(() => moveFrog(frog), initialTimeout));
      }
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [collectedFrogs, frogPositions]);

  const validFrogs = collectedFrogs.filter(f => f && f.speciesId && frogPositions.has(f.id));

  return (
    <div className={styles.zenPondContainer}>
      <div className={styles.water}>
        {/* Renderiza as decorações aleatórias */}
        <PondDecorations />

        {ripples.map(ripple => (
          <div
            key={ripple.id}
            className={styles.ripple}
            style={{ top: ripple.top, left: ripple.left }}
          />
        ))}

        {validFrogs.length > 0 ? (
          validFrogs.map(frog => {
            const pos = frogPositions.get(frog.id)!;
            return (
              <motion.div
                key={frog.id}
                animate={{ top: pos.top, left: pos.left }}
                transition={{ duration: 1.5, type: 'spring' }}
                className={styles.frogWrapper}
              >
                <ZenFrog speciesId={frog.speciesId} stage="adult" />
              </motion.div>
            );
          })
        ) : (
          children
        )}
      </div>
    </div>
  );
};
