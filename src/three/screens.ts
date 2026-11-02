import { CanvasTexture, SRGBColorSpace } from 'three';
import { profile, scanLogs } from '@/data/portfolio';
import { COLORS } from './layout';

// Contenu des trois moniteurs, dessiné en 2D sur des canvas utilisés comme textures.

const W = 1024;
const H = 596;
const MONO = '"JetBrains Mono", ui-monospace, monospace';

export type ScreenPhase = 'locked' | 'scanning' | 'granted' | 'dive' | 'contact';

export class Screen {
  canvas = document.createElement('canvas');
  ctx: CanvasRenderingContext2D;
  texture: CanvasTexture;

  constructor() {
    this.canvas.width = W;
    this.canvas.height = H;
    this.ctx = this.canvas.getContext('2d')!;
    this.texture = new CanvasTexture(this.canvas);
    this.texture.colorSpace = SRGBColorSpace;
    this.texture.anisotropy = 4;
  }

  commit() {
    this.texture.needsUpdate = true;
  }

  dispose() {
    this.texture.dispose();
  }
}

const frame = (ctx: CanvasRenderingContext2D, title: string, t: number) => {
  ctx.fillStyle = '#03070a';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#0b1217';
  ctx.fillRect(0, 0, W, 40);
  ctx.font = `500 18px ${MONO}`;
  ctx.fillStyle = COLORS.muted;
  ctx.textBaseline = 'middle';
  ctx.fillText(title, 20, 21);
  const clock = new Date().toLocaleTimeString('fr-FR');
  ctx.fillText(clock, W - 20 - ctx.measureText(clock).width, 21);
  ['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(W - 200 - i * 22, 21, 6, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
  ctx.textBaseline = 'alphabetic';
  // Lignes de balayage discrètes.
  ctx.fillStyle = 'rgba(255,255,255,0.025)';
  for (let y = 40 + ((t * 30) % 4); y < H; y += 4) ctx.fillRect(0, y, W, 1);
};

const caret = (t: number) => (Math.floor(t * 2) % 2 === 0 ? '_' : ' ');

const drawLock = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string, open: boolean) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = 8;
  ctx.beginPath();
  if (open) ctx.arc(x + 26, y - 6, 26, Math.PI, Math.PI * 1.9);
  else ctx.arc(x, y - 6, 26, Math.PI, 0);
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.fillRect(x - 38, y, 76, 58);
  ctx.fillStyle = '#03070a';
  ctx.fillRect(x - 5, y + 18, 10, 20);
};

export const drawMain = (s: Screen, phase: ScreenPhase, scan: number, t: number) => {
  const { ctx } = s;
  frame(ctx, 'root@kali: ~/ops/hugo_lambert', t);
  ctx.font = `500 24px ${MONO}`;

  if (phase === 'locked') {
    drawLock(ctx, W / 2, 190, COLORS.danger, false);
    ctx.textAlign = 'center';
    ctx.fillStyle = COLORS.danger;
    ctx.font = `700 58px ${MONO}`;
    ctx.fillText('ACCÈS REFUSÉ', W / 2, 360);
    ctx.font = `400 22px ${MONO}`;
    ctx.fillStyle = COLORS.muted;
    ctx.fillText(`cible : ${profile.handle} · profil chiffré`, W / 2, 410);
    ctx.fillStyle = COLORS.ink;
    ctx.fillText(`> scroll pour lancer l'intrusion${caret(t)}`, W / 2, 500);
    ctx.textAlign = 'left';
  }

  if (phase === 'scanning') {
    const count = Math.max(1, Math.ceil(scan * scanLogs.length));
    const lines = scanLogs.slice(0, count).slice(-13);
    ctx.font = `400 22px ${MONO}`;
    lines.forEach((line, i) => {
      ctx.fillStyle = line.includes('FOUND') ? COLORS.accent : 'rgba(110, 231, 170, 0.85)';
      ctx.fillText(line, 28, 82 + i * 30);
    });
    ctx.fillStyle = COLORS.ink;
    ctx.font = `600 22px ${MONO}`;
    ctx.fillText(`DECRYPTING ASSET... ${Math.round(scan * 100)}%`, 28, H - 52);
    ctx.fillStyle = '#132029';
    ctx.fillRect(28, H - 36, W - 56, 12);
    ctx.fillStyle = COLORS.accent;
    ctx.fillRect(28, H - 36, (W - 56) * scan, 12);
  }

  if (phase === 'granted') {
    drawLock(ctx, 120, 150, COLORS.ok, true);
    ctx.fillStyle = COLORS.ok;
    ctx.font = `700 54px ${MONO}`;
    ctx.fillText('ACCÈS AUTORISÉ', 210, 178);
    const rows = [
      ['PROFILE', 'Hugo LAMBERT'],
      ['STATUS', profile.title],
      ['ROLE', 'Apprenti analyste cyber · Unofi'],
      ['CURSUS', 'Mastère Expert Cyber · Ynov'],
      ['CLEARANCE', 'AUTHORIZED'],
    ];
    ctx.font = `400 25px ${MONO}`;
    rows.forEach(([k, val], i) => {
      ctx.fillStyle = COLORS.muted;
      ctx.fillText(k.padEnd(10, ' '), 70, 290 + i * 44);
      ctx.fillStyle = COLORS.ink;
      ctx.fillText(val, 250, 290 + i * 44);
    });
  }

  if (phase === 'dive') {
    ctx.font = `400 26px ${MONO}`;
    const lines = [
      '$ ssh -i ~/.ssh/id_ed25519 hugo@portfolio',
      'Connexion chiffrée établie.',
      'Montage du réseau : /parcours /arsenal /htb',
      '                   /certifications /operations',
      `> entrée dans le système${caret(t)}`,
    ];
    lines.forEach((line, i) => {
      ctx.fillStyle = i === 0 ? COLORS.ink : i === 4 ? COLORS.accent : COLORS.muted;
      ctx.fillText(line, 40, 110 + i * 50);
    });
  }

  if (phase === 'contact') {
    ctx.font = `400 26px ${MONO}`;
    const lines = [
      '$ ssh contact@hugo-lambert',
      'Canal sécurisé ouvert.',
      '',
      'Je vous répondrai dans les plus brefs délais.',
      '',
      `> en attente de votre message${caret(t)}`,
    ];
    lines.forEach((line, i) => {
      ctx.fillStyle = i === 0 ? COLORS.ink : i === 5 ? COLORS.accent : COLORS.muted;
      ctx.fillText(line, 40, 110 + i * 50);
    });
  }

  s.commit();
};

const hex = (n: number) => n.toString(16).padStart(4, '0');

export const drawPackets = (s: Screen, t: number) => {
  const { ctx } = s;
  frame(ctx, 'tcpdump -i tun0 -X', t);
  ctx.font = `400 19px ${MONO}`;
  const offset = Math.floor(t * 6);
  for (let i = 0; i < 18; i++) {
    const n = offset + i;
    const seed = Math.sin(n * 12.9898) * 43758.5453;
    const words = Array.from({ length: 8 }, (_, w) => hex(Math.floor(Math.abs(Math.sin(seed + w) * 65535))));
    ctx.fillStyle = COLORS.muted;
    ctx.fillText(`0x${hex((n * 16) % 65536)}:`, 20, 72 + i * 29);
    ctx.fillStyle = n % 7 === 0 ? COLORS.accent : 'rgba(230,235,236,0.75)';
    ctx.fillText(words.join(' '), 130, 72 + i * 29);
  }
  s.commit();
};

const PROCESSES = ['nmap -sC -sV 10.10.11.42', 'burpsuite', 'responder -I tun0', 'wireshark', 'msfconsole -q', 'hydra -L users.txt ssh://'];

export const drawMonitor = (s: Screen, t: number) => {
  const { ctx } = s;
  frame(ctx, 'htop', t);
  ctx.font = `400 19px ${MONO}`;
  for (let c = 0; c < 4; c++) {
    const load = 0.35 + 0.5 * Math.abs(Math.sin(t * (0.7 + c * 0.31) + c));
    ctx.fillStyle = COLORS.muted;
    ctx.fillText(`cpu${c}`, 20, 80 + c * 32);
    ctx.fillStyle = '#132029';
    ctx.fillRect(90, 66 + c * 32, 400, 16);
    ctx.fillStyle = load > 0.75 ? COLORS.danger : COLORS.accent;
    ctx.fillRect(90, 66 + c * 32, 400 * load, 16);
  }
  // Courbe de trafic réseau.
  ctx.strokeStyle = COLORS.accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x <= 440; x += 8) {
    const y = 140 - 50 * (0.5 + 0.5 * Math.sin((x + t * 120) * 0.035) * Math.cos((x + t * 60) * 0.013));
    if (x === 0) ctx.moveTo(550 + x, y);
    else ctx.lineTo(550 + x, y);
  }
  ctx.stroke();
  ctx.fillStyle = COLORS.muted;
  ctx.fillText('net tun0', 550, 182);

  ctx.fillStyle = COLORS.ink;
  ctx.fillText('  PID USER   %CPU COMMAND', 20, 250);
  PROCESSES.forEach((cmd, i) => {
    const cpu = (Math.abs(Math.sin(t * 0.9 + i * 1.7)) * 40).toFixed(1).padStart(5, ' ');
    ctx.fillStyle = i === Math.floor(t) % PROCESSES.length ? COLORS.accent : 'rgba(230,235,236,0.7)';
    ctx.fillText(`${String(1337 + i * 211).padStart(5, ' ')} hugo  ${cpu} ${cmd}`, 20, 290 + i * 40);
  });
  s.commit();
};
