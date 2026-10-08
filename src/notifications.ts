import { Capacitor, registerPlugin } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { postMessageToSW } from './sw-helpers';

// IDs fixos (um por "slot") — agendar de novo com o mesmo ID substitui a anterior,
// em vez de empilhar notificações repetidas.
const NOTIF_ID_PHASE_END = 9001;   // "Hora da pausa" / "De volta ao foco"

/** Serviço em primeiro plano próprio (PomodoroForegroundService.java) — não usa
 *  mais plugin de terceiros, porque precisava de cronômetro nativo ao vivo
 *  (setUsesChronometer) e de garantia real de não-descartável (setOngoing),
 *  que o plugin anterior não entregava de forma confiável. */
interface WidgetBridgePluginIface {
  startFocusService(opts: { title: string; body: string; endsAt: number; phase: 'focus' | 'break' }): Promise<void>;
  getFocusDistraction(): Promise<{ distractedMs: number }>;
  resetFocusDistraction(): Promise<void>;
  setDistractionGuard(opts: { enabled: boolean }): Promise<void>;
  stopFocusService(): Promise<void>;
  checkExactAlarmPermission(): Promise<{ granted: boolean }>;
  openExactAlarmSettings(): Promise<void>;
}
const NativeBridge = registerPlugin<WidgetBridgePluginIface>('WidgetBridge');

let exactAlarmChecked = false;

/**
 * [CORREÇÃO] No Android 12+, declarar SCHEDULE_EXACT_ALARM no manifesto (já
 * fazíamos) NÃO basta — o usuário precisa ligar isso manualmente numa tela
 * própria do sistema. Sem isso, alarmes de rotina e os avisos de fim de
 * foco/pausa podem simplesmente não disparar, sem nenhum erro visível. Checa
 * uma vez por sessão e, se não estiver concedida, abre essa tela direto —
 * só chamada quando o recurso é realmente usado (não no app inteiro à toa).
 */
async function ensureExactAlarmPermission() {
    if (!Capacitor.isNativePlatform() || exactAlarmChecked) return;
    exactAlarmChecked = true;
    try {
        const { granted } = await NativeBridge.checkExactAlarmPermission();
        if (!granted) {
            await NativeBridge.openExactAlarmSettings();
        }
    } catch {
        // Plugin indisponível (ex.: Android antigo) — segue sem bloquear nada.
    }
}

let permissionChecked = false;

async function ensureNativePermission() {
    if (!Capacitor.isNativePlatform() || permissionChecked) return;
    permissionChecked = true;
    try {
        const { display } = await LocalNotifications.checkPermissions();
        if (display !== 'granted') {
            await LocalNotifications.requestPermissions();
        }
    } catch {
        // Se o usuário negar, as notificações simplesmente não aparecem —
        // o timer na tela continua funcionando normalmente.
    }
}

/**
 * Agenda o aviso de troca de fase (fim do foco / fim da pausa).
 * No app nativo usa o AlarmManager de verdade (sobrevive ao app fechado);
 * no PWA mantém o comportamento antigo via Service Worker.
 */
export async function schedulePhaseEndNotification(title: string, body: string, atTimestamp: number) {
    if (Capacitor.isNativePlatform()) {
        await ensureNativePermission();
        await ensureExactAlarmPermission();
        try {
            await LocalNotifications.schedule({
                notifications: [{
                    id: NOTIF_ID_PHASE_END,
                    title,
                    body,
                    schedule: { at: new Date(atTimestamp), allowWhileIdle: true },
                }],
            });
        } catch (e) {
            console.warn('[notifications] falha ao agendar aviso de fase:', e);
        }
    } else {
        postMessageToSW({ type: 'SCHEDULE_NOTIFICATION', payload: { title, body, timestamp: atTimestamp } });
    }
}

/**
 * Sobe (ou atualiza) o SERVIÇO EM PRIMEIRO PLANO de verdade enquanto uma sessão
 * de foco/pausa está ativa — não é só uma notificação "ongoing": isso sobe a
 * prioridade do processo pro Android, reduzindo bastante a chance do app ser
 * morto em segundo plano (igual um player de música faz).
 */
let foregroundServiceRunning = false;

/** Inicia (ou atualiza, chamando de novo com o mesmo ID) o serviço em primeiro
 *  plano com cronômetro nativo ao vivo contando até endsAt. */
export async function startOrUpdateFocusForegroundService(taskTitle: string, phase: 'focus' | 'break', endsAt: number) {
    if (!Capacitor.isNativePlatform()) return;
    await ensureNativePermission();
    const title = phase === 'focus' ? `🐸 Em foco: ${taskTitle}` : '☕ Pausa';
    const body = phase === 'focus' ? 'Toque para voltar ao app' : 'Hora de respirar um pouco';
    try {
        await NativeBridge.startFocusService({ title, body, endsAt, phase });
        foregroundServiceRunning = true;
    } catch (e) {
        console.warn('[notifications] falha ao iniciar serviço em primeiro plano:', e);
    }
}

/** Encerra o serviço em primeiro plano (sessão pausada/concluída/cancelada). */
export async function stopFocusForegroundService() {
    if (!Capacitor.isNativePlatform() || !foregroundServiceRunning) return;
    try {
        await NativeBridge.stopFocusService();
    } catch { /* nada a fazer */ }
    foregroundServiceRunning = false;
}

// [CORREÇÃO] "Foco concluído" tem número PRÓPRIO. Antes usava o 9001 (o mesmo
// da troca de fase) e o encerramento da sessão cancelava o 9001 na linha
// seguinte — o aviso nascia e era apagado no mesmo instante.
const NOTIF_ID_SESSION_DONE = 9004;

/** Agenda (já no início do último bloco) o aviso de conclusão da sessão —
 *  dispara pelo AlarmManager mesmo com o app congelado/fechado. */
export async function scheduleSessionDoneNotification(title: string, body: string, atTimestamp: number) {
    if (Capacitor.isNativePlatform()) {
        await ensureNativePermission();
        await ensureExactAlarmPermission();
        try {
            await LocalNotifications.schedule({
                notifications: [{ id: NOTIF_ID_SESSION_DONE, title, body, schedule: { at: new Date(atTimestamp), allowWhileIdle: true } }],
            });
        } catch (e) {
            console.warn('[notifications] falha ao agendar aviso de conclusão:', e);
        }
    } else {
        postMessageToSW({ type: 'SCHEDULE_NOTIFICATION', payload: { title, body, timestamp: atTimestamp } });
    }
}

/** Interrompeu (parar/pausar): cancela os dois avisos e o serviço. */
export async function cancelPomodoroNotifications() {
    if (Capacitor.isNativePlatform()) {
        try {
            await LocalNotifications.cancel({ notifications: [{ id: NOTIF_ID_PHASE_END }, { id: NOTIF_ID_SESSION_DONE }] });
        } catch { /* nada a fazer */ }
        await stopFocusForegroundService();
    } else {
        postMessageToSW({ type: 'CANCEL_NOTIFICATION' });
    }
}

/** Terminou naturalmente: encerra o serviço mas PRESERVA o "Foco concluído"
 *  (que já foi agendado pro horário exato do fim). */
export async function finishPomodoroNotifications() {
    if (Capacitor.isNativePlatform()) {
        try { await LocalNotifications.cancel({ notifications: [{ id: NOTIF_ID_PHASE_END }] }); } catch { /* nada */ }
        await stopFocusForegroundService();
    }
}

// =============================================
// Lembrete do Sapo do Dia — "não deixa ele de lado"
// =============================================
const FROG_REMINDER_ID = 9003;

/**
 * Agenda um lembrete pro Sapo do Dia caso ele ainda não tenha sido feito depois
 * de um tempo. Chamar de novo (ex.: toda vez que frogTaskId muda) substitui o
 * lembrete anterior pelo novo horário — e chamar cancelFrogReminder() quando a
 * tarefa for concluída ou o Sapo do Dia for trocado remove o aviso obsoleto.
 */
export async function scheduleFrogReminder(taskTitle: string, delayMs: number) {
    if (!Capacitor.isNativePlatform()) return;
    await ensureNativePermission();
    try {
        await LocalNotifications.schedule({
            notifications: [{
                id: FROG_REMINDER_ID,
                title: '🐸 Seu Sapo do Dia ainda espera...',
                body: `"${taskTitle}" continua pendente. Que tal um foco rápido agora?`,
                schedule: { at: new Date(Date.now() + delayMs), allowWhileIdle: true },
            }],
        });
    } catch (e) {
        console.warn('[notifications] falha ao agendar lembrete do Sapo do Dia:', e);
    }
}

export async function cancelFrogReminder() {
    if (!Capacitor.isNativePlatform()) return;
    try {
        await LocalNotifications.cancel({ notifications: [{ id: FROG_REMINDER_ID }] });
    } catch { /* nada a fazer */ }
}

// =============================================
// Rotinas com horário programado
// =============================================
// Faixa de IDs reservada pra notificações de rotina, separada da faixa do
// Pomodoro (9001/9002) pra nunca colidir e sobrescrever uma a outra.
const ROUTINE_NOTIF_ID_BASE = 10000;

function routineNotifId(routineId: string): number {
    // Hash simples e estável — o mesmo id de rotina sempre vira o mesmo número,
    // então reagendar substitui a notificação antiga em vez de duplicar.
    let hash = 0;
    for (let i = 0; i < routineId.length; i++) {
        hash = (hash * 31 + routineId.charCodeAt(i)) >>> 0;
    }
    return ROUTINE_NOTIF_ID_BASE + (hash % 5000);
}

interface ScheduledRoutine {
    id: string;
    name: string;
    scheduledTime?: string; // "HH:MM"
    alarmMode?: 'normal' | 'alarm';
}

const ALARM_CHANNEL_ID = 'routine-alarm';
let alarmChannelReady = false;

/** Canal de notificação de prioridade máxima — só precisa ser criado uma vez. */
async function ensureAlarmChannel() {
    if (!Capacitor.isNativePlatform() || alarmChannelReady) return;
    alarmChannelReady = true;
    try {
        await LocalNotifications.createChannel({
            id: ALARM_CHANNEL_ID,
            name: 'Rotinas com alarme',
            description: 'Notificações de rotina marcadas como "não posso perder" — tocam mais forte.',
            importance: 5, // máxima: aparece por cima de outros apps, com som
            visibility: 1, // aparece na tela de bloqueio
            vibration: true,
            lights: true,
            lightColor: '#FBBF24',
        });
    } catch (e) {
        console.warn('[notifications] falha ao criar canal de alarme:', e);
    }
}

/**
 * Agenda (ou cancela) uma notificação diária por rotina que tenha scheduledTime
 * definido — ex.: a rotina da manhã dispara convidando o usuário a começá-la.
 * Chamar de novo com a lista completa de rotinas sempre que algo mudar: quem
 * não tem mais horário, ou foi excluído, tem a notificação cancelada aqui.
 */
export async function syncRoutineNotifications(routines: ScheduledRoutine[]) {
    if (!Capacitor.isNativePlatform()) return; // notificação diária repetida é só nativa
    if (!routines.some(r => r.scheduledTime)) return; // nada agendado, não precisa checar nada ainda
    await ensureNativePermission();
    await ensureExactAlarmPermission();
    await ensureAlarmChannel();

    const withTime = routines.filter(r => r.scheduledTime);
    const idsToKeep = new Set(withTime.map(r => routineNotifId(r.id)));

    try {
        const pending = await LocalNotifications.getPending();
        const toCancel = pending.notifications
            .filter(n => n.id >= ROUTINE_NOTIF_ID_BASE && n.id < ROUTINE_NOTIF_ID_BASE + 5000 && !idsToKeep.has(n.id))
            .map(n => ({ id: n.id }));
        if (toCancel.length) await LocalNotifications.cancel({ notifications: toCancel });

        if (withTime.length) {
            await LocalNotifications.schedule({
                notifications: withTime.map(r => {
                    const [hour, minute] = r.scheduledTime!.split(':').map(Number);
                    const isAlarm = r.alarmMode === 'alarm';
                    return {
                        id: routineNotifId(r.id),
                        title: isAlarm ? `⏰ ${r.name}` : `🐸 Hora da rotina: ${r.name}`,
                        body: isAlarm ? 'Sua rotina programada começa agora.' : 'Toque para começar assim que estiver pronto.',
                        schedule: { on: { hour, minute }, allowWhileIdle: true },
                        channelId: isAlarm ? ALARM_CHANNEL_ID : undefined,
                        extra: { routineId: r.id },
                    };
                }),
            });
        }
    } catch (e) {
        console.warn('[notifications] falha ao sincronizar notificações de rotina:', e);
    }
}

// =============================================
// Foco limpo: distração medida no lado nativo (FocusDistractionMonitor)
// =============================================
/** Tempo (ms) com a tela ligada em OUTRO app durante o foco desta sessão.
 *  No PWA/web não há como distinguir tela desligada de outro app → 0. */
export async function getFocusDistractionMs(): Promise<number> {
    // fora do APK não há medição; valor simulado só pra testes (dev)
    if (!Capacitor.isNativePlatform()) return Number(localStorage.getItem('focusfrog_dev_distraction_ms') || 0);
    try { return (await NativeBridge.getFocusDistraction()).distractedMs || 0; } catch { return 0; }
}

export async function resetFocusDistraction() {
    if (!Capacitor.isNativePlatform()) return;
    try { await NativeBridge.resetFocusDistraction(); } catch { /* nada */ }
}

/** Configurações → "Proteger o foco" (padrão: ligado). Desligado = sem
 *  cutucada e sapo garantido — pra quem faz a tarefa usando o celular. */
export const DISTRACTION_GUARD_KEY = 'focusfrog_distraction_guard';
export const isDistractionGuardOn = () => localStorage.getItem(DISTRACTION_GUARD_KEY) !== 'false';
export async function setDistractionGuard(enabled: boolean) {
    localStorage.setItem(DISTRACTION_GUARD_KEY, String(enabled));
    if (!Capacitor.isNativePlatform()) return;
    try { await NativeBridge.setDistractionGuard({ enabled }); } catch { /* nada */ }
}
