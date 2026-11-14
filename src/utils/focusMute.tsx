// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).

const Zm = "focusfrog:focus-mute";

let Qm = false;

export const Ed = () => Qm;

export function Mj(e) {
  Qm !== e && ((Qm = e), window.dispatchEvent(new Event(Zm)));
}

export function Lj(e) {
  return (
    window.addEventListener(Zm, e), () => window.removeEventListener(Zm, e)
  );
}
