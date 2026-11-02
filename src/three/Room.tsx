import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  CanvasTexture,
  Color,
  Group,
  InstancedMesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  RectAreaLight,
  SRGBColorSpace,
} from 'three';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import Operator from './Operator';
import { scrollState } from './scroll';
import { COLORS, ROOM } from './layout';
import { Screen, ScreenPhase, drawMain, drawMonitor, drawPackets } from './screens';

RectAreaLightUniformsLib.init();

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

const blindsTexture = () => {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#05080b';
  ctx.fillRect(0, 0, 128, 256);
  for (let y = 4; y < 256; y += 16) {
    const g = ctx.createLinearGradient(0, 0, 128, 0);
    g.addColorStop(0, 'rgba(120,160,220,0.25)');
    g.addColorStop(0.5, 'rgba(170,200,255,0.75)');
    g.addColorStop(1, 'rgba(120,160,220,0.3)');
    ctx.fillStyle = g;
    ctx.fillRect(0, y, 128, 9);
  }
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  return tex;
};

type MonitorProps = {
  position: [number, number, number];
  rotation?: number;
  material: MeshBasicMaterial;
  frameMat: MeshStandardMaterial;
};

const Monitor = ({ position, rotation = 0, material, frameMat }: MonitorProps) => {
  const { w, h } = ROOM.screen;
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh material={frameMat}>
        <boxGeometry args={[w + 0.03, h + 0.03, 0.022]} />
      </mesh>
      <mesh material={frameMat} position={[0, 0, -0.03]}>
        <boxGeometry args={[w * 0.55, h * 0.6, 0.04]} />
      </mesh>
      <mesh material={material} position={[0, 0, 0.0115]}>
        <planeGeometry args={[w, h]} />
      </mesh>
      <mesh material={frameMat} position={[0, -0.27, -0.05]}>
        <boxGeometry args={[0.045, 0.2, 0.025]} />
      </mesh>
      <mesh material={frameMat} position={[0, ROOM.deskTop - position[1] + 0.006, -0.03]}>
        <boxGeometry args={[0.22, 0.012, 0.16]} />
      </mesh>
    </group>
  );
};

export default function Room() {
  const camera = useThree((s) => s.camera);
  const group = useRef<Group>(null);
  const screenLight = useRef<RectAreaLight>(null);
  const leds = useRef<InstancedMesh>(null);
  const keys = useRef<InstancedMesh>(null);
  const lastDraw = useRef({ main: '', side: 0 });

  const screens = useMemo(() => ({ main: new Screen(), left: new Screen(), right: new Screen() }), []);
  const mats = useMemo(
    () => ({
      main: new MeshBasicMaterial({ map: screens.main.texture, toneMapped: false, transparent: true }),
      left: new MeshBasicMaterial({ map: screens.left.texture, toneMapped: false }),
      right: new MeshBasicMaterial({ map: screens.right.texture, toneMapped: false }),
      frame: new MeshStandardMaterial({ color: '#0d1013', roughness: 0.45, metalness: 0.3 }),
      desk: new MeshStandardMaterial({ color: '#171b20', roughness: 0.55, metalness: 0.1 }),
      mat: new MeshStandardMaterial({ color: '#0c1013', roughness: 0.95 }),
      chair: new MeshStandardMaterial({ color: '#14181d', roughness: 0.7 }),
      floor: new MeshStandardMaterial({ color: '#0b0f13', roughness: 0.82, metalness: 0.05 }),
      wall: new MeshStandardMaterial({ color: '#0a0d10', roughness: 0.95 }),
      mug: new MeshStandardMaterial({ color: '#d5dadd', roughness: 0.4 }),
      lampGlow: new MeshBasicMaterial({ color: '#ffd2a1', toneMapped: false }),
      shadow: new MeshBasicMaterial({ map: radialTexture('rgba(0,0,0,0.75)', 'rgba(0,0,0,0)'), transparent: true, depthWrite: false }),
      blinds: new MeshBasicMaterial({ map: blindsTexture(), color: '#6d7c94', toneMapped: false }),
    }),
    [screens],
  );

  useEffect(() => {
    screenLight.current?.lookAt(0, ROOM.screen.y, 2);
    const dummy = new Object3D();
    const k = keys.current;
    if (k) {
      let i = 0;
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 14; col++) {
          dummy.position.set(-0.195 + col * 0.03, 0.762, -0.095 + row * 0.027);
          dummy.updateMatrix();
          k.setMatrixAt(i, dummy.matrix);
          const lit = (row === 2 && col >= 1 && col <= 3) || (row === 1 && col === 2);
          k.setColorAt(i, new Color(lit ? COLORS.accent : '#262c33'));
          i++;
        }
      }
      k.instanceMatrix.needsUpdate = true;
      if (k.instanceColor) k.instanceColor.needsUpdate = true;
    }
    const l = leds.current;
    if (l) {
      for (let i = 0; i < 8; i++) {
        dummy.position.set(1.15, 0.1 + i * 0.05, -0.058);
        dummy.updateMatrix();
        l.setMatrixAt(i, dummy.matrix);
      }
      l.instanceMatrix.needsUpdate = true;
    }
    return () => {
      Object.values(screens).forEach((s) => s.dispose());
      Object.values(mats).forEach((m) => m.dispose());
    };
  }, [mats, screens]);

  useFrame((state) => {
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

    const light = screenLight.current;
    if (light) {
      light.color.lerp(new Color(PHASE_LIGHT[phase]), 0.06);
      light.intensity = 9 + Math.sin(t * 9) * 0.25;
    }

    const l = leds.current;
    if (l) {
      for (let i = 0; i < 8; i++) {
        const on = Math.sin(t * (3 + i * 1.7) + i * 2.1) > 0.2;
        l.setColorAt(i, new Color(on ? (i % 3 === 0 ? COLORS.ok : COLORS.accent) : '#0f1a20'));
      }
      if (l.instanceColor) l.instanceColor.needsUpdate = true;
    }
  });

  return (
    <group ref={group}>
      <ambientLight intensity={0.25} color="#9fb3c8" />
      <rectAreaLight ref={screenLight} position={[0, ROOM.screen.y, -0.42]} width={1.8} height={0.42} intensity={9} />
      <pointLight position={[-0.72, 1.12, -0.12]} intensity={1.6} distance={3.5} decay={2} color="#ffb26b" />
      <spotLight position={[-2.2, 2.1, 0.3]} target-position={[0, 0.8, 0]} angle={0.7} penumbra={1} intensity={7} distance={7} color="#8fb4ff" />
      <directionalLight position={[2, 3, 3]} intensity={0.35} color="#9fdcff" />
      {/* Lumière de contour : détache la silhouette du personnage du fond sombre */}
      <directionalLight position={[-1.6, 2.4, 2.2]} intensity={0.9} color="#a9dcff" />

      <mesh material={mats.floor} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[30, 30]} />
      </mesh>
      <mesh material={mats.shadow} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0.1]} scale={[2.6, 2.2, 1]}>
        <planeGeometry />
      </mesh>
      <mesh material={mats.wall} position={[-2.4, 1.6, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[7, 3.2]} />
      </mesh>
      <mesh material={mats.blinds} position={[-2.39, 1.75, -0.7]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.9, 1.1]} />
      </mesh>

      {/* Bureau */}
      <mesh material={mats.desk} position={[0, ROOM.deskTop - 0.02, -0.24]}>
        <boxGeometry args={[1.9, 0.04, 0.78]} />
      </mesh>
      {[-0.92, 0.92].map((x) => (
        <mesh key={x} material={mats.desk} position={[x, (ROOM.deskTop - 0.04) / 2, -0.24]}>
          <boxGeometry args={[0.04, ROOM.deskTop - 0.04, 0.72]} />
        </mesh>
      ))}
      <mesh material={mats.mat} position={[0.05, ROOM.deskTop + 0.002, -0.04]}>
        <boxGeometry args={[0.95, 0.004, 0.38]} />
      </mesh>

      <Monitor position={[0, ROOM.screen.y, -0.48]} material={mats.main} frameMat={mats.frame} />
      <Monitor position={[-0.66, ROOM.screen.y, -0.37]} rotation={0.5} material={mats.left} frameMat={mats.frame} />
      <Monitor position={[0.66, ROOM.screen.y, -0.37]} rotation={-0.5} material={mats.right} frameMat={mats.frame} />

      {/* Clavier, souris, tasse */}
      <mesh material={mats.frame} position={[0, ROOM.deskTop + 0.01, -0.04]}>
        <boxGeometry args={[0.45, 0.018, 0.15]} />
      </mesh>
      <instancedMesh ref={keys} args={[undefined, undefined, 70]}>
        <boxGeometry args={[0.025, 0.008, 0.023]} />
        <meshStandardMaterial roughness={0.6} />
      </instancedMesh>
      <mesh material={mats.frame} position={[0.34, ROOM.deskTop + 0.014, -0.02]} scale={[0.03, 0.017, 0.05]}>
        <sphereGeometry args={[1, 16, 12]} />
      </mesh>
      <group position={[-0.44, ROOM.deskTop, -0.06]}>
        <mesh material={mats.mug} position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.038, 0.034, 0.1, 20]} />
        </mesh>
        <mesh material={mats.mug} position={[0.045, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.022, 0.006, 8, 16, Math.PI]} />
        </mesh>
      </group>

      {/* Lampe de bureau */}
      <group position={[-0.8, ROOM.deskTop, -0.3]}>
        <mesh material={mats.frame} position={[0, 0.01, 0]}>
          <cylinderGeometry args={[0.07, 0.08, 0.02, 20]} />
        </mesh>
        <mesh material={mats.frame} position={[0.02, 0.2, 0.0]} rotation={[0, 0, -0.15]}>
          <cylinderGeometry args={[0.008, 0.008, 0.4, 8]} />
        </mesh>
        <mesh material={mats.frame} position={[0.09, 0.38, 0.1]} rotation={[0.9, 0, -0.5]}>
          <cylinderGeometry args={[0.008, 0.008, 0.28, 8]} />
        </mesh>
        <mesh material={mats.frame} position={[0.14, 0.43, 0.2]} rotation={[0.6, 0, 0.3]}>
          <coneGeometry args={[0.06, 0.09, 20, 1, true]} />
        </mesh>
        <mesh material={mats.lampGlow} position={[0.13, 0.405, 0.2]}>
          <sphereGeometry args={[0.02, 12, 8]} />
        </mesh>
      </group>

      {/* Tour serveur avec LED */}
      <mesh material={mats.frame} position={[1.15, 0.26, -0.3]}>
        <boxGeometry args={[0.22, 0.52, 0.48]} />
      </mesh>
      <instancedMesh ref={leds} args={[undefined, undefined, 8]}>
        <boxGeometry args={[0.06, 0.008, 0.004]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>

      {/* Chaise */}
      <group>
        <mesh material={mats.chair} position={[0, 0.44, 0.48]}>
          <boxGeometry args={[0.5, 0.08, 0.48]} />
        </mesh>
        <mesh material={mats.chair} position={[0, 0.88, 0.77]} rotation={[0.12, 0, 0]}>
          <boxGeometry args={[0.48, 0.72, 0.07]} />
        </mesh>
        <mesh material={mats.frame} position={[0, 0.24, 0.48]}>
          <cylinderGeometry args={[0.025, 0.03, 0.34, 12]} />
        </mesh>
        {Array.from({ length: 5 }, (_, i) => (
          <mesh key={i} material={mats.frame} position={[Math.sin((i / 5) * Math.PI * 2) * 0.15, 0.06, 0.48 + Math.cos((i / 5) * Math.PI * 2) * 0.15]} rotation={[0, (i / 5) * Math.PI * 2, 0]}>
            <boxGeometry args={[0.035, 0.03, 0.3]} />
          </mesh>
        ))}
      </group>

      <Operator />
    </group>
  );
}
