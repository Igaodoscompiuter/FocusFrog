// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).


const trackEvent = (e, t) => {
  typeof window < "u" && typeof window.gtag == "function" && window.gtag("event", e, t);
};

export const D3 = e => {
  const t = "/" + e.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  trackEvent("page_view", {
    page_title: e,
    page_location: "https://app.focusfrog" + t,
    page_path: t
  });
};

export const $3 = e => {
  trackEvent("sign_up", {
    method: e
  });
};

export const F3 = e => {
  trackEvent("login", {
    method: e
  });
};

export const M3 = e => {
  trackEvent("pwa_installed", {
    source: e
  });
};

export const L3 = (e, t, n) => {
  trackEvent("task_completed", {
    task_mode: e,
    method: t,
    is_frog: n
  });
};

export const B3 = () => {
  trackEvent("new_routine_created");
};

export const z3 = e => {
  trackEvent("default_routine_used", {
    routine_name: e
  });
};

export const V3 = () => {
  trackEvent("instagram_click");
};

export const U3 = (e, t) => trackEvent("focus_complete", {
  minutes: e,
  is_frog: t
});

export const q3 = (e, t, n = false) => trackEvent("frog_collected", {
  species: e,
  rarity: t,
  guaranteed: n
});

export const W3 = () => trackEvent("tutorial_complete");

export const $_ = (e, t) => trackEvent("store_unlock", {
  item_id: e,
  price: t
});

export const H3 = e => trackEvent("share", {
  method: "frog_card",
  content_type: "frog",
  item_id: e
});

export const G3 = (e, t, n) => trackEvent("focus_start", {
  minutes: e,
  mode: t,
  has_step: n
});

export const K3 = e => trackEvent("focus_stopped", {
  minutes: Math.round(e)
});

export const ih = (e, t) => trackEvent("widget_add", {
  widget: e,
  supported: t
});
