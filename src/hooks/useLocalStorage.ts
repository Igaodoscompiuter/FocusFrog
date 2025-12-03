import { useState, Dispatch, SetStateAction } from 'react';

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

  // This function is a wrapped version of useState's setter.
  // It persists the new value to localStorage.
  const setValue: Dispatch<SetStateAction<T>> = (value) => {
    try {
      // Allow value to be a function so we have the same API as useState.
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      
      // Save the new state.
      setStoredValue(valueToStore);
      
      // Save to localStorage.
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      // A more advanced implementation could handle the error case,
      // e.g., if localStorage is full.
      console.error(`Error setting localStorage key “${key}”:`, error);
    }
  };

  return [storedValue, setValue];
}
