
import { getAnalyticsInstance } from './firebase';
import { logEvent } from 'firebase/analytics';

// =============================================
// Funções de Rastreamento Genéricas e de Ciclo de Vida
// =============================================

/**
 * Rastreia uma visualização de página.
 * O GA4 já faz isso automaticamente, mas é útil para SPAs.
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
 * Rastreia a criação de um novo utilizador (sign_up).
 * @param method - O método usado para o registo (e.g., 'google', 'email').
 */
export const trackUserCreation = (method: string) => {
    const analytics = getAnalyticsInstance();
    if (analytics) {
        logEvent(analytics, 'sign_up', { method });
    }
};

/**
 * Rastreia o login de um utilizador existente.
 * @param method - O método usado para o login (e.g., 'google', 'email').
 */
export const trackLogin = (method: string) => {
    const analytics = getAnalyticsInstance();
    if (analytics) {
        logEvent(analytics, 'login', { method });
    }
};


// =============================================
// Rastreamento Específico do PWA
// =============================================

/**
 * Rastreia a instalação do PWA, conforme a secção 5.1 do manual.
 * @param source - De onde o prompt foi acionado (e.g., 'browser_prompt', 'install_button')
 */
export const trackPWAInstall = (source: 'browser_prompt' | 'install_button') => {
  const analytics = getAnalyticsInstance();
  if (analytics) {
    logEvent(analytics, 'pwa_installed', { source });
  }
};

// =============================================
// Rastreamento do "Core Loop" do FocusFrog
// =============================================

/**
 * Rastreia quando um utilizador conclui uma tarefa.
 */
export const trackTaskCompleted = () => {
    const analytics = getAnalyticsInstance();
    if (analytics) {
        logEvent(analytics, 'task_completed');
    }
};

/**
 * Rastreia quando um utilizador cria uma nova rotina personalizada.
 */
export const trackNewRoutineCreated = () => {
    const analytics = getAnalyticsInstance();
    if (analytics) {
        logEvent(analytics, 'new_routine_created');
    }
};

/**
 * Rastreia quando um utilizador guarda uma tarefa como um modelo.
 */
export const trackTaskSavedAsTemplate = () => {
    const analytics = getAnalyticsInstance();
    if (analytics) {
        logEvent(analytics, 'task_saved_as_template');
    }
};

/**
 * Rastreia a utilização de uma rotina pré-definida.
 * @param routineName - O nome da rotina padrão utilizada.
 */
export const trackDefaultRoutineUsed = (routineName: string) => {
    const analytics = getAnalyticsInstance();
    if (analytics) {
        logEvent(analytics, 'default_routine_used', {
            routine_name: routineName
        });
    }
};

// =============================================
// Rastreamento de Crescimento e Apoio
// =============================================

/**
 * Rastreia cliques no botão de doação.
 */
export const trackDonationClick = () => {
    const analytics = getAnalyticsInstance();
    if (analytics) {
        logEvent(analytics, 'donation_click');
    }
};

/**
 * Rastreia cliques no botão de seguir no Instagram.
 */
export const trackInstagramClick = () => {
    const analytics = getAnalyticsInstance();
    if (analytics) {
        logEvent(analytics, 'instagram_click');
    }
};

