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
  };
  preview: string;
}

export const themes: { [key: string]: Theme } = {
  'light-theme': {
    colors: {
      '--primary-color': '#2563eb',
      '--primary-color-hover': '#1d4ed8',
      '--secondary-color': '#dbeafe',
      '--accent-color': '#f59e0b',
      '--accent-color-hover': '#d97706',
      '--accent-color-light': '#fbbf24',
      '--accent-color-glow': 'rgba(245, 158, 11, 0.3)',
      '--accent-color-dark': '#b45309',
      '--success-color': '#10b981',
      '--danger-color': '#ef4444',
      '--background-color': '#f3f4f6',
      '--surface-color': '#ffffff',
      '--surface-secondary-color': '#f9fafb',
      '--background-color-light': '#f9fafb',
      '--background-color-darker': '#e5e7eb',
      '--background-color-hover': '#eef0f2',
      '--text-color': '#1f2937',
      '--text-secondary-color': '#6b7280',
      '--text-light-color': '#ffffff',
      '--text-on-primary': '#ffffff',
      '--text-on-accent': '#ffffff',
      '--text-primary-color': '#1f2937',
      '--border-color': '#e5e7eb',
      '--border-subtle-color': '#f3f4f6',
      '--border-color-light': '#f3f4f6',
      '--quadrant-do-bg': '#fee2e2',
      '--quadrant-schedule-bg': '#dbeafe',
      '--quadrant-delegate-bg': '#fef3c7',
      '--quadrant-eliminate-bg': '#e5e7eb',
    },
    preview: 'linear-gradient(to bottom right, #f3f4f6, #ffffff)',
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
    },
    preview: 'linear-gradient(to bottom right, #1F2937, #111827)',
  },
  'forest-theme': {
    colors: {
      '--primary-color': '#2F855A',
      '--primary-color-hover': '#276749',
      '--secondary-color': '#C6F6D5',
      '--accent-color': '#DD6B20',
      '--accent-color-hover': '#C05621',
      '--accent-color-light': '#F6AD55',
      '--accent-color-glow': 'rgba(221, 107, 32, 0.3)',
      '--accent-color-dark': '#9C4221',
      '--success-color': '#38A169',
      '--danger-color': '#E53E3E',
      '--background-color': '#F0FFF4',
      '--surface-color': '#FFFFFF',
      '--surface-secondary-color': '#EDF2F7',
      '--background-color-light': '#EDF2F7',
      '--background-color-darker': '#E2E8F0',
      '--background-color-hover': '#DFF5E7',
      '--text-color': '#2D3748',
      '--text-secondary-color': '#4A5568',
      '--text-light-color': '#FFFFFF',
      '--text-on-primary': '#FFFFFF',
      '--text-on-accent': '#FFFFFF',
      '--text-primary-color': '#2D3748',
      '--border-color': '#E2E8F0',
      '--border-subtle-color': '#F7FAFC',
      '--border-color-light': '#F7FAFC',
      '--quadrant-do-bg': '#FED7D7',
      '--quadrant-schedule-bg': '#C6F6D5',
      '--quadrant-delegate-bg': '#FEEBC8',
      '--quadrant-eliminate-bg': '#E2E8F0',
    },
    preview: 'linear-gradient(to bottom right, #F0FFF4, #C6F6D5)',
  },
  'ocean-theme': {
    colors: {
      '--primary-color': '#3182CE',
      '--primary-color-hover': '#2B6CB0',
      '--secondary-color': '#BEE3F8',
      '--accent-color': '#F6E05E',
      '--accent-color-hover': '#D69E2E',
      '--accent-color-light': '#FAF089',
      '--accent-color-glow': 'rgba(246, 224, 94, 0.35)',
      '--accent-color-dark': '#B7791F',
      '--success-color': '#38B2AC',
      '--danger-color': '#E53E3E',
      '--background-color': '#EBF8FF',
      '--surface-color': '#FFFFFF',
      '--surface-secondary-color': '#F7FAFC',
      '--background-color-light': '#F7FAFC',
      '--background-color-darker': '#E2E8F0',
      '--background-color-hover': '#E6F6FF',
      '--text-color': '#2A4365',
      '--text-secondary-color': '#4A5568',
      '--text-light-color': '#FFFFFF',
      '--text-on-primary': '#FFFFFF',
      '--text-on-accent': '#2A4365',
      '--text-primary-color': '#2A4365',
      '--border-color': '#E2E8F0',
      '--border-subtle-color': '#F7FAFC',
      '--border-color-light': '#F7FAFC',
      '--quadrant-do-bg': '#FED7D7',
      '--quadrant-schedule-bg': '#BEE3F8',
      '--quadrant-delegate-bg': '#FEFCBF',
      '--quadrant-eliminate-bg': '#E2E8F0',
    },
    preview: 'linear-gradient(to bottom right, #EBF8FF, #BEE3F8)',
  },
  'sunset-theme': {
    colors: {
      '--primary-color': '#D53F8C',
      '--primary-color-hover': '#B83280',
      '--secondary-color': '#FED7E2',
      '--accent-color': '#ED8936',
      '--accent-color-hover': '#DD6B20',
      '--accent-color-light': '#F6AD55',
      '--accent-color-glow': 'rgba(237, 137, 54, 0.3)',
      '--accent-color-dark': '#9C4221',
      '--success-color': '#38A169',
      '--danger-color': '#C53030',
      '--background-color': '#FFF5F7',
      '--surface-color': '#FFFFFF',
      '--surface-secondary-color': '#F7FAFC',
      '--background-color-light': '#F7FAFC',
      '--background-color-darker': '#E2E8F0',
      '--background-color-hover': '#FFF0F3',
      '--text-color': '#4A5568',
      '--text-secondary-color': '#718096',
      '--text-light-color': '#FFFFFF',
      '--text-on-primary': '#FFFFFF',
      '--text-on-accent': '#FFFFFF',
      '--text-primary-color': '#4A5568',
      '--border-color': '#E2E8F0',
      '--border-subtle-color': '#F7FAFC',
      '--border-color-light': '#F7FAFC',
      '--quadrant-do-bg': '#FED7D7',
      '--quadrant-schedule-bg': '#FBB6CE',
      '--quadrant-delegate-bg': '#FEEBC8',
      '--quadrant-eliminate-bg': '#E2E8F0',
    },
    preview: 'linear-gradient(to bottom right, #FFF5F7, #FED7E2)',
  }
};