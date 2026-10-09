import { Capacitor, registerPlugin } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import type { ChecklistItem } from './types';

// Mesma chave usada pelo ChecklistWidgetProvider.java no lado nativo.
const WIDGET_PREFS_KEY = 'leavingHomeItems';

/** Plugin nativo próprio (não vem de pacote npm) — só existe no Android. */
interface WidgetBridgePlugin {
  refreshChecklistWidget(): Promise<void>;
  refreshFrogWidget(): Promise<void>;
  requestPinWidget(opts?: { kind?: 'checklist' | 'frog' }): Promise<{ supported: boolean; requested?: boolean; reason?: string }>;
}
const WidgetBridge = registerPlugin<WidgetBridgePlugin>('WidgetBridge');

/**
 * Pede pro Android mostrar o diálogo nativo de "adicionar widget à tela
 * inicial" — sem precisar explicar o caminho manual pro usuário.
 * Devolve `supported: false` em launchers/versões do Android que não
 * suportam esse atalho, pra quem chamar decidir como orientar o usuário.
 */
export async function requestPinChecklistWidget(): Promise<{ supported: boolean; reason?: string }> {
  if (!Capacitor.isNativePlatform()) return { supported: false, reason: 'web' };
  try {
    return await WidgetBridge.requestPinWidget();
  } catch {
    return { supported: false, reason: 'error' };
  }
}

/**
 * Espelha o checklist "Já pegou?" pra um arquivo de SharedPreferences que o
 * widget de tela inicial consegue ler diretamente (o localStorage da WebView,
 * usado pelo resto do app, é invisível pro Android nativo). Chamar sempre que
 * `leavingHomeItems` mudar dentro do app.
 */
export async function syncChecklistToWidget(items: ChecklistItem[]) {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await Preferences.set({ key: WIDGET_PREFS_KEY, value: JSON.stringify(items) });
    await WidgetBridge.refreshChecklistWidget();
  } catch {
    // Sem widget adicionado ainda, ou falha pontual — não impacta o app em si.
  }
}

/**
 * Lê o checklist de volta do SharedPreferences nativo — usado quando o app
 * volta ao primeiro plano, pra pegar toques que aconteceram no widget
 * enquanto o app estava fechado/minimizado.
 */
export async function readChecklistFromWidget(): Promise<ChecklistItem[] | null> {
  if (!Capacitor.isNativePlatform()) return null;
  try {
    const { value } = await Preferences.get({ key: WIDGET_PREFS_KEY });
    if (!value) return null;
    return JSON.parse(value) as ChecklistItem[];
  } catch {
    return null;
  }
}

/** Estado do widget "Sapo do Dia" (lido pelo FrogWidgetProvider.java). */
export interface FrogWidgetState {
  state: 'active' | 'none' | 'done';
  title?: string;
  done?: number;
  total?: number;
  focusEndsAt?: number | null;
  date: string; // AAAA-MM-DD de hoje
}

let lastFrogWidget = '';
export async function syncFrogToWidget(st: FrogWidgetState) {
  if (!Capacitor.isNativePlatform()) return;
  const value = JSON.stringify(st);
  if (value === lastFrogWidget) return;
  lastFrogWidget = value;
  try {
    await Preferences.set({ key: 'frogWidget', value });
    await WidgetBridge.refreshFrogWidget();
  } catch {
    // sem widget na tela: nada a fazer
  }
}

/** Diálogo nativo de "adicionar widget" pro Sapo do Dia. */
export async function requestPinFrogWidget(): Promise<{ supported: boolean; reason?: string }> {
  if (!Capacitor.isNativePlatform()) return { supported: false, reason: 'web' };
  try { return await WidgetBridge.requestPinWidget({ kind: 'frog' }); }
  catch { return { supported: false, reason: 'error' }; }
}
