import * as React from "react";

export function shallowEqual(a: Record<string, unknown>, b: Record<string, unknown>): boolean {
  if (a === b) return true;
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  for (const k of ka) {
    if (!Object.prototype.hasOwnProperty.call(b, k) || !Object.is(a[k], b[k])) return false;
  }
  return true;
}

/**
 * Devolve o mesmo objeto enquanto todos os campos forem iguais (comparação rasa).
 * Usado no `value` dos providers: sem isso, cada render do provider cria um
 * objeto novo e força todos os consumidores do context a re-renderizar.
 */
export function useShallowStable<T extends Record<string, unknown>>(next: T): T {
  const ref = React.useRef(next);
  if (ref.current !== next && !shallowEqual(ref.current, next)) {
    ref.current = next;
  }
  return ref.current;
}
