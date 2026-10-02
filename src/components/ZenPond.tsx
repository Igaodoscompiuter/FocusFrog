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
  merging?: boolean; // sendo "engolido" por outro sapo da mesma espécie (some no próximo tick)
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
const FROG_INTERACTION_DISTANCE = 8;
// Teto de sapos VISÍVEIS na lagoa. Os excedentes esperam numa fila ("viveiro") e entram
// conforme abrem vagas (fusões). Validado em simulação: sem teto e sem atração, uma
// lagoa de 12 quase nunca se resolve sozinha (2/40 rodadas em 2h).
const MAX_POND_FROGS = 8;
// Chance de um pulo ir na direção do sapo mais próximo da MESMA espécie (atração ativa).
// Em simulação: lagoa de 8 converge em ~2,6 min (vs ~60 min sem atração).
const ATTRACTION_CHANCE = 0.7;
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

// Pulo com atração: parte das vezes o sapo salta em direção ao parceiro (mesma espécie)
// mais próximo, sem ultrapassá-lo; nas demais vezes mantém o pulo aleatório da personalidade.
const getSmartLeapPosition = (frog, allFrogs, jumpDistance, bounds) => {
  if (Math.random() < ATTRACTION_CHANCE) {
    let partner = null;
    let nearest = Infinity;
    for (const other of allFrogs) {
      if (other.id === frog.id || other.merging || other.speciesId !== frog.speciesId) continue;
      const d = getDistance(frog, other);
      if (d < nearest) { nearest = d; partner = other; }
    }
    if (partner) {
      const angle = Math.atan2(partner.top - frog.top, partner.left - frog.left) + random(-0.35, 0.35);
      const distance = Math.min(random(jumpDistance.min, jumpDistance.max) / 5, Math.max(nearest - 1, 0.5));
      return {
        left: Math.max(bounds.left, Math.min(frog.left + Math.cos(angle) * distance, bounds.right)),
        top: Math.max(bounds.top, Math.min(frog.top + Math.sin(angle) * distance, bounds.bottom)),
      };
    }
  }
  return getNewLeapPosition(frog, jumpDistance, bounds);
};

// Ordena candidatos priorizando diversidade: primeiro espécies que ainda não estão na
// lagoa, depois o resto alternando entre espécies (evita a lagoa virar só duplicatas).
const diversityOrder = (candidates: FrogInput[], present: { speciesId: string }[]): FrogInput[] => {
  const seen = new Set(present.map(f => f.speciesId));
  const bySpecies = new Map<string, FrogInput[]>();
  candidates.forEach(c => {
    const list = bySpecies.get(c.speciesId) ?? [];
    list.push(c);
    bySpecies.set(c.speciesId, list);
  });
  const result: FrogInput[] = [];
  bySpecies.forEach((list, speciesId) => {
    if (!seen.has(speciesId) && list.length > 0) result.push(list.shift() as FrogInput);
  });
  let added = true;
  while (added) {
    added = false;
    bySpecies.forEach(list => {
      const next = list.shift();
      if (next) { result.push(next); added = true; }
    });
  }
  return result;
};

const spawnFrog = (f: FrogInput): PondFrog => ({
  ...f,
  top: random(POND_BOUNDS.top, POND_BOUNDS.bottom),
  left: random(POND_BOUNDS.left, POND_BOUNDS.right),
  scale: 0.5,
  moveAt: Date.now() + random(5000, 10000),
});

// --- Componente Principal ---
export const ZenPond: React.FC<ZenPondProps> = ({ collectedFrogs, children }) => {
  const [pondFrogs, setPondFrogs] = useState<PondFrog[]>([]);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const prevCollectedFrogsRef = useRef<FrogInput[]>([]);

  // Espelho do estado para uso fora de updaters (evita efeitos colaterais em StrictMode).
  const pondFrogsRef = useRef<PondFrog[]>([]);
  useEffect(() => { pondFrogsRef.current = pondFrogs; }, [pondFrogs]);
  // Sapos coletados que não couberam na lagoa (teto MAX_POND_FROGS) — esperam vaga.
  const overflowRef = useRef<FrogInput[]>([]);

  useEffect(() => {
    const prevIds = new Set(prevCollectedFrogsRef.current.map(f => f.id));
    const newFrogsFromProp = collectedFrogs.filter(f => !prevIds.has(f.id));
    prevCollectedFrogsRef.current = collectedFrogs;
    if (newFrogsFromProp.length === 0) return;

    const current = pondFrogsRef.current.filter(f => !f.merging);
    const ordered = diversityOrder([...overflowRef.current, ...newFrogsFromProp], current);
    const room = Math.max(0, MAX_POND_FROGS - current.length);
    overflowRef.current = ordered.slice(room);
    const frogsToAdd = ordered.slice(0, room).map(spawnFrog);
    if (frogsToAdd.length > 0) {
      setPondFrogs(prev => [...prev, ...frogsToAdd]);
    }
  }, [collectedFrogs]);

  useEffect(() => {
    const gameLoop = setInterval(() => {
      const now = Date.now();
      // Quem foi "engolido" no tick anterior já terminou a animação: sai de vez.
      const frogs = pondFrogs.filter(f => !f.merging);

      // 1. Lógica de Movimento com PERSONALIDADES
      const updatedFrogs = frogs.map(frog => {
        if (now >= frog.moveAt) {
          const personality = frogPersonalities[frog.speciesId] || frogPersonalities.DEFAULT;
          
          const potentialPosition = getSmartLeapPosition(frog, frogs, personality.jumpDistance, POND_BOUNDS);

          const isPathClear = !frogs.some(otherFrog => {
            if (frog.id === otherFrog.id) return false;
            // Só espécies DIFERENTES bloqueiam o pulo; da mesma espécie podem se aproximar (e fundir).
            if (otherFrog.speciesId === frog.speciesId) return false;
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
              frogA.scale = Math.min(frogA.scale * 1.1, 2.0); // Adiciona limite de crescimento
              frogB.merging = true;                            // desliza até o sobrevivente e some
              frogB.left = frogA.left;
              frogB.top = frogA.top;
              frogB.scale = 0.15;
              frogsToRemove.add(frogB.id);
            } else {
              const [larger, smaller] = frogA.scale > frogB.scale ? [frogA, frogB] : [frogB, frogA];
              larger.scale = Math.min(larger.scale * 1.02, 2.0);
              smaller.scale *= 0.98;
            }
          }
        }
      }
      
      // Os "engolidos" ficam mais um tick (animando até o sobrevivente) e saem no início do próximo.
      const finalFrogs = updatedFrogs.filter(f => f.merging || f.scale >= MIN_FROG_SCALE);

      // Abriu vaga (fusão)? Puxa da fila de espera, priorizando espécies que ainda não estão na lagoa.
      const active = finalFrogs.filter(f => !f.merging);
      let refill: PondFrog[] = [];
      if (active.length < MAX_POND_FROGS && overflowRef.current.length > 0) {
        const ordered = diversityOrder(overflowRef.current, active);
        const room = MAX_POND_FROGS - active.length;
        overflowRef.current = ordered.slice(room);
        refill = ordered.slice(0, room).map(spawnFrog);
      }

      setPondFrogs([...finalFrogs, ...refill]);

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
              animate={{ top: `${frog.top}%`, left: `${frog.left}%`, scale: frog.scale, opacity: frog.merging ? 0 : 1 }}
              transition={frog.merging ? { duration: 0.7, ease: 'easeIn' } : { duration: 2.5, type: 'spring' }}
              className={styles.frogWrapper}
            >
              <div className={styles.collisionBarrier} />
              <ZenFrog speciesId={frog.speciesId} stage="adult" top={frog.top} left={frog.left} />
            </motion.div>
          ))
        ) : (
          children
        )}
      </div>
    </div>
  );
};
