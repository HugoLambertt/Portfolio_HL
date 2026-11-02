import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  BufferGeometry,
  CanvasTexture,
  CapsuleGeometry,
  ConeGeometry,
  CylinderGeometry,
  DoubleSide,
  Group,
  LatheGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Quaternion,
  SphereGeometry,
  SRGBColorSpace,
  TorusGeometry,
  Vector2,
  Vector3,
} from 'three';
import { scrollState } from './scroll';
import { COLORS } from './layout';

// L'opérateur : personnage stylisé assis, capuche relevée, mèche blonde, qui travaille sur ses écrans.
// Les bras sont résolus par IK à deux segments ; un petit « emploi du temps » alterne frappe au clavier,
// souris et coups d'œil aux écrans. À l'accès autorisé, il se redresse, se tourne et salue la caméra.

const UP = new Vector3(0, 1, 0);
const UPPER_ARM = 0.28;
const FOREARM = 0.27;

// Le torse pivote autour des hanches ; épaules et tête sont exprimées dans son repère local.
const HIP = new Vector3(0, 0.52, 0.47);
const LEAN_WORK = -0.2;
const LEAN_RELAX = -0.07;
const SHOULDER_LOCAL = [new Vector3(-0.185, 0.5, 0.05), new Vector3(0.185, 0.5, 0.05)];
const HEAD_LOCAL = new Vector3(0, 0.6, -0.02);

const WRISTS = [new Vector3(-0.125, 0.8, 0.01), new Vector3(0.125, 0.8, 0.01)];
const MOUSE_WRIST = new Vector3(0.32, 0.79, 0.03);
const WAVE_WRIST = new Vector3(0.3, 1.24, 0.16);
const POLES = [new Vector3(-1, -1, 0.7).normalize(), new Vector3(1, -1, 0.7).normalize()];
const SCREENS = {
  center: new Vector3(0, 1.12, -0.47),
  left: new Vector3(-0.66, 1.12, -0.37),
  right: new Vector3(0.66, 1.12, -0.37),
};

const smooth = (a: number, b: number, t: number) => {
  const k = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return k * k * (3 - 2 * k);
};

const rotX = (v: Vector3, a: number, out: Vector3) =>
  out.set(v.x, v.y * Math.cos(a) - v.z * Math.sin(a), v.y * Math.sin(a) + v.z * Math.cos(a));

const solveElbow = (a: Vector3, target: Vector3, pole: Vector3, out: Vector3, wrist: Vector3) => {
  const dir = target.clone().sub(a);
  const d = Math.min(dir.length(), (UPPER_ARM + FOREARM) * 0.999);
  dir.normalize();
  const along = (UPPER_ARM ** 2 - FOREARM ** 2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, UPPER_ARM ** 2 - along ** 2));
  const bend = pole.clone().addScaledVector(dir, -pole.dot(dir)).normalize();
  out.copy(a).addScaledVector(dir, along).addScaledVector(bend, h);
  wrist.copy(a).addScaledVector(dir, d);
};

const placeLimb = (mesh: Mesh, a: Vector3, b: Vector3) => {
  const dir = b.clone().sub(a);
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.scale.set(1, dir.length(), 1);
  mesh.quaternion.setFromUnitVectors(UP, dir.normalize());
};

/* ---------- Géométries ---------- */

// Torse du sweat : profil de révolution (hanches, taille, poitrine, épaules) aplati et voûté.
const HUNCH = 0.08;
const hoodieGeometry = () => {
  const profile = [
    [0.155, 0], [0.172, 0.03], [0.172, 0.07], [0.163, 0.16], [0.168, 0.26],
    [0.184, 0.36], [0.19, 0.44], [0.18, 0.5], [0.15, 0.55], [0.1, 0.585], [0.07, 0.6],
  ].map(([r, y]) => new Vector2(r, y));
  const g = new LatheGeometry(profile, 48);
  g.scale(1.18, 1, 0.76);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i) / 0.6;
    p.setZ(i, p.getZ(i) + HUNCH * y * y);
  }
  g.computeVertexNormals();
  return g;
};

// Capuche : sphère percée pour le visage, ouverte sous le menton, dont l'arrière retombe vers le dos.
const HOOD_R = 0.15;
const HOOD_HOLE = 0.9;
const HOOD_TILT = -Math.PI / 2 - 0.48;
const CHIN_GAP = 1.7;
const hoodGeometry = () => {
  const g = new SphereGeometry(HOOD_R, 48, 32, Math.PI * 1.5 + CHIN_GAP / 2, Math.PI * 2 - CHIN_GAP, HOOD_HOLE, Math.PI - HOOD_HOLE);
  g.rotateX(HOOD_TILT);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const z = p.getZ(i);
    if (z > 0) {
      p.setZ(i, z * 1.28);
      p.setY(i, p.getY(i) - z * 0.42);
    }
  }
  g.computeVertexNormals();
  return g;
};

// Tête : sphère unitaire sculptée — mâchoire carrée, menton marqué, arcade sourcilière, pommettes.
const headGeometry = () => {
  const g = new SphereGeometry(1, 56, 40);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i);
    const y = p.getY(i);
    let z = p.getZ(i);
    const front = Math.max(0, -z);
    if (y < 0) {
      x *= 1 - 0.15 * -y;
      if (z < 0) z *= 1 - 0.06 * -y;
    }
    z -= 0.1 * front * smooth(-0.55, -0.95, y);
    z -= 0.05 * front * smooth(0.05, 0.22, y) * (1 - smooth(0.3, 0.5, y));
    x *= 1 + 0.05 * front * (1 - Math.min(1, Math.abs(y + 0.05) / 0.3));
    p.setXYZ(i, x, y, z);
  }
  g.computeVertexNormals();
  return g;
};

// Mèche : cône aplati dont la pointe revient vers le visage.
const lockGeometry = (h: number, w: number) => {
  const g = new ConeGeometry(w, h, 8, 5);
  g.rotateX(Math.PI);
  g.translate(0, -h / 2, 0);
  g.scale(1, 1, 0.42);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const k = -p.getY(i) / h;
    p.setZ(i, p.getZ(i) + 0.45 * h * k * k);
  }
  g.computeVertexNormals();
  return g;
};

// Mèche de houppe : cône aplati pointé vers le haut, dont la pointe part en arrière.
const quiffGeometry = (h: number, w: number) => {
  const g = new ConeGeometry(w, h, 8, 5);
  g.translate(0, h / 2, 0);
  g.scale(1, 1, 0.45);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const k = p.getY(i) / h;
    p.setZ(i, p.getZ(i) + 0.55 * h * k * k);
  }
  g.computeVertexNormals();
  return g;
};

const printTexture = () => {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = COLORS.accent;
  ctx.font = '600 58px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('>_', 64, 66);
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  return tex;
};

type ArmRig = {
  shoulder: Mesh | null;
  upper: Mesh | null;
  elbow: Mesh | null;
  fore: Mesh | null;
  cuff: Mesh | null;
  hand: Group | null;
  fingers: (Group | null)[];
  thumb: Group | null;
};

const emptyArm = (): ArmRig => ({ shoulder: null, upper: null, elbow: null, fore: null, cuff: null, hand: null, fingers: [], thumb: null });

export default function Operator() {
  const camera = useThree((s) => s.camera);
  const torso = useRef<Group>(null);
  const head = useRef<Group>(null);
  const eyes = useRef<(Group | null)[]>([]);
  const brows = useRef<(Mesh | null)[]>([]);
  const mouth = useRef<Mesh>(null);
  const strings = useRef<(Group | null)[]>([]);
  const arms = useRef<ArmRig[]>([emptyArm(), emptyArm()]);
  const state = useRef({ yaw: 0, pitch: -0.2, lean: LEAN_WORK, grantedAt: -1, wave: 0, smile: 0, mouse: 0, blinkAt: 2 });

  const mats = useMemo(
    () => ({
      hoodie: new MeshStandardMaterial({ color: COLORS.hoodie, roughness: 0.9 }),
      rib: new MeshStandardMaterial({ color: '#141619', roughness: 0.95 }),
      pocket: new MeshStandardMaterial({ color: '#1f2227', roughness: 0.95 }),
      hood: new MeshStandardMaterial({ color: '#1e2126', roughness: 0.92, side: DoubleSide }),
      pants: new MeshStandardMaterial({ color: '#3a3e44', roughness: 0.88 }),
      cargo: new MeshStandardMaterial({ color: '#32353a', roughness: 0.9 }),
      skin: new MeshStandardMaterial({ color: COLORS.skin, roughness: 0.58 }),
      lip: new MeshStandardMaterial({ color: '#a8665a', roughness: 0.6 }),
      sclera: new MeshStandardMaterial({ color: '#f1ece6', roughness: 0.3 }),
      iris: new MeshStandardMaterial({ color: '#3f8fd6', roughness: 0.25 }),
      lash: new MeshStandardMaterial({ color: '#3a2a1a', roughness: 0.8 }),
      phones: new MeshStandardMaterial({ color: '#16181b', roughness: 0.45, metalness: 0.2 }),
      cushion: new MeshStandardMaterial({ color: '#0d0e10', roughness: 0.85 }),
      hair: [
        new MeshStandardMaterial({ color: COLORS.hair, roughness: 0.5 }),
        new MeshStandardMaterial({ color: '#e8cf8c', roughness: 0.5 }),
        new MeshStandardMaterial({ color: '#c39a52', roughness: 0.55 }),
      ],
      brow: new MeshStandardMaterial({ color: '#8d6a2f', roughness: 0.7 }),
      eye: new MeshStandardMaterial({ color: '#161210', roughness: 0.25 }),
      glint: new MeshBasicMaterial({ color: '#ffffff' }),
      shoe: new MeshStandardMaterial({ color: '#1b1d21', roughness: 0.55 }),
      sole: new MeshStandardMaterial({ color: '#e4e6e8', roughness: 0.6 }),
      string: new MeshStandardMaterial({ color: '#2b2f35', roughness: 0.7 }),
      aglet: new MeshStandardMaterial({ color: '#c9ced3', roughness: 0.25, metalness: 0.9 }),
      print: new MeshBasicMaterial({ map: printTexture(), transparent: true, opacity: 0.95, depthWrite: false, toneMapped: false }),
      backPrint: new MeshBasicMaterial({ map: printTexture(), transparent: true, opacity: 0.3, depthWrite: false }),
    }),
    [],
  );

  const geo = useMemo(
    () => ({
      hoodie: hoodieGeometry(),
      hood: hoodGeometry(),
      head: headGeometry(),
      joint: new SphereGeometry(1, 18, 14),
      upper: new CylinderGeometry(0.05, 0.059, 1, 18),
      fore: new CylinderGeometry(0.043, 0.051, 1, 18),
      cuff: new CylinderGeometry(0.04, 0.043, 1, 16),
      thigh: new CylinderGeometry(0.068, 0.08, 1, 18),
      shin: new CylinderGeometry(0.055, 0.063, 1, 18),
      pocket: (() => {
        const g = new CapsuleGeometry(0.035, 0.14, 6, 12);
        g.rotateZ(Math.PI / 2);
        return g;
      })(),
      cup: new CylinderGeometry(0.042, 0.042, 0.032, 24),
      cupPad: new TorusGeometry(0.032, 0.011, 10, 24),
      band: new TorusGeometry(0.105, 0.008, 8, 32, Math.PI),
      finger: (() => {
        const g = new CapsuleGeometry(0.0072, 0.026, 4, 8);
        g.rotateX(Math.PI / 2);
        g.translate(0, 0, 0.018);
        return g;
      })(),
      hairCap: new SphereGeometry(0.106, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.3),
      hoodRim: new TorusGeometry(HOOD_R * Math.sin(HOOD_HOLE), 0.012, 10, 48, Math.PI * 2 - CHIN_GAP),
      hem: new TorusGeometry(0.168, 0.018, 10, 40),
      collar: new TorusGeometry(0.075, 0.04, 12, 32),
      smile: new TorusGeometry(0.015, 0.0028, 6, 16, Math.PI),
      shoe: (() => {
        const g = new CapsuleGeometry(0.045, 0.13, 6, 14);
        g.rotateX(Math.PI / 2);
        return g;
      })(),
      string: new CylinderGeometry(0.0045, 0.0045, 1, 6),
      collarTop: new CylinderGeometry(0.056, 0.05, 0.08, 18, 1, true),
    }),
    [],
  );

  // Houppe blonde balayée vers le haut et sur le côté, quelques mèches sur le front, côtés courts.
  const locks = useMemo(() => {
    const list: { a: number; y: number; r: number; tilt: number; sweep: number; geometry: BufferGeometry; mat: number }[] = [];
    const add = (geometry: BufferGeometry, a: number, y: number, r: number, tilt: number, sweep: number) =>
      list.push({ a, y, r, tilt, sweep, geometry, mat: list.length % 3 });
    for (let i = 0; i < 14; i++) {
      const k = i / 13;
      add(quiffGeometry(0.034 + Math.sin(k * Math.PI) * 0.012 + Math.random() * 0.006, 0.028), -1.0 + k * 2.0, 0.062 - Math.abs(k - 0.5) * 0.04, 0.09, -1.3, -0.4);
    }
    for (let i = 0; i < 8; i++) {
      const k = i / 7;
      add(quiffGeometry(0.03 + Math.random() * 0.01, 0.03), -0.65 + k * 1.3, 0.06, 0.09, -1.2, -0.45);
    }
    add(lockGeometry(0.045, 0.016), 0.15, 0.066, 0.094, 0.55, 0.35);
    add(lockGeometry(0.035, 0.014), 0.32, 0.062, 0.093, 0.6, 0.3);
    [-1, 1].forEach((side) => [1.3, 1.5].forEach((a) => add(lockGeometry(0.045, 0.026), side * a, 0.05, 0.093, 0.2, side * 0.1)));
    return list;
  }, []);

  const legs = useMemo(
    () =>
      [-1, 1].map((side) => ({
        side,
        hip: new Vector3(side * 0.095, 0.53, 0.45),
        knee: new Vector3(side * 0.12, 0.53, 0.03),
        ankle: new Vector3(side * 0.13, 0.1, 0.08),
      })),
    [],
  );

  const tmp = useMemo(
    () => ({
      elbow: new Vector3(),
      wrist: new Vector3(),
      target: new Vector3(),
      shoulder: new Vector3(),
      dir: new Vector3(),
      headPos: new Vector3(),
      look: new Vector3(),
      q1: new Quaternion(),
      q2: new Quaternion(),
      obj: new Group(),
    }),
    [],
  );

  useFrame((frame, dt) => {
    const t = frame.clock.elapsedTime;
    const s = state.current;
    const heroP = scrollState.chapterSticky[0];
    const granted = scrollState.activeChapter === 0 && heroP > 0.6;
    const scanning = scrollState.activeChapter === 0 && heroP > 0.1 && heroP < 0.6;
    const urgency = scanning ? 1.4 : 1;
    const breath = Math.sin(t * 1.7);
    const damp = (current: number, target: number, speed: number) => current + (target - current) * (1 - Math.exp(-dt * speed));

    // Emploi du temps : un cycle de 12 s entre clavier, souris et coups d'œil aux écrans.
    const cycle = t % 12;
    const mouseW = granted ? 0 : smooth(7.4, 8, cycle) * (1 - smooth(9.9, 10.5, cycle));
    const glanceLeft = smooth(2.8, 3.3, cycle) * (1 - smooth(4.6, 5.1, cycle));

    if (granted && s.grantedAt < 0) s.grantedAt = t;
    if (!granted) s.grantedAt = -1;
    const since = s.grantedAt < 0 ? -1 : t - s.grantedAt;
    const waveTarget = since < 0 ? 0 : smooth(0.35, 0.8, since) * (1 - smooth(2.8, 3.4, since));
    s.wave = damp(s.wave, waveTarget, 8);
    s.mouse = damp(s.mouse, mouseW, 6);
    s.smile = damp(s.smile, granted ? 1 : 0, 3);
    s.lean = damp(s.lean, granted ? LEAN_RELAX : LEAN_WORK, 2.5);
    const typing = granted ? 0 : 1;

    // Torse
    const tr = torso.current;
    if (tr) {
      tr.rotation.x = s.lean + breath * 0.008;
      tr.scale.set(1 + breath * 0.006, 1, 1 + breath * 0.01);
    }
    strings.current.forEach((g, i) => g && (g.rotation.z = Math.sin(t * 1.3 + i) * 0.06));

    // Bras
    [0, 1].forEach((i) => {
      const side = i === 0 ? -1 : 1;
      const rig = arms.current[i];
      rotX(SHOULDER_LOCAL[i], s.lean, tmp.shoulder).add(HIP);
      tmp.shoulder.y += breath * 0.004;

      tmp.target.copy(WRISTS[i]);
      tmp.target.x += typing * 0.02 * Math.sin(t * (1.1 + i * 0.4) + side);
      tmp.target.z += typing * 0.012 * Math.sin(t * 0.8 + i);
      tmp.target.y += typing * 0.006 * Math.pow(Math.max(0, Math.sin(t * 6 * urgency + i * 2)), 3);
      if (i === 1) {
        tmp.target.lerp(MOUSE_WRIST, s.mouse);
        tmp.dir.set(Math.sin(t * 2.2) * 0.08, Math.sin(t * 4.5) * 0.04, 0);
        tmp.target.lerp(tmp.dir.add(WAVE_WRIST), s.wave);
      }
      solveElbow(tmp.shoulder, tmp.target, POLES[i], tmp.elbow, tmp.wrist);

      if (!rig.upper || !rig.elbow || !rig.fore || !rig.hand || !rig.shoulder || !rig.cuff) return;
      rig.shoulder.position.copy(tmp.shoulder);
      placeLimb(rig.upper, tmp.shoulder, tmp.elbow);
      rig.elbow.position.copy(tmp.elbow);
      tmp.dir.subVectors(tmp.wrist, tmp.elbow).normalize();
      const cuffStart = tmp.wrist.clone().addScaledVector(tmp.dir, -0.035);
      placeLimb(rig.fore, tmp.elbow, cuffStart);
      placeLimb(rig.cuff, cuffStart, tmp.wrist);

      // Main : à plat au-dessus du clavier, ou doigts levés vers la caméra pendant le salut.
      const hand = rig.hand;
      hand.position.copy(tmp.wrist);
      tmp.obj.position.copy(tmp.wrist);
      tmp.obj.lookAt(tmp.look.copy(tmp.wrist).add(tmp.dir.setY(0).normalize()));
      tmp.q1.copy(tmp.obj.quaternion);
      if (i === 1 && s.wave > 0.001) {
        tmp.obj.rotation.set(-Math.PI / 2 + 0.15, Math.atan2(camera.position.x - tmp.wrist.x, camera.position.z - tmp.wrist.z), Math.sin(t * 9) * 0.35, 'YXZ');
        tmp.q2.copy(tmp.obj.quaternion);
        tmp.q1.slerp(tmp.q2, s.wave);
      }
      hand.quaternion.copy(tmp.q1);

      // Doigts : chaque doigt frappe sa touche à son propre rythme.
      const openHand = i === 1 ? s.wave : 0;
      rig.fingers.forEach((f, k) => {
        if (!f) return;
        const press = Math.pow(Math.max(0, Math.sin(t * (8 + k * 2.3 + i) * urgency + k * 1.7 + i * 0.9)), 10);
        const click = i === 1 && k === 1 ? Math.pow(Math.max(0, Math.sin(t * 5)), 12) * s.mouse : 0;
        const curl = 0.55 + typing * (1 - s.mouse * (i === 1 ? 1 : 0)) * press * 0.45 + click * 0.4 - s.mouse * (i === 1 ? 0.25 : 0);
        f.rotation.x = curl * (1 - openHand) + 0.02 * openHand;
        f.rotation.y = (k - 1.5) * 0.12 * openHand;
      });
      if (rig.thumb) rig.thumb.rotation.x = 0.35 * (1 - openHand);
    });

    // Tête : regard sur l'écran de travail, vers la caméra une fois l'accès autorisé.
    const h = head.current;
    if (!h) return;
    rotX(HEAD_LOCAL, s.lean, tmp.headPos).add(HIP);
    h.position.copy(tmp.headPos);
    h.position.y += breath * 0.004;
    if (granted) tmp.look.copy(camera.position);
    else {
      tmp.look.copy(SCREENS.center).lerp(SCREENS.left, glanceLeft * 0.8).lerp(SCREENS.right, s.mouse * 0.8);
    }
    const d = tmp.look.sub(tmp.headPos).sub(new Vector3(0, 0.14, 0));
    let yaw = Math.atan2(-d.x, -d.z);
    let pitch = Math.atan2(d.y, Math.hypot(d.x, d.z));
    if (!granted) pitch += 0.012 * Math.sin(t * 7 * urgency);
    else pitch += Math.sin(Math.min(1, Math.max(0, since)) * Math.PI) * 0.12;
    yaw = Math.max(-1.25, Math.min(1.25, yaw));
    pitch = Math.max(-0.45, Math.min(0.35, pitch));
    s.yaw = damp(s.yaw, yaw, granted ? 3 : 4);
    s.pitch = damp(s.pitch, pitch, granted ? 3 : 4);
    h.rotation.set(s.pitch, s.yaw, 0, 'YXZ');

    // Visage : clignements, sourcils et sourire.
    if (t > s.blinkAt + 0.14) s.blinkAt = t + 2 + Math.random() * 3.5;
    const blink = t > s.blinkAt && t < s.blinkAt + 0.14 ? 0.12 : 1;
    eyes.current.forEach((e) => e && (e.scale.y = blink));
    brows.current.forEach((b) => b && (b.position.y = 0.04 + s.smile * 0.005 - (scanning ? 0.003 : 0)));
    if (mouth.current) mouth.current.scale.set(1, 0.2 + s.smile * 0.8, 1);
  });

  const armRef = <K extends keyof ArmRig>(i: number, key: K) => (el: ArmRig[K]) => {
    arms.current[i][key] = el;
  };

  return (
    <group>
      {/* Torse : sweat à capuche, voûté vers les écrans */}
      <group ref={torso} position={HIP}>
        <mesh geometry={geo.hoodie} material={mats.hoodie} />
        <mesh geometry={geo.hem} material={mats.rib} position={[0, 0.025, 0.002]} rotation={[Math.PI / 2, 0, 0]} scale={[1.12, 0.74, 1]} />
        <mesh geometry={geo.pocket} material={mats.pocket} position={[0, 0.13, -0.118]} scale={[1, 1, 0.24]} />
        <mesh material={mats.print} position={[0, 0.43, -0.112]} rotation={[0.19, Math.PI, 0]}>
          <planeGeometry args={[0.075, 0.075]} />
        </mesh>
        <mesh material={mats.backPrint} position={[0, 0.37, 0.176]} rotation={[-0.25, 0, 0]}>
          <planeGeometry args={[0.1, 0.1]} />
        </mesh>
        {/* Casque audio autour du cou */}
        <mesh geometry={geo.band} material={mats.phones} position={[0, 0.565, 0.035]} rotation={[Math.PI / 2 + 0.2, 0, 0]} />
        {[-1, 1].map((sd) => (
          <group key={sd} position={[sd * 0.103, 0.55, -0.005]} rotation={[0, sd * 0.55, (sd * Math.PI) / 2]}>
            <mesh geometry={geo.cup} material={mats.phones} />
            <mesh geometry={geo.cupPad} material={mats.cushion} position={[0, sd * 0.018, 0]} rotation={[Math.PI / 2, 0, 0]} />
          </group>
        ))}
        <mesh geometry={geo.joint} material={mats.hood} position={[0, 0.535, 0.16]} scale={[0.12, 0.07, 0.075]} />
        <mesh geometry={geo.collar} material={mats.hoodie} position={[0, 0.585, 0.072]} rotation={[Math.PI / 2 + 0.15, 0, 0]} />
        {[-1, 1].map((sd, i) => (
          <group key={sd} ref={(el) => (strings.current[i] = el)} position={[sd * 0.035, 0.53, -0.07]}>
            <mesh geometry={geo.string} material={mats.string} position={[0, -0.1, 0]} scale={[1, 0.2, 1]} />
            <mesh geometry={geo.joint} material={mats.aglet} position={[0, -0.212, 0]} scale={[0.006, 0.016, 0.006]} />
          </group>
        ))}
      </group>

      {/* Bras */}
      {[0, 1].map((i) => {
        const side = i === 0 ? -1 : 1;
        return (
          <group key={i}>
            <mesh ref={armRef(i, 'shoulder')} geometry={geo.joint} material={mats.hoodie} scale={[0.068, 0.064, 0.068]} />
            <mesh ref={armRef(i, 'upper')} geometry={geo.upper} material={mats.hoodie} />
            <mesh ref={armRef(i, 'elbow')} geometry={geo.joint} material={mats.hoodie} scale={0.052} />
            <mesh ref={armRef(i, 'fore')} geometry={geo.fore} material={mats.hoodie} />
            <mesh ref={armRef(i, 'cuff')} geometry={geo.cuff} material={mats.rib} />
            <group ref={armRef(i, 'hand')}>
              <mesh geometry={geo.joint} material={mats.skin} position={[0, -0.002, 0.034]} scale={[0.033, 0.013, 0.038]} />
              {[0, 1, 2, 3].map((k) => (
                <group
                  key={k}
                  ref={(el) => (arms.current[i].fingers[k] = el)}
                  position={[(k - 1.5) * 0.0145 * -side, -0.003, 0.066 - Math.abs(k - 1.2) * 0.004]}
                  scale={k === 3 ? 0.8 : k === 0 ? 0.95 : 1}
                >
                  <mesh geometry={geo.finger} material={mats.skin} />
                </group>
              ))}
              <group ref={armRef(i, 'thumb')} position={[side * 0.03, -0.006, 0.03]} rotation={[0.35, side * 0.7, 0]}>
                <mesh geometry={geo.finger} material={mats.skin} scale={[1.1, 1.1, 0.85]} />
              </group>
            </group>
          </group>
        );
      })}

      {/* Jambes et baskets */}
      {legs.map((l, i) => (
        <group key={i}>
          <mesh geometry={geo.joint} material={mats.pants} position={l.hip} scale={0.084} />
          <mesh geometry={geo.thigh} material={mats.pants} ref={(m) => m && placeLimb(m, l.hip, l.knee)} />
          <mesh geometry={geo.joint} material={mats.pants} position={l.knee} scale={0.068} />
          <mesh geometry={geo.shin} material={mats.pants} ref={(m) => m && placeLimb(m, l.knee, l.ankle)} />
          {/* Poches cargo sur la cuisse et le mollet, avec rabat et sangle */}
          <group position={[l.hip.x + l.side * 0.078, 0.54, 0.22]}>
            <mesh material={mats.cargo}>
              <boxGeometry args={[0.022, 0.085, 0.12]} />
            </mesh>
            <mesh material={mats.pants} position={[l.side * 0.004, 0.038, 0]}>
              <boxGeometry args={[0.024, 0.02, 0.125]} />
            </mesh>
            <mesh material={mats.cargo} position={[0, -0.07, 0.03]}>
              <boxGeometry args={[0.008, 0.07, 0.012]} />
            </mesh>
          </group>
          <mesh material={mats.cargo} position={[l.ankle.x + l.side * 0.06, 0.3, 0.06]} rotation={[0.1, 0, 0]}>
            <boxGeometry args={[0.02, 0.09, 0.07]} />
          </mesh>
          {/* Baskets montantes noir et blanc */}
          <mesh geometry={geo.collarTop} material={mats.shoe} position={[l.ankle.x, 0.115, l.ankle.z - 0.005]} />
          <mesh geometry={geo.shoe} material={mats.shoe} position={[l.ankle.x, 0.052, l.ankle.z - 0.06]} scale={[1.08, 0.8, 1]} />
          <mesh geometry={geo.joint} material={mats.sole} position={[l.ankle.x, 0.042, l.ankle.z - 0.15]} scale={[0.046, 0.032, 0.055]} />
          <mesh material={mats.sole} position={[l.ankle.x, 0.014, l.ankle.z - 0.06]}>
            <boxGeometry args={[0.1, 0.028, 0.245]} />
          </mesh>
          {[0, 1, 2].map((k) => (
            <mesh key={k} material={mats.sole} position={[l.ankle.x, 0.093 - k * 0.012, l.ankle.z - 0.065 - k * 0.025]} rotation={[0.5, 0, 0]}>
              <boxGeometry args={[0.04, 0.005, 0.008]} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Tête : cou, visage, cheveux blonds, capuche */}
      <group ref={head}>
        <mesh geometry={geo.joint} material={mats.skin} position={[0, 0.05, 0.005]} scale={[0.042, 0.07, 0.042]} />
        <group position={[0, 0.14, -0.015]}>
          <mesh geometry={geo.head} material={mats.skin} scale={[0.088, 0.108, 0.097]} />
          <mesh geometry={geo.joint} material={mats.skin} position={[0, -0.012, -0.093]} scale={[0.01, 0.021, 0.012]} />
          <mesh geometry={geo.joint} material={mats.skin} position={[0, -0.03, -0.1]} scale={[0.012, 0.01, 0.011]} />
          {[-1, 1].map((sd, k) => (
            <group key={sd}>
              <group ref={(el) => (eyes.current[k] = el)} position={[sd * 0.031, 0.006, -0.088]}>
                <mesh geometry={geo.joint} material={mats.sclera} scale={[0.0135, 0.0095, 0.006]} />
                <mesh geometry={geo.joint} material={mats.iris} position={[sd * -0.0012, 0, -0.0045]} scale={[0.0058, 0.0058, 0.003]} />
                <mesh geometry={geo.joint} material={mats.eye} position={[sd * -0.0012, 0, -0.0068]} scale={[0.0027, 0.0027, 0.0015]} />
                <mesh geometry={geo.joint} material={mats.glint} position={[sd * -0.0025, 0.0022, -0.0079]} scale={0.0012} />
                <mesh geometry={geo.joint} material={mats.lash} position={[0, 0.0072, -0.0035]} scale={[0.0135, 0.0018, 0.0062]} />
              </group>
              <mesh ref={(el) => (brows.current[k] = el)} material={mats.brow} position={[sd * 0.032, 0.04, -0.092]} rotation={[0, 0, sd * 0.1]}>
                <boxGeometry args={[0.032, 0.008, 0.008]} />
              </mesh>
            </group>
          ))}
          <mesh ref={mouth} geometry={geo.smile} material={mats.lip} position={[0.005, -0.052, -0.088]} rotation={[0, 0, Math.PI + 0.18]} />

          <mesh geometry={geo.hairCap} material={mats.hair[0]} position={[0, 0.01, 0.006]} rotation={[-0.12, 0, 0]} />
          {locks.map((l, i) => (
            <group key={i} position={[Math.sin(l.a) * l.r, l.y, -Math.cos(l.a) * l.r]} rotation={[l.tilt, -l.a, l.sweep, 'YXZ']}>
              <mesh geometry={l.geometry} material={mats.hair[l.mat]} />
            </group>
          ))}

          <group position={[0, 0.026, 0.03]} scale={[1, 1.06, 1.08]}>
            <mesh geometry={geo.hood} material={mats.hood} />
            {/* Bord épais autour de l'ouverture du visage, interrompu sous le menton */}
            <group rotation={[HOOD_TILT, 0, 0]}>
              <group position={[0, HOOD_R * Math.cos(HOOD_HOLE), 0]} rotation={[Math.PI / 2, 0, 0]}>
                <mesh geometry={geo.hoodRim} material={mats.hood} rotation={[0, 0, -Math.PI / 2 + CHIN_GAP / 2]} />
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}
