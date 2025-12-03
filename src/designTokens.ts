
// designTokens.ts
// Esta é a fonte única da verdade para todas as variáveis de design que não são cores.

export const baseTokens = {
  /* Safe Area Insets */
  '--safe-top': 'env(safe-area-inset-top, 0px)',
  '--safe-bottom': 'env(safe-area-inset-bottom, 0px)',
  '--safe-left': 'env(safe-area-inset-left, 0px)',
  '--safe-right': 'env(safe-area-inset-right, 0px)',

  /* Typography */
  '--font-inter': "'Inter', -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
  '--font-poppins': "'Poppins', \"Helvetica Neue\", Arial, sans-serif",
  '--font-scale': '1.0', /* Base font scale */

  /* Spacing (Seguindo uma escala de 4px) */
  '--sp-xs': '4px',
  '--sp-sm': '8px',
  '--sp-md': '12px',
  '--sp-lg': '16px',
  '--sp-xl': '24px',
  '--sp-xxl': '32px',

  /* Outros */
  '--border-radius-md': '8px',
  '--border-radius-lg': '12px',
  '--transition-fast': '200ms ease',
  '--transition-slow': '400ms ease',
};
