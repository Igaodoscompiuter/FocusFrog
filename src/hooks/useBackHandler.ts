import { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';

/**
 * Voltar do Android (botão ou gesto de arrastar da borda).
 *
 * O app troca de tela por estado (sem URLs), então o WebView não tem histórico
 * e, sem isto, "voltar" fechava o app de qualquer lugar. Agora existe uma
 * PILHA de "o que fechar": cada modal, folha ou sub-tela aberta empilha o seu
 * fechamento; o voltar fecha só o que está por cima.
 *
 * Ordem do voltar:
 *   1. o que estiver aberto por último (modal, folha, sub-tela)
 *   2. aba que não é a Home → volta pra Home
 *   3. na Home → minimiza o app (não fecha: o foco em andamento continua)
 */
type Handler = { fn: () => void };
const stack: Handler[] = [];

/** Empilha `handler` enquanto o componente estiver montado e `active` for true. */
export function useBackHandler(handler: () => void, active = true) {
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => {
    if (!active) return;
    const entry: Handler = { fn: () => ref.current() };
    stack.push(entry);
    return () => {
      const i = stack.lastIndexOf(entry);
      if (i >= 0) stack.splice(i, 1);
    };
  }, [active]);
}

/** Fecha o que está por cima. Retorna false se não havia nada aberto. */
export function runBackHandler(): boolean {
  const top = stack[stack.length - 1];
  if (!top) return false;
  top.fn();
  return true;
}

/**
 * Liga o voltar do Android ao app (chamar uma vez, no layout principal).
 * `fallback` cuida do passo 2; se retornar false, o app é minimizado.
 */
export function useAndroidBackButton(fallback: () => boolean) {
  const ref = useRef(fallback);
  ref.current = fallback;
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      // na versão web, Esc faz o papel do voltar (só fecha o que estiver aberto)
      const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && runBackHandler()) e.preventDefault(); };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }
    const sub = CapApp.addListener('backButton', () => {
      if (runBackHandler()) return;
      if (ref.current()) return;
      CapApp.minimizeApp().catch(() => {});
    });
    return () => { sub.then(s => s.remove()); };
  }, []);
}
