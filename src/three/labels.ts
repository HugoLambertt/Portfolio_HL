import { CanvasTexture, SRGBColorSpace } from 'three';

const MONO = '"JetBrains Mono", ui-monospace, monospace';
const SANS = '"Inter Variable", Inter, system-ui, sans-serif';

export type LabelLine = { text: string; size: number; color: string; weight?: number; mono?: boolean };

// Texture transparente contenant quelques lignes de texte, pour étiqueter les objets 3D.
export const labelTexture = (lines: LabelLine[], width = 512, pad = 24, align: CanvasTextAlign = 'left') => {
  const canvas = document.createElement('canvas');
  const height = Math.ceil(lines.reduce((h, l) => h + l.size * 1.35, pad * 2));
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.textAlign = align;
  const x = align === 'center' ? width / 2 : pad;
  let y = pad;
  lines.forEach((l) => {
    y += l.size * 1.1;
    ctx.font = `${l.weight ?? 500} ${l.size}px ${l.mono ? MONO : SANS}`;
    ctx.fillStyle = l.color;
    ctx.fillText(l.text, x, y, width - pad * 2);
    y += l.size * 0.25;
  });
  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 4;
  return { texture: tex, aspect: width / height };
};
