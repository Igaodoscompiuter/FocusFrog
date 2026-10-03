import React, { createContext, useContext, useEffect, useRef, useState, ReactNode, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { frogPersonalities } from '../config/frogPersonalities';

export interface FrogInput {
  id: string;
  speciesId: string;
}

export interface PondFrog extends FrogInput {
  top: number;
  left: number;
  scale: number;
  moveAt: number;
  location: 'pond' | 'storage';
  count: number; // quantas vezes essa espécie já se fundiu nesta — mostrado como "×N" na carta
  merging?: boolean;
}

interface Ripple {
  id: number;
  top: string;
  left: string;
}

const POND_BOUNDS = { top: 15, left: 15, right: 85, bottom: 85 };
const FROG_COLLISION_RADIUS = 7;
const FROG_INTERACTION_DISTANCE = 8;
export const MAX_POND_FROGS = 8;
const ATTRACTION_CHANCE = 0.7;
const MIN_FROG_SCALE = 0.25;
const SIMULATION_TICK_RATE = 2000;

const random = (min: number, max: number) => Math.random() * (max - min) + min;
const getDistance = (a: { left: number; top: number }, b: { left: number; top: number }) =>
  Math.hypot(a.left - b.left, a.top - b.top);

const getNewLeapPosition = (pos: { left: number; top: number }, jumpDistance: { min: number; max: number }, bounds: typeof POND_BOUNDS) => {
  const angle = random(0, 2 * Math.PI);
  const distance = random(jumpDistance.min, jumpDistance.max) / 5;
  return {
    left: Math.max(bounds.left, Math.min(pos.left + Math.cos(angle) * distance, bounds.right)),
    top: Math.max(bounds.top, Math.min(pos.top + Math.sin(angle) * distance, bounds.bottom)),
  };
};

const getSmartLeapPosition = (frog: PondFrog, allFrogs: PondFrog[], jumpDistance: { min: number; max: number }, bounds: typeof POND_BOUNDS) => {
  if (Math.random() < ATTRACTION_CHANCE) {
    let partner: PondFrog | null = null, nearest = Infinity;
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

// Diversidade: primeiro espécies ainda não presentes, depois alterna — evita a lagoa virar só duplicatas.
const diversityOrder = (candidates: PondFrog[], present: { speciesId: string }[]): PondFrog[] => {
  const seen = new Set(present.map(f => f.speciesId));
  const bySpecies = new Map<string, PondFrog[]>();
  candidates.forEach(c => { const l = bySpecies.get(c.speciesId) ?? []; l.push(c); bySpecies.set(c.speciesId, l); });
  const result: PondFrog[] = [];
  bySpecies.forEach((list, speciesId) => { if (!seen.has(speciesId) && list.length > 0) result.push(list.shift()!); });
  let added = true;
  while (added) {
    added = false;
    bySpecies.forEach(list => { const next = list.shift(); if (next) { result.push(next); added = true; } });
  }
  return result;
};

const spawnFrog = (f: FrogInput, location: 'pond' | 'storage' = 'storage'): PondFrog => ({
  ...f,
  top: random(POND_BOUNDS.top, POND_BOUNDS.bottom),
  left: random(POND_BOUNDS.left, POND_BOUNDS.right),
  scale: 0.5,
  moveAt: Date.now() + random(5000, 10000),
  location,
  count: 1,
});

interface ZenPondContextValue {
  pondFrogs: PondFrog[];
  storageFrogs: PondFrog[];
  ripples: Ripple[];
  maxPond: number;
  sendToStorage: (frogId: string) => void;
  releaseToPond: (frogId: string) => boolean;
}

const ZenPondContext = createContext<ZenPondContextValue | null>(null);

export const useZenPond = () => {
  const ctx = useContext(ZenPondContext);
  if (!ctx) throw new Error('useZenPond precisa estar dentro de <ZenPondProvider>');
  return ctx;
};

interface ZenPondProviderProps {
  collectedFrogs: FrogInput[]; // log bruto de espécies coletadas (de UserContext)
  children: ReactNode;
}

/**
 * [NOVO] Antes, sapos que não cabiam na lagoa esperavam numa fila só em
 * memória (useRef) — se perdia ao fechar o app, e não existia NENHUMA tela
 * pro usuário ver ou mexer nesse "viveiro". Agora pondFrogs E storageFrogs
 * são persistidos de verdade, com ações manuais de guardar/soltar — é o
 * sistema completo do protótipo zen-lake-v3.html, não só a simulação.
 */
export const ZenPondProvider: React.FC<ZenPondProviderProps> = ({ collectedFrogs, children }) => {
  const [pondFrogs, setPondFrogs] = useLocalStorage<PondFrog[]>('focusfrog_zenPondFrogs', []);
  const [storageFrogs, setStorageFrogs] = useLocalStorage<PondFrog[]>('focusfrog_zenStorageFrogs', []);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  // [CORREÇÃO] Precisa começar VAZIO, não com collectedFrogs — senão o diff
  // da 1ª renderização já acha "tudo igual ao anterior" e nenhum sapo jamais
  // entra na lagoa (bug real, achado testando antes de gerar o APK).
  const prevCollectedFrogsRef = useRef<FrogInput[]>([]);

  const pondFrogsRef = useRef<PondFrog[]>(pondFrogs);
  useEffect(() => { pondFrogsRef.current = pondFrogs; }, [pondFrogs]);

  // Entrada de sapos novos (vindos de UserContext.collectedFrogs): cada
  // ENTRADA NOVA no log vira uma instância — se couber, pulso direto na
  // lagoa; senão, pro viveiro, esperando o usuário (ou uma fusão) abrir vaga.
  useEffect(() => {
    const prevIds = new Set(prevCollectedFrogsRef.current.map(f => f.id));
    const newOnes = collectedFrogs.filter(f => !prevIds.has(f.id));
    prevCollectedFrogsRef.current = collectedFrogs;
    if (newOnes.length === 0) return;

    const current = pondFrogsRef.current.filter(f => !f.merging);
    const room = Math.max(0, MAX_POND_FROGS - current.length);
    const toPond = newOnes.slice(0, room).map(f => spawnFrog(f, 'pond'));
    const toStorage = newOnes.slice(room).map(f => spawnFrog(f, 'storage'));
    if (toPond.length) setPondFrogs(prev => [...prev, ...toPond]);
    if (toStorage.length) setStorageFrogs(prev => [...prev, ...toStorage]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectedFrogs]);

  // Simulação: movimento + interação (fusão/disputa), igual antes.
  useEffect(() => {
    const gameLoop = setInterval(() => {
      const now = Date.now();
      const frogs = pondFrogs.filter(f => !f.merging);

      const updatedFrogs = frogs.map(frog => {
        if (now < frog.moveAt) return frog;
        const personality = frogPersonalities[frog.speciesId] || frogPersonalities.DEFAULT;
        const potentialPosition = getSmartLeapPosition(frog, frogs, personality.jumpDistance, POND_BOUNDS);
        const isPathClear = !frogs.some(other => {
          if (frog.id === other.id) return false;
          if (other.speciesId === frog.speciesId) return false;
          return getDistance(potentialPosition, other) < FROG_COLLISION_RADIUS;
        });
        if (isPathClear) {
          const newRipple: Ripple = { id: now + Math.random(), top: `${frog.top}%`, left: `${frog.left}%` };
          setRipples(prev => [...prev, newRipple]);
          setTimeout(() => setRipples(prev => prev.filter(r => r.id !== newRipple.id)), 1000);
          return { ...frog, ...potentialPosition, moveAt: now + random(personality.moveInterval.min, personality.moveInterval.max) };
        }
        return { ...frog, moveAt: now + random(2000, 4000) };
      });

      const toRemove = new Set<string>();
      for (let i = 0; i < updatedFrogs.length; i++) {
        for (let j = i + 1; j < updatedFrogs.length; j++) {
          const a = updatedFrogs[i], b = updatedFrogs[j];
          if (toRemove.has(a.id) || toRemove.has(b.id)) continue;
          if (getDistance(a, b) < FROG_INTERACTION_DISTANCE) {
            if (a.speciesId === b.speciesId) {
              a.scale = Math.min(a.scale * 1.1, 2.0);
              a.count += b.count;
              b.merging = true; b.left = a.left; b.top = a.top; b.scale = 0.15;
              toRemove.add(b.id);
            } else {
              const [larger, smaller] = a.scale > b.scale ? [a, b] : [b, a];
              larger.scale = Math.min(larger.scale * 1.02, 2.0);
              smaller.scale *= 0.98;
            }
          }
        }
      }

      const finalFrogs = updatedFrogs.filter(f => f.merging || f.scale >= MIN_FROG_SCALE);
      const active = finalFrogs.filter(f => !f.merging);
      let refill: PondFrog[] = [];
      if (active.length < MAX_POND_FROGS) {
        setStorageFrogs(prevStorage => {
          if (prevStorage.length === 0) return prevStorage;
          const ordered = diversityOrder(prevStorage, active);
          const room = MAX_POND_FROGS - active.length;
          const toRelease = ordered.slice(0, room);
          if (toRelease.length === 0) return prevStorage;
          refill = toRelease.map(f => ({ ...f, location: 'pond' as const, ...spawnFrog(f, 'pond'), id: f.id, count: f.count }));
          const releasedIds = new Set(toRelease.map(f => f.id));
          return prevStorage.filter(f => !releasedIds.has(f.id));
        });
      }

      setPondFrogs([...finalFrogs, ...refill]);
    }, SIMULATION_TICK_RATE);

    return () => clearInterval(gameLoop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pondFrogs]);

  const sendToStorage = useCallback((frogId: string) => {
    setPondFrogs(prev => {
      const frog = prev.find(f => f.id === frogId);
      if (!frog) return prev;
      setStorageFrogs(s => [...s, { ...frog, location: 'storage' }]);
      return prev.filter(f => f.id !== frogId);
    });
  }, [setPondFrogs, setStorageFrogs]);

  const releaseToPond = useCallback((frogId: string): boolean => {
    let released = false;
    setPondFrogs(prevPond => {
      if (prevPond.filter(f => !f.merging).length >= MAX_POND_FROGS) return prevPond;
      let movedFrog: PondFrog | null = null;
      setStorageFrogs(prevStorage => {
        const frog = prevStorage.find(f => f.id === frogId);
        if (!frog) return prevStorage;
        movedFrog = frog;
        return prevStorage.filter(f => f.id !== frogId);
      });
      if (!movedFrog) return prevPond;
      released = true;
      const spot = { left: random(POND_BOUNDS.left, POND_BOUNDS.right), top: random(POND_BOUNDS.top, POND_BOUNDS.bottom) };
      return [...prevPond, { ...(movedFrog as PondFrog), location: 'pond', ...spot, moveAt: Date.now() + random(2500, 6000) }];
    });
    return released;
  }, [setPondFrogs, setStorageFrogs]);

  return (
    <ZenPondContext.Provider value={{ pondFrogs, storageFrogs, ripples, maxPond: MAX_POND_FROGS, sendToStorage, releaseToPond }}>
      {children}
    </ZenPondContext.Provider>
  );
};
