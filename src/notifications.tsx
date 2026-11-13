// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import { Capacitor, registerPlugin } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { LocalNotifications } from '@capacitor/local-notifications';

function Yy(e) {
  "serviceWorker" in navigator && navigator.serviceWorker.controller ? navigator.serviceWorker.controller.postMessage(e) : console.warn("Não foi possível enviar a mensagem para o Service Worker. Controller não encontrado.");
}

const Zy = 9001;

const Bo = registerPlugin("WidgetBridge");

let Z_ = false;

async function hh() {
  if (!Capacitor.isNativePlatform() || Z_) return false;
  Z_ = true;
  try {
    const {
      granted: e
    } = await Bo.checkExactAlarmPermission();
    if (!e) return await Bo.openExactAlarmSettings(), true;
  } catch {}
  return false;
}

function lO(e) {
  return new Promise(t => {
    let n = false,
      s = false;
    const r = () => {
        s || (s = true, o.then(a => a.remove()).catch(() => {}), t());
      },
      o = CapApp.addListener("appStateChange", ({
        isActive: a
      }) => {
        a ? n && r() : n = true;
      });
    setTimeout(r, e);
  });
}

let vS = false;

export const _S = () => !Capacitor.isNativePlatform() || vS;

export async function cO() {
  _S() || (vS = true, await _c(), (await hh()) && (await lO(9e4)));
}

let Q_ = false;

async function _c() {
  if (!(!Capacitor.isNativePlatform() || Q_)) {
    Q_ = true;
    try {
      const {
        display: e
      } = await LocalNotifications.checkPermissions();
      e !== "granted" && (await LocalNotifications.requestPermissions());
    } catch {}
  }
}

export async function X_(e, t, n) {
  if (Capacitor.isNativePlatform()) {
    await _c(), await hh();
    try {
      await LocalNotifications.schedule({
        notifications: [{
          id: Zy,
          title: e,
          body: t,
          schedule: {
            at: new Date(n),
            allowWhileIdle: true
          },
          extra: {
            go: "focus"
          }
        }]
      });
    } catch (s) {
      console.warn("[notifications] falha ao agendar aviso de fase:", s);
    }
  } else Yy({
    type: "SCHEDULE_NOTIFICATION",
    payload: {
      title: e,
      body: t,
      timestamp: n
    }
  });
}

let jm = false;

export async function $i(e, t, n) {
  if (!Capacitor.isNativePlatform()) return;
  await _c();
  const s = t === "focus" ? `🐸 Em foco: ${e}` : "☕ Pausa",
    r = t === "focus" ? "Toque para voltar ao app" : "Hora de respirar um pouco";
  try {
    await Bo.startFocusService({
      title: s,
      body: r,
      endsAt: n,
      phase: t
    }), jm = true;
  } catch (o) {
    console.warn("[notifications] falha ao iniciar serviço em primeiro plano:", o);
  }
}

async function xS() {
  if (!(!Capacitor.isNativePlatform() || !jm)) {
    try {
      await Bo.stopFocusService();
    } catch {}
    jm = false;
  }
}

const wS = 9004;

export async function uO(e, t, n) {
  if (Capacitor.isNativePlatform()) {
    await _c(), await hh();
    try {
      await LocalNotifications.schedule({
        notifications: [{
          id: wS,
          title: e,
          body: t,
          schedule: {
            at: new Date(n),
            allowWhileIdle: true
          },
          extra: {
            go: "focus"
          }
        }]
      });
    } catch (s) {
      console.warn("[notifications] falha ao agendar aviso de conclusão:", s);
    }
  } else Yy({
    type: "SCHEDULE_NOTIFICATION",
    payload: {
      title: e,
      body: t,
      timestamp: n
    }
  });
}

export async function e1() {
  if (Capacitor.isNativePlatform()) {
    try {
      await LocalNotifications.cancel({
        notifications: [{
          id: Zy
        }, {
          id: wS
        }]
      });
    } catch {}
    await xS();
  } else Yy({
    type: "CANCEL_NOTIFICATION"
  });
}

export async function dO() {
  if (Capacitor.isNativePlatform()) {
    try {
      await LocalNotifications.cancel({
        notifications: [{
          id: Zy
        }]
      });
    } catch {}
    await xS();
  }
}

const hO = 9003;

export async function fO() {
  if (Capacitor.isNativePlatform()) try {
    await LocalNotifications.cancel({
      notifications: [{
        id: hO
      }]
    });
  } catch {}
}

const ri = 1e4;

function Jl(e) {
  let t = 0;
  for (let n = 0; n < e.length; n++) t = t * 31 + e.charCodeAt(n) >>> 0;
  return ri + t % 5e3;
}

const Qy = 4e4;

const pO = Qy + 5e3 * 7;

function bS(e, t) {
  return Qy + (Jl(e) - ri) * 7 + t;
}

const mO = e => {
  const t = [...new Set((e || []).filter(n => n >= 0 && n <= 6))];
  return t.length === 0 || t.length === 7 ? null : t;
};

const kS = "routine-alarm";

const Xy = "ff-routine";

const gO = "start";

export const SS = "snooze";

let t1 = false;

async function jS() {
  if (!(!Capacitor.isNativePlatform() || t1)) {
    t1 = true;
    try {
      await LocalNotifications.registerActionTypes({
        types: [{
          id: Xy,
          actions: [{
            id: gO,
            title: "Começar agora",
            foreground: true
          }, {
            id: SS,
            title: "Adiar 10 min",
            foreground: true
          }]
        }]
      });
    } catch (e) {
      console.warn("[notifications] falha ao registrar botões da rotina:", e);
    }
  }
}

const CS = 16e3;

export async function yO(e, t, n = 10) {
  if (Capacitor.isNativePlatform()) {
    await jS();
    try {
      await LocalNotifications.schedule({
        notifications: [{
          id: CS + (Jl(e) - ri),
          title: `🐸 Lembrete: ${t}`,
          body: "Você pediu pra lembrar de novo. Toque pra começar.",
          schedule: {
            at: new Date(Date.now() + n * 60 * 1e3),
            allowWhileIdle: true
          },
          actionTypeId: Xy,
          extra: {
            routineId: e
          }
        }]
      });
    } catch (s) {
      console.warn("[notifications] falha ao adiar rotina:", s);
    }
  }
}

export async function n1(e) {
  if (Capacitor.isNativePlatform()) try {
    const {
        notifications: t
      } = await LocalNotifications.getDeliveredNotifications(),
      n = new Set([Jl(e), CS + (Jl(e) - ri), ...[0, 1, 2, 3, 4, 5, 6].map(r => bS(e, r))]),
      s = t.filter(r => n.has(r.id));
    s.length && (await LocalNotifications.removeDeliveredNotifications({
      notifications: s
    }));
  } catch {}
}

let s1 = false;

async function vO() {
  if (!(!Capacitor.isNativePlatform() || s1)) {
    s1 = true;
    try {
      await LocalNotifications.createChannel({
        id: kS,
        name: "Rotinas com alarme",
        description: 'Notificações de rotina marcadas como "não posso perder" — tocam mais forte.',
        importance: 5,
        visibility: 1,
        vibration: true,
        lights: true,
        lightColor: "#FBBF24"
      });
    } catch (e) {
      console.warn("[notifications] falha ao criar canal de alarme:", e);
    }
  }
}

export async function _O(e) {
  if (!Capacitor.isNativePlatform() || !e.some(o => o.scheduledTime)) return;
  await _c(), await hh(), await vO(), await jS();
  const n = e.filter(o => o.scheduledTime).flatMap(o => {
      const a = mO(o.days);
      return a ? a.map(l => ({
        r: o,
        id: bS(o.id, l),
        weekday: l + 1
      })) : [{
        r: o,
        id: Jl(o.id),
        weekday: undefined
      }];
    }),
    s = new Set(n.map(o => o.id)),
    r = o => o >= ri && o < ri + 5e3 || o >= Qy && o < pO;
  try {
    const a = (await LocalNotifications.getPending()).notifications.filter(l => r(l.id) && !s.has(l.id)).map(l => ({
      id: l.id
    }));
    a.length && (await LocalNotifications.cancel({
      notifications: a
    })), n.length && (await LocalNotifications.schedule({
      notifications: n.map(({
        r: l,
        id: c,
        weekday: u
      }) => {
        const [d, f] = l.scheduledTime.split(":").map(Number),
          h = l.alarmMode === "alarm";
        return {
          id: c,
          title: h ? `⏰ ${l.name}` : `🐸 Hora da rotina: ${l.name}`,
          body: h ? "Sua rotina programada começa agora." : "Toque para começar assim que estiver pronto.",
          schedule: {
            on: u ? {
              weekday: u,
              hour: d,
              minute: f
            } : {
              hour: d,
              minute: f
            },
            allowWhileIdle: true
          },
          channelId: h ? kS : undefined,
          actionTypeId: Xy,
          extra: {
            routineId: l.id
          }
        };
      })
    }));
  } catch (o) {
    console.warn("[notifications] falha ao sincronizar notificações de rotina:", o);
  }
}

export async function xO() {
  if (!Capacitor.isNativePlatform()) return Number(localStorage.getItem("focusfrog_dev_distraction_ms") || 0);
  try {
    return (await Bo.getFocusDistraction()).distractedMs || 0;
  } catch {
    return 0;
  }
}

export async function wO() {
  if (Capacitor.isNativePlatform()) try {
    await Bo.resetFocusDistraction();
  } catch {}
}

const TS = "focusfrog_distraction_guard";

export const Cm = () => localStorage.getItem(TS) !== "false";

export async function ES(e) {
  if (localStorage.setItem(TS, String(e)), !!Capacitor.isNativePlatform()) try {
    await Bo.setDistractionGuard({
      enabled: e
    });
  } catch {}
}
