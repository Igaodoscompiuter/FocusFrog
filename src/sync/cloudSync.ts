import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { collectSnapshot, applySnapshot, snapshotHasProgress, UserSnapshot } from './userDataKeys';

/**
 * Sincronização com o Supabase: UMA linha por pessoa (tabela public.profiles, id = usuário)
 * com a foto completa dos dados. Simples e à prova de conflito parcial —
 * casa com a regra "sincroniza 1x por dia".
 *
 * Meta local (fica no aparelho, nunca vai pra nuvem):
 *   lastSyncAt       quando este aparelho sincronizou pela última vez
 *   cloudUpdatedAt   updated_at da nuvem visto nessa sincronização
 * Se a nuvem mudou depois disso, foi OUTRO aparelho → a nuvem prevalece.
 */
const META_KEY = 'focusfrog_sync_meta';
const BACKUP_KEY = 'focusfrog_sync_backup';  // cópia de segurança antes de sobrescrever
const BACKUP_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

interface SyncMeta { userId: string; lastSyncAt: number; cloudUpdatedAt: string | null }
interface CloudRow { data: UserSnapshot; updated_at: string }

const readMeta = (): SyncMeta | null => { try { return JSON.parse(localStorage.getItem(META_KEY) || 'null'); } catch { return null; } };
const writeMeta = (m: SyncMeta) => localStorage.setItem(META_KEY, JSON.stringify(m));
export const clearSyncMeta = () => localStorage.removeItem(META_KEY);
export const getLastSyncAt = () => readMeta()?.lastSyncAt ?? null;

const appVersion = () => (typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '');

export async function fetchCloud(userId: string): Promise<CloudRow | null> {
  const { data, error } = await supabase.from('profiles').select('data, updated_at').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data as CloudRow | null;
}

/** Sobe os dados do aparelho pra nuvem. */
export async function pushLocal(userId: string) {
  const { data, error } = await supabase.from('profiles')
    .upsert({ id: userId, data: collectSnapshot(), app_version: appVersion(), updated_at: new Date().toISOString() }, { onConflict: 'id' })
    .select('updated_at').single();
  if (error) throw error;
  writeMeta({ userId, lastSyncAt: Date.now(), cloudUpdatedAt: data.updated_at });
}

/** Guarda o que está no aparelho antes de sobrescrever (se houver progresso). */
const backupLocal = () => {
  const snap = collectSnapshot();
  if (!snapshotHasProgress(snap)) return false;
  localStorage.setItem(BACKUP_KEY, JSON.stringify({ savedAt: Date.now(), data: snap }));
  return true;
};

export const getLocalBackup = (): { savedAt: number } | null => {
  try {
    const b = JSON.parse(localStorage.getItem(BACKUP_KEY) || 'null');
    if (!b || Date.now() - b.savedAt > BACKUP_DAYS * DAY_MS) return null;
    return { savedAt: b.savedAt };
  } catch { return null; }
};

/** Desfaz: volta o aparelho pra cópia de segurança (sai da conta pra não ressincronizar por cima). */
export async function restoreLocalBackup() {
  const b = JSON.parse(localStorage.getItem(BACKUP_KEY) || 'null');
  if (!b) return false;
  await supabase.auth.signOut();
  clearSyncMeta();
  applySnapshot(b.data);
  localStorage.removeItem(BACKUP_KEY);
  return true;
}

/** Baixa a nuvem pro aparelho (com cópia de segurança antes). */
function applyCloud(userId: string, row: CloudRow) {
  backupLocal();
  applySnapshot(row.data);
  writeMeta({ userId, lastSyncAt: Date.now(), cloudUpdatedAt: row.updated_at });
}

export type LoginOutcome =
  | 'restored'      // conta existente: dados da nuvem aplicados (recarregar o app)
  | 'new-account'   // conta nova, sem dados na nuvem
  | 'uploaded';     // conta nova, entrou pelas Configurações: subiu o que tinha no aparelho

/**
 * Logo após o login.
 *   origem 'onboarding': conta com dados → restaura; sem dados → 'new-account'
 *     (o app pede o nome e só sobe depois que a pessoa salvar).
 *   origem 'settings':   conta com dados → sobrescreve o aparelho (com cópia);
 *     sem dados → sobe o que está no aparelho.
 */
export async function handleLogin(userId: string, origin: 'onboarding' | 'settings'): Promise<LoginOutcome> {
  const row = await fetchCloud(userId);
  if (row && row.data && Object.keys(row.data).length > 0) {
    applyCloud(userId, row);
    return 'restored';
  }
  if (origin === 'settings') { await pushLocal(userId); return 'uploaded'; }
  return 'new-account';
}

export type SyncOutcome = 'skipped' | 'pushed' | 'pulled' | 'offline' | 'error';

/**
 * Sincronização diária (ao abrir o app) ou manual (botão).
 *   nuvem mudou desde a última vez (outro aparelho) → baixa (com cópia)
 *   senão → sobe o aparelho
 */
export async function syncNow(userId: string, opts: { force?: boolean } = {}): Promise<SyncOutcome> {
  if (!isSupabaseConfigured) return 'skipped';
  const meta = readMeta();
  if (!opts.force && meta?.userId === userId && Date.now() - meta.lastSyncAt < DAY_MS) return 'skipped';
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return 'offline';
  try {
    const row = await fetchCloud(userId);
    const cloudChangedElsewhere = !!row && (!meta || meta.userId !== userId || row.updated_at !== meta.cloudUpdatedAt);
    if (row && cloudChangedElsewhere && meta?.userId === userId) {
      applyCloud(userId, row);
      return 'pulled';
    }
    await pushLocal(userId);
    return 'pushed';
  } catch (e) {
    console.warn('[sync] falhou:', e);
    return 'error';
  }
}
