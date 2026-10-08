/**
 * Dados DA PESSOA: o que vai pro backup (Exportar/Importar) e pra nuvem.
 * Uma lista só pros dois, pra nunca mais divergirem.
 *
 * Fica DE FORA (é do aparelho, não da pessoa): sessão de foco em andamento,
 * tutorial, aviso de versão, modo dev, telas recolhidas/abertas.
 */
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
  'focusfrog_theme',
  'focusfrog_sound',
  'focusfrog_sound_enabled',
  'focusfrog_haptics_enabled',
  'focusfrog_fontsize',
  'focusfrog_ui_settings',
  'focusfrog_distraction_guard',
] as const;

export type UserSnapshot = Record<string, string>;

/** Foto atual dos dados da pessoa (valores crus do localStorage). */
export const collectSnapshot = (): UserSnapshot => {
  const snap: UserSnapshot = {};
  USER_DATA_KEYS.forEach(k => { const v = localStorage.getItem(k); if (v !== null) snap[k] = v; });
  return snap;
};

/** Substitui os dados da pessoa pelos da foto (o que não veio na foto é apagado). */
export const applySnapshot = (snap: UserSnapshot) => {
  USER_DATA_KEYS.forEach(k => {
    if (snap[k] !== undefined) localStorage.setItem(k, snap[k]);
    else localStorage.removeItem(k);
  });
};

/** Tem progresso de verdade? (pra decidir se vale a cópia de segurança) */
export const snapshotHasProgress = (snap: UserSnapshot) =>
  ['focusfrog_tasks', 'focusfrog_collectedFrogs', 'focusfrog_routines', 'focusfrog_userName'].some(k => {
    const v = snap[k]; if (!v) return false;
    try { const p = JSON.parse(v); return Array.isArray(p) ? p.length > 0 : !!p; } catch { return true; }
  });
