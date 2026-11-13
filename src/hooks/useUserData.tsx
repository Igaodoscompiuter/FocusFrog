// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import * as React from 'react';
import { supabase } from '../supabaseClient';
import { useUI } from '../context/UIContext';
import { FROG_SPECIES } from '../data/frogs';
import { Lt } from '../constants';

const My = ["focusfrog_tasks", "focusfrog_tags", "focusfrog_frogTaskId", "focusfrog_routines", "focusfrog_taskTemplates", "focusfrog_leavingHomeItems", "focusfrog_userName", "focusfrog_onboardingCompleted", "focusfrog_onboarding_completed", "focusfrog_pomodorosCompleted", "focusfrog_theme_data_v2", "focusfrog_collectedFrogs", "focusfrog_zenState", "focusfrog_frogPity", "focusfrog_tasksCompletedTotal", "focusfrog_thanksMilestone", "focusfrog_tutorialFrogGiven", "focusfrog_mascot", "focusfrog_mascotStyle", "focusfrog_sound_enabled", "focusfrog_haptics_enabled", "focusfrog_fontsize", "focusfrog_distraction_guard", "focusfrog_effects"];

const P3 = 3;

export const Ly = () => {
  const e = {
      schemaVersion: P3
    },
    t = [];
  return My.forEach(n => {
    const s = localStorage.getItem(n);
    if (s !== null) try {
      e[n] = JSON.parse(s);
    } catch {
      e[n] = s, t.push(n);
    }
  }), t.length && (e.__raw = t), e;
};

export const By = e => {
  e.focusfrog_onboardingCompleted == null && e.focusfrog_onboarding_completed === true && G2(e) && (e = {
    ...e,
    focusfrog_onboardingCompleted: true
  });
  const t = new Set(Array.isArray(e.__raw) ? e.__raw : []);
  My.forEach(n => {
    const s = e[n];
    if (s == null) {
      localStorage.removeItem(n);
      return;
    }
    localStorage.setItem(n, t.has(n) && typeof s == "string" ? s : JSON.stringify(s));
  }), zy(e) && localStorage.setItem(I3, JSON.stringify({
    done: true,
    step: 0
  }));
};

const I3 = "focusfrog_tour";

const G2 = e => typeof e.focusfrog_userName == "string" && e.focusfrog_userName.trim() !== "";

export const zy = e => {
  if (!e) return false;
  if ((Array.isArray(e.focusfrog_tasks) ? e.focusfrog_tasks : []).some(s => !Lt(s)) || G2(e)) return true;
  const n = s => Array.isArray(e[s]) ? e[s] : [];
  return n("focusfrog_collectedFrogs").length > 0 || n("focusfrog_routines").some(s => !(s != null && s.isDefault)) || Number(e.focusfrog_pomodorosCompleted) > 0;
};

const O3 = () => ({
  ...Ly(),
  exportedAt: new Date().toISOString()
});

const R3 = e => {
  if (!e || typeof e != "object" || !My.some(t => t in e)) throw new Error("backup inválido");
  By(e);
};

export const K2 = () => {
  const {
      addNotification: e
    } = useUI(),
    t = React.useCallback(() => {
      const a = localStorage.getItem("focusfrog_collectedFrogs");
      if (!a) return [];
      try {
        const l = JSON.parse(a);
        if (Array.isArray(l) && l.length > 0 && typeof l[0] == "object" && l[0] !== null && "speciesId" in l[0]) {
          const c = l.map(u => u.speciesId);
          return localStorage.setItem("focusfrog_collectedFrogs", JSON.stringify(c)), c;
        }
        return Array.isArray(l) ? l : [];
      } catch (l) {
        return console.error("Erro ao processar dados de sapos coletados:", l), [];
      }
    }, []),
    n = React.useCallback(a => {
      var l;
      try {
        const c = t(),
          u = !c.includes(a),
          d = [...c, a];
        localStorage.setItem("focusfrog_collectedFrogs", JSON.stringify(d));
        const f = ((l = FROG_SPECIES[a]) == null ? undefined : l.name) || "sapo desconhecido";
        e(u ? `Você descobriu o ${f}!` : `Mais um ${f} coletado!`, "🐸", "success");
      } catch (c) {
        console.error("Falha ao adicionar sapo à coleção:", c), e("Não deu pra guardar o sapo novo. Tente de novo.", "❌", "error");
      }
    }, [t, e]),
    s = React.useCallback(() => {
      try {
        const a = O3(),
          l = new Blob([JSON.stringify(a, null, 2)], {
            type: "application/json"
          }),
          c = URL.createObjectURL(l),
          u = document.createElement("a"),
          d = new Date().toISOString().split("T")[0];
        u.href = c, u.download = `focusfrog_backup_${d}.json`, document.body.appendChild(u), u.click(), document.body.removeChild(u), URL.revokeObjectURL(c), e("Backup salvo", "💾", "success");
      } catch (a) {
        e("Não deu pra criar o backup. Tente de novo.", "❌", "error"), console.error(a);
      }
    }, [e]),
    r = React.useCallback((a, l) => {
      const c = new FileReader();
      c.onload = async u => {
        var d;
        try {
          const f = JSON.parse((d = u.target) == null ? undefined : d.result);
          R3(f), e("Backup restaurado. Recarregando…", "✅", "success"), setTimeout(() => window.location.reload(), 2e3);
        } catch (f) {
          e("Esse arquivo não é um backup do FocusFrog", "❌", "error"), console.error(f);
        }
      }, c.readAsText(a);
    }, [e]),
    o = React.useCallback(() => {
      supabase.auth.signOut().catch(() => {}), Object.keys(localStorage).filter(a => a.startsWith("focusfrog_")).forEach(a => localStorage.removeItem(a)), e("Dados apagados deste aparelho. Recarregando…", "🗑️", "info"), setTimeout(() => window.location.reload(), 1500);
    }, [e]);
  return {
    exportData: s,
    importDataFromFile: r,
    resetData: o,
    addFrogToCollection: n,
    getCollectedFrogs: t
  };
};
