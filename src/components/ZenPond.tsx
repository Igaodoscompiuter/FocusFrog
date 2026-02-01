import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import styles from './ZenPond.module.css';
import { ZenFrog } from './zen/ZenFrog';
import { PondDecorations } from './zen/PondDecorations';
import { frogPersonalities } from '../config/frogPersonalities'; // [NEW] Importa as personalidades

// --- Interfaces ---
interface FrogInput {
  id: string;
  speciesId: string;
}

interface PondFrog extends FrogInput {
  top: number;
  left: number;
  scale: number;
  moveAt: number; 
}

interface Ripple {
  id: number;
  top: string;
  left: string;
}

interface ZenPondProps {
  collectedFrogs: FrogInput[];
  children?: React.ReactNode;
}

// --- Constantes ---
const POND_BOUNDS = { top: 15, left: 15, right: 85, bottom: 85 };
const FROG_COLLISION_RADIUS = 7;
const FROG_INTERACTION_DISTANCE = 5.5;
const MIN_FROG_SCALE = 0.25; 
const SIMULATION_TICK_RATE = 2000;

// --- Funções Auxiliares ---
const random = (min, max) => Math.random() * (max - min) + min;
const getDistance = (pos1: {left: number, top: number}, pos2: {left: number, top: number}) => {
  return Math.sqrt(Math.pow(pos1.left - pos2.left, 2) + Math.pow(pos1.top - pos2.top, 2));
};

// [NEW] Calcula a nova posição do salto com base na personalidade
const getNewLeapPosition = (currentPos, jumpDistance, bounds) => {
  const angle = random(0, 2 * Math.PI);
  const distance = random(jumpDistance.min, jumpDistance.max) / 5; // Ajuste para o sistema de coordenadas em %

  let newLeft = currentPos.left + Math.cos(angle) * distance;
  let newTop = currentPos.top + Math.sin(angle) * distance;

  // Garante que o sapo permaneça dentro dos limites do lago
  newLeft = Math.max(bounds.left, Math.min(newLeft, bounds.right));
  newTop = Math.max(bounds.top, Math.min(newTop, bounds.bottom));

  return { top: newTop, left: newLeft };
};

// --- Componente Principal ---
export const ZenPond: React.FC<ZenPondProps> = ({ collectedFrogs, children }) => {
  const [pondFrogs, setPondFrogs] = useState<PondFrog[]>([]);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const prevCollectedFrogsRef = useRef<FrogInput[]>([]);

  useEffect(() => {
    const prevIds = new Set(prevCollectedFrogsRef.current.map(f => f.id));
    const newFrogsFromProp = collectedFrogs.filter(f => !prevIds.has(f.id));

    const frogsToAdd = newFrogsFromProp.map(newFrog => ({
      ...newFrog,
      top: random(POND_BOUNDS.top, POND_BOUNDS.bottom),
      left: random(POND_BOUNDS.left, POND_BOUNDS.right),
      scale: 0.5,
      moveAt: Date.now() + random(5000, 10000),
    }));

    if (frogsToAdd.length > 0) {
      setPondFrogs(prev => [...prev, ...frogsToAdd]);
    }
    prevCollectedFrogsRef.current = collectedFrogs;
  }, [collectedFrogs]);

  useEffect(() => {
    const gameLoop = setInterval(() => {
      const now = Date.now();
      let frogs = [...pondFrogs];

      // 1. Lógica de Movimento com PERSONALIDADES
      const updatedFrogs = frogs.map(frog => {
        if (now >= frog.moveAt) {
          const personality = frogPersonalities[frog.speciesId] || frogPersonalities.DEFAULT;
          
          const potentialPosition = getNewLeapPosition(frog, personality.jumpDistance, POND_BOUNDS);

          const isPathClear = !frogs.some(otherFrog => {
            if (frog.id === otherFrog.id) return false;
            return getDistance(potentialPosition, otherFrog) < FROG_COLLISION_RADIUS;
          });

          if (isPathClear) {
            const newRipple: Ripple = { id: now + Math.random(), top: `${frog.top}%`, left: `${frog.left}%` };
            setRipples(prev => [...prev, newRipple]);
            setTimeout(() => setRipples(prev => prev.filter(r => r.id !== newRipple.id)), 1000);
            
            return { 
              ...frog, 
              ...potentialPosition, 
              moveAt: now + random(personality.moveInterval.min, personality.moveInterval.max) 
            };
          } else {
            return { ...frog, moveAt: now + random(2000, 4000) };
          }
        }
        return frog;
      });

      // 2. Lógica de Interação
      const frogsToRemove = new Set<string>();
      for (let i = 0; i < updatedFrogs.length; i++) {
        for (let j = i + 1; j < updatedFrogs.length; j++) {
          const frogA = updatedFrogs[i];
          const frogB = updatedFrogs[j];

          if (frogsToRemove.has(frogA.id) || frogsToRemove.has(frogB.id)) continue;
          
          if (getDistance(frogA, frogB) < FROG_INTERACTION_DISTANCE) {
            if (frogA.speciesId === frogB.speciesId) {
              frogA.scale = Math.min(frogA.scale * 1.05, 2.0); // Adiciona limite de crescimento
              frogsToRemove.add(frogB.id);
            } else {
              const [larger, smaller] = frogA.scale > frogB.scale ? [frogA, frogB] : [frogB, frogA];
              larger.scale = Math.min(larger.scale * 1.02, 2.0);
              smaller.scale *= 0.98;
            }
          }
        }
      }
      
      const finalFrogs = updatedFrogs
        .filter(f => !frogsToRemove.has(f.id))
        .filter(f => f.scale >= MIN_FROG_SCALE);

      setPondFrogs(finalFrogs);

    }, SIMULATION_TICK_RATE);

    return () => clearInterval(gameLoop);
  }, [pondFrogs]);

  return (
    <div className={styles.zenPondContainer}>
      <div className={styles.water}>
        <PondDecorations />
        {ripples.map(ripple => (
          <div key={ripple.id} className={styles.ripple} style={{ top: ripple.top, left: ripple.left }} />
        ))}

        {pondFrogs.length > 0 ? (
          pondFrogs.map(frog => (
            <motion.div
              key={frog.id}
              animate={{ top: `${frog.top}%`, left: `${frog.left}%`, scale: frog.scale }}
              transition={{ duration: 2.5, type: 'spring' }}
              className={styles.frogWrapper}
            >
              <div className={styles.collisionBarrier} />
              <ZenFrog speciesId={frog.speciesId} stage="adult" />
            </motion.div>
          ))
        ) : (
          children
        )}
      </div>
    </div>
  );
};
