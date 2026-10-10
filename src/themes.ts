export interface Theme {
  colors: {
    '--primary-color': string;
    '--primary-color-hover': string;
    '--secondary-color': string;
    '--accent-color': string;
    '--accent-color-hover': string;
    '--accent-color-light': string;
    '--accent-color-glow': string;
    '--accent-color-dark': string;
    '--success-color': string;
    '--danger-color': string;

    '--background-color': string;
    '--surface-color': string;
    '--surface-secondary-color': string;
    /** Um tom mais claro que --surface-color. Usado em trilhos de seletores/chips. */
    '--background-color-light': string;
    /** Um tom mais escuro/recuado que --surface-color. Usado em estados "ativos" de chips. */
    '--background-color-darker': string;
    /** Tom usado em :hover de itens sobre um --surface-color. */
    '--background-color-hover': string;

    '--text-color': string;
    '--text-secondary-color': string;
    '--text-light-color': string;
    '--text-on-primary': string;
    '--text-on-accent': string;
    /** Alias de --text-color para componentes que pedem "cor de texto primária". */
    '--text-primary-color': string;

    '--border-color': string;
    '--border-subtle-color': string;
    /** Borda mais sutil que --border-color, para separadores leves sobre --background-color-light. */
    '--border-color-light': string;

    '--quadrant-do-bg': string;
    '--quadrant-schedule-bg': string;
    '--quadrant-delegate-bg': string;
    '--quadrant-eliminate-bg': string;

    /* Usadas por Toast.module.css (e outros) — faltavam por completo antes. */
    '--warning-color': string;
    '--info-color': string;
    '--primary-color-translucent': string;
    /** Componentes RGB (sem o #, separados por vírgula) de --surface-color,
     *  pra usar dentro de rgba(var(--surface-rgb), alpha). */
    '--surface-rgb': string;
    /** O mesmo, mas de --text-color. */
    '--text-rgb': string;
    '--danger-color-translucent': string;
  };
  preview: string;
}

export const themes: { [key: string]: Theme } = {
  // Claro: verde-menta clarinho, com contraste firme (texto ≥ 4.5:1,
  // cartões brancos com borda visível sobre o fundo menta)
  'light-theme': {
    colors: {
      '--primary-color': '#1F7A4D',
      '--primary-color-hover': '#17643E',
      '--secondary-color': '#D3EBD9',
      '--accent-color': '#A85A00',
      '--accent-color-hover': '#8F4C00',
      '--accent-color-light': '#F5B547',
      '--accent-color-glow': 'rgba(168, 90, 0, 0.18)',
      '--accent-color-dark': '#7A4100',
      '--success-color': '#15803D',
      '--danger-color': '#DC2626',
      '--background-color': '#EAF5EC',
      '--surface-color': '#FFFFFF',
      '--surface-secondary-color': '#F2FAF3',
      '--background-color-light': '#F2FAF3',
      '--background-color-darker': '#D3E9D7',
      '--background-color-hover': '#E1F1E4',
      '--text-color': '#10261A',
      '--text-secondary-color': '#4B6355',
      '--text-light-color': '#FFFFFF',
      '--text-on-primary': '#FFFFFF',
      '--text-on-accent': '#FFFFFF',
      '--text-primary-color': '#10261A',
      '--border-color': '#BFD8C4',
      '--border-subtle-color': '#D7E9DA',
      '--border-color-light': '#E3F0E5',
      '--quadrant-do-bg': '#FDE4E1',
      '--quadrant-schedule-bg': '#DDF0E2',
      '--quadrant-delegate-bg': '#FCEFD6',
      '--quadrant-eliminate-bg': '#E6ECE8',
      '--warning-color': '#A85A00',
      '--info-color': '#1F7A4D',
      '--primary-color-translucent': 'rgba(31, 122, 77, 0.3)',
      '--surface-rgb': '255, 255, 255',
      '--text-rgb': '16, 38, 26',
      '--danger-color-translucent': 'rgba(220, 38, 38, 0.12)',
    },
    preview: 'linear-gradient(to bottom right, #FFFFFF, #EAF5EC)',
  },
  'dark-theme': {
    colors: {
      '--primary-color': '#3B82F6',
      '--primary-color-hover': '#2563EB',
      '--secondary-color': '#374151',
      '--accent-color': '#FBBF24',
      '--accent-color-hover': '#F59E0B',
      '--accent-color-light': '#FCD34D',
      '--accent-color-glow': 'rgba(251, 191, 36, 0.4)',
      '--accent-color-dark': '#B45309',
      '--success-color': '#10B981',
      '--danger-color': '#EF4444',
      '--background-color': '#111827',
      '--surface-color': '#1F2937',
      '--surface-secondary-color': '#374151',
      '--background-color-light': '#374151',
      '--background-color-darker': '#111827',
      '--background-color-hover': '#2D3748',
      '--text-color': '#F3F4F6',
      '--text-secondary-color': '#9CA3AF',
      '--text-light-color': '#FFFFFF',
      '--text-on-primary': '#FFFFFF',
      '--text-on-accent': '#111827',
      '--text-primary-color': '#F3F4F6',
      '--border-color': '#374151',
      '--border-subtle-color': '#1F2937',
      '--border-color-light': '#4B5563',
      '--quadrant-do-bg': 'rgba(239, 68, 68, 0.1)',
      '--quadrant-schedule-bg': 'rgba(59, 130, 246, 0.1)',
      '--quadrant-delegate-bg': 'rgba(245, 158, 11, 0.1)',
      '--quadrant-eliminate-bg': 'rgba(107, 114, 128, 0.1)',
      '--warning-color': '#FBBF24',
      '--info-color': '#3B82F6',
      '--primary-color-translucent': 'rgba(59, 130, 246, 0.35)',
      '--surface-rgb': '31, 41, 55',
      '--text-rgb': '243, 244, 246',
      '--danger-color-translucent': 'rgba(239, 68, 68, 0.15)',
    },
    preview: 'linear-gradient(to bottom right, #1F2937, #111827)',
  },
};

// ---------------------------------------------------------------
// Temas da Loja do Sapo. Cada um é montado a partir de poucas cores-base;
// o resto (hover, translúcidos, quadrantes) é derivado aqui, igual pra todos.
// ---------------------------------------------------------------
const hexToRgb = (h: string) => {
  const n = parseInt(h.replace('#', ''), 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
};
interface ThemeBase {
  bg: string; surface: string; surface2: string; hover: string;
  primary: string; primaryHover: string; accent: string; accentHover: string; accentLight: string; accentDark: string;
  text: string; muted: string; border: string; borderLight: string;
  onAccent: string; light?: boolean;
}
const buildTheme = (b: ThemeBase): Theme => {
  const p = hexToRgb(b.primary), a = hexToRgb(b.accent);
  const tint = (rgb: string, alpha: number) => `rgba(${rgb}, ${alpha})`;
  return {
    colors: {
      '--primary-color': b.primary,
      '--primary-color-hover': b.primaryHover,
      '--secondary-color': b.light ? tint(p, 0.12) : b.surface2,
      '--accent-color': b.accent,
      '--accent-color-hover': b.accentHover,
      '--accent-color-light': b.accentLight,
      '--accent-color-glow': tint(a, 0.35),
      '--accent-color-dark': b.accentDark,
      '--success-color': b.light ? '#10b981' : '#34D399',
      '--danger-color': '#EF4444',
      '--background-color': b.bg,
      '--surface-color': b.surface,
      '--surface-secondary-color': b.surface2,
      '--background-color-light': b.surface2,
      '--background-color-darker': b.light ? b.border : b.bg,
      '--background-color-hover': b.hover,
      '--text-color': b.text,
      '--text-secondary-color': b.muted,
      '--text-light-color': '#FFFFFF',
      '--text-on-primary': '#FFFFFF',
      '--text-on-accent': b.onAccent,
      '--text-primary-color': b.text,
      '--border-color': b.border,
      '--border-subtle-color': b.light ? b.surface2 : b.surface,
      '--border-color-light': b.borderLight,
      '--quadrant-do-bg': 'rgba(239, 68, 68, 0.1)',
      '--quadrant-schedule-bg': tint(p, 0.12),
      '--quadrant-delegate-bg': tint(a, 0.12),
      '--quadrant-eliminate-bg': 'rgba(107, 114, 128, 0.1)',
      '--warning-color': b.accent,
      '--info-color': b.primary,
      '--primary-color-translucent': tint(p, 0.35),
      '--surface-rgb': hexToRgb(b.surface),
      '--text-rgb': hexToRgb(b.text),
      '--danger-color-translucent': 'rgba(239, 68, 68, 0.15)',
    },
    preview: `linear-gradient(to bottom right, ${b.surface}, ${b.bg})`,
  };
};

Object.assign(themes, {
  'lagoa-theme': buildTheme({ bg: '#0B1A1E', surface: '#12262B', surface2: '#1B343A', hover: '#183036', primary: '#2C9C91', primaryHover: '#248177', accent: '#F6E05E', accentHover: '#ECC94B', accentLight: '#FAF089', accentDark: '#B7791F', text: '#E6F4F1', muted: '#8FB3AE', border: '#1E3A40', borderLight: '#2A4E55', onAccent: '#0B1A1E' }),
  'regia-theme': buildTheme({ light: true, bg: '#FFF5F7', surface: '#FFFFFF', surface2: '#FFF0F4', hover: '#FDE8EF', primary: '#2F855A', primaryHover: '#276749', accent: '#D53F8C', accentHover: '#B83280', accentLight: '#F687B3', accentDark: '#97266D', text: '#1F2933', muted: '#7B6470', border: '#FBD5E5', borderLight: '#FDE3EE', onAccent: '#FFFFFF' }),
  'musgo-theme': buildTheme({ bg: '#141A12', surface: '#1E271B', surface2: '#2A3626', hover: '#253021', primary: '#5E8C2F', primaryHover: '#4F7727', accent: '#D4A373', accentHover: '#C08A57', accentLight: '#E6C7A5', accentDark: '#8C6239', text: '#EEF2E6', muted: '#A3AE96', border: '#2E3A29', borderLight: '#3C4B36', onAccent: '#141A12' }),
  'mare-theme': buildTheme({ bg: '#0A1628', surface: '#11223A', surface2: '#1A2F4D', hover: '#172A45', primary: '#0E7FC0', primaryHover: '#0B6A9F', accent: '#FB923C', accentHover: '#F97316', accentLight: '#FDBA74', accentDark: '#C2410C', text: '#E8F1FA', muted: '#93A8C2', border: '#1E3554', borderLight: '#2A4568', onAccent: '#0A1628' }),
  'neblina-theme': buildTheme({ light: true, bg: '#EEF2EF', surface: '#F9FBF9', surface2: '#F1F5F2', hover: '#E6ECE8', primary: '#4A7C59', primaryHover: '#3D6849', accent: '#B7703A', accentHover: '#9C5D2F', accentLight: '#D9A273', accentDark: '#7A4723', text: '#1E2A22', muted: '#66756B', border: '#D8E2DB', borderLight: '#E4EBE6', onAccent: '#FFFFFF' }),
  'ambar-theme': buildTheme({ bg: '#1A1206', surface: '#261B0C', surface2: '#342512', hover: '#2E2110', primary: '#B7651B', primaryHover: '#9A5416', accent: '#FBD38D', accentHover: '#F6AD55', accentLight: '#FEEBC8', accentDark: '#C05621', text: '#FDF3E1', muted: '#BFA77F', border: '#3B2A12', borderLight: '#4A3518', onAccent: '#1A1206' }),
  'galaxia-theme': buildTheme({ bg: '#0D0B1F', surface: '#1A1638', surface2: '#262050', hover: '#221C47', primary: '#7C5CE0', primaryHover: '#6847C9', accent: '#F472B6', accentHover: '#EC4899', accentLight: '#F9A8D4', accentDark: '#BE185D', text: '#EDE9FE', muted: '#A79FD0', border: '#2D2760', borderLight: '#3B3478', onAccent: '#0D0B1F' }),
});

/** Catálogo da Loja do Sapo (temas). Preço em pontos de foco; 0 = grátis. */
export interface ThemeItem { id: string; name: string; price: number; desc: string; epic?: boolean }
export const THEME_CATALOG: ThemeItem[] = [
  { id: 'dark-theme', name: 'Escuro', price: 0, desc: 'O tema de sempre.' },
  { id: 'light-theme', name: 'Claro', price: 0, desc: 'Verde-menta, pra usar de dia.' },
  { id: 'musgo-theme', name: 'Musgo', price: 200, desc: 'Floresta úmida, tons de terra.' },
  { id: 'mare-theme', name: 'Maré', price: 200, desc: 'Azul fundo com boia laranja.' },
  { id: 'lagoa-theme', name: 'Lagoa à noite', price: 300, desc: 'Verde-água e luz de vaga-lume.' },
  { id: 'regia-theme', name: 'Vitória-régia', price: 300, desc: 'Rosa de flor sobre folha verde.' },
  { id: 'neblina-theme', name: 'Neblina', price: 400, desc: 'Manhã cinza-verde, bem calma.' },
  { id: 'ambar-theme', name: 'Âmbar noturno', price: 500, desc: 'Pouca luz azul, pra depois das 22h.' },
  { id: 'galaxia-theme', name: 'Galáxia', price: 800, desc: 'O tema do Sapo Galáxia.', epic: true },
];
