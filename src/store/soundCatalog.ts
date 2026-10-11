/**
 * Sons do FocusFrog — todos gravações reais (public/sounds).
 *  - amb/: ambientes que tocam em loop durante o foco (Loja → Sons)
 *  - fx/:  avisos curtos (início do foco, pausa, fim do foco)
 * Origem e licença de cada arquivo: public/sounds/CREDITOS.md
 */
export type SoundGroup = 'base' | 'natureza' | 'sapos';

export interface SoundItem {
  id: string;
  name: string;
  desc: string;
  price: number;
  group: SoundGroup;
  file?: string;          // relativo a /sounds/amb/
  ready: boolean;
}

const amb = (id: string, name: string, desc: string, price: number, group: SoundGroup, file: string): SoundItem =>
  ({ id, name, desc, price, group, file, ready: true });

export const SOUND_GROUPS: { id: SoundGroup; title: string; hint?: string }[] = [
  { id: 'base', title: 'Grátis' },
  { id: 'natureza', title: 'Natureza' },
  { id: 'sapos', title: 'Sapos', hint: 'Premium · gravados em lagoas de verdade' },
];

export const SOUND_CATALOG: SoundItem[] = [
  { id: 'none', name: 'Silêncio', desc: 'Só você e o foco', price: 0, group: 'base', ready: true },
  // grátis (os ids antigos continuam, agora com gravação real)
  amb('rain', 'Chuva fina', 'Chuva leve e constante', 0, 'base', 'chuva-fina.mp3'),
  amb('waves', 'Ondas do mar', 'Mar calmo indo e voltando', 0, 'base', 'ondas.mp3'),
  amb('forest', 'Vento na mata', 'Brisa nas folhas e pássaros', 0, 'base', 'vento-na-mata.mp3'),
  // natureza
  amb('chuva-constante', 'Chuva constante', 'Chuva firme, sem trovão', 100, 'natureza', 'chuva-constante.mp3'),
  amb('chuva-longa', 'Chuva longa', 'Chuva ao longe, bem uniforme', 100, 'natureza', 'chuva-longa.mp3'),
  amb('vento', 'Só o vento', 'Vento soprando, nada mais', 100, 'natureza', 'vento.mp3'),
  amb('ondas-costa', 'Ondas na costa', 'Ondas quebrando na praia', 120, 'natureza', 'ondas-costa.mp3'),
  amb('marolas', 'Marolas nas pedras', 'Água batendo de leve nas pedras', 120, 'natureza', 'marolas.mp3'),
  amb('grilos', 'Grilos', 'Grilos numa noite de verão', 150, 'natureza', 'grilos.mp3'),
  amb('agua-correndo', 'Água correndo', 'Fio de água sem parar', 150, 'natureza', 'agua-correndo.mp3'),
  amb('agua-passaros', 'Água e pássaros', 'Córrego com passarinhos', 150, 'natureza', 'agua-passaros.mp3'),
  amb('passaros-rio', 'Pássaros no rio', 'Canto de pássaros na beira do rio', 150, 'natureza', 'passaros-rio.mp3'),
  amb('passaros-floresta', 'Pássaros na floresta', 'Manhã cheia de canto', 150, 'natureza', 'passaros-floresta.mp3'),
  amb('rec-riacho', 'Riacho', 'Rio na floresta com pássaros', 200, 'natureza', 'riacho.mp3'),
  amb('noite-verao', 'Noite de verão', 'Mata quente à noite', 200, 'natureza', 'noite-verao.mp3'),
  amb('mata-noite', 'Mata à noite', 'Insetos e folhas no escuro', 200, 'natureza', 'mata-noite.mp3'),
  amb('chuva-mata', 'Chuva na mata', 'Chuva tropical com pássaros', 200, 'natureza', 'chuva-mata.mp3'),
  amb('passaros-selva', 'Pássaros na selva', 'Floresta tropical acordada', 200, 'natureza', 'passaros-selva.mp3'),
  amb('rec-lagoa', 'Lagoa com grilos', 'Beira da lagoa à noite', 250, 'natureza', 'lagoa-grilos.mp3'),
  amb('fogueira', 'Fogueira', 'Lenha estalando', 250, 'natureza', 'fogueira.mp3'),
  amb('fogueira-vento', 'Fogueira com vento', 'Fogo e vento frio da noite', 250, 'natureza', 'fogueira-vento.mp3'),
  amb('amanhecer', 'Floresta ao amanhecer', 'Primeiros pássaros do dia', 250, 'natureza', 'amanhecer.mp3'),
  amb('rec-tempestade', 'Trovoada calma', 'Trovões longe, na mata', 300, 'natureza', 'trovoada-calma.mp3'),
  amb('trovoes-chuva', 'Trovões e chuva', 'Tempestade de verdade, de longe', 300, 'natureza', 'trovoes-chuva.mp3'),
  // sapos (premium)
  amb('sapos-lagoa', 'Lagoa no campo', 'Sapos, pássaros e vento', 400, 'sapos', 'sapos-lagoa.mp3'),
  amb('sapos-cascata', 'Coro da cascata', 'Muitos sapos e uma queda d’água', 400, 'sapos', 'sapos-cascata.mp3'),
  amb('sapos-floresta', 'Floresta dos sapos', 'Sapos coaxando na mata', 400, 'sapos', 'sapos-floresta.mp3'),
  amb('sapo-noite', 'Sapo da noite', 'Um sapo cantando sozinho', 400, 'sapos', 'sapo-noite.mp3'),
  amb('sapo-parteiro', 'Sapo-parteiro', 'Um “pio” de sino, bem calmo', 450, 'sapos', 'sapo-parteiro.mp3'),
  amb('sapo-parteiro-2', 'Sapo-parteiro II', 'Outra noite, outro ritmo', 450, 'sapos', 'sapo-parteiro-2.mp3'),
  amb('sapo-parteiro-3', 'Sapo-parteiro sereno', 'Mais limpo, quase meditação', 450, 'sapos', 'sapo-parteiro-3.mp3'),
];

// ---------------------------------------------------------------------------
// Toca um ambiente em loop sem emenda (Web Audio decodifica e repete o buffer)

const bufferCache = new Map<string, Promise<AudioBuffer>>();
let sharedCtx: AudioContext | null = null;
const ctx = () => {
  if (!sharedCtx) { const C = window.AudioContext || (window as any).webkitAudioContext; sharedCtx = new C(); }
  if (sharedCtx.state === 'suspended') sharedCtx.resume().catch(() => {});
  return sharedCtx;
};
const loadBuffer = (url: string) => {
  if (!bufferCache.has(url)) {
    const p = fetch(url).then(r => r.arrayBuffer()).then(b => ctx().decodeAudioData(b));
    p.catch(() => bufferCache.delete(url));
    bufferCache.set(url, p);
  }
  return bufferCache.get(url)!;
};

/** Toca um som em loop. Devolve a função que para (com fade curto). */
export function playLoop(item: SoundItem, volume = 0.5): () => void {
  if (!item.file || !item.ready) return () => {};
  const c = ctx();
  const gain = c.createGain(); gain.gain.value = 0; gain.connect(c.destination);
  let src: AudioBufferSourceNode | null = null; let stopped = false;
  loadBuffer(`/sounds/amb/${item.file}`).then(buf => {
    if (stopped) return;
    src = c.createBufferSource(); src.buffer = buf; src.loop = true; src.connect(gain);
    src.start();
    gain.gain.setTargetAtTime(volume, c.currentTime, 0.6);
  }).catch(() => {});
  return () => {
    stopped = true;
    gain.gain.setTargetAtTime(0, c.currentTime, 0.15);
    setTimeout(() => { try { src?.stop(); } catch { /* já parou */ } gain.disconnect(); }, 600);
  };
}

// ---------------------------------------------------------------------------
// Avisos (efeitos curtos): a pessoa escolhe um por momento do foco

export type EffectEvent = 'start' | 'break' | 'end';
export interface EffectItem { id: string; name: string; file: string; price: number }

export const EFFECT_EVENTS: { id: EffectEvent; title: string; desc: string; options: EffectItem[] }[] = [
  { id: 'start', title: 'Início do foco', desc: 'Quando o cronômetro começa', options: [
    { id: 'inicio-toque', name: 'Toque suave', file: 'inicio-toque.mp3', price: 0 },
    { id: 'inicio-clique', name: 'Clique', file: 'inicio-clique.mp3', price: 0 },
    { id: 'inicio-opcao', name: 'Clique duplo', file: 'inicio-opcao.mp3', price: 0 },
    { id: 'inicio-sininho', name: 'Sininho', file: 'inicio-sininho.mp3', price: 0 },
  ] },
  { id: 'break', title: 'Hora da pausa', desc: 'Quando um bloco de foco acaba', options: [
    { id: 'pausa-sino', name: 'Sino curto', file: 'pausa-sino.mp3', price: 0 },
    { id: 'pausa-acerto', name: 'Tom de acerto', file: 'pausa-acerto.mp3', price: 0 },
    { id: 'pausa-positiva', name: 'Aviso alegre', file: 'pausa-positiva.mp3', price: 0 },
    { id: 'pausa-relaxante', name: 'Sino relaxante', file: 'pausa-relaxante.mp3', price: 0 },
  ] },
  { id: 'end', title: 'Fim do foco', desc: 'Quando você termina tudo', options: [
    { id: 'fim-conquista', name: 'Sino de conquista', file: 'fim-conquista.mp3', price: 0 },
    { id: 'fim-aviso', name: 'Sino de aviso', file: 'fim-aviso.mp3', price: 0 },
    { id: 'fim-alegre', name: 'Sinos alegres', file: 'fim-alegre.mp3', price: 0 },
    { id: 'fim-flauta', name: 'Flauta', file: 'fim-flauta.mp3', price: 0 },
    { id: 'croak', name: 'Coaxo da vitória', file: 'coaxo.mp3', price: 300 },
  ] },
];

const EFFECTS_KEY = 'focusfrog_effects'; // { start, break } — o do fim fica em activeEffectId (ThemeContext)
type EffectPrefs = Partial<Record<'start' | 'break', string>>;

export function getEffectPrefs(): Record<'start' | 'break', string> {
  let p: EffectPrefs = {};
  try { p = JSON.parse(localStorage.getItem(EFFECTS_KEY) || '{}') || {}; } catch { /* padrão */ }
  return { start: p.start || EFFECT_EVENTS[0].options[0].id, break: p.break || EFFECT_EVENTS[1].options[0].id };
}
export function setEffectPref(event: 'start' | 'break', id: string) {
  const p = { ...getEffectPrefs(), [event]: id };
  try { localStorage.setItem(EFFECTS_KEY, JSON.stringify(p)); } catch { /* sem armazenamento */ }
}
const findEffect = (event: EffectEvent, id: string) => {
  const ev = EFFECT_EVENTS.find(e => e.id === event)!;
  return ev.options.find(o => o.id === id) || ev.options[0];
};

const soundOn = () => { try { return JSON.parse(localStorage.getItem('focusfrog_sound_enabled') ?? 'true') !== false; } catch { return true; } };

/** Toca um efeito (prévia ou aviso). */
export function playEffectFile(file: string, volume = 0.7) {
  const c = ctx();
  loadBuffer(`/sounds/fx/${file}`).then(buf => {
    const g = c.createGain(); g.gain.value = volume; g.connect(c.destination);
    const s = c.createBufferSource(); s.buffer = buf; s.connect(g); s.start();
    s.onended = () => g.disconnect();
  }).catch(() => {});
}

/** Toca o aviso escolhido pra esse momento (respeita "sons ligados").
 *  `endId` = activeEffectId do tema ('default' = o primeiro da lista). */
export function playEventEffect(event: EffectEvent, isUnlocked: (id: string, price: number) => boolean, endId = 'default') {
  if (!soundOn()) return;
  let item = findEffect(event, event === 'end' ? endId : getEffectPrefs()[event]);
  if (item.price > 0 && !isUnlocked(item.id, item.price)) item = findEffect(event, '');
  playEffectFile(item.file);
}
