// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import { CapacitorHttp } from "@capacitor/core";
import { AG, Aw, CT, NG, TT } from "../screens/focus/ZenLakeScreen";

async function IG() {
  try {
    const e = await CapacitorHttp.get({
        url: `${NG}?t=${Date.now()}`,
        headers: {
          "Cache-Control": "no-cache",
        },
      }),
      t = typeof e.data == "string" ? JSON.parse(e.data) : e.data;
    return e.status !== 200 ||
      !t ||
      typeof t.versionCode != "number" ||
      !t.apkUrl
      ? null
      : t;
  } catch {
    return null;
  }
}

export async function OG(e = false) {
  const t = await TT();
  if (!t)
    return {
      update: null,
      installed: t,
    };
  if (!e) {
    const s = Number(localStorage.getItem(Aw) || 0);
    if (Date.now() - s < AG)
      return {
        update: null,
        installed: t,
      };
  }
  const n = await IG();
  if (
    (localStorage.setItem(Aw, String(Date.now())),
    !n || n.versionCode <= t.versionCode)
  )
    return {
      update: null,
      installed: t,
    };
  if (!e)
    try {
      const s = JSON.parse(localStorage.getItem(CT) || "null");
      if (s && s.versionCode === n.versionCode && Date.now() < s.until)
        return {
          update: null,
          installed: t,
        };
    } catch {}
  return {
    update: n,
    installed: t,
  };
}
