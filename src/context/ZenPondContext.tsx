import React, { createContext, useContext, useEffect, useRef, useState, ReactNode, useCallback } from 'react';
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
  /** Momento em que entrou na lagoa caindo (soltar do viveiro / sapo novo). */
  enteredAt?: number;
  /** Momento da última fusão em que este sapo absorveu outro (→ pulso). */
  pulseAt?: number;
}

export interface Ripple {
  id: number;
  top: string;
  left: string;
  /** anel dourado da fusão (ring-gold do jogo) */
  gold?: boolean;
  /** atraso até o pouso — a ondulação nasce quando o sapo toca a água */
  delayMs?: number;
}

/** Efeito de fusão: faíscas + texto flutuante "×N" no sapo que ficou. */
export interface MergeEffect {
  id: number;
  top: number;
  left: number;
  text: string;
}

// tempo até tocar a água (fração de pouso × duração, iguais ao jogo/ZenFrog)
const HOP_LAND_MS = Math.round(0.68 * 620);
const DROP_LAND_MS = Math.round(0.55 * 780);

const POND_BOUNDS = { top: 15, left: 15, right: 85, bottom: 85 };
const FROG_COLLISION_RADIUS = 7;
const FROG_INTERACTION_DISTANCE = 8;
export const MAX_POND_FROGS = 8;
const ATTRACTION_CHANCE = 0.7;
// Sapos de espécies diferentes "disputam" espaço e o menor encolhe um pouco,
// mas nunca abaixo disto. [CORREÇÃO] Antes o menor encolhia até 0.25 e era
// APAGADO da lagoa — a pessoa perdia um sapo que ganhou com foco.
const MIN_FROG_SCALE = 0.7;
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

const spawnFrog = (f: FrogInput, location: 'pond' | 'storage' = 'storage'): PondFrog => ({
  ...f,
  top: random(POND_BOUNDS.top, POND_BOUNDS.bottom),
  left: random(POND_BOUNDS.left, POND_BOUNDS.right),
  scale: 0.5,
  moveAt: Date.now() + random(5000, 10000),
  location,
  count: 1,
  enteredAt: location === 'pond' ? Date.now() : undefined,
});

interface ZenPondContextValue {
  pondFrogs: PondFrog[];
  storageFrogs: PondFrog[];
  ripples: Ripple[];
  effects: MergeEffect[];
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
const STATE_KEY = 'focusfrog_zenState';
const LEGACY_POND_KEY = 'focusfrog_zenPondFrogs';
const LEGACY_STORAGE_KEY = 'focusfrog_zenStorageFrogs';

interface ZenState {
  pond: PondFrog[];
  storage: PondFrog[];
  /** IDs de coleta que JÁ viraram sapo na lagoa/viveiro — persistido. É o que
   *  impede reinserir tudo de novo a cada vez que a tela monta. */
  ingested: string[];
}

const readJSON = <T,>(key: string, fallback: T): T => {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; }
};

/** Remove cópias com o mesmo id (dados corrompidos pela versão anterior):
 *  mantém a 1ª ocorrência, com a lagoa tendo prioridade sobre o viveiro. */
const dedupe = (pond: PondFrog[], storage: PondFrog[]) => {
  const seen = new Set<string>();
  const keep = (f: PondFrog) => { if (!f || !f.id || f.merging || seen.has(f.id)) return false; seen.add(f.id); return true; };
  const p = pond.filter(keep).map(f => ({ ...f, location: 'pond' as const }));
  const st = storage.filter(keep).map(f => ({ ...f, location: 'storage' as const }));
  return { pond: p, storage: st };
};

const loadInitialState = (collected: FrogInput[]): ZenState => {
  const saved = readJSON<ZenState | null>(STATE_KEY, null);
  if (saved && Array.isArray(saved.pond) && Array.isArray(saved.storage)) {
    return { ...dedupe(saved.pond, saved.storage), ingested: Array.isArray(saved.ingested) ? saved.ingested : [] };
  }
  // Migração da versão anterior (2 chaves separadas, sem lista de recebidos).
  const legacy = dedupe(readJSON<PondFrog[]>(LEGACY_POND_KEY, []), readJSON<PondFrog[]>(LEGACY_STORAGE_KEY, []));
  const hadFrogs = legacy.pond.length + legacy.storage.length > 0;
  return {
    ...legacy,
    // Se já havia sapos, a coleção atual já está representada (inclusive os
    // que se fundiram) — marca tudo como recebido pra não reinserir nada.
    ingested: hadFrogs ? collected.map(f => f.id) : [],
  };
};

/**
 * [REESCRITO] Lagoa, viveiro e a lista de "já recebidos" vivem num ÚNICO
 * estado salvo, e toda ação é UMA atualização atômica. A versão anterior
 * tinha três bugs reais, que causavam sapos sumindo e trocando de lugar:
 *  1. Reinserção a cada montagem: o controle de "sapos já recebidos" era
 *     só em memória e começava vazio — toda visita a Estatísticas inseria a
 *     coleção inteira de novo, com IDs repetidos.
 *  2. "Soltar" apagava o sapo: tirava do viveiro numa atualização aninhada
 *     dentro de outra; a de dentro só roda depois, então a checagem "achei o
 *     sapo?" sempre falhava — ele saía do viveiro e nunca entrava na lagoa.
 *  3. Corrida com a simulação: o tick gravava a lagoa a partir de uma foto
 *     antiga, podendo desfazer um guardar/soltar feito no mesmo instante.
 */
export const ZenPondProvider: React.FC<ZenPondProviderProps> = ({ collectedFrogs, children }) => {
  const [state, setState] = useState<ZenState>(() => loadInitialState(collectedFrogs));
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [effects, setEffects] = useState<MergeEffect[]>([]);
  const addRipples = useCallback((list: Ripple[]) => {
    if (!list.length) return;
    setRipples(r => [...r, ...list]);
    const ids = new Set(list.map(x => x.id));
    const longest = Math.max(...list.map(x => (x.delayMs || 0))) + 1900;
    setTimeout(() => setRipples(r => r.filter(x => !ids.has(x.id))), longest);
  }, []);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Persistência (uma chave só) + limpeza das chaves antigas.
  useEffect(() => {
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify(state));
      localStorage.removeItem(LEGACY_POND_KEY);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch { /* armazenamento cheio/indisponível — segue em memória */ }
  }, [state]);

  // Entrada de sapos novos: só IDs que ainda não estão na lista persistida.
  useEffect(() => {
    setState(prev => {
      const done = new Set(prev.ingested);
      const fresh = collectedFrogs.filter(f => !done.has(f.id));
      if (fresh.length === 0) return prev;
      const room = Math.max(0, MAX_POND_FROGS - prev.pond.filter(f => !f.merging).length);
      return {
        pond: [...prev.pond, ...fresh.slice(0, room).map(f => spawnFrog(f, 'pond'))],
        storage: [...prev.storage, ...fresh.slice(room).map(f => spawnFrog(f, 'storage'))],
        ingested: [...prev.ingested, ...fresh.map(f => f.id)],
      };
    });
  }, [collectedFrogs]);

  // Simulação (movimento + fusão). Calcula a partir do estado atual e só
  // aplica se ninguém mexeu nele no meio do caminho — senão pula este tick.
  useEffect(() => {
    const gameLoop = setInterval(() => {
      const snapshot = stateRef.current;
      const now = Date.now();
      const frogs = snapshot.pond.filter(f => !f.merging).map(f => ({ ...f }));
      const newRipples: Ripple[] = [];

      const updated = frogs.map(frog => {
        if (now < frog.moveAt) return frog;
        const personality = frogPersonalities[frog.speciesId] || frogPersonalities.DEFAULT;
        const target = getSmartLeapPosition(frog, frogs, personality.jumpDistance, POND_BOUNDS);
        const blocked = frogs.some(o => o.id !== frog.id && o.speciesId !== frog.speciesId && getDistance(target, o) < FROG_COLLISION_RADIUS);
        if (blocked) return { ...frog, moveAt: now + random(2000, 4000) };
        newRipples.push({ id: now + Math.random(), top: `${target.top}%`, left: `${target.left}%`, delayMs: HOP_LAND_MS });
        return { ...frog, ...target, moveAt: now + random(personality.moveInterval.min, personality.moveInterval.max) };
      });

      const absorbed = new Set<string>();
      const newEffects: MergeEffect[] = [];
      for (let i = 0; i < updated.length; i++) {
        for (let j = i + 1; j < updated.length; j++) {
          const a = updated[i], b = updated[j];
          if (absorbed.has(a.id) || absorbed.has(b.id)) continue;
          if (getDistance(a, b) >= FROG_INTERACTION_DISTANCE) continue;
          if (a.speciesId === b.speciesId) {
            const total = a.count + b.count;
            updated[i] = { ...a, scale: Math.min(a.scale * 1.1, 2.0), count: total, pulseAt: now };
            updated[j] = { ...b, merging: true, left: a.left, top: a.top, scale: 0.15 };
            absorbed.add(b.id);
            // efeitos chegam junto com o sapo absorvido (~560ms de deslize)
            newEffects.push({ id: now + Math.random(), top: a.top, left: a.left, text: `×${total}` });
            newRipples.push({ id: now + Math.random(), top: `${a.top}%`, left: `${a.left}%`, gold: true, delayMs: 560 });
          } else {
            const aBig = a.scale > b.scale;
            updated[i] = { ...a, scale: aBig ? Math.min(a.scale * 1.02, 2.0) : Math.max(a.scale * 0.98, MIN_FROG_SCALE) };
            updated[j] = { ...b, scale: aBig ? Math.max(b.scale * 0.98, MIN_FROG_SCALE) : Math.min(b.scale * 1.02, 2.0) };
          }
        }
      }
      const nextPond = updated; // ninguém some: só os absorvidos numa fusão saem no próximo tique

      let applied = false;
      setState(prev => {
        if (prev !== snapshot) return prev; // usuário mexeu no meio — pula
        applied = true;
        return { ...prev, pond: nextPond };
      });
      if (applied) {
        addRipples(newRipples);
        if (newEffects.length) {
          setTimeout(() => {
            setEffects(e => [...e, ...newEffects]);
            const ids = new Set(newEffects.map(x => x.id));
            setTimeout(() => setEffects(e => e.filter(x => !ids.has(x.id))), 1000);
          }, 560);
        }
      }
    }, SIMULATION_TICK_RATE);
    return () => clearInterval(gameLoop);
  }, [addRipples]);

  const sendToStorage = useCallback((frogId: string) => {
    setState(prev => {
      const frog = prev.pond.find(f => f.id === frogId && !f.merging);
      if (!frog) return prev;
      return {
        ...prev,
        pond: prev.pond.filter(f => f.id !== frogId),
        storage: [...prev.storage, { ...frog, location: 'storage' }],
      };
    });
  }, []);

  const releaseToPond = useCallback((frogId: string): boolean => {
    const cur = stateRef.current;
    const canRelease = cur.storage.some(f => f.id === frogId) && cur.pond.filter(f => !f.merging).length < MAX_POND_FROGS;
    if (!canRelease) return false;
    setState(prev => {
      const frog = prev.storage.find(f => f.id === frogId);
      if (!frog || prev.pond.filter(f => !f.merging).length >= MAX_POND_FROGS) return prev;
      const spot = { left: random(POND_BOUNDS.left, POND_BOUNDS.right), top: random(POND_BOUNDS.top, POND_BOUNDS.bottom) };
      return {
        ...prev,
        storage: prev.storage.filter(f => f.id !== frogId),
        pond: [...prev.pond, { ...frog, ...spot, location: 'pond', enteredAt: Date.now(), moveAt: Date.now() + random(2500, 6000) }],
      };
    });
    return true;
  }, []);

  // ondulação no pouso de quem entrou caindo (soltar do viveiro / sapo novo)
  const seenDrops = useRef(new Set<string>());
  useEffect(() => {
    const now = Date.now();
    const drops = state.pond.filter(f => f.enteredAt && now - f.enteredAt < 1500 && !seenDrops.current.has(f.id + f.enteredAt));
    if (!drops.length) return;
    drops.forEach(f => seenDrops.current.add(f.id + f.enteredAt));
    addRipples(drops.map(f => ({ id: now + Math.random(), top: `${f.top}%`, left: `${f.left}%`, delayMs: DROP_LAND_MS })));
  }, [state.pond, addRipples]);

  return (
    <ZenPondContext.Provider value={{ pondFrogs: state.pond, storageFrogs: state.storage, ripples, effects, maxPond: MAX_POND_FROGS, sendToStorage, releaseToPond }}>
      {children}
    </ZenPondContext.Provider>
  );
};
