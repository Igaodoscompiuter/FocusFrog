import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { postMessageToSW } from './sw-helpers';

// IDs fixos (um por "slot") — agendar de novo com o mesmo ID substitui a anterior,
// em vez de empilhar notificações repetidas.
const NOTIF_ID_PHASE_END = 9001;   // "Sua pausa começou" / "De volta ao foco"
const NOTIF_ID_ONGOING = 9002;    // notificação fixa, tipo Spotify, enquanto o foco roda

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

/** Mostra/atualiza a notificação fixa e não-removível enquanto uma sessão está ativa. */
export async function showOngoingSessionNotification(taskTitle: string, phase: 'focus' | 'break', endsAt: number) {
    if (!Capacitor.isNativePlatform()) return; // só faz sentido com notificação persistente nativa
    await ensureNativePermission();
    const endTime = new Date(endsAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const title = phase === 'focus' ? `🐸 Em foco: ${taskTitle}` : '☕ Pausa';
    const body = phase === 'focus' ? `Termina às ${endTime}` : `Volta ao foco às ${endTime}`;
    try {
        await LocalNotifications.schedule({
            notifications: [{
                id: NOTIF_ID_ONGOING,
                title,
                body,
                ongoing: true,
                autoCancel: false,
                schedule: { at: new Date(Date.now() + 500) }, // "agora" — dispara quase de imediato
            }],
        });
    } catch (e) {
        console.warn('[notifications] falha ao exibir notificação contínua:', e);
    }
}

/** Cancela tanto o aviso de troca de fase quanto a notificação contínua. */
export async function cancelPomodoroNotifications() {
    if (Capacitor.isNativePlatform()) {
        try {
            await LocalNotifications.cancel({ notifications: [{ id: NOTIF_ID_PHASE_END }, { id: NOTIF_ID_ONGOING }] });
        } catch { /* nada a fazer */ }
    } else {
        postMessageToSW({ type: 'CANCEL_NOTIFICATION' });
    }
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
                    return {
                        id: routineNotifId(r.id),
                        title: `🐸 Hora da rotina: ${r.name}`,
                        body: 'Toque para começar assim que estiver pronto.',
                        schedule: { on: { hour, minute }, allowWhileIdle: true },
                        extra: { routineId: r.id },
                    };
                }),
            });
        }
    } catch (e) {
        console.warn('[notifications] falha ao sincronizar notificações de rotina:', e);
    }
}
