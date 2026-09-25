import { useState, useEffect, Dispatch, SetStateAction } from 'react';

/**
 * A custom hook for persisting state to localStorage.
 *
 * @param key The key to use for storing the value in localStorage.
 * @param initialValue The initial value to use if no value is found in localStorage.
 * @returns A stateful value, and a function to update it.
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  // State to store our value.
  // We use a lazy initializer with a function passed to useState,
  // so this logic is only executed once on the initial render.
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      // Get from local storage by key.
      const item = window.localStorage.getItem(key);
      // Parse stored JSON or if none, return initialValue.
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If there's an error (e.g., in private browsing), return initialValue.
      console.error(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  });

  // [CORREÇÃO] A implementação anterior calculava `value(storedValue)` na hora,
  // usando o `storedValue` do fechamento daquele render — não o estado mais
  // atual do React. Quando o mesmo setter era chamado várias vezes em sequência
  // no mesmo tick (ex.: um loop criando várias tarefas), cada chamada lia o
  // MESMO valor antigo e sobrescrevia a anterior: só a última sobrevivia.
  //
  // A correção é devolver o setter nativo do useState (`setStoredValue`)
  // diretamente — ele já implementa corretamente o encadeamento de
  // atualizações funcionais, igual a qualquer outro useState. Persistir no
  // localStorage vira um efeito colateral que reage à mudança real do
  // estado, depois que o React já resolveu todas as atualizações da leva.
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(storedValue));
      }
    } catch (error) {
      // A more advanced implementation could handle the error case,
      // e.g., if localStorage is full.
      console.error(`Error setting localStorage key “${key}”:`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
