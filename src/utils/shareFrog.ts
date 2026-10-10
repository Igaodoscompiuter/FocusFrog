import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { frogSpecies } from './frogSpecies';
import { trackShareFrog } from '../analytics';

/**
 * Cartão pra compartilhar um sapo novo (formato Stories, 1080×1920):
 * o sapo desenhado com as cores da espécie, raridade, nome e o link do app.
 * O desenho repete a geometria do ZenFrog (viewBox 100×100).
 */
const SITE = 'focusfrog.netlify.app';
const RARITY: Record<string, { label: string; color: string }> = {
  common: { label: 'Comum', color: '#8BD150' },
  rare: { label: 'Rara', color: '#4FC3F7' },
  epic: { label: 'Épica', color: '#CE93D8' },
};

function drawFrog(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, c: { primary: string; secondary: string }) {
  const k = size / 100;
  const X = (x: number) => cx + (x - 50) * k;
  const Y = (y: number) => cy + (y - 50) * k;
  const ell = (x: number, y: number, rx: number, ry: number, fill: string, stroke = false) => {
    ctx.beginPath(); ctx.ellipse(X(x), Y(y), rx * k, ry * k, 0, 0, Math.PI * 2);
    ctx.fillStyle = fill; ctx.fill();
    if (stroke) { ctx.lineWidth = 1.5 * k; ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.stroke(); }
  };
  ell(50, 88, 26, 6, 'rgba(0,0,0,.28)');                       // sombra
  ell(28, 75, 12, 10, c.primary, true); ell(72, 75, 12, 10, c.primary, true);
  ell(50, 60, 30, 25, c.primary);
  ctx.globalAlpha = 0.8; ell(50, 65, 20, 18, c.secondary); ctx.globalAlpha = 1;
  ell(38, 80, 8, 6, c.primary, true); ell(62, 80, 8, 6, c.primary, true);
  for (const ex of [40, 60]) { ell(ex, 45, 10, 10, '#fff'); ell(ex, 46, 5, 5, '#111'); ell(ex + 2, 43, 1.6, 1.6, '#fff'); }
  ctx.beginPath(); ctx.moveTo(X(45), Y(68)); ctx.quadraticCurveTo(X(50), Y(72), X(55), Y(68));
  ctx.lineWidth = 2 * k; ctx.lineCap = 'round'; ctx.strokeStyle = c.secondary; ctx.stroke();
}

export async function buildFrogCard(speciesId: string, isNew: boolean): Promise<Blob | null> {
  const sp = frogSpecies[speciesId];
  if (!sp) return null;
  const W = 1080, H = 1920;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d'); if (!ctx) return null;
  const r = RARITY[sp.rarity] || RARITY.common;
  const col = sp.stages.adult.colors;
  try { await (document as any).fonts?.ready; } catch { /* segue com a fonte padrão */ }
  const FONT = "'Poppins', 'Inter', system-ui, sans-serif";

  // fundo: lagoa escura com brilho da cor do sapo
  ctx.fillStyle = '#0A120E'; ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W / 2, 860, 60, W / 2, 860, 760);
  glow.addColorStop(0, col.primary + 'AA'); glow.addColorStop(1, 'rgba(10,18,14,0)');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
  // vitória-régia
  ctx.beginPath(); ctx.ellipse(W / 2, 1130, 360, 110, 0, 0.18, Math.PI * 2 - 0.18);
  ctx.lineTo(W / 2, 1130); ctx.closePath(); ctx.fillStyle = '#2F6B3A'; ctx.fill();

  ctx.textAlign = 'center'; ctx.fillStyle = '#F2EFE4';
  ctx.font = `600 52px ${FONT}`;
  ctx.fillText(isNew ? 'Espécie nova na minha lagoa!' : 'Mais um sapo na minha lagoa!', W / 2, 300);

  drawFrog(ctx, W / 2, 860, 640, col);

  // selo de raridade
  ctx.font = `700 44px ${FONT}`;
  const label = r.label.toUpperCase();
  const tw = ctx.measureText(label).width + 80;
  ctx.fillStyle = r.color + '33'; ctx.strokeStyle = r.color; ctx.lineWidth = 4;
  ctx.beginPath(); (ctx as any).roundRect?.(W / 2 - tw / 2, 1290, tw, 84, 42); ctx.fill(); ctx.stroke();
  ctx.fillStyle = r.color; ctx.fillText(label, W / 2, 1347);

  ctx.fillStyle = '#F2EFE4'; ctx.font = `800 96px ${FONT}`;
  ctx.fillText(sp.name, W / 2, 1500);
  ctx.fillStyle = '#AABAAD'; ctx.font = `500 46px ${FONT}`;
  ctx.fillText('Ganhei com foco no FocusFrog', W / 2, 1580);

  ctx.fillStyle = '#8BD150'; ctx.font = `700 48px ${FONT}`;
  ctx.fillText(`${SITE} · @focus.frog`, W / 2, 1780);

  return new Promise(res => cv.toBlob(b => res(b), 'image/png'));
}

const blobToBase64 = (b: Blob) => new Promise<string>((res, rej) => {
  const fr = new FileReader();
  fr.onload = () => res(String(fr.result).split(',')[1] || '');
  fr.onerror = rej; fr.readAsDataURL(b);
});

/** Abre o "compartilhar" do celular com a imagem do sapo + texto e link. */
export async function shareFrog(speciesId: string, isNew: boolean): Promise<'shared' | 'cancelled' | 'failed'> {
  const sp = frogSpecies[speciesId];
  const text = `${isNew ? 'Descobri' : 'Ganhei'} o ${sp?.name ?? 'um sapo novo'} no FocusFrog 🐸 Foco que vira sapo: https://${SITE}`;
  try {
    const blob = await buildFrogCard(speciesId, isNew);
    if (!blob) return 'failed';
    const fileName = `focusfrog-${speciesId.toLowerCase()}.png`;
    if (Capacitor.isNativePlatform()) {
      const saved = await Filesystem.writeFile({ path: fileName, data: await blobToBase64(blob), directory: Directory.Cache });
      trackShareFrog(speciesId);
      await Share.share({ title: 'Meu sapo no FocusFrog', text, files: [saved.uri], dialogTitle: 'Compartilhar sapo' });
      return 'shared';
    }
    const file = new File([blob], fileName, { type: 'image/png' });
    if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], text }); return 'shared'; }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = fileName; a.click();
    return 'shared';
  } catch (e: any) {
    return /cancel|abort/i.test(String(e?.message || e)) ? 'cancelled' : 'failed';
  }
}
