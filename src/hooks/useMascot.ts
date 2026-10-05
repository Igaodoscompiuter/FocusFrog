import { useCallback, useEffect, useState } from 'react';

/** Sapo mascote escolhido pelo usuário (na carta de um sapo). */
export interface Mascot {
  speciesId: string;
  name: string;
  /** instância específica da lagoa/viveiro; ausente se escolhido pelo Álbum */
  frogId?: string;
}

export const MASCOT_KEY = 'focusfrog_mascot';
const EVENT = 'focusfrog:mascot-changed';

const read = (): Mascot | null => {
  try { const raw = localStorage.getItem(MASCOT_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
};

/**
 * Mascote compartilhado entre todas as telas abertas ao mesmo tempo (carta,
 * lagoa, cronômetro): ao mudar em uma, as outras atualizam na hora — com o
 * useLocalStorage comum cada componente tinha sua própria cópia e só via a
 * mudança depois de remontar.
 */
export const useMascot = (): [Mascot | null, (m: Mascot | null) => void] => {
  const [mascot, setLocal] = useState<Mascot | null>(read);
  useEffect(() => {
    const sync = () => setLocal(read());
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);
  const setMascot = useCallback((m: Mascot | null) => {
    if (m) localStorage.setItem(MASCOT_KEY, JSON.stringify(m)); else localStorage.removeItem(MASCOT_KEY);
    window.dispatchEvent(new Event(EVENT));
  }, []);
  return [mascot, setMascot];
};
