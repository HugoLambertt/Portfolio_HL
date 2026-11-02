import { Vector3 } from 'three';
import { projectSide, projects, timeline } from '@/data/portfolio';

// Plan du monde 3D. La pièce est à l'origine, l'écran central fait face à +z ;
// le « cyberespace » s'étend derrière l'écran, vers -z.

export const COLORS = {
  bg: '#05080b',
  accent: '#7dd6ff',
  ink: '#e6ebec',
  muted: '#7f8c92',
  htb: '#9fef00',
  danger: '#ff5d5d',
  ok: '#5df2a6',
  hoodie: '#1b1e23',
  hair: '#d8b25a',
  skin: '#dfac87',
};

export const ROOM = {
  deskTop: 0.74,
  screen: { x: 0, y: 1.12, z: -0.47, w: 0.62, h: 0.36 },
};

export const TIMELINE_NODES = timeline.map(
  (_, k) => new Vector3(k % 2 === 0 ? 1.4 : -1.4, 1.5 + (k % 3) * 0.3, -11 - k * 5.5),
);

export const ARSENAL_CENTER = new Vector3(0, 2, -52);
export const HTB_CENTER = new Vector3(0, 2.2, -70);
export const CERTS_CENTER = new Vector3(0, 2, -88);
export const PROJECT_POSITIONS = projects.map(
  (_, k) => new Vector3(projectSide(k) * 1.8, 2, -104 - k * 12),
);

// Un plan caméra par repère [data-anchor] du DOM.
// `side` : +1 = l'objet doit apparaître à droite (texte à gauche), -1 = à gauche.
// `portraitDrop` : sur écran vertical, abaisse le point visé pour remonter la scène au-dessus du texte.
export type Shot = { pos: Vector3; focus: Vector3; side?: number; lateral?: number; portraitDrop?: number };

const v = (x: number, y: number, z: number) => new Vector3(x, y, z);

export const SHOTS: Record<string, Shot> = {
  'hero-0': { portraitDrop: 0.22, pos: v(2.7, 1.75, 1.7), focus: v(-0.15, 0.95, -0.2), side: 1, lateral: 0.6 },
  'hero-1': { portraitDrop: 0.22, pos: v(1.95, 1.45, 1.2), focus: v(-0.1, 1.05, -0.25), side: 1, lateral: 0.45 },
  'hero-2': { portraitDrop: 0.22, pos: v(1.95, 1.45, 0.12), focus: v(0, 1.18, 0.28), side: 1, lateral: 0.45 },
  'hero-3': { portraitDrop: 0.22, pos: v(1.7, 1.4, 0.02), focus: v(0, 1.2, 0.28), side: 1, lateral: 0.4 },
  'dive-0': { pos: v(0.26, 1.16, 0.0), focus: v(0, 1.12, -0.47) },
  'dive-1': { pos: v(0, 1.12, -0.28), focus: v(0, 1.12, -2) },
  'dive-2': { pos: v(0, 1.45, -3.4), focus: v(0, 1.55, -10) },
  'about-bio': { pos: v(0, 1.95, -5.2), focus: v(0.6, 1.6, -13), side: 1 },
  ...Object.fromEntries(
    TIMELINE_NODES.map((n, k) => [
      `about-${k}`,
      { pos: v(n.x * 0.45, n.y + 0.55, n.z + 3.4), focus: n.clone(), side: 1, lateral: 1.1 },
    ]),
  ),
  'arsenal-0': { pos: v(-0.6, 3.2, ARSENAL_CENTER.z + 8.5), focus: ARSENAL_CENTER.clone(), side: -1 },
  'arsenal-1': { pos: v(-0.2, 2.3, ARSENAL_CENTER.z + 6.2), focus: ARSENAL_CENTER.clone(), side: -1 },
  'htb-0': { pos: v(0.8, 2.6, HTB_CENTER.z + 8.5), focus: HTB_CENTER.clone(), side: 1, lateral: 2.4 },
  'htb-grid': { pos: v(0, 6, HTB_CENTER.z + 7), focus: v(0, 1.2, HTB_CENTER.z) },
  'certs-0': { pos: v(-0.4, 2.6, CERTS_CENTER.z + 7.5), focus: CERTS_CENTER.clone(), side: -1, lateral: 2 },
  'certs-1': { pos: v(-0.2, 2.2, CERTS_CENTER.z + 5.8), focus: CERTS_CENTER.clone(), side: -1, lateral: 1.8 },
  'projects-intro': { pos: v(0, 2.6, PROJECT_POSITIONS[0].z + 11), focus: v(0, 2, PROJECT_POSITIONS[0].z - 6) },
  ...Object.fromEntries(
    PROJECT_POSITIONS.map((p, k) => [
      `projects-${k}`,
      { pos: v(p.x * 0.25, 2.25, p.z + 4.6), focus: p.clone(), side: p.x > 0 ? 1 : -1, lateral: 1, portraitDrop: 0.2 },
    ]),
  ),
  exfil: { pos: v(0, 1.3, -5), focus: v(0, 1.2, -20) },
  'contact-gate': { pos: v(0, 1.13, -0.15), focus: v(0, 1.12, -3) },
  'contact-0': { portraitDrop: 0.15, pos: v(0.9, 1.55, 1.45), focus: v(-0.05, 1.05, -0.45), side: 1, lateral: 0.6 },
};
