// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import { Capacitor } from '@capacitor/core';
import { FROG_SPECIES } from '../data/frogs';
import { H3 } from '../analytics';
import { Share } from '@capacitor/share';
import { Filesystem } from '@capacitor/filesystem';

function ZQ(e) {
  e.CapacitorUtils.Synapse = new Proxy({}, {
    get(t, n) {
      return new Proxy({}, {
        get(s, r) {
          return (o, a, l) => {
            const c = e.Capacitor.Plugins[n];
            if (c === undefined) {
              l(new Error(`Capacitor plugin ${n} not found`));
              return;
            }
            if (typeof c[r] != "function") {
              l(new Error(`Method ${r} not found in Capacitor plugin ${n}`));
              return;
            }
            (async () => {
              try {
                const u = await c[r](o);
                a(u);
              } catch (u) {
                l(u);
              }
            })();
          };
        }
      });
    }
  });
}

function QQ(e) {
  e.CapacitorUtils.Synapse = new Proxy({}, {
    get(t, n) {
      return e.cordova.plugins[n];
    }
  });
}

function XQ(e = false) {
  typeof window > "u" || (window.CapacitorUtils = window.CapacitorUtils || {}, window.Capacitor !== undefined && !e ? ZQ(window) : window.cordova !== undefined && QQ(window));
}

let Dg;

(function (e) {
  e.Documents = "DOCUMENTS", e.Data = "DATA", e.Library = "LIBRARY", e.Cache = "CACHE", e.External = "EXTERNAL", e.ExternalStorage = "EXTERNAL_STORAGE", e.ExternalCache = "EXTERNAL_CACHE", e.LibraryNoCloud = "LIBRARY_NO_CLOUD", e.Temporary = "TEMPORARY";
})(Dg || (Dg = {}));

let rb;

(function (e) {
  e.UTF8 = "utf8", e.ASCII = "ascii", e.UTF16 = "utf16";
})(rb || (rb = {}));

XQ();

const VT = "focusfrog.netlify.app";

const ob = {
  common: {
    label: "Comum",
    color: "#8BD150"
  },
  rare: {
    label: "Rara",
    color: "#4FC3F7"
  },
  epic: {
    label: "Épica",
    color: "#CE93D8"
  },
  legendary: {
    label: "Lendária",
    color: "#FBBF24"
  }
};

function tX(e, t, n, s, r) {
  const o = s / 100,
    a = u => t + (u - 50) * o,
    l = u => n + (u - 50) * o,
    c = (u, d, f, h, m, v = false) => {
      e.beginPath(), e.ellipse(a(u), l(d), f * o, h * o, 0, 0, Math.PI * 2), e.fillStyle = m, e.fill(), v && (e.lineWidth = 1.5 * o, e.strokeStyle = "rgba(0,0,0,.25)", e.stroke());
    };
  c(50, 88, 26, 6, "rgba(0,0,0,.28)"), c(28, 75, 12, 10, r.primary, true), c(72, 75, 12, 10, r.primary, true), c(50, 60, 30, 25, r.primary), e.globalAlpha = 0.8, c(50, 65, 20, 18, r.secondary), e.globalAlpha = 1, c(38, 80, 8, 6, r.primary, true), c(62, 80, 8, 6, r.primary, true);
  for (const u of [40, 60]) c(u, 45, 10, 10, "#fff"), c(u, 46, 5, 5, "#111"), c(u + 2, 43, 1.6, 1.6, "#fff");
  e.beginPath(), e.moveTo(a(45), l(68)), e.quadraticCurveTo(a(50), l(72), a(55), l(68)), e.lineWidth = 2 * o, e.lineCap = "round", e.strokeStyle = r.secondary, e.stroke();
}

async function nX(e, t) {
  var m, v;
  const n = FROG_SPECIES[e];
  if (!n) return null;
  const s = 1080,
    r = 1920,
    o = document.createElement("canvas");
  o.width = s, o.height = r;
  const a = o.getContext("2d");
  if (!a) return null;
  const l = ob[n.rarity] || ob.common,
    c = n.stages.adult.colors;
  try {
    await ((m = document.fonts) == null ? undefined : m.ready);
  } catch {}
  const u = "'Poppins', 'Inter', system-ui, sans-serif";
  a.fillStyle = "#0A120E", a.fillRect(0, 0, s, r);
  const d = a.createRadialGradient(s / 2, 860, 60, s / 2, 860, 760);
  d.addColorStop(0, c.primary + "AA"), d.addColorStop(1, "rgba(10,18,14,0)"), a.fillStyle = d, a.fillRect(0, 0, s, r), a.beginPath(), a.ellipse(s / 2, 1130, 360, 110, 0, 0.18, Math.PI * 2 - 0.18), a.lineTo(s / 2, 1130), a.closePath(), a.fillStyle = "#2F6B3A", a.fill(), a.textAlign = "center", a.fillStyle = "#F2EFE4", a.font = `600 52px ${u}`, a.fillText(t ? "Espécie nova na minha lagoa!" : "Mais um sapo na minha lagoa!", s / 2, 300), tX(a, s / 2, 860, 640, c), a.font = `700 44px ${u}`;
  const f = l.label.toUpperCase(),
    h = a.measureText(f).width + 80;
  return a.fillStyle = l.color + "33", a.strokeStyle = l.color, a.lineWidth = 4, a.beginPath(), (v = a.roundRect) == null || v.call(a, s / 2 - h / 2, 1290, h, 84, 42), a.fill(), a.stroke(), a.fillStyle = l.color, a.fillText(f, s / 2, 1347), a.fillStyle = "#F2EFE4", a.font = `800 96px ${u}`, a.fillText(n.name, s / 2, 1500), a.fillStyle = "#AABAAD", a.font = `500 46px ${u}`, a.fillText("Ganhei com foco no FocusFrog", s / 2, 1580), a.fillStyle = "#8BD150", a.font = `700 48px ${u}`, a.fillText(`${VT} · @focus.frog`, s / 2, 1780), new Promise(x => o.toBlob(k => x(k), "image/png"));
}

const sX = e => new Promise((t, n) => {
  const s = new FileReader();
  s.onload = () => t(String(s.result).split(",")[1] || ""), s.onerror = n, s.readAsDataURL(e);
});

export async function rX(e, t) {
  var r;
  const n = FROG_SPECIES[e],
    s = `${t ? "Descobri" : "Ganhei"} o ${(n == null ? undefined : n.name) ?? "um sapo novo"} no FocusFrog 🐸 Foco que vira sapo: https://${VT}`;
  try {
    const o = await nX(e, t);
    if (!o) return "failed";
    const a = `focusfrog-${e.toLowerCase()}.png`;
    if (Capacitor.isNativePlatform()) {
      const u = await Filesystem.writeFile({
        path: a,
        data: await sX(o),
        directory: Dg.Cache
      });
      return H3(e), await Share.share({
        title: "Meu sapo no FocusFrog",
        text: s,
        files: [u.uri],
        dialogTitle: "Compartilhar sapo"
      }), "shared";
    }
    const l = new File([o], a, {
      type: "image/png"
    });
    if ((r = navigator.canShare) != null && r.call(navigator, {
      files: [l]
    })) return await navigator.share({
      files: [l],
      text: s
    }), "shared";
    const c = document.createElement("a");
    return c.href = URL.createObjectURL(o), c.download = a, c.click(), "shared";
  } catch (o) {
    return /cancel|abort/i.test(o instanceof Error ? o.message : String(o)) ? "cancelled" : "failed";
  }
}
