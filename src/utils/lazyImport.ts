/** Carrega um módulo sob demanda (no build original era o helper de preload do Vite). */
export const lazyImport = <T,>(load: () => Promise<T>, _deps?: unknown): Promise<T> => load();
