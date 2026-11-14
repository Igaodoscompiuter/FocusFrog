// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import * as React from "react";
import * as jsxRuntime from "react/jsx-runtime";

export const Va = {
  "light-theme": {
    colors: {
      "--primary-color": "#1F7A4D",
      "--primary-color-hover": "#17643E",
      "--secondary-color": "#D3EBD9",
      "--accent-color": "#A85A00",
      "--accent-color-hover": "#8F4C00",
      "--accent-color-light": "#F5B547",
      "--accent-color-glow": "rgba(168, 90, 0, 0.18)",
      "--accent-color-dark": "#7A4100",
      "--success-color": "#15803D",
      "--danger-color": "#DC2626",
      "--background-color": "#EAF5EC",
      "--surface-color": "#FFFFFF",
      "--surface-secondary-color": "#F2FAF3",
      "--background-color-light": "#F2FAF3",
      "--background-color-darker": "#D3E9D7",
      "--background-color-hover": "#E1F1E4",
      "--text-color": "#10261A",
      "--text-secondary-color": "#4B6355",
      "--text-light-color": "#FFFFFF",
      "--text-on-primary": "#FFFFFF",
      "--text-on-accent": "#FFFFFF",
      "--text-primary-color": "#10261A",
      "--border-color": "#BFD8C4",
      "--border-subtle-color": "#D7E9DA",
      "--border-color-light": "#E3F0E5",
      "--quadrant-do-bg": "#FDE4E1",
      "--quadrant-schedule-bg": "#DDF0E2",
      "--quadrant-delegate-bg": "#FCEFD6",
      "--quadrant-eliminate-bg": "#E6ECE8",
      "--warning-color": "#A85A00",
      "--info-color": "#1F7A4D",
      "--primary-color-translucent": "rgba(31, 122, 77, 0.3)",
      "--surface-rgb": "255, 255, 255",
      "--text-rgb": "16, 38, 26",
      "--danger-color-translucent": "rgba(220, 38, 38, 0.12)",
    },
    preview: "linear-gradient(to bottom right, #FFFFFF, #EAF5EC)",
  },
  "dark-theme": {
    colors: {
      "--primary-color": "#3B82F6",
      "--primary-color-hover": "#2563EB",
      "--secondary-color": "#374151",
      "--accent-color": "#FBBF24",
      "--accent-color-hover": "#F59E0B",
      "--accent-color-light": "#FCD34D",
      "--accent-color-glow": "rgba(251, 191, 36, 0.4)",
      "--accent-color-dark": "#B45309",
      "--success-color": "#10B981",
      "--danger-color": "#EF4444",
      "--background-color": "#111827",
      "--surface-color": "#1F2937",
      "--surface-secondary-color": "#374151",
      "--background-color-light": "#374151",
      "--background-color-darker": "#111827",
      "--background-color-hover": "#2D3748",
      "--text-color": "#F3F4F6",
      "--text-secondary-color": "#9CA3AF",
      "--text-light-color": "#FFFFFF",
      "--text-on-primary": "#FFFFFF",
      "--text-on-accent": "#111827",
      "--text-primary-color": "#F3F4F6",
      "--border-color": "#374151",
      "--border-subtle-color": "#1F2937",
      "--border-color-light": "#4B5563",
      "--quadrant-do-bg": "rgba(239, 68, 68, 0.1)",
      "--quadrant-schedule-bg": "rgba(59, 130, 246, 0.1)",
      "--quadrant-delegate-bg": "rgba(245, 158, 11, 0.1)",
      "--quadrant-eliminate-bg": "rgba(107, 114, 128, 0.1)",
      "--warning-color": "#FBBF24",
      "--info-color": "#3B82F6",
      "--primary-color-translucent": "rgba(59, 130, 246, 0.35)",
      "--surface-rgb": "31, 41, 55",
      "--text-rgb": "243, 244, 246",
      "--danger-color-translucent": "rgba(239, 68, 68, 0.15)",
    },
    preview: "linear-gradient(to bottom right, #1F2937, #111827)",
  },
};

const tu = (e) => {
  const t = parseInt(e.replace("#", ""), 16);
  return `${(t >> 16) & 255}, ${(t >> 8) & 255}, ${t & 255}`;
};

const io = (e) => {
  const t = tu(e.primary),
    n = tu(e.accent),
    s = (r, o) => `rgba(${r}, ${o})`;
  return {
    colors: {
      "--primary-color": e.primary,
      "--primary-color-hover": e.primaryHover,
      "--secondary-color": e.light ? s(t, 0.12) : e.surface2,
      "--accent-color": e.accent,
      "--accent-color-hover": e.accentHover,
      "--accent-color-light": e.accentLight,
      "--accent-color-glow": s(n, 0.35),
      "--accent-color-dark": e.accentDark,
      "--success-color": e.light ? "#10b981" : "#34D399",
      "--danger-color": "#EF4444",
      "--background-color": e.bg,
      "--surface-color": e.surface,
      "--surface-secondary-color": e.surface2,
      "--background-color-light": e.surface2,
      "--background-color-darker": e.light ? e.border : e.bg,
      "--background-color-hover": e.hover,
      "--text-color": e.text,
      "--text-secondary-color": e.muted,
      "--text-light-color": "#FFFFFF",
      "--text-on-primary": "#FFFFFF",
      "--text-on-accent": e.onAccent,
      "--text-primary-color": e.text,
      "--border-color": e.border,
      "--border-subtle-color": e.light ? e.surface2 : e.surface,
      "--border-color-light": e.borderLight,
      "--quadrant-do-bg": "rgba(239, 68, 68, 0.1)",
      "--quadrant-schedule-bg": s(t, 0.12),
      "--quadrant-delegate-bg": s(n, 0.12),
      "--quadrant-eliminate-bg": "rgba(107, 114, 128, 0.1)",
      "--warning-color": e.accent,
      "--info-color": e.primary,
      "--primary-color-translucent": s(t, 0.35),
      "--surface-rgb": tu(e.surface),
      "--text-rgb": tu(e.text),
      "--danger-color-translucent": "rgba(239, 68, 68, 0.15)",
    },
    preview: `linear-gradient(to bottom right, ${e.surface}, ${e.bg})`,
  };
};

Object.assign(Va, {
  "lagoa-theme": io({
    bg: "#0B1A1E",
    surface: "#12262B",
    surface2: "#1B343A",
    hover: "#183036",
    primary: "#2C9C91",
    primaryHover: "#248177",
    accent: "#F6E05E",
    accentHover: "#ECC94B",
    accentLight: "#FAF089",
    accentDark: "#B7791F",
    text: "#E6F4F1",
    muted: "#8FB3AE",
    border: "#1E3A40",
    borderLight: "#2A4E55",
    onAccent: "#0B1A1E",
  }),
  "regia-theme": io({
    light: true,
    bg: "#FFF5F7",
    surface: "#FFFFFF",
    surface2: "#FFF0F4",
    hover: "#FDE8EF",
    primary: "#2F855A",
    primaryHover: "#276749",
    accent: "#D53F8C",
    accentHover: "#B83280",
    accentLight: "#F687B3",
    accentDark: "#97266D",
    text: "#1F2933",
    muted: "#7B6470",
    border: "#FBD5E5",
    borderLight: "#FDE3EE",
    onAccent: "#FFFFFF",
  }),
  "musgo-theme": io({
    bg: "#141A12",
    surface: "#1E271B",
    surface2: "#2A3626",
    hover: "#253021",
    primary: "#5E8C2F",
    primaryHover: "#4F7727",
    accent: "#D4A373",
    accentHover: "#C08A57",
    accentLight: "#E6C7A5",
    accentDark: "#8C6239",
    text: "#EEF2E6",
    muted: "#A3AE96",
    border: "#2E3A29",
    borderLight: "#3C4B36",
    onAccent: "#141A12",
  }),
  "mare-theme": io({
    bg: "#0A1628",
    surface: "#11223A",
    surface2: "#1A2F4D",
    hover: "#172A45",
    primary: "#0E7FC0",
    primaryHover: "#0B6A9F",
    accent: "#FB923C",
    accentHover: "#F97316",
    accentLight: "#FDBA74",
    accentDark: "#C2410C",
    text: "#E8F1FA",
    muted: "#93A8C2",
    border: "#1E3554",
    borderLight: "#2A4568",
    onAccent: "#0A1628",
  }),
  "neblina-theme": io({
    light: true,
    bg: "#EEF2EF",
    surface: "#F9FBF9",
    surface2: "#F1F5F2",
    hover: "#E6ECE8",
    primary: "#4A7C59",
    primaryHover: "#3D6849",
    accent: "#B7703A",
    accentHover: "#9C5D2F",
    accentLight: "#D9A273",
    accentDark: "#7A4723",
    text: "#1E2A22",
    muted: "#66756B",
    border: "#D8E2DB",
    borderLight: "#E4EBE6",
    onAccent: "#FFFFFF",
  }),
  "ambar-theme": io({
    bg: "#1A1206",
    surface: "#261B0C",
    surface2: "#342512",
    hover: "#2E2110",
    primary: "#B7651B",
    primaryHover: "#9A5416",
    accent: "#FBD38D",
    accentHover: "#F6AD55",
    accentLight: "#FEEBC8",
    accentDark: "#C05621",
    text: "#FDF3E1",
    muted: "#BFA77F",
    border: "#3B2A12",
    borderLight: "#4A3518",
    onAccent: "#1A1206",
  }),
  "galaxia-theme": io({
    bg: "#0D0B1F",
    surface: "#1A1638",
    surface2: "#262050",
    hover: "#221C47",
    primary: "#7C5CE0",
    primaryHover: "#6847C9",
    accent: "#F472B6",
    accentHover: "#EC4899",
    accentLight: "#F9A8D4",
    accentDark: "#BE185D",
    text: "#EDE9FE",
    muted: "#A79FD0",
    border: "#2D2760",
    borderLight: "#3B3478",
    onAccent: "#0D0B1F",
  }),
});

export const nu = [
  {
    id: "dark-theme",
    name: "Escuro",
    price: 0,
    desc: "O tema de sempre.",
  },
  {
    id: "light-theme",
    name: "Claro",
    price: 0,
    desc: "Verde-menta, pra usar de dia.",
  },
  {
    id: "musgo-theme",
    name: "Musgo",
    price: 200,
    desc: "Floresta úmida, tons de terra.",
  },
  {
    id: "mare-theme",
    name: "Maré",
    price: 200,
    desc: "Azul fundo com boia laranja.",
  },
  {
    id: "lagoa-theme",
    name: "Lagoa à noite",
    price: 300,
    desc: "Verde-água e luz de vaga-lume.",
  },
  {
    id: "regia-theme",
    name: "Vitória-régia",
    price: 300,
    desc: "Rosa de flor sobre folha verde.",
  },
  {
    id: "neblina-theme",
    name: "Neblina",
    price: 400,
    desc: "Manhã cinza-verde, bem calma.",
  },
  {
    id: "ambar-theme",
    name: "Âmbar noturno",
    price: 500,
    desc: "Pouca luz azul, pra depois das 22h.",
  },
  {
    id: "galaxia-theme",
    name: "Galáxia",
    price: 800,
    desc: "O tema do Sapo Galáxia.",
    epic: true,
  },
];

const su = "focusfrog_theme_data_v2";

const iS = React.createContext(undefined);

export const useTheme = () => {
  const e = React.useContext(iS);
  if (!e) throw new Error("useTheme must be used within a ThemeProvider");
  return e;
};

const OI = {
  activeThemeId: "dark-theme",
  activeSoundId: "none",
  activeEffectId: "default",
  pontosFoco: 0,
  unlockedRewards: ["dark-theme", "none"],
};

export const ThemeProvider = ({ children: e }) => {
  const [t, n] = React.useState(OI),
    [s, r] = React.useState(true);
  React.useEffect(() => {
    try {
      const x = localStorage.getItem(su);
      x &&
        n((k) => ({
          ...k,
          ...JSON.parse(x),
        }));
    } catch (x) {
      console.error("Failed to load theme data from localStorage", x);
    }
    r(false);
  }, []),
    React.useEffect(() => {
      const x = Va[t.activeThemeId] || Va["dark-theme"],
        k = document.documentElement;
      Object.entries(x.colors).forEach(([y, p]) => {
        k.style.setProperty(y, p);
      });
    }, [t.activeThemeId]);
  const o = React.useCallback((x, k) => {
      n((y) => {
        const p = y[x],
          g = typeof k == "function" ? k(p) : k,
          b = {
            ...y,
            [x]: g,
          };
        try {
          localStorage.setItem(su, JSON.stringify(b));
        } catch (j) {
          console.error("Failed to save theme data", j);
        }
        return b;
      });
    }, []),
    a = React.useCallback(
      (x) => {
        o("activeThemeId", x);
      },
      [o]
    ),
    l = React.useCallback(
      (x) => {
        o("activeSoundId", x);
      },
      [o]
    ),
    c = React.useCallback(
      (x) => {
        o("pontosFoco", x);
      },
      [o]
    ),
    u = React.useCallback(
      (x) => {
        o("unlockedRewards", x);
      },
      [o]
    ),
    d = React.useCallback((x) => o("activeEffectId", x), [o]),
    f = React.useCallback(
      (x, k) => k === 0 || t.unlockedRewards.includes(x),
      [t.unlockedRewards]
    ),
    h = React.useCallback(
      (x, k) =>
        k === 0 || t.unlockedRewards.includes(x)
          ? "owned"
          : t.pontosFoco < k
          ? "insufficient"
          : (n((y) => {
              if (y.unlockedRewards.includes(x) || y.pontosFoco < k) return y;
              const p = {
                ...y,
                pontosFoco: y.pontosFoco - k,
                unlockedRewards: [...y.unlockedRewards, x],
              };
              try {
                localStorage.setItem(su, JSON.stringify(p));
              } catch {}
              return p;
            }),
            "ok"),
      [t.pontosFoco, t.unlockedRewards]
    ),
    m = React.useCallback(
      (x) =>
        x <= 0
          ? true
          : t.pontosFoco < x
          ? false
          : (n((k) => {
              if (k.pontosFoco < x) return k;
              const y = {
                ...k,
                pontosFoco: k.pontosFoco - x,
              };
              try {
                localStorage.setItem(su, JSON.stringify(y));
              } catch {}
              return y;
            }),
            true),
      [t.pontosFoco]
    ),
    v = {
      ...t,
      setActiveThemeId: a,
      setActiveSoundId: l,
      setPontosFoco: c,
      setUnlockedRewards: u,
      setActiveEffectId: d,
      buyItem: h,
      spendPoints: m,
      isUnlocked: f,
      loadingTheme: s,
    };
  return <iS.Provider value={v}>{e}</iS.Provider>;
};
