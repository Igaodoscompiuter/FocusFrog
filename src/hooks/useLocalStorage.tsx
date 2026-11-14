// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import * as React from "react";

export function useLocalStorage(e, t) {
  const [n, s] = React.useState(() => {
    if (typeof window > "u") return t;
    try {
      const r = window.localStorage.getItem(e);
      return r ? JSON.parse(r) : t;
    } catch (r) {
      return console.error(`Error reading localStorage key “${e}”:`, r), t;
    }
  });
  // O valor inicial acabou de ser lido do storage: não precisa regravar na montagem.
  const skipFirstWrite = React.useRef(true),
    lastKey = React.useRef(e);
  return (
    React.useEffect(() => {
      if (skipFirstWrite.current && lastKey.current === e) {
        skipFirstWrite.current = false;
        // Se a chave já existe, o estado veio dela: regravar seria só custo.
        // Se não existe, grava o padrão (comportamento original, usado pelo backup/sync).
        try {
          if (window.localStorage.getItem(e) !== null) return;
        } catch {}
      }
      lastKey.current = e;
      try {
        typeof window < "u" &&
          window.localStorage.setItem(e, JSON.stringify(n));
      } catch (r) {
        console.error(`Error setting localStorage key “${e}”:`, r);
      }
    }, [e, n]),
    [n, s]
  );
}
