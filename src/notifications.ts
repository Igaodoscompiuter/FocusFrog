import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { ForegroundService } from '@capawesome-team/capacitor-android-foreground-service';
import { postMessageToSW } from './sw-helpers';

// IDs fixos (um por "slot") — agendar de novo com o mesmo ID substitui a anterior,
// em vez de empilhar notificações repetidas.
const NOTIF_ID_PHASE_END = 9001;   // "Sua pausa começou" / "De volta ao foco"
const FOREGROUND_NOTIF_ID = 9002;  // notificação fixa do serviço em primeiro plano

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

export async function startOrUpdateFocusForegroundService(taskTitle: string, phase: 'focus' | 'break', endsAt: number) {
    if (!Capacitor.isNativePlatform()) return;
    await ensureNativePermission();
    const endTime = new Date(endsAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const title = phase === 'focus' ? `🐸 Em foco: ${taskTitle}` : '☕ Pausa';
    const body = phase === 'focus' ? `Termina às ${endTime}` : `Volta ao foco às ${endTime}`;
    try {
        const options = { id: FOREGROUND_NOTIF_ID, title, body, smallIcon: 'ic_stat_frog', silent: true };
        if (foregroundServiceRunning) {
            await ForegroundService.updateForegroundService(options);
        } else {
            await ForegroundService.startForegroundService(options);
            foregroundServiceRunning = true;
        }
    } catch (e) {
        console.warn('[notifications] falha ao iniciar serviço em primeiro plano:', e);
    }
}

/** Encerra o serviço em primeiro plano (sessão pausada/concluída/cancelada). */
export async function stopFocusForegroundService() {
    if (!Capacitor.isNativePlatform() || !foregroundServiceRunning) return;
    try {
        await ForegroundService.stopForegroundService();
    } catch { /* nada a fazer */ }
    foregroundServiceRunning = false;
}

/** Cancela o aviso de troca de fase e encerra o serviço em primeiro plano. */
export async function cancelPomodoroNotifications() {
    if (Capacitor.isNativePlatform()) {
        try {
            await LocalNotifications.cancel({ notifications: [{ id: NOTIF_ID_PHASE_END }] });
        } catch { /* nada a fazer */ }
        await stopFocusForegroundService();
    } else {
        postMessageToSW({ type: 'CANCEL_NOTIFICATION' });
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
    await ensureNativePermission();
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
