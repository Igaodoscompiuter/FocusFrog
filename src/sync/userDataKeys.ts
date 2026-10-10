/**
 * Dados DA PESSOA: o que vai pro backup (Exportar/Importar) e pra nuvem.
 * Uma lista só pros dois, pra nunca mais divergirem.
 *
 * Fica DE FORA (é do aparelho, não da pessoa): sessão de foco em andamento,
 * tutorial, aviso de versão, modo dev, telas recolhidas/abertas.
 */
import { isSpecialFrogTask } from '../constants';
export const USER_DATA_KEYS = [
  // organização
  'focusfrog_tasks',
  'focusfrog_tags',
  'focusfrog_frogTaskId',
  'focusfrog_routines',
  'focusfrog_taskTemplates',
  'focusfrog_leavingHomeItems',
  // perfil e progresso
  'focusfrog_userName',
  'focusfrog_onboardingCompleted',
  'focusfrog_onboarding_completed',
  'focusfrog_pomodorosCompleted',
  'focusfrog_theme_data_v2', // pontos de foco + tema (faltava no backup antigo)
  // lagoa
  'focusfrog_collectedFrogs',
  'focusfrog_zenState',
  'focusfrog_mascot',
  // preferências
  'focusfrog_sound_enabled',
  'focusfrog_haptics_enabled',
  'focusfrog_fontsize',
  'focusfrog_distraction_guard',
] as const;

/**
 * Formato dos dados (nuvem e arquivo de backup são o MESMO formato):
 *
 *   {
 *     "schemaVersion": 3,
 *     "focusfrog_tasks": [ ...tarefas... ],   ← JSON de verdade, não texto
 *     "focusfrog_userName": "Ana",
 *     ...
 *   }
 *
 * Compatível com as linhas antigas da nuvem e com backups exportados antes
 * (que já usavam valores JSON e chaves extras como backupVersion/exportedAt,
 * que são ignoradas). Se algum valor do aparelho não for JSON válido, ele vai
 * como texto e a chave entra em "__raw", pra voltar idêntico.
 */
export const SCHEMA_VERSION = 3;

export type UserSnapshot = {
  schemaVersion?: number;
  __raw?: string[];
  [key: string]: unknown;
};

/** Foto atual dos dados da pessoa. */
export const collectSnapshot = (): UserSnapshot => {
  const snap: UserSnapshot = { schemaVersion: SCHEMA_VERSION };
  const raw: string[] = [];
  USER_DATA_KEYS.forEach(k => {
    const v = localStorage.getItem(k);
    if (v === null) return;
    try { snap[k] = JSON.parse(v); } catch { snap[k] = v; raw.push(k); }
  });
  if (raw.length) snap.__raw = raw;
  return snap;
};

/** Substitui os dados da pessoa pelos da foto (o que não veio na foto é apagado). */
export const applySnapshot = (snap: UserSnapshot) => {
  // backups antigos (v2) só têm a flag antiga de onboarding; com nome salvo,
  // a pessoa já tinha passado da abertura — não volta pra tela de login
  if (snap.focusfrog_onboardingCompleted == null && snap.focusfrog_onboarding_completed === true && hasName(snap)) {
    snap = { ...snap, focusfrog_onboardingCompleted: true };
  }
  const raw = new Set(Array.isArray(snap.__raw) ? snap.__raw : []);
  USER_DATA_KEYS.forEach(k => {
    const v = snap[k];
    if (v === undefined || v === null) { localStorage.removeItem(k); return; }
    localStorage.setItem(k, raw.has(k) && typeof v === 'string' ? v : JSON.stringify(v));
  });
};

const hasName = (snap: UserSnapshot) =>
  typeof snap.focusfrog_userName === 'string' && snap.focusfrog_userName.trim() !== '';

/**
 * Tem progresso de verdade? (decide se restaura a conta / se vale a cópia de segurança)
 * O Card Especial sozinho não conta — era criado em toda instalação antiga.
 */
export const snapshotHasProgress = (snap: UserSnapshot | null | undefined) => {
  if (!snap) return false;
  const tasks = Array.isArray(snap.focusfrog_tasks) ? snap.focusfrog_tasks : [];
  if (tasks.some((t: any) => !isSpecialFrogTask(t))) return true;
  if (hasName(snap)) return true;
  return ['focusfrog_collectedFrogs', 'focusfrog_routines'].some(k => {
    const v = snap[k];
    return Array.isArray(v) ? v.length > 0 : !!v;
  });
};
