
import { useEffect, useRef } from 'react';
import { useBackHandler } from './useBackHandler';

/** Fecha ao tocar fora — e também no voltar do Android (`active`: só enquanto aberto). */
export const useClickOutside = (callback: () => void, active = true) => {
    const ref = useRef<HTMLDivElement>(null);
    useBackHandler(callback, active);

    useEffect(() => {
        if (!active) return;
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                callback();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [callback, active]);

    return ref;
};
