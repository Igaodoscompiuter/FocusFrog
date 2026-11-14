// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import { Capacitor, registerPlugin } from "@capacitor/core";
import { ih } from "../analytics";
import { Preferences } from "@capacitor/preferences";
import { bs } from "../domain/mascot";

export function qO(e, t = Date.now()) {
  const n = [
    ...new Set(
      e
        .filter((a) => a.status === "done" && a.completedAt)
        .map((a) => bs(new Date(a.completedAt).getTime()))
    ),
  ]
    .sort()
    .reverse();
  if (!n.length)
    return {
      days: 0,
      lastDay: "",
    };
  const s = bs(t),
    r = bs(t - 864e5);
  if (n[0] !== s && n[0] !== r)
    return {
      days: 0,
      lastDay: n[0],
    };
  let o = 1;
  for (let a = 1; a < n.length; a++) {
    const l = new Date(n[a - 1] + "T12:00:00").getTime();
    if (bs(l - 864e5) === n[a]) o++;
    else break;
  }
  return {
    days: o,
    lastDay: n[0],
  };
}

const zS = "leavingHomeItems";

const no = registerPlugin("WidgetBridge");

export async function WO() {
  if (!Capacitor.isNativePlatform())
    return {
      supported: false,
      reason: "web",
    };
  try {
    const e = await no.requestPinWidget();
    return ih("checklist", e.supported), e;
  } catch {
    return {
      supported: false,
      reason: "error",
    };
  }
}

export async function HO(e) {
  if (Capacitor.isNativePlatform())
    try {
      await Preferences.set({
        key: zS,
        value: JSON.stringify(e),
      }),
        await no.refreshChecklistWidget();
    } catch {}
}

export async function GO() {
  if (!Capacitor.isNativePlatform()) return null;
  try {
    const { value: e } = await Preferences.get({
      key: zS,
    });
    return e ? JSON.parse(e) : null;
  } catch {
    return null;
  }
}

let Om = "";

export async function jf(e) {
  if (!Capacitor.isNativePlatform()) return;
  const t = JSON.stringify(e);
  if (t !== Om) {
    Om = t;
    try {
      await Preferences.set({
        key: "frogWidget",
        value: t,
      }),
        await no.refreshFrogWidget();
    } catch {}
  }
}

export async function KO() {
  if (!Capacitor.isNativePlatform())
    return {
      supported: false,
      reason: "web",
    };
  try {
    const e = await no.requestPinWidget({
      kind: "frog",
    });
    return ih("sapo", e.supported), e;
  } catch {
    return {
      supported: false,
      reason: "error",
    };
  }
}

let f1 = "";

export async function JO(e, t) {
  if (!Capacitor.isNativePlatform()) return;
  const n = JSON.stringify({
    date: e,
    items: t,
  });
  if (n !== f1) {
    f1 = n;
    try {
      await Preferences.set({
        key: "agendaWidget",
        value: n,
      }),
        await no.refreshAgendaWidget();
    } catch {}
  }
}

export async function YO() {
  if (!Capacitor.isNativePlatform()) return [];
  try {
    const { value: e } = await Preferences.get({
        key: "agendaWidgetDone",
      }),
      t = e ? JSON.parse(e) : [];
    return (
      t.length &&
        (await Preferences.set({
          key: "agendaWidgetDone",
          value: "[]",
        })),
      Array.isArray(t) ? t : []
    );
  } catch {
    return [];
  }
}

export async function ZO() {
  if (!Capacitor.isNativePlatform())
    return {
      supported: false,
      reason: "web",
    };
  try {
    const e = await no.requestPinWidget({
      kind: "agenda",
    });
    return ih("agenda", e.supported), e;
  } catch {
    return {
      supported: false,
      reason: "error",
    };
  }
}

let p1 = "";

export async function QO(e) {
  if (!Capacitor.isNativePlatform()) return;
  const t = JSON.stringify(e);
  if (t !== p1) {
    p1 = t;
    try {
      await Preferences.set({
        key: "mascotWidget",
        value: t,
      }),
        await no.refreshMascotWidget();
    } catch {}
  }
}

export async function ev() {
  if (!Capacitor.isNativePlatform())
    return {
      supported: false,
      reason: "web",
    };
  try {
    const e = await no.requestPinWidget({
      kind: "mascot",
    });
    return ih("mascote", e.supported), e;
  } catch {
    return {
      supported: false,
      reason: "error",
    };
  }
}

export async function XO() {
  if (!Capacitor.isNativePlatform()) return null;
  try {
    const { value: e } = await Preferences.get({
      key: "frogWidgetPending",
    });
    if (!e) return null;
    const t = JSON.parse(e);
    return !t || !t.taskId
      ? null
      : (await Preferences.set({
          key: "frogWidgetPending",
          value: "{}",
        }),
        (Om = ""),
        {
          taskId: String(t.taskId),
          toggled: Array.isArray(t.toggled) ? t.toggled.map(String) : [],
          complete: !!t.complete,
        });
  } catch {
    return null;
  }
}
