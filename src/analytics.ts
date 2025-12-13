
import { getAnalyticsInstance } from './firebase';
import { logEvent } from 'firebase/analytics';

/**
 * Rastreia uma visualização de página.
 * Este é um evento recolhido automaticamente pelo GA4, mas podemos enviá-lo 
 * manualmente para garantir o rastreamento em Single Page Applications (SPAs).
 */
export const trackPageView = (page_title: string) => {
  const analytics = getAnalyticsInstance();
  if (analytics) {
    logEvent(analytics, 'page_view', {
      page_title: page_title,
      page_location: window.location.href,
      page_path: window.location.pathname
    });
  }
};

/**
 * Rastreia a instalação do PWA, conforme a secção 5.1 do manual.
 * Este é um evento personalizado crucial para medir a adoção do PWA.
 * 
 * @param source - De onde o prompt de instalação foi acionado (e.g., 'browser_prompt', 'install_button')
 */
export const trackPWAInstall = (source: 'browser_prompt' | 'install_button') => {
  const analytics = getAnalyticsInstance();
  if (analytics) {
    // Usando o nome de evento e parâmetro recomendados no manual.
    logEvent(analytics, 'pwa_installed', { 
      source: source
    });
  }
};
