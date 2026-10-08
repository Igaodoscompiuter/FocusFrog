import { Capacitor, CapacitorHttp } from '@capacitor/core';
import { App } from '@capacitor/app';

/**
 * Aviso de nova versão do APK (fora da Play Store não existe atualização
 * automática). A LP publica um version.json:
 *
 *   {
 *     "versionCode": 4,                 // inteiro, igual ao build.gradle
 *     "versionName": "1.5.0",
 *     "apkUrl": "https://focusfrog.netlify.app/downloads/FocusFrog.apk",
 *     "notes": ["Novidade 1", "Novidade 2"],
 *     "publishedAt": "2026-10-20"
 *   }
 *
 * A consulta usa o HTTP nativo (CapacitorHttp): não depende de CORS na LP.
 */
export interface UpdateManifest {
  versionCode: number;
  versionName: string;
  apkUrl: string;
  notes?: string[];
  publishedAt?: string;
}

export interface InstalledVersion { versionCode: number; versionName: string }

const MANIFEST_URL = (import.meta.env.VITE_UPDATE_MANIFEST_URL as string | undefined) || 'https://focusfrog.netlify.app/version.json';
const LAST_CHECK_KEY = 'focusfrog_update_lastCheck';
const SNOOZE_KEY = 'focusfrog_update_snooze'; // { versionCode, until }
const CHECK_EVERY_MS = 12 * 60 * 60 * 1000;
const SNOOZE_MS = 3 * 24 * 60 * 60 * 1000;

export async function getInstalledVersion(): Promise<InstalledVersion | null> {
  if (!Capacitor.isNativePlatform()) return null;
  try {
    const info = await App.getInfo();
    return { versionCode: parseInt(info.build, 10) || 0, versionName: info.version };
  } catch { return null; }
}

async function fetchManifest(): Promise<UpdateManifest | null> {
  try {
    const res = await CapacitorHttp.get({ url: `${MANIFEST_URL}?t=${Date.now()}`, headers: { 'Cache-Control': 'no-cache' } });
    const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
    if (res.status !== 200 || !data || typeof data.versionCode !== 'number' || !data.apkUrl) return null;
    return data as UpdateManifest;
  } catch { return null; }
}

/**
 * Retorna o manifesto se existir versão MAIS NOVA que a instalada.
 * `manual`: ignora o intervalo de 12h e o "agora não" (botão nas Configurações).
 */
export async function checkForUpdate(manual = false): Promise<{ update: UpdateManifest | null; installed: InstalledVersion | null }> {
  const installed = await getInstalledVersion();
  if (!installed) return { update: null, installed };
  if (!manual) {
    const last = Number(localStorage.getItem(LAST_CHECK_KEY) || 0);
    if (Date.now() - last < CHECK_EVERY_MS) return { update: null, installed };
  }
  const manifest = await fetchManifest();
  localStorage.setItem(LAST_CHECK_KEY, String(Date.now()));
  if (!manifest || manifest.versionCode <= installed.versionCode) return { update: null, installed };
  if (!manual) {
    try {
      const snooze = JSON.parse(localStorage.getItem(SNOOZE_KEY) || 'null');
      if (snooze && snooze.versionCode === manifest.versionCode && Date.now() < snooze.until) return { update: null, installed };
    } catch { /* */ }
  }
  return { update: manifest, installed };
}

export const snoozeUpdate = (versionCode: number) =>
  localStorage.setItem(SNOOZE_KEY, JSON.stringify({ versionCode, until: Date.now() + SNOOZE_MS }));

/** Abre o download no navegador do celular (o Android pede pra instalar). */
export const openApkDownload = (url: string) => { window.open(url, '_blank'); };
