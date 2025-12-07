import { getAnalyticsInstance } from './firebase';
import { logEvent } from 'firebase/analytics';

// Rastreia visualizações de página
export const trackPageView = (page_title: string) => {
  const analytics = getAnalyticsInstance();
  logEvent(analytics, 'page_view', {
    page_title: page_title,
    page_location: window.location.href,
    page_path: window.location.pathname
  });
};

// Rastreia a instalação do PWA
export const trackPWAInstall = () => {
  const analytics = getAnalyticsInstance();
  logEvent(analytics, 'pwa_install', { event_category: 'PWA', event_label: 'Installation' });
};
