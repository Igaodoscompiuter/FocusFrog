// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).


const ru = new Map();

let Ri = null;

export const Gy = () => {
  if (!Ri) {
    const e = window.AudioContext || window.webkitAudioContext;
    Ri = new e();
  }
  return Ri.state === "suspended" && Ri.resume().catch(() => {}), Ri;
};

export const cS = e => {
  if (!ru.has(e)) {
    const t = fetch(e).then(n => n.arrayBuffer()).then(n => Gy().decodeAudioData(n));
    t.catch(() => ru.delete(e)), ru.set(e, t);
  }
  return ru.get(e);
};

export function uS(e, t = 0.5) {
  if (!e.file || !e.ready) return () => {};
  const n = Gy(),
    s = n.createGain();
  s.gain.value = 0, s.connect(n.destination);
  let r = null,
    o = false;
  return cS(`/sounds/amb/${e.file}`).then(a => {
    o || (r = n.createBufferSource(), r.buffer = a, r.loop = true, r.connect(s), r.start(), s.gain.setTargetAtTime(t, n.currentTime, 0.6));
  }).catch(() => {}), () => {
    o = true, s.gain.setTargetAtTime(0, n.currentTime, 0.15), setTimeout(() => {
      try {
        r == null || r.stop();
      } catch {}
      s.disconnect();
    }, 600);
  };
}
