import { Capacitor, registerPlugin } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import type { ChecklistItem } from './types';

// Mesma chave usada pelo ChecklistWidgetProvider.java no lado nativo.
const WIDGET_PREFS_KEY = 'leavingHomeItems';

/** Plugin nativo próprio (não vem de pacote npm) — só existe no Android. */
interface WidgetBridgePlugin {
  refreshChecklistWidget(): Promise<void>;
}
const WidgetBridge = registerPlugin<WidgetBridgePlugin>('WidgetBridge');

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
