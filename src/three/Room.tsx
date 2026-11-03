import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  Group,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Points,
  PointsMaterial,
  RectAreaLight,
  RepeatWrapping,
  SRGBColorSpace,
} from 'three';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { scrollState } from './scroll';
import { COLORS, ROOM } from './layout';
import { Screen, ScreenPhase, drawMain, drawMonitor, drawPackets } from './screens';

RectAreaLightUniformsLib.init();

// Le poste de l'intro : trois écrans flottant dans le noir au-dessus d'une grille lumineuse.
// L'écran central raconte l'intrusion (refusé → scan → autorisé), puis la caméra le traverse pour entrer dans le réseau.

const phaseFor = (): { phase: ScreenPhase; scan: number } => {
  const chapter = scrollState.activeChapter;
  const p = scrollState.chapterSticky[0];
  if (chapter >= 7) return { phase: 'contact', scan: 1 };
  if (chapter >= 1) return { phase: 'dive', scan: 1 };
  if (p < 0.1) return { phase: 'locked', scan: 0 };
  if (p < 0.6) return { phase: 'scanning', scan: (p - 0.1) / 0.5 };
  return { phase: 'granted', scan: 1 };
};

const PHASE_LIGHT: Record<ScreenPhase, string> = {
  locked: '#ff7a7a',
  scanning: '#8fd9ff',
  granted: '#86f5bd',
  dive: '#8fd9ff',
  contact: '#8fd9ff',
};

const radialTexture = (inner: string, outer: string) => {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, inner);
  g.addColorStop(1, outer);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new CanvasTexture(c);
};

// Lueur rectangulaire floue, posée derrière chaque écran.
const glowTexture = () => {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 160;
  const ctx = c.getContext('2d')!;
  ctx.shadowColor = 'rgba(255,255,255,0.9)';
  ctx.shadowBlur = 28;
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillRect(40, 40, 176, 80);
  return new CanvasTexture(c);
};

// Une maille de grille de 1 m, répétée sur tout le sol ; le brouillard l'efface au loin.
const gridTexture = () => {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d')!;
  ctx.strokeStyle = 'rgba(125, 214, 255, 0.55)';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, 256, 256);
  ctx.strokeStyle = 'rgba(125, 214, 255, 0.14)';
  ctx.lineWidth = 1;
  for (let k = 64; k < 256; k += 64) {
    ctx.beginPath();
    ctx.moveTo(k, 0);
    ctx.lineTo(k, 256);
    ctx.moveTo(0, k);
    ctx.lineTo(256, k);
    ctx.stroke();
  }
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  tex.wrapS = tex.wrapT = RepeatWrapping;
  tex.repeat.set(30, 30);
  tex.anisotropy = 8;
  return tex;
};

type MonitorProps = {
  position: [number, number, number];
  rotation?: number;
  material: MeshBasicMaterial;
  frameMat: MeshStandardMaterial;
  haloMat: MeshBasicMaterial;
};

// Écran sans pied : un cadre fin, la dalle, et un halo derrière qui prend la couleur de la phase.
const Monitor = ({ position, rotation = 0, material, frameMat, haloMat }: MonitorProps) => {
  const { w, h } = ROOM.screen;
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh material={haloMat} position={[0, 0, -0.03]}>
        <planeGeometry args={[w * 1.45, h * 1.6]} />
      </mesh>
      <mesh material={frameMat}>
        <boxGeometry args={[w + 0.02, h + 0.02, 0.016]} />
      </mesh>
      <mesh material={material} position={[0, 0, 0.0085]}>
        <planeGeometry args={[w, h]} />
      </mesh>
    </group>
  );
};

const PARTICLES = 220;

export default function Room() {
  const camera = useThree((s) => s.camera);
  const group = useRef<Group>(null);
  const screenLight = useRef<RectAreaLight>(null);
  const lastDraw = useRef({ main: '', side: 0 });

  const screens = useMemo(() => ({ main: new Screen(), left: new Screen(), right: new Screen() }), []);
  const mats = useMemo(
    () => ({
      main: new MeshBasicMaterial({ map: screens.main.texture, toneMapped: false, transparent: true }),
      left: new MeshBasicMaterial({ map: screens.left.texture, toneMapped: false }),
      right: new MeshBasicMaterial({ map: screens.right.texture, toneMapped: false }),
      frame: new MeshStandardMaterial({ color: '#0d1013', roughness: 0.4, metalness: 0.4 }),
      halo: new MeshBasicMaterial({ map: glowTexture(), transparent: true, depthWrite: false, blending: AdditiveBlending, toneMapped: false }),
      floor: new MeshStandardMaterial({ color: '#070a0d', roughness: 0.35, metalness: 0.6 }),
      grid: new MeshBasicMaterial({ map: gridTexture(), transparent: true, depthWrite: false, opacity: 0.5 }),
      pool: new MeshBasicMaterial({ map: radialTexture('rgba(125,214,255,0.35)', 'rgba(125,214,255,0)'), transparent: true, depthWrite: false, blending: AdditiveBlending }),
    }),
    [screens],
  );

  // Particules de données qui montent lentement autour des écrans.
  const particles = useMemo(() => {
    const geometry = new BufferGeometry();
    const pos = new Float32Array(PARTICLES * 3);
    for (let i = 0; i < PARTICLES; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 4.5;
      pos[i * 3 + 1] = Math.random() * 3;
      pos[i * 3 + 2] = -1.6 + Math.random() * 3.2;
    }
    geometry.setAttribute('position', new BufferAttribute(pos, 3));
    const material = new PointsMaterial({ color: COLORS.accent, size: 0.012, transparent: true, opacity: 0.55, depthWrite: false, blending: AdditiveBlending });
    return new Points(geometry, material);
  }, []);

  useEffect(() => {
    screenLight.current?.lookAt(0, ROOM.screen.y, 2);
    return () => {
      Object.values(screens).forEach((s) => s.dispose());
      Object.values(mats).forEach((m) => {
        m.map?.dispose();
        m.dispose();
      });
      particles.geometry.dispose();
      (particles.material as PointsMaterial).dispose();
    };
  }, [mats, screens, particles]);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    g.visible = camera.position.z > -3.5;
    if (!g.visible) return;
    const t = state.clock.elapsedTime;
    const { phase, scan } = phaseFor();

    // L'écran central se « dissout » quand la caméra le traverse.
    const { screen } = ROOM;
    const dz = Math.abs(camera.position.z - screen.z);
    const inFrame = Math.abs(camera.position.x) < screen.w * 0.6 && Math.abs(camera.position.y - screen.y) < screen.h * 0.7;
    mats.main.opacity = inFrame ? Math.min(1, Math.max(0, (dz - 0.06) / 0.3)) : 1;

    const key = `${phase}:${Math.round(scan * 100)}:${Math.floor(t * 2)}`;
    if (key !== lastDraw.current.main) {
      lastDraw.current.main = key;
      drawMain(screens.main, phase, scan, t);
    }
    if (t - lastDraw.current.side > 0.09) {
      lastDraw.current.side = t;
      drawPackets(screens.left, t);
      drawMonitor(screens.right, t);
    }

    const tint = new Color(PHASE_LIGHT[phase]);
    const light = screenLight.current;
    if (light) {
      light.color.lerp(tint, 0.06);
      light.intensity = 9 + Math.sin(t * 9) * 0.25;
    }
    mats.halo.color.lerp(tint, 0.06);
    mats.pool.color.lerp(tint, 0.06);
    mats.halo.opacity = 0.5 + Math.sin(t * 2.2) * 0.08;

    const p = particles.geometry.attributes.position as BufferAttribute;
    for (let i = 0; i < PARTICLES; i++) {
      const y = p.getY(i) + dt * (0.05 + (i % 7) * 0.012);
      p.setY(i, y > 3 ? 0 : y);
    }
    p.needsUpdate = true;
  });

  return (
    <group ref={group}>
      <ambientLight intensity={0.18} color="#9fb3c8" />
      <rectAreaLight ref={screenLight} position={[0, ROOM.screen.y, -0.42]} width={1.8} height={0.42} intensity={9} />
      <directionalLight position={[2, 3, 3]} intensity={0.3} color="#9fdcff" />

      {/* Sol sombre et brillant, grille lumineuse, flaque de lumière sous les écrans */}
      <mesh material={mats.floor} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 30]} />
      </mesh>
      <mesh material={mats.grid} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <planeGeometry args={[30, 30]} />
      </mesh>
      <mesh material={mats.pool} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, -0.2]} scale={[3.4, 2.4, 1]}>
        <planeGeometry />
      </mesh>

      <Monitor position={[0, ROOM.screen.y, -0.48]} material={mats.main} frameMat={mats.frame} haloMat={mats.halo} />
      <Monitor position={[-0.66, ROOM.screen.y, -0.37]} rotation={0.5} material={mats.left} frameMat={mats.frame} haloMat={mats.halo} />
      <Monitor position={[0.66, ROOM.screen.y, -0.37]} rotation={-0.5} material={mats.right} frameMat={mats.frame} haloMat={mats.halo} />

      <primitive object={particles} />
    </group>
  );
}
