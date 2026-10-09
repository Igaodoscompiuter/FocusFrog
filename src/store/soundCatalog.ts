import { ambientSounds } from '../sounds';

/**
 * Sons da Loja do Sapo.
 *  - synth: gerado pelo app (src/sounds.ts), funciona sem arquivo
 *  - file:  gravação real em public/sounds/<arquivo>.mp3, tocada em loop
 * Um som gravado só aparece como disponível quando o arquivo existe de
 * verdade: é só colocar o .mp3 na pasta e mudar `ready` pra true.
 */
export interface SoundItem {
  id: string;
  name: string;
  desc: string;
  price: number;
  synth?: keyof typeof ambientSounds;
  file?: string;
  ready: boolean;
}

export const SOUND_CATALOG: SoundItem[] = [
  { id: 'none', name: 'Silêncio', desc: 'Só você e o foco', price: 0, synth: 'none', ready: true },
  { id: 'rain', name: 'Chuva leve', desc: 'Chuva fina e constante', price: 0, synth: 'rain', ready: true },
  { id: 'waves', name: 'Ondas', desc: 'Mar ao longe', price: 0, synth: 'waves', ready: true },
  { id: 'forest', name: 'Vento na mata', desc: 'Folhas e brisa', price: 0, synth: 'forest', ready: true },
  { id: 'rec-telhado', name: 'Chuva no telhado', desc: 'Pingos num telhado de zinco', price: 150, file: 'chuva-telhado.mp3', ready: false },
  { id: 'rec-riacho', name: 'Riacho', desc: 'Água correndo entre pedras', price: 200, file: 'riacho.mp3', ready: false },
  { id: 'rec-cafe', name: 'Café', desc: 'Conversa baixa e xícaras', price: 200, file: 'cafe.mp3', ready: false },
  { id: 'rec-lagoa', name: 'Lagoa à noite', desc: 'Sapos, grilos e vento', price: 250, file: 'lagoa-noite.mp3', ready: false },
  { id: 'rec-lareira', name: 'Lareira', desc: 'Lenha estalando', price: 250, file: 'lareira.mp3', ready: false },
  { id: 'rec-biblioteca', name: 'Biblioteca', desc: 'Páginas e passos ao longe', price: 300, file: 'biblioteca.mp3', ready: false },
  { id: 'rec-tempestade', name: 'Tempestade distante', desc: 'Trovões longe, chuva forte', price: 300, file: 'tempestade.mp3', ready: false },
  { id: 'rec-trem', name: 'Trem noturno', desc: 'Trilhos num ritmo lento', price: 400, file: 'trem-noturno.mp3', ready: false },
];

export const EFFECT_CATALOG = [
  { id: 'croak', name: 'Coaxo da vitória', desc: 'Toca quando o foco termina', price: 300 },
];

/** Toca um som em loop. Devolve a função que para. */
export function playLoop(item: SoundItem, volume = 0.5): () => void {
  if (item.file && item.ready) {
    const audio = new Audio(`/sounds/${item.file}`);
    audio.loop = true; audio.volume = volume;
    audio.play().catch(() => {});
    return () => { audio.pause(); audio.src = ''; };
  }
  const gen = item.synth ? ambientSounds[item.synth] : undefined;
  if (!gen || item.id === 'none') return () => {};
  const Ctx = window.AudioContext || (window as any).webkitAudioContext;
  const ctx: AudioContext = new Ctx();
  const gain = ctx.createGain(); gain.gain.value = volume * 0.6; gain.connect(ctx.destination);
  gen.generator(ctx, gain);
  return () => { ctx.close().catch(() => {}); };
}

/** "Coaxo da vitória": dois coaxos curtos, gerados (sem arquivo). */
export const croakEffect = {
  id: 'croak',
  generator: (ctx: AudioContext, dest: AudioNode) => {
    const croak = (t: number, f: number) => {
      const osc = ctx.createOscillator(); osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, t); osc.frequency.exponentialRampToValueAtTime(f * 0.7, t + 0.22);
      const lfo = ctx.createOscillator(); lfo.frequency.value = 38;
      const lfoGain = ctx.createGain(); lfoGain.gain.value = 0.5;
      const amp = ctx.createGain(); amp.gain.setValueAtTime(0, t);
      amp.gain.linearRampToValueAtTime(0.8, t + 0.03); amp.gain.exponentialRampToValueAtTime(0.001, t + 0.26);
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; lp.Q.value = 6;
      lfo.connect(lfoGain); lfoGain.connect(amp.gain);
      osc.connect(lp); lp.connect(amp); amp.connect(dest);
      osc.start(t); lfo.start(t); osc.stop(t + 0.3); lfo.stop(t + 0.3);
    };
    const t0 = ctx.currentTime + 0.02;
    croak(t0, 190); croak(t0 + 0.32, 230);
  },
};

/** Prévia avulsa (Loja): toca um efeito num contexto de áudio próprio. */
export function previewEffect(effect: { generator: (c: AudioContext, d: AudioNode) => void }, volume = 0.6) {
  const Ctx = window.AudioContext || (window as any).webkitAudioContext;
  const ctx: AudioContext = new Ctx();
  const out = ctx.createGain(); out.gain.value = volume; out.connect(ctx.destination);
  effect.generator(ctx, out);
  setTimeout(() => ctx.close().catch(() => {}), 1500);
}
