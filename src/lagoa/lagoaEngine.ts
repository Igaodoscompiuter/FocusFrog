// @ts-nocheck
// Recuperado do build 2.4.9: motor da lagoa em PixiJS.
import { FROG_SPECIES as q, FROG_PATTERNS as Z } from '../data/frogs';
import { ZEN_FROG_COLORS as V } from '../components/zen/ZenFrog';
const n = (w, t) => w + Math.random() * (t - w),
  x = (w, t, s) => (w < t ? t : w > s ? s : w),
  M = (w, t, s) => w + (t - w) * s;
function Q(w, t, s) {
  const e = (i) => {
    const o = (i + w * 12) % 12,
      r = t * Math.min(s, 1 - s);
    return Math.round(255 * (s - r * Math.max(-1, Math.min(o - 3, 9 - o, 1))));
  };
  return (e(0) << 16) | (e(8) << 8) | e(4);
}
const I = (w, t, s) => {
    const e = M((w >> 16) & 255, (t >> 16) & 255, s),
      i = M((w >> 8) & 255, (t >> 8) & 255, s),
      o = M(w & 255, t & 255, s);
    return ((e & 255) << 16) | ((i & 255) << 8) | (o | 0);
  },
  tt = (w, t, s) =>
    "#" +
    I(parseInt(w.slice(1), 16), parseInt(t.slice(1), 16), s)
      .toString(16)
      .padStart(6, "0"),
  G = (w, t) =>
    ((((w >> 16) & 255) * t) << 16) |
    ((((w >> 8) & 255) * t) << 8) |
    (((w & 255) * t) | 0),
  L = (w) => w[(Math.random() * w.length) | 0];
class v {
  constructor(t, s, e, i = 0) {
    ((this.k1 = 0),
      (this.k2 = 0),
      (this.k3 = 0),
      (this.yd = 0),
      this.set(t, s, e),
      (this.xp = i),
      (this.y = i));
  }
  set(t, s, e) {
    ((this.k1 = s / (Math.PI * t)),
      (this.k2 = 1 / (2 * Math.PI * t) ** 2),
      (this.k3 = (e * s) / (2 * Math.PI * t)));
  }
  update(t, s) {
    const e = (s - this.xp) / t;
    this.xp = s;
    const i = Math.max(this.k2, (t * t) / 2 + (t * this.k1) / 2, t * this.k1);
    return (
      (this.y += t * this.yd),
      (this.yd += (t * (s + this.k3 * e - this.y - this.k1 * this.yd)) / i),
      this.y
    );
  }
}
const st = {
  equilibrado: { sod: [2.2, 0.45, 0], water: 0.25, prefer: "any" },
  agitado: { sod: [3.6, 0.28, 1.4], water: 0.12, prefer: "near" },
  explorador: { sod: [2.6, 0.5, 0.5], water: 0.35, prefer: "far" },
  timido: { sod: [1.6, 0.75, 0], water: 0.05, prefer: "near" },
  zen: { sod: [1.1, 0.9, 0], water: 0.02, prefer: "any" },
  cosmico: { sod: [1.3, 0.32, -0.6], water: 0.08, prefer: "far" },
  dorminhoco: { sod: [1.2, 0.85, 0], water: 0.03, prefer: "near" },
  nadador: { sod: [2.4, 0.5, 0.3], water: 0.65, prefer: "any" },
  cantor: { sod: [2.2, 0.45, 0], water: 0.2, prefer: "any", croak: 2.6 },
  cacador: { sod: [3, 0.4, 0.6], water: 0.2, prefer: "near", hunt: 1.8 },
};
function et(w) {
  const t = V[w] || V.DEFAULT,
    s = q[w],
    e = st[(s == null ? void 0 : s.trait) || "equilibrado"] || {};
  return {
    sod: e.sod || [2.2, 0.45, 0],
    idle: [(t.moveInterval.min / 1e3) * 0.3, (t.moveInterval.max / 1e3) * 0.3],
    water: e.water ?? 0.2,
    reach: [
      Math.max(50, t.jumpDistance.min * 3),
      Math.max(120, t.jumpDistance.max * 5),
    ],
    prefer: e.prefer || "any",
    epic:
      (s == null ? void 0 : s.special) ||
      ((s == null ? void 0 : s.rarity) === "epic" ||
      (s == null ? void 0 : s.rarity) === "legendary"
        ? "stars"
        : void 0),
    rare: (s == null ? void 0 : s.rarity) === "rare",
    croak: e.croak ?? 1,
    hunt: e.hunt ?? 1,
  };
}
const K =
    "M50 6 C74 6 92 16 94 42 C96 66 82 92 56 94 C30 96 8 78 6 52 C4 28 26 6 50 6 Z",
  it = [
    [0.27, 0.2, 34, 0],
    [0.7, 0.17, 30, 1],
    [0.48, 0.36, 40, 2],
    [0.81, 0.4, 32, 0],
    [0.21, 0.47, 33, 1],
    [0.62, 0.58, 37, 2],
    [0.33, 0.7, 31, 0],
    [0.77, 0.76, 33, 1],
    [0.5, 0.86, 29, 2],
  ],
  at = ["#2f8f5b", "#3aa568", "#279874"],
  ot = [
    ["#e8641a", "#fff6ea", "#1c1c1c"],
    ["#f2f0ea", "#e8641a", "#1c1c1c"],
    ["#d9431c", "#ffd27a", "#ffffff"],
  ],
  S = 1 / 60;
class $ {
  constructor(t, s, e, i) {
    ((this.W = 0),
      (this.H = 0),
      (this.TEX = {}),
      (this.layers = {}),
      (this.water = { cols: 0, rows: 0 }),
      (this.pondShape = { cx: 0, cy: 0, rx: 1, ry: 1 }),
      (this.state = {
        night: !1,
        nightAmt: 0,
        nightSod: new v(0.6, 1, 0, 0),
        calm: !1,
        level: 2,
        auto: !0,
        wind: 0,
        windSod: new v(0.4, 0.9, 0, 0),
        windDir: 1,
        gustT: n(4, 9),
        gustOn: 0,
        raining: Math.random() < 0.15,
        rainAmt: 0,
        rainSod: new v(0.25, 1, 0, 0),
        rainT: n(45, 90),
      }),
      (this.streaks = []),
      (this.rings = []),
      (this.pads = []),
      (this.fish = []),
      (this.flies = []),
      (this.frogs = []),
      (this.pool = []),
      (this.live = []),
      (this.reeds = []),
      (this.floats = []),
      (this.acc = 0),
      (this.t = 0),
      (this.frameDt = S),
      (this.fpsAcc = 0),
      (this.fpsN = 0),
      (this.fpsWin = 0),
      (this.lowStreak = 0),
      (this.destroyed = !1),
      (this.onVis = () => {
        document.hidden ? this.app.ticker.stop() : this.app.ticker.start();
      }),
      (this.PIXI = t),
      (this.app = s),
      (this.host = e),
      (this.cb = i));
  }
  static async create(t, s) {
    let e;
    try {
      e = await import('pixi.js');
    } catch {
      return null;
    }
    const i = new e.Application();
    try {
      await i.init({
        resizeTo: t,
        antialias: !0,
        backgroundColor: 863018,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        autoDensity: !0,
        preference: "webgl",
      });
    } catch {
      return null;
    }
    const o = new $(e, i, t, s);
    return (o.boot(), o);
  }
  S() {
    return x(Math.min(this.W / 390, this.H / 640), 0.75, 1.35);
  }
  depthScale(t) {
    return 0.84 + 0.28 * x(t / this.H, 0, 1);
  }
  frogK(t, s) {
    return this.depthScale(t) * this.S() * 0.56 * (s ? s.size : 1);
  }
  canvasTex(t, s, e, i = 2) {
    const o = this.PIXI,
      r = document.createElement("canvas");
    ((r.width = Math.ceil(t * i)), (r.height = Math.ceil(s * i)));
    const u = r.getContext("2d");
    return (
      u.scale(i, i),
      e(u, t, s),
      new o.Texture({
        source: new o.CanvasSource({ resource: r, resolution: i }),
      })
    );
  }
  boot() {
    var d;
    const t = this.PIXI,
      s = this.app;
    (this.host.appendChild(s.canvas),
      (s.canvas.style.display = "block"),
      (this.W = s.screen.width),
      (this.H = s.screen.height),
      (this.state.calm =
        ((d = window.matchMedia) == null
          ? void 0
          : d.call(window, "(prefers-reduced-motion: reduce)").matches) ?? !1));
    const e = new Date().getHours();
    ((this.state.night = e >= 18 || e < 6),
      (this.state.nightAmt = this.state.night ? 1 : 0),
      (this.state.nightSod = new v(0.6, 1, 0, this.state.nightAmt)));
    const i = this.TEX;
    ((i.dot = this.canvasTex(16, 16, (a) => {
      const l = a.createRadialGradient(8, 8, 0, 8, 8, 8);
      (l.addColorStop(0, "rgba(255,255,255,1)"),
        l.addColorStop(0.5, "rgba(255,255,255,.7)"),
        l.addColorStop(1, "rgba(255,255,255,0)"),
        (a.fillStyle = l),
        a.fillRect(0, 0, 16, 16));
    })),
      (i.glow = this.canvasTex(64, 64, (a) => {
        const l = a.createRadialGradient(32, 32, 0, 32, 32, 32);
        (l.addColorStop(0, "rgba(255,255,255,.9)"),
          l.addColorStop(0.35, "rgba(255,255,255,.35)"),
          l.addColorStop(1, "rgba(255,255,255,0)"),
          (a.fillStyle = l),
          a.fillRect(0, 0, 64, 64));
      })),
      (i.shadow = this.canvasTex(48, 20, (a) => {
        const l = a.createRadialGradient(24, 10, 0, 24, 10, 22);
        (l.addColorStop(0, "rgba(0,0,0,.55)"),
          l.addColorStop(1, "rgba(0,0,0,0)"),
          (a.fillStyle = l),
          a.save(),
          a.scale(1, 0.45),
          a.beginPath(),
          a.arc(24, 22, 22, 0, 7),
          a.restore(),
          a.fill());
      })),
      (i.star = this.canvasTex(14, 14, (a) => {
        ((a.fillStyle = "#fff"), a.beginPath());
        for (let l = 0; l < 8; l++) {
          const h = (l * Math.PI) / 4,
            c = l % 2 ? 2 : 7;
          a.lineTo(7 + Math.cos(h) * c, 7 + Math.sin(h) * c);
        }
        a.fill();
      })),
      (i.throat = this.canvasTex(16, 12, (a) => {
        ((a.fillStyle = "rgba(255,248,220,.9)"),
          a.beginPath(),
          a.ellipse(8, 6, 7.5, 5.5, 0, 0, 7),
          a.fill(),
          (a.strokeStyle = "rgba(0,0,0,.15)"),
          a.stroke());
      })),
      (i.ring = this.canvasTex(64, 64, (a) => {
        ((a.strokeStyle = "rgba(255,214,90,1)"),
          (a.lineWidth = 3),
          a.beginPath(),
          a.arc(32, 32, 28, 0, 7),
          a.stroke());
      })));
    const o = this.layers;
    ((o.under = new t.Container()),
      (o.bed = new t.Sprite()),
      (o.caustA = new t.TilingSprite({
        texture: t.Texture.WHITE,
        width: 10,
        height: 10,
      })),
      (o.caustB = new t.TilingSprite({
        texture: t.Texture.WHITE,
        width: 10,
        height: 10,
      })),
      (o.padShadows = new t.Container()),
      (o.fishLayer = new t.Container()),
      (o.waterTint = new t.Sprite(t.Texture.WHITE)),
      (o.moon = new t.Sprite(i.glow)),
      o.under.addChild(
        o.bed,
        o.caustA,
        o.caustB,
        o.padShadows,
        o.fishLayer,
        o.waterTint,
        o.moon,
      ),
      (o.surfaceShade = new t.Sprite()),
      (o.world = new t.Container()),
      (o.world.sortableChildren = !0),
      (o.fireLayer = new t.Container()),
      (o.shore = new t.Graphics()),
      (o.reedsG = new t.Graphics()),
      (o.dispSprite = new t.Sprite()),
      (o.dispSprite.renderable = !1),
      (o.rainShade = new t.Sprite(t.Texture.WHITE)),
      (o.rainShade.tint = 1780282),
      (o.rainShade.alpha = 0),
      (o.rainG = new t.Graphics()),
      (o.rainRings = new t.Graphics()),
      s.stage.addChild(
        o.under,
        o.surfaceShade,
        o.rainRings,
        o.world,
        o.fireLayer,
        o.shore,
        o.reedsG,
        o.rainShade,
        o.rainG,
        o.dispSprite,
      ),
      (this.dispFilter = new t.DisplacementFilter({
        sprite: o.dispSprite,
        scale: 16,
      })));
    for (let a = 0; a < 220; a++) {
      const l = new t.Sprite(i.dot);
      (l.anchor.set(0.5),
        (l.visible = !1),
        o.world.addChild(l),
        this.pool.push(l));
    }
    ((this.pads = it.map(([a, l, h, c], y) => {
      const g = new t.Sprite(this.padTex(at[c], y === 3));
      g.anchor.set(0.5);
      const p = new t.Sprite(this.padShadowTex());
      return (
        p.anchor.set(0.5),
        (p.alpha = 0.8),
        o.world.addChild(g),
        o.padShadows.addChild(p),
        {
          nx: a,
          ny: l,
          r0: h,
          r: h,
          x: 0,
          y: 0,
          hx: 0,
          hy: 0,
          vx: 0,
          vy: 0,
          rot: n(0, 6.28),
          rotV: n(-0.04, 0.04),
          sink: new v(2.4, 0.35, 0),
          tx: new v(2, 0.3, 0),
          ty: new v(2, 0.3, 0),
          occupant: null,
          reserved: null,
          sprite: g,
          sh: p,
        }
      );
    })),
      (this.fish = ot.map(([a, l, h]) => {
        const g = Array.from({ length: 12 }, () => new t.Point()),
          p = this.fishTex(a, l, h),
          m = new t.MeshRope({ texture: p, points: g });
        ((m.tint = 0), (m.alpha = 0.22), m.position.set(6, 10));
        const f = new t.MeshRope({ texture: p, points: g });
        return (
          o.fishLayer.addChild(m, f),
          {
            N: 12,
            seg: 4.4,
            pts: g,
            spine: Array.from({ length: 12 }, () => ({ x: 0, y: 0 })),
            rope: f,
            shadow: m,
            x: 0,
            y: 0,
            a: n(0, 6.28),
            speed: new v(0.8, 1, 0, 30),
            want: 30,
            wander: n(0, 6.28),
            phase: n(0, 6),
            fleeT: 0,
            fx: 0,
            fy: 0,
            surfaceT: n(8, 20),
          }
        );
      })),
      (this.flies = Array.from({ length: 10 }, () => {
        const a = new t.Sprite(i.glow);
        return (
          a.anchor.set(0.5),
          (a.blendMode = "add"),
          (a.tint = 16179834),
          o.fireLayer.addChild(a),
          {
            s: a,
            x: 0,
            y: 0,
            z: n(16, 46),
            a: n(0, 6.28),
            ph: n(0, 6),
            alive: !0,
            respawn: 0,
          }
        );
      })),
      this.buildScene(),
      this.layoutPads(),
      this.placeFish(),
      this.placeFlies(),
      this.buildReeds(),
      this.setLevel(2),
      (s.stage.eventMode = "static"),
      (s.stage.hitArea = s.screen));
    try {
      s.renderer.events.autoPreventDefault = !1;
    } catch {}
    s.canvas.style.touchAction = "pan-y";
    let r = null;
    (s.stage.on("pointerdown", (a) => {
      r = {
        x: a.global.x,
        y: a.global.y,
        t: performance.now(),
        id: a.pointerId,
      };
    }),
      s.stage.on("pointerup", (a) => {
        const l = r;
        ((r = null),
          !(!l || l.id !== a.pointerId) &&
            Math.hypot(a.global.x - l.x, a.global.y - l.y) < 12 &&
            performance.now() - l.t < 600 &&
            this.onPointer(a.global.x, a.global.y));
      }),
      s.stage.on("pointerupoutside", () => {
        r = null;
      }),
      s.canvas.addEventListener("pointercancel", () => {
        r = null;
      }),
      s.ticker.add((a) => this.tick(a.deltaMS)),
      document.addEventListener("visibilitychange", this.onVis));
    let u;
    ((this.ro = new ResizeObserver(() => {
      (clearTimeout(u),
        (u = setTimeout(() => {
          if (this.destroyed) return;
          this.app.resize();
          const a = this.app.screen.width,
            l = this.app.screen.height;
          if (!(Math.abs(a - this.W) < 2 && Math.abs(l - this.H) < 2)) {
            ((this.W = a),
              (this.H = l),
              this.buildScene(),
              this.layoutPads(),
              this.placeFlies(),
              this.buildReeds(),
              this.setLevel(this.state.level));
            for (const h of this.frogs)
              h.pad && ((h.x = h.pad.hx), (h.y = h.pad.hy));
          }
        }, 200)));
    })),
      this.ro.observe(this.host));
  }
  destroy() {
    var t;
    if (!this.destroyed) {
      ((this.destroyed = !0),
        document.removeEventListener("visibilitychange", this.onVis),
        (t = this.ro) == null || t.disconnect());
      try {
        this.app.destroy(!0, { children: !0, texture: !0 });
      } catch {}
    }
  }
  padTex(t, s) {
    return this.canvasTex(100, 100, (e) => {
      const i = new Path2D(K),
        o = e.createRadialGradient(42, 40, 4, 50, 50, 52);
      (o.addColorStop(0, tt(t, "#d9f5c4", 0.25)),
        o.addColorStop(1, t),
        (e.fillStyle = o),
        e.fill(i),
        e.save(),
        e.clip(i),
        (e.fillStyle = "#0f3d36"),
        e.beginPath(),
        e.moveTo(50, 50),
        e.lineTo(96, 40),
        e.lineTo(96, 60),
        e.closePath(),
        e.fill(),
        (e.strokeStyle = "rgba(255,255,255,.18)"),
        (e.lineWidth = 1.4));
      for (const r of [-1.6, -2.5, 2.9, 2.1, 1.3, -0.8])
        (e.beginPath(),
          e.moveTo(50, 50),
          e.lineTo(50 + Math.cos(r) * 44, 50 + Math.sin(r) * 44),
          e.stroke());
      if (
        (e.restore(),
        (e.strokeStyle = "rgba(0,0,0,.25)"),
        (e.lineWidth = 1.5),
        e.stroke(i),
        (e.strokeStyle = "rgba(255,255,255,.18)"),
        (e.lineWidth = 1),
        e.stroke(i),
        s)
      ) {
        for (let r = 0; r < 8; r++)
          (e.save(),
            e.translate(30, 34),
            e.rotate((r * Math.PI) / 4),
            (e.fillStyle = r % 2 ? "#f3a6c8" : "#fbd0e2"),
            e.beginPath(),
            e.ellipse(0, -8, 4.5, 9, 0, 0, 7),
            e.fill(),
            e.restore());
        ((e.fillStyle = "#ffd54a"),
          e.beginPath(),
          e.arc(30, 34, 4, 0, 7),
          e.fill());
      }
    });
  }
  padShadowTex() {
    return this.canvasTex(
      100,
      100,
      (t) => {
        ((t.filter = "blur(5px)"),
          (t.fillStyle = "rgba(0,10,8,.55)"),
          t.fill(new Path2D(K)));
      },
      1,
    );
  }
  fishTex(t, s, e) {
    return this.canvasTex(64, 22, (i) => {
      ((i.fillStyle = t),
        i.beginPath(),
        i.moveTo(2, 11),
        i.bezierCurveTo(4, 2, 22, 1, 34, 4),
        i.bezierCurveTo(44, 6, 50, 9, 52, 11),
        i.bezierCurveTo(50, 13, 44, 16, 34, 18),
        i.bezierCurveTo(22, 21, 4, 20, 2, 11),
        i.fill(),
        (i.globalAlpha = 0.85),
        i.beginPath(),
        i.moveTo(50, 11),
        i.bezierCurveTo(56, 4, 60, 1, 63, 0),
        i.bezierCurveTo(61, 8, 61, 14, 63, 22),
        i.bezierCurveTo(60, 21, 56, 18, 50, 11),
        i.fill(),
        (i.globalAlpha = 1),
        (i.fillStyle = s),
        i.beginPath(),
        i.ellipse(16, 8, 6, 3.2, -0.2, 0, 7),
        i.fill(),
        (i.fillStyle = e),
        i.beginPath(),
        i.ellipse(30, 14, 5, 2.6, 0.3, 0, 7),
        i.fill(),
        (i.fillStyle = s),
        i.beginPath(),
        i.ellipse(40, 9, 3.5, 2, 0, 0, 7),
        i.fill(),
        (i.fillStyle = "rgba(255,255,255,.22)"),
        i.beginPath(),
        i.ellipse(18, 6, 12, 2, 0, 0, 7),
        i.fill(),
        (i.fillStyle = "#111"),
        i.beginPath(),
        i.arc(6, 8.5, 1.3, 0, 7),
        i.arc(6, 13.5, 1.3, 0, 7),
        i.fill());
    });
  }
  qualityCols() {
    return [40, 56, 76][this.state.level];
  }
  buildWater(t) {
    const s = this.PIXI,
      e = this.water,
      i = this.layers;
    ((e.cols = t), (e.rows = Math.max(16, Math.round((t * this.H) / this.W))));
    const o = e.cols * e.rows;
    ((e.cur = new Float32Array(o)), (e.prev = new Float32Array(o)));
    for (const r of ["d", "s"]) {
      const u = document.createElement("canvas");
      ((u.width = e.cols),
        (u.height = e.rows),
        (e[r + "Canvas"] = u),
        (e[r + "Ctx"] = u.getContext("2d")),
        (e[r + "Img"] = e[r + "Ctx"].createImageData(e.cols, e.rows)),
        (e[r + "Tex"] = new s.Texture({
          source: new s.CanvasSource({ resource: u, resolution: 1 }),
        })));
    }
    ((i.dispSprite.texture = e.dTex),
      (i.dispSprite.width = this.W),
      (i.dispSprite.height = this.H),
      (i.surfaceShade.texture = e.sTex),
      (i.surfaceShade.width = this.W),
      (i.surfaceShade.height = this.H));
  }
  disturb(t, s, e, i) {
    const { cols: o, rows: r, cur: u } = this.water;
    if (!u) return;
    const d = (t / this.W) * o,
      a = (s / this.H) * r,
      l = Math.max(1, (e / this.W) * o),
      h = Math.max(1, (d - l) | 0),
      c = Math.min(o - 2, (d + l + 1) | 0),
      y = Math.max(1, (a - l) | 0),
      g = Math.min(r - 2, (a + l + 1) | 0);
    for (let p = y; p <= g; p++)
      for (let m = h; m <= c; m++) {
        const f = Math.hypot(m - d, p - a);
        f > l ||
          (u[p * o + m] += i * (0.5 + 0.5 * Math.cos((f / l) * Math.PI)));
      }
  }
  sampleH(t, s) {
    const e = this.water,
      i = x(((t / this.W) * e.cols) | 0, 0, e.cols - 1),
      o = x(((s / this.H) * e.rows) | 0, 0, e.rows - 1);
    return e.cur[o * e.cols + i];
  }
  stepWater() {
    const t = this.water,
      { cols: s, rows: e } = t,
      i = t.cur,
      o = t.prev,
      r = this.state.calm ? 0.975 : 0.986;
    for (let u = 1; u < e - 1; u++) {
      let d = u * s + 1;
      for (let a = 1; a < s - 1; a++, d++) {
        const l = (i[d - 1] + i[d + 1] + i[d - s] + i[d + s]) * 0.5 - o[d];
        o[d] = l * r;
      }
    }
    ((t.cur = o), (t.prev = i));
  }
  paintWater() {
    const t = this.water,
      { cols: s, rows: e, cur: i } = t,
      o = t.dImg.data,
      r = t.sImg.data,
      u = 14,
      d = this.state.nightAmt;
    for (let a = 0; a < e; a++)
      for (let l = 0; l < s; l++) {
        const h = a * s + l,
          c = h * 4,
          y = (l > 0 ? i[h - 1] : 0) - (l < s - 1 ? i[h + 1] : 0),
          g = (a > 0 ? i[h - s] : 0) - (a < e - 1 ? i[h + s] : 0);
        ((o[c] = x(128 + y * u, 0, 255)),
          (o[c + 1] = x(128 + g * u, 0, 255)),
          (o[c + 2] = 128),
          (o[c + 3] = 255));
        const p = (y - g) * 0.075;
        p > 0
          ? ((r[c] = 235),
            (r[c + 1] = M(255, 225, d)),
            (r[c + 2] = 255),
            (r[c + 3] = x(p * 255, 0, 150)))
          : ((r[c] = 0),
            (r[c + 1] = 18),
            (r[c + 2] = 30),
            (r[c + 3] = x(-p * 200, 0, 110)));
      }
    (t.dCtx.putImageData(t.dImg, 0, 0),
      t.sCtx.putImageData(t.sImg, 0, 0),
      t.dTex.source.update(),
      t.sTex.source.update());
  }
  setLevel(t) {
    const s = this.layers;
    ((this.state.level = t),
      (s.under.filters = t >= 1 ? [this.dispFilter] : null),
      (s.caustA.visible = s.caustB.visible = t >= 2),
      this.buildWater(this.qualityCols()));
  }
  inPond(t, s, e = 0) {
    const i = this.pondShape,
      o = (t - i.cx) / (i.rx - e),
      r = (s - i.cy) / (i.ry - e);
    return o * o + r * r < 1;
  }
  buildScene() {
    const t = this.layers,
      s = this.W,
      e = this.H;
    ((this.pondShape = {
      cx: s / 2,
      cy: e / 2 + 6,
      rx: s / 2 - 12,
      ry: e / 2 - 22,
    }),
      (t.bed.texture = this.canvasTex(
        s,
        e,
        (a) => {
          const l = a.createRadialGradient(
            s / 2,
            e / 2,
            10,
            s / 2,
            e / 2,
            Math.max(s, e) * 0.62,
          );
          (l.addColorStop(0, "#0f4a4f"),
            l.addColorStop(0.55, "#1d6a5e"),
            l.addColorStop(0.85, "#5b8f6a"),
            l.addColorStop(1, "#8a9f6c"),
            (a.fillStyle = l),
            a.fillRect(0, 0, s, e));
          for (let h = 0; h < 70; h++) {
            const c = Math.random() * 7,
              y = Math.sqrt(Math.random()),
              g = s / 2 + Math.cos(c) * y * s * 0.5,
              p = e / 2 + Math.sin(c) * y * e * 0.5;
            ((a.fillStyle = `rgba(${n(10, 40) | 0},${n(40, 70) | 0},${n(50, 70) | 0},${n(0.25, 0.5)})`),
              a.beginPath(),
              a.ellipse(g, p, n(2, 9), n(1.5, 6), n(0, 3), 0, 7),
              a.fill());
          }
          ((a.strokeStyle = "rgba(8,40,30,.55)"), (a.lineCap = "round"));
          for (let h = 0; h < 26; h++) {
            const c = n(0, s),
              y = n(0, e);
            ((a.lineWidth = n(1.5, 3)),
              a.beginPath(),
              a.moveTo(c, y),
              a.bezierCurveTo(
                c + n(-12, 12),
                y - 14,
                c + n(-16, 16),
                y - 22,
                c + n(-10, 10),
                y - n(26, 44),
              ),
              a.stroke());
          }
        },
        1,
      )));
    const i = this.canvasTex(
      160,
      160,
      (a) => {
        ((a.strokeStyle = "rgba(200,255,240,.9)"),
          (a.lineWidth = 1.4),
          (a.lineCap = "round"));
        for (let l = 0; l < 46; l++) {
          const h = n(0, 160),
            c = n(0, 160),
            y = n(0, 7),
            g = n(8, 22);
          for (const p of [-160, 0, 160])
            for (const m of [-160, 0, 160])
              (a.beginPath(),
                a.moveTo(h + p, c + m),
                a.quadraticCurveTo(
                  h + p + Math.cos(y + 1) * g * 0.6,
                  c + m + Math.sin(y + 1) * g * 0.6,
                  h + p + Math.cos(y) * g,
                  c + m + Math.sin(y) * g,
                ),
                a.stroke());
        }
      },
      1,
    );
    for (const a of [t.caustA, t.caustB])
      ((a.texture = i), (a.width = s), (a.height = e), (a.blendMode = "add"));
    (t.caustB.tileScale.set(1.35),
      (t.waterTint.width = s),
      (t.waterTint.height = e),
      t.moon.anchor.set(0.5),
      t.moon.position.set(s * 0.7, e * 0.26),
      t.moon.scale.set(1.1 * this.S()));
    const o = t.shore;
    o.clear();
    const r = [],
      u = 90,
      d = this.pondShape;
    for (let a = 0; a < u; a++) {
      const l = (a / u) * Math.PI * 2,
        h = 1 + 0.028 * Math.sin(l * 5 + 0.7) + 0.018 * Math.sin(l * 11 + 2.1);
      r.push(
        d.cx + Math.cos(l) * (d.rx + 6) * h,
        d.cy + Math.sin(l) * (d.ry + 6) * h,
      );
    }
    (o.rect(0, 0, s, e).fill(3103290),
      o.poly(r).cut(),
      o.poly(r).stroke({ width: 6, color: 1850154, alpha: 0.9 }),
      o.poly(r).stroke({ width: 2, color: 10276762, alpha: 0.35 }));
    for (let a = 0; a < 60; a++) {
      const l = n(0, 7),
        h = n(1.04, 1.25),
        c = d.cx + Math.cos(l) * d.rx * h,
        y = d.cy + Math.sin(l) * d.ry * h;
      if (!(c < 0 || c > s || y < 0 || y > e))
        for (let g = -1; g <= 1; g++)
          o.moveTo(c + g * 2, y).lineTo(c + g * 3.5, y - n(5, 10));
    }
    (o.stroke({ width: 1.6, color: 6134364, alpha: 0.8, cap: "round" }),
      this.buildWater(this.qualityCols()));
  }
  layoutPads() {
    for (const t of this.pads)
      ((t.r = t.r0 * this.S()),
        (t.hx = t.nx * this.W),
        (t.hy = t.ny * this.H),
        (t.x = t.hx),
        (t.y = t.hy),
        (t.vx = t.vy = 0));
  }
  padImpulse(t, s, e, i) {
    ((t.sink.yd += 1.6 * i),
      (t.tx.yd += (s / t.r) * 4 * i),
      (t.ty.yd += (e / t.r) * 4 * i),
      this.disturb(t.x + s * 0.6, t.y + e * 0.6, t.r * 1.25, 2.2 * i));
  }
  updatePads(t, s) {
    const e = this.state;
    for (const i of this.pads) {
      const o = Math.sin(s * 0.3 + i.nx * 9) * 2;
      let r = (i.hx - i.x) * 0.35 + e.wind * e.windDir * 14 + o,
        u = (i.hy - i.y) * 0.35;
      for (const m of this.pads) {
        if (m === i) continue;
        const f = i.x - m.x,
          b = i.y - m.y,
          T = Math.hypot(f, b),
          C = i.r + m.r + 4;
        T < C &&
          T > 0.01 &&
          ((r += (f / T) * (C - T) * 6), (u += (b / T) * (C - T) * 6));
      }
      ((i.vx = (i.vx + r * t) * 0.97),
        (i.vy = (i.vy + u * t) * 0.97),
        (i.x += i.vx * t),
        (i.y += i.vy * t),
        (i.rot += (i.rotV + e.wind * 0.05 * e.windDir) * t));
      const d = i.occupant,
        a = i.sink.update(t, d ? 0.05 * d.size : 0),
        l = i.tx.update(t, d ? (d.seatX / i.r) * 0.12 : 0),
        h = i.ty.update(t, d ? (d.seatY / i.r) * 0.12 : 0),
        c = this.sampleH(i.x, i.y) * 0.012,
        y = this.depthScale(i.y),
        g = ((i.r * 2) / 100) * y * (1 - a * 0.5);
      (i.sprite.position.set(i.x + l * 6, i.y + a * 8 + h * 6),
        i.sprite.scale.set(
          g * (1 - Math.abs(l) * 0.25 + c),
          g * (1 - Math.abs(h) * 0.25 - c),
        ),
        (i.sprite.rotation = i.rot + l * 0.25));
      const p = 1 - x(a * 2.2, 0, 0.3);
      ((i.sprite.tint = G(
        I(16777215, 11057368, e.nightAmt * 0.8) & 16777215,
        p,
      )),
        (i.sprite.zIndex = i.y),
        i.sh.position.set(i.sprite.x + 7, i.sprite.y + 12),
        i.sh.scale.set(g * 1.05),
        (i.sh.rotation = i.sprite.rotation));
    }
  }
  freePads(t) {
    return this.pads.filter((s) => !s.occupant && !s.reserved && s !== t);
  }
  placeFish() {
    const t = this.pondShape;
    for (const s of this.fish) {
      ((s.x = t.cx + n(-0.5, 0.5) * t.rx), (s.y = t.cy + n(-0.5, 0.5) * t.ry));
      for (const e of s.spine) ((e.x = s.x), (e.y = s.y));
    }
  }
  updateFish(t) {
    const s = this.state,
      e = this.pondShape;
    for (const i of this.fish) {
      ((i.want = s.calm ? 22 : 34), (i.wander += n(-1, 1) * 1.6 * t));
      let o = i.a + Math.sin(i.wander) * 0.9;
      this.inPond(i.x, i.y, 46) || (o = Math.atan2(e.cy - i.y, e.cx - i.x));
      for (const h of this.fish) {
        if (h === i) continue;
        Math.hypot(h.x - i.x, h.y - i.y) < 42 &&
          (o = Math.atan2(i.y - h.y, i.x - h.x));
      }
      i.fleeT > 0 &&
        ((i.fleeT -= t),
        (o = Math.atan2(i.y - i.fy, i.x - i.fx)),
        (i.want = 150),
        this.inPond(i.x, i.y, 30) || (o = Math.atan2(e.cy - i.y, e.cx - i.x)));
      const r = ((o - i.a + Math.PI * 3) % (Math.PI * 2)) - Math.PI,
        u = (i.fleeT > 0 ? 6 : 1.8) * t;
      i.a += x(r, -u, u);
      const d = i.speed.update(t, i.want);
      ((i.x += Math.cos(i.a) * d * t), (i.y += Math.sin(i.a) * d * t));
      const a = i.spine;
      ((a[0].x = i.x), (a[0].y = i.y));
      for (let h = 1; h < i.N; h++) {
        const c = a[h].x - a[h - 1].x,
          y = a[h].y - a[h - 1].y,
          g = Math.hypot(c, y) || 1;
        ((a[h].x = a[h - 1].x + (c / g) * i.seg),
          (a[h].y = a[h - 1].y + (y / g) * i.seg));
      }
      i.phase += t * (3 + d * 0.07);
      const l = 1.2 + d * 0.022;
      for (let h = 0; h < i.N; h++) {
        const c = Math.min(h, i.N - 2),
          y = -(a[c + 1].y - a[c].y),
          g = a[c + 1].x - a[c].x,
          p = Math.hypot(y, g) || 1,
          m = Math.sin(i.phase - h * 0.55) * l * Math.pow(h / i.N, 1.4);
        i.pts[h].set(a[h].x + (y / p) * m, a[h].y + (g / p) * m);
      }
      if (
        ((i.rope.alpha = M(0.92, 0.8, s.nightAmt)),
        (i.surfaceT -= t),
        i.surfaceT <= 0 && ((i.surfaceT = n(10, 22)), !s.calm))
      ) {
        this.disturb(i.x, i.y, 10 * this.S(), 3);
        for (let h = 0; h < 4; h++)
          this.spawn(
            "bubble",
            i.x + n(-4, 4),
            i.y + n(-4, 4),
            0,
            n(-6, 6),
            n(-6, 6),
            0,
          );
      }
    }
  }
  scareFish(t, s) {
    for (const e of this.fish)
      Math.hypot(e.x - t, e.y - s) < 150 * this.S() &&
        ((e.fleeT = n(0.9, 1.5)), (e.fx = t), (e.fy = s));
  }
  spawn(t, s, e, i, o, r, u, d) {
    const a = this.pool.pop();
    if (!a) return;
    const l = this.TEX,
      h = {
        kind: t,
        sp: a,
        x: s,
        y: e,
        z: i,
        vx: o,
        vy: r,
        vz: u,
        life: 0,
        max: 1,
      };
    ((a.visible = !0),
      (a.blendMode = "normal"),
      (a.alpha = 1),
      (a.rotation = 0),
      t === "drop" &&
        ((a.texture = l.dot),
        (a.tint = 14218495),
        a.scale.set(n(0.22, 0.38)),
        (h.max = 1.2)),
      t === "bubble" &&
        ((a.texture = l.dot),
        (a.tint = 15269880),
        a.scale.set(n(0.18, 0.3)),
        (h.max = n(0.8, 1.4))),
      t === "star" &&
        ((a.texture = l.star),
        (a.tint = d ?? L([16777215, 14275327, 16770984])),
        (a.blendMode = "add"),
        a.scale.set(n(0.35, 0.6)),
        (h.max = n(0.5, 0.9))),
      t === "spark" &&
        ((a.texture = l.dot),
        (a.tint = d ?? 16773555),
        (a.blendMode = "add"),
        a.scale.set(n(0.3, 0.5)),
        (h.max = 0.6)),
      t === "wisp" &&
        ((a.texture = l.glow),
        (a.tint = 15267071),
        (a.blendMode = "add"),
        a.scale.set(n(0.12, 0.2)),
        (h.max = n(0.8, 1.3))),
      t === "ring" &&
        ((a.texture = l.ring),
        (a.tint = 16777215),
        (a.blendMode = "add"),
        a.scale.set(0.2),
        (h.max = 0.9)),
      this.live.push(h));
  }
  updateParticles(t) {
    for (let s = this.live.length - 1; s >= 0; s--) {
      const e = this.live[s];
      if (((e.life += t), e.kind === "drop"))
        ((e.vz -= 520 * t),
          (e.z += e.vz * t),
          (e.x += e.vx * t),
          (e.y += e.vy * t),
          e.z <= 0 && (this.disturb(e.x, e.y, 5, 0.8), (e.life = 99)));
      else if (e.kind === "bubble")
        ((e.x += e.vx * t),
          (e.y += e.vy * t),
          (e.sp.alpha = 1 - e.life / e.max),
          e.sp.scale.set(0.18 + e.life * 0.35));
      else if (e.kind === "ring") {
        const i = e.life / e.max;
        (e.sp.scale.set(0.3 + i * 1.6), (e.sp.alpha = 1 - i));
      } else
        ((e.x += e.vx * t),
          (e.y += e.vy * t),
          (e.z += e.vz * t),
          (e.sp.alpha = 1 - e.life / e.max),
          (e.sp.rotation += 4 * t));
      (e.sp.position.set(e.x, e.y - e.z),
        (e.sp.zIndex = e.kind === "ring" ? -15e4 + e.y : 2e5),
        e.life >= e.max &&
          ((e.sp.visible = !1), this.pool.push(e.sp), this.live.splice(s, 1)));
    }
    for (let s = this.floats.length - 1; s >= 0; s--) {
      const e = this.floats[s];
      ((e.life += t),
        (e.txt.y = e.y - 20 - e.life * 26),
        (e.txt.alpha = x(1.4 - e.life * 1.4, 0, 1)),
        e.life > 1 && (e.txt.destroy(), this.floats.splice(s, 1)));
    }
  }
  placeFlies() {
    for (const t of this.flies)
      ((t.x = n(this.W * 0.15, this.W * 0.85)),
        (t.y = n(this.H * 0.15, this.H * 0.85)));
  }
  updateFlies(t, s) {
    const e = this.pondShape,
      i = this.state;
    for (const o of this.flies) {
      if (!o.alive) {
        ((o.respawn -= t),
          o.respawn <= 0 &&
            ((o.alive = !0),
            (o.x = n(this.W * 0.1, this.W * 0.9)),
            (o.y = n(this.H * 0.1, this.H * 0.9))),
          (o.s.visible = !1));
        continue;
      }
      ((o.a += n(-1, 1) * 2.4 * t),
        (o.x += Math.cos(o.a) * 14 * t),
        (o.y += Math.sin(o.a) * 10 * t),
        this.inPond(o.x, o.y, 10) ||
          (o.a = Math.atan2(e.cy - o.y, e.cx - o.x)));
      const r =
        0.5 + 0.5 * Math.sin(s * 3 + o.ph) * Math.sin(s * 1.3 + o.ph * 2);
      ((o.s.visible = i.nightAmt > 0.05),
        (o.s.alpha = i.nightAmt * (1 - i.rainAmt * 0.85) * (0.25 + 0.75 * r)),
        o.s.position.set(o.x, o.y - o.z - Math.sin(s * 1.7 + o.ph) * 4),
        o.s.scale.set(0.32 + r * 0.14));
    }
  }
  buildReeds() {
    const t = this.W,
      s = this.H,
      e = this.S();
    this.reeds = [];
    const i = (o, r, u, d, a) =>
      this.reeds.push({
        x: o,
        y: r,
        h: u,
        lean: d,
        cat: a,
        ph: n(0, 6),
        push: new v(1.4, 0.25, 0),
      });
    for (let o = 0; o < 6; o++)
      i(
        n(0, t * 0.16),
        s - n(0, 18),
        n(44, 78) * e,
        n(-0.1, 0.25),
        o % 3 === 0,
      );
    for (let o = 0; o < 5; o++)
      i(
        t - n(0, t * 0.14),
        s - n(0, 24),
        n(40, 72) * e,
        n(-0.25, 0.1),
        o % 2 === 0,
      );
    for (let o = 0; o < 3; o++)
      i(t - n(0, t * 0.12), n(30, 80), n(32, 54) * e, n(-0.2, 0.05), o === 1);
  }
  updateReeds(t, s) {
    const e = this.layers.reedsG,
      i = this.state;
    e.clear();
    const o = I(5214026, 2771514, i.nightAmt);
    for (const r of this.reeds) {
      const u = Math.sin(s * 1.2 + r.ph) * 0.05 + i.wind * i.windDir * 0.28,
        d = r.lean + u + r.push.update(t, 0);
      let a = r.x,
        l = r.y,
        h = -Math.PI / 2;
      const c = 6,
        y = r.h / c,
        g = [[a, l]];
      for (let p = 1; p <= c; p++)
        ((h = -Math.PI / 2 + d * Math.pow(p / c, 1.6)),
          (a += Math.cos(h) * y),
          (l += Math.sin(h) * y),
          g.push([a, l]));
      for (let p = 1; p < g.length; p++)
        e.moveTo(g[p - 1][0], g[p - 1][1])
          .lineTo(g[p][0], g[p][1])
          .stroke({ width: M(3.4, 1.2, p / c), color: o, cap: "round" });
      if (r.cat) {
        const [p, m] = g[c - 1];
        e.ellipse(p, m, 2.8, 7).fill(I(8014374, 4861984, i.nightAmt));
      }
    }
  }
  setFrogs(t) {
    if (this.destroyed) return;
    const s = new Map(t.map((e) => [e.id, e]));
    for (const e of [...this.frogs])
      !s.has(e.id) && !e.leaving && !e.merging && this.removeFrog(e);
    for (const e of t) {
      const i = this.frogs.find((o) => o.id === e.id);
      i
        ? ((i.count = e.count),
          (i.size = this.sizeFor(e.scale)),
          (e.mascotName || null) !== i.mascotName &&
            this.setMascot(i, e.mascotName || null))
        : this.makeFrog(e);
    }
  }
  sizeFor(t) {
    return x(0.85 + (t - 0.5) * 0.35, 0.85, 1.35);
  }
  makeFrog(t) {
    const s = this.PIXI,
      e = this.layers,
      i = this.TEX,
      o = q[t.speciesId] || q.JUNGLE,
      r = et(t.speciesId),
      u = parseInt(o.stages.adult.colors.primary.slice(1), 16),
      d = parseInt(o.stages.adult.colors.secondary.slice(1), 16),
      a = parseInt(o.stages.adult.colors.accent.slice(1), 16),
      l = { width: 1.5, color: 0, alpha: 0.25 },
      h = new s.Container(),
      c = new s.Sprite(i.glow);
    (c.anchor.set(0.5),
      (c.blendMode = "add"),
      c.position.set(0, -30),
      (c.tint =
        r.epic === "ghost"
          ? 14675967
          : r.epic === "stars"
            ? 9403391
            : r.epic === "crystal"
              ? 12580607
              : a),
      (c.visible = !!r.epic || !!r.rare));
    const y = new s.Container(),
      g = (z, A, W, H) => {
        const F = new s.Graphics().ellipse(0, 0, W, H).fill(u).stroke(l);
        return (F.position.set(z, A), F);
      },
      p = g(-22, -10, 12, 10),
      m = g(22, -10, 12, 10),
      f = new s.Graphics()
        .ellipse(0, -25, 30, 25)
        .fill(u)
        .ellipse(0, -20, 20, 18)
        .fill({ color: d, alpha: 0.8 });
    if (r.epic === "stars")
      for (let z = 0; z < 16; z++) {
        const A = n(0, 6.28),
          W = Math.sqrt(Math.random()),
          H = Math.cos(A) * W * 26,
          F = -25 + Math.sin(A) * W * 21;
        Math.hypot(H / 20, (F + 20) / 18) < 1 ||
          f
            .circle(H, F, n(0.6, 1.5))
            .fill({ color: 16777215, alpha: n(0.5, 1) });
      }
    const b = Z[o.pattern] || {},
      T = o.pattern === "speckles" ? 0 : a,
      C = o.pattern === "speckles" ? 0.35 : 0.6;
    for (const [z, A, W] of b.dots || [])
      f.circle(z, -25 + A, W).fill({ color: T, alpha: C });
    for (const [z, A, W, H, F, j] of b.stripes || [])
      f.moveTo(z, -25 + A)
        .quadraticCurveTo(W, -25 + H, F, -25 + j)
        .stroke({ width: 3.2, color: a, alpha: 0.55, cap: "round" });
    ((b.dots || b.stripes) &&
      f.ellipse(0, -20, 20, 18).fill({ color: d, alpha: 0.8 }),
      f
        .moveTo(-5, -17)
        .quadraticCurveTo(0, -13, 5, -17)
        .stroke({ width: 2, color: d, cap: "round" }));
    const N = g(-12, -5, 8, 6),
      X = g(12, -5, 8, 6),
      R = new s.Sprite(i.throat);
    (R.anchor.set(0.5, 0.2), (R.visible = !1), R.position.set(0, -14));
    const D = new s.Container();
    D.position.set(0, -40);
    const J = new s.Graphics()
        .circle(-10, 0, 10)
        .fill(16777215)
        .circle(10, 0, 10)
        .fill(16777215),
      O = new s.Graphics().circle(-10, 0, 5).fill(0).circle(10, 0, 5).fill(0);
    (D.addChild(J, O),
      y.addChild(p, m, f, N, X, R, D),
      r.epic === "ghost" && (y.alpha = 0.82),
      r.epic === "crystal" && (y.alpha = 0.86));
    const Y = new s.Graphics(),
      _ = new s.Graphics();
    h.addChild(c, y, Y, _);
    const E = new s.Sprite(i.shadow);
    (E.anchor.set(0.5), e.world.addChild(E, h));
    const k = this.freePads()[0] ? L(this.freePads()) : null,
      B = k || { x: this.pondShape.cx, y: this.pondShape.cy },
      P = {
        id: t.id,
        speciesId: t.speciesId,
        beh: r,
        count: t.count,
        size: this.sizeFor(t.scale),
        mascotName: null,
        label: null,
        c: h,
        aura: c,
        rig: y,
        backL: p,
        backR: m,
        body: f,
        frontL: N,
        frontR: X,
        throat: R,
        eyes: D,
        pupils: O,
        tongue: Y,
        deco: _,
        shadow: E,
        parts: [p, m, f, N, X],
        x: B.x,
        y: B.y,
        z: 0,
        seatX: k ? n(-0.12, 0.12) * k.r : 0,
        seatY: k ? -k.r * 0.05 : 0,
        state: "sit",
        timer: n(r.idle[0], r.idle[1]) * 0.5,
        pad: k,
        target: null,
        sy: new v(r.sod[0], r.sod[1], r.sod[2], 1),
        lookX: new v(1.5, 0.7, 0),
        lookY: new v(1.5, 0.7, 0),
        lookT: 0,
        lx: 0,
        ly: 0,
        blinkT: n(2, 5),
        blink: 0,
        croak: 0,
        air: null,
        swimTo: null,
        wakeT: 0,
        tongueT: -1,
        prey: null,
        trailT: 0,
        vz: 0,
        fade: 1,
      };
    return (
      k ? (k.occupant = P) : ((P.state = "swim"), (P.timer = 0.2)),
      t.entering && k && ((P.z = this.H * 0.5), (P.state = "drop"), (P.vz = 0)),
      this.frogs.push(P),
      t.mascotName && this.setMascot(P, t.mascotName),
      P
    );
  }
  setMascot(t, s) {
    const e = this.PIXI;
    if (
      ((t.mascotName = s), t.label && (t.label.destroy(), (t.label = null)), !s)
    )
      return;
    const i = new e.Text({
      text: `⭐ ${s}`,
      style: {
        fontFamily: "Poppins, Nunito, sans-serif",
        fontSize: 30,
        fontWeight: "700",
        fill: 16774872,
        stroke: { color: 727575, width: 6 },
      },
    });
    (i.anchor.set(0.5, 1),
      i.position.set(0, -78),
      t.c.addChild(i),
      (t.label = i));
  }
  idle(t) {
    return n(t.beh.idle[0], t.beh.idle[1]);
  }
  removeFrog(t) {
    ((t.leaving = !0),
      t.pad &&
        ((t.pad.occupant = null),
        this.padImpulse(t.pad, t.seatX, t.seatY, -0.5),
        (t.pad = null)));
    for (const s of this.pads) s.reserved === t && (s.reserved = null);
    this.disturb(t.x, t.y, 16 * this.S(), 6);
    for (let s = 0; s < 8; s++) {
      const e = n(0, 6.28),
        i = n(20, 60);
      this.spawn(
        "drop",
        t.x,
        t.y,
        2,
        Math.cos(e) * i,
        Math.sin(e) * i * 0.6,
        n(80, 150),
      );
    }
  }
  killFrog(t) {
    (t.c.destroy({ children: !0 }),
      t.shadow.destroy(),
      (this.frogs = this.frogs.filter((s) => s !== t)));
  }
  chooseJump(t) {
    const s = { x: t.x, y: t.y },
      e = t.beh,
      i = this.S(),
      o = e.reach[0] * i,
      r = e.reach[1] * i;
    if (Math.random() < 0.45) {
      const l = this.frogs
        .filter(
          (h) =>
            h !== t &&
            h.speciesId === t.speciesId &&
            h.state === "sit" &&
            h.pad &&
            !h.leaving &&
            !h.merging &&
            !h.pad.reserved,
        )
        .map((h) => ({ o: h, d: Math.hypot(h.x - s.x, h.y - s.y) }))
        .filter((h) => h.d <= Math.max(r, 160 * i))
        .sort((h, c) => h.d - c.d)[0];
      if (l)
        return (
          (l.o.pad.reserved = t),
          { pad: l.o.pad, x: l.o.pad.x, y: l.o.pad.y, mergeInto: l.o }
        );
    }
    const u = this.freePads(t.pad)
      .map((l) => ({ p: l, d: Math.hypot(l.x - s.x, l.y - s.y) }))
      .filter((l) => l.d >= o * 0.6 && l.d <= r);
    if (
      (e.prefer === "near"
        ? u.sort((l, h) => l.d - h.d)
        : e.prefer === "far"
          ? u.sort((l, h) => h.d - l.d)
          : u.sort(() => Math.random() - 0.5),
      Math.random() < e.water * (this.state.calm ? 0.4 : 1) || !u.length)
    ) {
      for (let l = 0; l < 18; l++) {
        const h = n(0, 6.28),
          c = n(o, Math.min(r, 170 * i)),
          y = s.x + Math.cos(h) * c,
          g = s.y + Math.sin(h) * c;
        if (
          this.inPond(y, g, 40) &&
          this.pads.every((p) => Math.hypot(p.x - y, p.y - g) > p.r + 14)
        )
          return { water: !0, x: y, y: g };
      }
      if (!u.length) return null;
    }
    const a = u[0];
    return ((a.p.reserved = t), { pad: a.p, x: a.p.x, y: a.p.y });
  }
  startJump(t, s, e = !1) {
    t.pad &&
      ((t.pad.occupant = null), this.padImpulse(t.pad, t.seatX, t.seatY, -0.5));
    const i = Math.hypot(s.x - t.x, s.y - t.y);
    ((t.air = {
      fx: t.x,
      fy: t.y,
      tx: s.x,
      ty: s.y,
      u: 0,
      dur: (0.38 + i / 650) * (this.state.calm ? 1.25 : 1),
      peak: 14 + i * 0.2,
      tgt: s,
    }),
      (t.state = "crouch"),
      (t.timer = e ? 0.07 : 0.16),
      (t.pad = null));
  }
  land(t) {
    const s = t.air.tgt;
    if (
      ((t.z = 0),
      (t.air = null),
      s.mergeInto && !s.mergeInto.leaving && s.mergeInto.pad === s.pad)
    ) {
      this.mergeInto(t, s.mergeInto);
      return;
    }
    if ((s.pad && s.pad.occupant && (s.pad = null), s.pad)) {
      if (
        ((t.pad = s.pad),
        (s.pad.reserved = null),
        (s.pad.occupant = t),
        (t.seatX = n(-0.12, 0.12) * s.pad.r),
        (t.seatY = -s.pad.r * 0.12),
        this.padImpulse(s.pad, t.seatX, t.seatY, t.size),
        (t.sy.yd -= 9),
        (t.state = "sit"),
        (t.timer = this.idle(t)),
        t.beh.epic === "stars")
      )
        for (let e = 0; e < 10; e++) {
          const i = n(0, 6.28);
          this.spawn(
            "star",
            t.x,
            t.y,
            6,
            Math.cos(i) * 60,
            Math.sin(i) * 30,
            n(10, 50),
          );
        }
      if (t.beh.epic === "ghost")
        for (let e = 0; e < 8; e++)
          this.spawn(
            "wisp",
            t.x + n(-10, 10),
            t.y,
            n(4, 20),
            n(-10, 10),
            n(-6, 6),
            n(14, 30),
          );
    } else
      (s.mergeInto && s.mergeInto.pad && (s.mergeInto.pad.reserved = null),
        this.dive(t));
  }
  mergeInto(t, s) {
    const e = this.PIXI;
    (s.pad && (s.pad.reserved = null),
      (t.merging = !0),
      (t.state = "merge"),
      (t.mergeT = 0),
      (t.mergeTo = s));
    const i = s.count + t.count;
    ((s.count = i),
      (s.size = x(s.size * 1.06, 0.85, 1.35)),
      (s.sy.yd -= 14),
      this.padImpulse(s.pad, s.seatX, s.seatY, 1.2),
      this.disturb(s.x, s.y, 26 * this.S(), 5),
      this.spawn("ring", s.x, s.y, 0, 0, 0, 0));
    for (let r = 0; r < 12; r++) {
      const u = (r / 12) * Math.PI * 2;
      this.spawn(
        "spark",
        s.x,
        s.y,
        24,
        Math.cos(u) * 70,
        Math.sin(u) * 40,
        n(10, 40),
        16766554,
      );
    }
    const o = new e.Text({
      text: `×${i}`,
      style: {
        fontFamily: "Poppins, Nunito, sans-serif",
        fontSize: 20,
        fontWeight: "800",
        fill: 16766554,
        stroke: { color: 727575, width: 4 },
      },
    });
    (o.anchor.set(0.5),
      o.position.set(s.x, s.y - 30),
      (o.zIndex = 3e5),
      this.layers.world.addChild(o),
      this.floats.push({ txt: o, y: s.y - 20, life: 0 }),
      this.cb.onMerge(s.id, t.id));
  }
  dive(t) {
    const s = this.S();
    this.disturb(t.x, t.y, 18 * s, 9);
    for (let o = 0; o < 14; o++) {
      const r = n(0, 6.28),
        u = n(20, 70);
      this.spawn(
        "drop",
        t.x,
        t.y,
        2,
        Math.cos(r) * u,
        Math.sin(r) * u * 0.6,
        n(90, 190),
      );
    }
    this.scareFish(t.x, t.y);
    const i =
      this.freePads().sort(
        (o, r) =>
          Math.hypot(o.x - t.x, o.y - t.y) - Math.hypot(r.x - t.x, r.y - t.y),
      )[0] || null;
    (i && (i.reserved = t),
      (t.state = "swim"),
      (t.swimTo = i),
      (t.timer = n(0.8, 1.6)),
      (t.sy.yd -= 4));
  }
  updateTongue(t, s) {
    t.tongueT += s / 0.32;
    const e = t.prey;
    if (t.tongueT >= 0.5 && e.alive) {
      ((e.alive = !1), (e.respawn = n(4, 9)), (t.sy.yd -= 6));
      for (let i = 0; i < 5; i++)
        this.spawn("spark", e.x, e.y, e.z, n(-30, 30), n(-20, 20), n(-10, 30));
    }
    t.tongueT >= 1 && ((t.tongueT = -1), (t.prey = null));
  }
  updateFrog(t, s, e) {
    const i = t.beh,
      o = this.S(),
      r = this.state;
    let u = 1;
    if (t.leaving) {
      if (
        ((t.fade -= s * 2.2), (t.z = Math.max(0, t.z - s * 30)), t.fade <= 0)
      ) {
        this.killFrog(t);
        return;
      }
      ((t.state = "swim"),
        (t.air = null),
        this.renderFrog(t, t.sy.update(s, 1), e));
      return;
    }
    if (t.state === "merge") {
      const d = t.mergeTo;
      if (((t.mergeT += s / 0.56), !d || d.leaving)) {
        this.killFrog(t);
        return;
      }
      const a = Math.min(1, t.mergeT);
      if (
        ((t.x = M(t.x, d.x, 0.18)),
        (t.y = M(t.y, d.y, 0.18)),
        (t.z = Math.sin(a * Math.PI) * 16),
        (t.fade = 1 - a),
        t.mergeT >= 1)
      ) {
        this.killFrog(t);
        return;
      }
      this.renderFrog(t, 1, e);
      return;
    }
    if (((t.lookT -= s), t.lookT <= 0)) {
      t.lookT = n(1, 3);
      const d = Math.random(),
        a =
          d < 0.4
            ? L(this.fish)
            : d < 0.7 && r.nightAmt > 0.5
              ? L(this.flies)
              : L(this.frogs);
      ((t.lx = a ? x((a.x - t.x) / 60, -1, 1) : n(-1, 1)),
        (t.ly = a ? x((a.y - t.y) / 60, -1, 1) : n(-1, 1)));
    }
    if (
      ((t.blinkT -= s),
      t.blinkT <= 0 && ((t.blink = 0.14), (t.blinkT = n(2, 6))),
      (t.blink = Math.max(0, t.blink - s)),
      t.state === "sit")
    ) {
      const d = t.pad;
      if (
        ((t.x = d.x + t.seatX * this.depthScale(d.y)),
        (t.y = d.y + t.seatY + d.sink.y * 8),
        (u = 1 + Math.sin(e * 2.3 + t.x) * 0.03),
        t.croak > 0 && (t.croak -= s),
        t.tongueT >= 0 && this.updateTongue(t, s),
        (t.timer -= s * (r.calm ? 0.55 : 1)),
        t.timer <= 0 && t.tongueT < 0 && !t.leaving)
      ) {
        const a = t.beh,
          l =
            r.nightAmt > 0.5
              ? this.flies.find(
                  (c) =>
                    c.alive &&
                    Math.hypot(c.x - t.x, c.y - t.y) <
                      80 * o * (a.hunt > 1 ? 1.5 : 1),
                )
              : null,
          h = Math.random();
        if (l && h < Math.min(0.9, 0.5 * a.hunt))
          ((t.tongueT = 0), (t.prey = l), (t.timer = this.idle(t)));
        else if (h < 0.22 * a.croak && t.croak <= 0)
          ((t.croak = 1.3),
            this.disturb(t.x, t.y + 6, 14 * o, 1.2),
            (t.timer = this.idle(t) * 0.6));
        else {
          const c = this.chooseJump(t);
          c ? this.startJump(t, c) : (t.timer = n(1, 3));
        }
      }
    } else if (t.state === "crouch")
      ((u = 0.74),
        (t.timer -= s),
        t.timer <= 0 && ((t.state = "air"), (t.sy.yd += 10)));
    else if (t.state === "air") {
      const d = t.air;
      d.u = Math.min(1, d.u + s / d.dur);
      const a = d.u;
      ((t.x = M(d.fx, d.tx, a)),
        (t.y = M(d.fy, d.ty, a)),
        (t.z = 4 * d.peak * a * (1 - a)),
        (u = a < 0.5 ? 1.2 : 1.06),
        i.epic === "stars" &&
          ((t.trailT -= s),
          t.trailT <= 0 &&
            ((t.trailT = 0.03),
            this.spawn(
              "star",
              t.x + n(-6, 6),
              t.y,
              t.z + n(0, 12),
              n(-8, 8),
              n(-4, 4),
              n(-10, 10),
            ))),
        i.epic === "ghost" &&
          ((t.trailT -= s),
          t.trailT <= 0 &&
            ((t.trailT = 0.05),
            this.spawn(
              "wisp",
              t.x + n(-5, 5),
              t.y,
              t.z + n(4, 16),
              n(-6, 6),
              n(-3, 3),
              n(-4, 8),
            ))),
        d.u >= 1 && this.land(t));
    } else if (t.state === "swim") {
      ((t.timer -= s), (t.wakeT -= s));
      const d = t.swimTo;
      if (t.timer <= 0 && d)
        if (d.occupant) ((d.reserved = null), (t.swimTo = null));
        else {
          const a = d.x - t.x,
            l = d.y - t.y,
            h = Math.hypot(a, l),
            c = d.r * 0.95;
          if (h > c) {
            const y = Math.min(46 * o, (h - c) * 1.6 + 8);
            ((t.x += (a / h) * y * s),
              (t.y += (l / h) * y * s),
              t.wakeT <= 0 &&
                ((t.wakeT = 0.11),
                this.disturb(
                  t.x - (a / h) * 6,
                  t.y - (l / h) * 6,
                  7 * o,
                  -1.4,
                )));
          } else {
            for (let y = 0; y < 6; y++)
              this.spawn(
                "drop",
                t.x,
                t.y,
                6,
                n(-20, 20),
                n(-10, 10),
                n(30, 70),
              );
            ((t.air = {
              fx: t.x,
              fy: t.y,
              tx: d.x,
              ty: d.y - d.r * 0.12,
              u: 0,
              dur: 0.32,
              peak: 10,
              tgt: { pad: d },
            }),
              (t.state = "air"),
              (t.sy.yd += 6));
          }
        }
      else if (!d) {
        t.timer = 1;
        const a = this.freePads();
        a.length && ((t.swimTo = a[0]), (a[0].reserved = t));
      }
      u = 1 + Math.sin(e * 5) * 0.04;
    } else if (
      t.state === "drop" &&
      ((t.vz -= 900 * s), (t.z += t.vz * s), (u = 1.15), t.z <= 0)
    ) {
      if (
        ((t.z = 0),
        (t.state = "sit"),
        (t.timer = this.idle(t)),
        this.padImpulse(t.pad, t.seatX, t.seatY, 1.4),
        (t.sy.yd -= 12),
        i.epic === "stars")
      )
        for (let d = 0; d < 24; d++) {
          const a = n(0, 6.28);
          this.spawn(
            "star",
            t.x,
            t.y,
            10,
            Math.cos(a) * 90,
            Math.sin(a) * 50,
            n(20, 80),
          );
        }
      if (i.epic === "ghost")
        for (let d = 0; d < 16; d++)
          this.spawn(
            "wisp",
            t.x + n(-14, 14),
            t.y,
            n(6, 26),
            n(-14, 14),
            n(-8, 8),
            n(16, 40),
          );
    }
    this.renderFrog(t, t.sy.update(s, u), e);
  }
  renderFrog(t, s, e) {
    const i = this.state,
      o = this.frogK(t.y, t),
      r = t.state === "swim",
      u = 1 + (1 - s) * 0.85;
    (t.c.position.set(t.x, t.y - t.z + (r ? 14 * o : 0)),
      t.c.scale.set(o),
      (t.c.alpha = x(t.fade, 0, 1)),
      (t.c.zIndex = r
        ? -2e5 + t.y
        : (t.state === "sit" || t.state === "crouch") && t.pad
          ? t.pad.y + 1
          : 1e5 + t.y),
      t.rig.scale.set(u, s));
    const d = t.state === "air" || t.state === "drop",
      a = t.air ? t.air.u : 0,
      l = d
        ? a < 0.55
          ? 1
          : Math.max(0, 1 - (a - 0.55) / 0.45)
        : t.state === "crouch"
          ? -0.25
          : 0;
    for (const [p, m] of [
      [t.backL, -1],
      [t.backR, 1],
    ])
      (p.scale.set(1 + 0.4 * l, 1 - 0.15 * l),
        p.position.set(m * (22 + 5 * l), -10 + 9 * l),
        (p.visible = !r));
    for (const [p, m] of [
      [t.frontL, -1],
      [t.frontR, 1],
    ])
      (p.position.set(m * 12, -5 + 4 * Math.max(l, 0)), (p.visible = !r));
    if (
      ((t.eyes.scale.y = t.blink > 0 ? 0.12 : 1),
      t.pupils.position.set(
        t.lookX.update(this.frameDt, t.lx) * 3,
        t.lookY.update(this.frameDt, t.ly) * 2.5,
      ),
      t.croak > 0 && !r)
    ) {
      const p = Math.max(0, Math.sin(((1.3 - t.croak) / 1.3) * Math.PI * 3));
      ((t.throat.visible = !0), t.throat.scale.set(0.9 + p * 1.1));
    } else t.throat.visible = !1;
    const h = I(16777215, 12174566, i.nightAmt * 0.7);
    for (const p of t.parts) p.tint = h;
    ((t.body.alpha = r ? 0.55 : 1), r && (t.body.tint = G(h, 0.65)));
    const c = t.tongue;
    if ((c.clear(), t.tongueT >= 0 && t.prey)) {
      const p = t.tongueT < 0.5 ? t.tongueT * 2 : (1 - t.tongueT) * 2,
        m = (t.prey.x - t.x) / o,
        f = (t.prey.y - t.prey.z - (t.y - t.z)) / o,
        b = -15 * s;
      (c
        .moveTo(0, b)
        .lineTo(M(0, m, p), M(b, f, p))
        .stroke({ width: 4, color: 15891098, cap: "round" }),
        c.circle(M(0, m, p), M(b, f, p), 3.5).fill(15891098));
    }
    const y = t.beh;
    if (y.epic === "stars") {
      ((t.aura.alpha =
        (0.4 + 0.2 * Math.sin(e * 2)) *
        (r ? 0.4 : 1) *
        M(0.75, 1.2, i.nightAmt)),
        t.aura.scale.set(1.9 + 0.12 * Math.sin(e * 2)));
      const p = t.deco;
      p.clear();
      for (let m = 0; m < 5; m++) {
        const f = e * 0.6 + m * 1.26,
          b = Math.cos(f) * 44,
          T = -30 + Math.sin(f) * 20,
          C = 0.5 + 0.5 * Math.sin(e * 4 + m * 2);
        p.circle(b, T, 2.4 * C + 0.8).fill({ color: 16774600, alpha: C });
      }
    } else if (y.epic === "ghost")
      ((t.rig.alpha =
        0.55 + 0.3 * (0.5 + 0.5 * Math.sin(e * 0.9 + t.x * 0.01))),
        (t.aura.alpha = (0.28 + 0.14 * Math.sin(e * 1.4)) * (r ? 0.4 : 1)),
        t.aura.scale.set(1.7 + 0.1 * Math.sin(e * 1.4)));
    else if (y.epic === "glow") {
      const p = M(0.18, 0.75, i.nightAmt);
      ((t.aura.alpha =
        p * (0.75 + 0.25 * Math.sin(e * 3 + t.x * 0.02)) * (r ? 0.4 : 1)),
        t.aura.scale.set(1.6 + 0.4 * i.nightAmt));
    } else if (y.epic === "rainbow") {
      const p = (e * 0.12 + t.x * 0.001) % 1,
        m = Q(p, 0.75, 0.62);
      for (const f of t.parts) f.tint = G(I(16777215, m, 0.55), 1);
      ((t.aura.tint = m),
        (t.aura.alpha = (0.3 + 0.1 * Math.sin(e * 2)) * (r ? 0.4 : 1)),
        t.aura.scale.set(1.7));
    } else
      y.epic === "crystal"
        ? ((t.aura.alpha =
            (0.2 + 0.25 * Math.max(0, Math.sin(e * 1.7 + t.x * 0.03))) *
            (r ? 0.3 : 1) *
            M(1, 0.6, i.nightAmt)),
          t.aura.scale.set(1.5),
          (t.trailT -= this.frameDt),
          t.trailT <= 0 &&
            !r &&
            ((t.trailT = n(0.4, 1.1)),
            this.spawn(
              "spark",
              t.x + n(-18, 18),
              t.y,
              t.z + n(14, 40),
              0,
              0,
              n(4, 10),
              15334911,
            )))
        : y.rare &&
          ((t.aura.alpha = (0.18 + 0.08 * Math.sin(e * 2.2)) * (r ? 0.3 : 1)),
          t.aura.scale.set(1.5));
    ((t.shadow.visible = !r),
      t.shadow.position.set(t.x, t.y + 3 * o),
      (t.shadow.zIndex = d
        ? t.air && t.air.tgt.pad
          ? Math.max(t.y, t.air.tgt.pad.y) + 0.5
          : t.pad
            ? t.pad.y + 0.5
            : -199999 + t.y
        : t.c.zIndex - 0.5));
    const g = x(t.z / 120, 0, 1);
    (t.shadow.scale.set(((o * 52) / 44) * (1 - g * 0.45)),
      (t.shadow.alpha = 0.5 * (1 - g * 0.7) * x(t.fade, 0, 1)));
  }
  onPointer(t, s) {
    const e = this.S();
    for (const r of this.reeds)
      Math.hypot(r.x - t, r.y - r.h * 0.5 - s) < r.h * 0.6 &&
        (r.push.yd += (t < r.x ? 1 : -1) * 4);
    const i = this.frogs.find(
      (r) =>
        !r.leaving &&
        !r.merging &&
        Math.hypot(r.x - t, r.y - r.z - 28 * this.frogK(r.y, r) - s) <
          36 * this.frogK(r.y, r) + 8,
    );
    if (i) {
      i.sy.yd -= 6;
      for (let r = 0; r < 3; r++)
        this.spawn("spark", i.x, i.y, 30, n(-20, 20), 0, n(20, 40));
      this.cb.onFrogTap(i.id);
      return;
    }
    const o = this.pads.find((r) => Math.hypot(r.x - t, r.y - s) < r.r);
    if (o) {
      (this.padImpulse(o, t - o.x, s - o.y, 0.8),
        o.occupant && (o.occupant.sy.yd -= 5));
      return;
    }
    if (this.inPond(t, s)) {
      (this.disturb(t, s, 12 * e, 7), this.scareFish(t, s));
      for (let r = 0; r < 5; r++)
        this.spawn("drop", t, s, 1, n(-30, 30), n(-20, 20), n(60, 120));
    }
  }
  tick(t) {
    if (this.destroyed) return;
    const s = this.state,
      e = this.layers,
      i = Math.min(t / 1e3, 0.1);
    this.acc += i;
    let o = 0;
    for (; this.acc >= S && o < 3;) {
      if (
        ((this.t += S),
        o++,
        (this.acc -= S),
        (s.gustT -= S),
        s.gustT <= 0 &&
          ((s.gustT = n(7, 15)),
          (s.windDir = Math.random() < 0.5 ? -1 : 1),
          (s.gustOn = 2.5)),
        s.gustOn > 0 && (s.gustOn -= S),
        (s.wind = s.windSod.update(S, s.gustOn > 0 && !s.calm ? 1 : 0)),
        s.wind > 0.3 &&
          Math.random() < 0.25 &&
          this.disturb(n(0, this.W), n(0, this.H), 6, 0.5 * s.wind),
        Math.random() < (s.calm ? 0.01 : 0.03) &&
          this.disturb(n(0, this.W), n(0, this.H), 4, 0.45),
        (s.rainT -= S),
        s.rainT <= 0 &&
          (s.raining
            ? ((s.raining = !1), (s.rainT = n(60, 150)))
            : Math.random() < 0.2
              ? ((s.raining = !0), (s.rainT = n(25, 50)))
              : (s.rainT = n(45, 90))),
        (s.rainAmt = x(s.rainSod.update(S, s.raining ? 1 : 0), 0, 1)),
        s.rainAmt > 0.02)
      ) {
        const a = s.rainAmt * (s.level === 0 ? 0.9 : 1.8);
        for (let l = 0; l < a + (Math.random() < a % 1 ? 1 : 0); l++) {
          const h = n(0, this.W),
            c = n(0, this.H);
          this.inPond(h, c, 6) &&
            this.pads.every((y) => Math.hypot(y.x - h, y.y - c) > y.r) &&
            (this.disturb(h, c, 3, 0.3 * s.rainAmt),
            this.rings.length < (s.level === 0 ? 50 : 140) &&
              this.rings.push({
                x: h,
                y: c,
                age: 0,
                life: n(0.55, 0.95),
                r: n(5, 10) * this.S(),
              }));
        }
      }
      this.stepWater();
    }
    this.acc > S * 3 && (this.acc = 0);
    const r = Math.min(i, 1 / 30),
      u = this.t + this.acc;
    ((this.frameDt = r),
      this.updatePads(r, u),
      this.updateFish(r),
      this.updateFlies(r, u));
    for (const a of [...this.frogs])
      try {
        this.updateFrog(a, r, u);
      } catch {
        a.pad === null && a.state === "sit" && this.dive(a);
      }
    (this.updateParticles(r), this.updateReeds(r, u));
    const d = (s.nightAmt = x(s.nightSod.update(i, s.night ? 1 : 0), 0, 1));
    if (
      ((e.bed.tint = I(16777215, 6979496, d)),
      (e.waterTint.tint = I(1010282, 399923, d)),
      (e.waterTint.alpha = M(0.32, 0.55, d)),
      (e.moon.alpha = d * (0.55 + 0.1 * Math.sin(u * 0.8))),
      (e.moon.tint = 15986904),
      (e.shore.tint = I(16777215, 6123402, d)),
      e.caustA.tilePosition.set(u * 9, u * 5),
      e.caustB.tilePosition.set(-u * 7, u * 6),
      (e.caustA.alpha = M(0.09, 0.03, d)),
      (e.caustB.alpha = M(0.07, 0.02, d)),
      this.paintRain(i),
      this.dispFilter.scale.set(16 * this.S(), 16 * this.S()),
      this.paintWater(),
      (this.fpsAcc += t),
      this.fpsN++,
      (this.fpsWin += t),
      this.fpsWin >= 1e3)
    ) {
      const a = 1e3 / (this.fpsAcc / this.fpsN);
      ((this.lowStreak = a < 45 ? this.lowStreak + 1 : 0),
        this.lowStreak >= 3 &&
          s.level > 0 &&
          (this.setLevel(s.level - 1), (this.lowStreak = 0)),
        (this.fpsAcc = 0),
        (this.fpsN = 0),
        (this.fpsWin = 0));
    }
  }
  paintRain(t) {
    const s = this.state,
      e = this.layers,
      i = e.rainG,
      o = e.rainRings,
      r = s.rainAmt;
    ((e.rainShade.width = this.W),
      (e.rainShade.height = this.H),
      (e.rainShade.alpha = r * 0.18),
      i.clear(),
      o.clear());
    const u = s.nightAmt > 0.5 ? 12110048 : 15136511;
    for (let h = this.rings.length - 1; h >= 0; h--) {
      const c = this.rings[h];
      c.age += t;
      const y = c.age / c.life;
      if (y >= 1) {
        this.rings.splice(h, 1);
        continue;
      }
      const g = 1 - (1 - y) * (1 - y),
        p = 1 + c.r * g,
        m = (1 - y) * (1 - y);
      if (
        (o
          .ellipse(c.x, c.y, p, p * 0.42)
          .stroke({ width: 0.8, color: u, alpha: 0.55 * m }),
        y > 0.25)
      ) {
        const f = c.r * 0.55 * ((y - 0.25) / 0.75);
        o.ellipse(c.x, c.y, f, f * 0.42).stroke({
          width: 0.6,
          color: u,
          alpha: 0.35 * m,
        });
      }
    }
    if (r < 0.02) {
      this.streaks.length = 0;
      return;
    }
    const d = Math.round(r * (s.level === 0 ? 34 : 70));
    for (; this.streaks.length < d;) {
      const h = Math.random() < 0.55;
      this.streaks.push({
        x: n(-40, this.W),
        y: n(-this.H, this.H),
        len: h ? n(6, 10) : n(11, 17),
        sp: h ? n(380, 480) : n(560, 700),
        far: h,
      });
    }
    this.streaks.length > d && (this.streaks.length = d);
    const a = 0.12 + s.wind * 0.22 * s.windDir,
      l = s.nightAmt > 0.5 ? 11188432 : 15267071;
    for (const h of [!0, !1]) {
      for (const c of this.streaks)
        c.far === h &&
          ((c.y += c.sp * t),
          (c.x += c.sp * a * t),
          (c.y > this.H + 20 || c.x > this.W + 40 || c.x < -60) &&
            ((c.y = n(-60, -10)), (c.x = n(-40, this.W))),
          i.moveTo(c.x, c.y).lineTo(c.x - c.len * a, c.y - c.len));
      i.stroke({
        width: h ? 0.6 : 0.9,
        color: l,
        alpha: (h ? 0.16 : 0.26) * r,
        cap: "round",
      });
    }
  }
  setRain(t) {
    ((this.state.raining = t), (this.state.rainT = t ? n(25, 50) : n(60, 150)));
  }
  debug() {
    return {
      frogs: this.frogs.map((t) => ({
        id: t.id,
        state: t.state,
        x: t.x,
        y: t.y,
      })),
      level: this.state.level,
      rain: this.state.rainAmt,
    };
  }
}
export { $ as LagoaEngine };
