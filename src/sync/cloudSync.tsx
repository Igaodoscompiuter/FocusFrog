// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import { supabase } from "../supabaseClient";
import { By, Ly, zy } from "../hooks/useUserData";

const Vy = "focusfrog_sync_meta";

const ud = "focusfrog_sync_backup";

const Q3 = 7;

const Y2 = 24 * 60 * 60 * 1e3;

const Z2 = () => {
  try {
    return JSON.parse(localStorage.getItem(Vy) || "null");
  } catch {
    return null;
  }
};

const Q2 = (e) => localStorage.setItem(Vy, JSON.stringify(e));

export const X2 = () => localStorage.removeItem(Vy);

export const Xc = () => {
  var e;
  return ((e = Z2()) == null ? undefined : e.lastSyncAt) ?? null;
};

const X3 = () => "2.4.9";

async function eS(e) {
  const { data: t, error: n } = await supabase
    .from("profiles")
    .select("data, updated_at")
    .eq("id", e)
    .maybeSingle();
  if (n) throw n;
  return t;
}

export async function lh(e) {
  const { data: t, error: n } = await supabase
    .from("profiles")
    .upsert(
      {
        id: e,
        data: Ly(),
        app_version: X3(),
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "id",
      }
    )
    .select("updated_at")
    .single();
  if (n) throw n;
  Q2({
    userId: e,
    lastSyncAt: Date.now(),
    cloudUpdatedAt: t.updated_at,
  });
}

const eP = () => {
  const e = Ly();
  return zy(e)
    ? (localStorage.setItem(
        ud,
        JSON.stringify({
          savedAt: Date.now(),
          data: e,
        })
      ),
      true)
    : false;
};

export const tP = () => {
  try {
    const e = JSON.parse(localStorage.getItem(ud) || "null");
    return !e || Date.now() - e.savedAt > Q3 * Y2
      ? null
      : {
          savedAt: e.savedAt,
        };
  } catch {
    return null;
  }
};

export async function nP() {
  const e = JSON.parse(localStorage.getItem(ud) || "null");
  return e
    ? (await supabase.auth.signOut(),
      X2(),
      By(e.data),
      localStorage.removeItem(ud),
      true)
    : false;
}

function tS(e, t) {
  eP(),
    By(t.data),
    Q2({
      userId: e,
      lastSyncAt: Date.now(),
      cloudUpdatedAt: t.updated_at,
    });
}

export async function sP(e, t) {
  const n = await eS(e);
  return n && zy(n.data)
    ? (tS(e, n), "restored")
    : t === "settings"
    ? (await lh(e), "uploaded")
    : "new-account";
}

export async function L_(e, t = {}) {
  const n = Z2();
  if (
    !t.force &&
    (n == null ? undefined : n.userId) === e &&
    Date.now() - n.lastSyncAt < Y2
  )
    return "skipped";
  if (typeof navigator < "u" && navigator.onLine === false) return "offline";
  try {
    const s = await eS(e),
      r = !!s && (!n || n.userId !== e || s.updated_at !== n.cloudUpdatedAt);
    return s && r && (n == null ? undefined : n.userId) === e
      ? (tS(e, s), "pulled")
      : (await lh(e), "pushed");
  } catch (s) {
    return console.warn("[sync] falhou:", s), "error";
  }
}
