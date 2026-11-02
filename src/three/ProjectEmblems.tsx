import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  DoubleSide,
  Group,
  InstancedMesh,
  LatheGeometry,
  Mesh,
  Object3D,
  PlaneGeometry,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  Vector2,
  Vector3,
} from 'three';
import { asset, projects } from '@/data/portfolio';
import { COLORS, PROJECT_POSITIONS } from './layout';
import { Station, useProximity } from './station';
import { Label } from './Stations';

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => t * t * (3 - 2 * t);

/* OP-01 SANIOS : un QR code qui s'assemble cube par cube */
const QrCode = ({ z }: { z: number }) => {
  const mesh = useRef<InstancedMesh>(null);
  const scan = useRef<Mesh>(null);
  const near = useProximity(z, 4, 16);
  const cells = useMemo(() => {
    const size = 21;
    const out: { x: number; y: number; scatter: Vector3; delay: number }[] = [];
    const finder = (x: number, y: number, ox: number, oy: number) => {
      const dx = x - ox;
      const dy = y - oy;
      if (dx < 0 || dy < 0 || dx > 6 || dy > 6) return null;
      const ring = Math.max(Math.abs(dx - 3), Math.abs(dy - 3));
      return ring !== 2;
    };
    let seed = 7;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const f = finder(x, y, 0, 0) ?? finder(x, y, 14, 0) ?? finder(x, y, 0, 14);
        const on = f ?? (x === 6 || y === 6 ? (x + y) % 2 === 0 : rand() > 0.52);
        if (on) out.push({ x: x - 10, y: 10 - y, scatter: new Vector3((rand() - 0.5) * 8, (rand() - 0.5) * 6, (rand() - 0.5) * 6), delay: rand() * 0.4 });
      }
    }
    return out;
  }, []);
  const dummy = useMemo(() => new Object3D(), []);

  useFrame((state) => {
    const m = mesh.current;
    if (!m) return;
    const t = state.clock.elapsedTime;
    const p = near();
    cells.forEach((c, i) => {
      const k = ease(clamp01((p - c.delay) / 0.6));
      dummy.position.set(c.x * 0.075, c.y * 0.075, 0).lerp(c.scatter, 1 - k);
      dummy.position.z += Math.sin(t * 2 + c.x * 0.5 + c.y * 0.3) * 0.015;
      dummy.scale.setScalar(0.068 * ease(clamp01(p * 2.5)));
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
    if (scan.current) scan.current.position.y = Math.sin(t * 1.4) * 0.8;
  });

  return (
    <group rotation={[0, -0.25, 0]}>
      <instancedMesh ref={mesh} args={[undefined, undefined, cells.length]} frustumCulled={false}>
        <boxGeometry />
        <meshStandardMaterial color={COLORS.ink} roughness={0.4} />
      </instancedMesh>
      <mesh ref={scan} position={[0, 0, 0.08]}>
        <planeGeometry args={[1.8, 0.012]} />
        <meshBasicMaterial color={COLORS.accent} toneMapped={false} />
      </mesh>
    </group>
  );
};

/* OP-02 TOURNAMENT GAMES : un trophée */
const Trophy = () => {
  const ref = useRef<Group>(null);
  const cup = useMemo(() => {
    const pts = [
      [0, 0], [0.32, 0], [0.32, 0.06], [0.2, 0.08], [0.18, 0.12], [0.06, 0.16], [0.05, 0.42], [0.1, 0.5],
      [0.3, 0.62], [0.42, 0.85], [0.46, 1.15], [0.44, 1.18], [0.4, 1.15], [0.36, 0.88], [0.0, 0.7],
    ].map(([x, y]) => new Vector2(x, y));
    return new LatheGeometry(pts, 48);
  }, []);
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.5;
  });
  return (
    <group ref={ref} position={[0, -0.75, 0]} scale={1.15}>
      <mesh geometry={cup}>
        <meshStandardMaterial color="#d9c48e" metalness={1} roughness={0.22} side={DoubleSide} envMapIntensity={2.5} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.46, 0.92, 0]} rotation={[0, 0, s * -Math.PI / 2]}>
          <torusGeometry args={[0.16, 0.025, 10, 24, Math.PI]} />
          <meshStandardMaterial color="#d9c48e" metalness={1} roughness={0.22} envMapIntensity={2.5} />
        </mesh>
      ))}
      <mesh position={[0, -0.08, 0]}>
        <boxGeometry args={[0.6, 0.16, 0.6]} />
        <meshStandardMaterial color="#14181d" roughness={0.5} />
      </mesh>
    </group>
  );
};

/* OP-03 BELLATRIX : la constellation d'Orion, Bellatrix mise en évidence */
const ORION: Record<string, [number, number, number]> = {
  Betelgeuse: [88.8, 7.4, 0.5],
  Bellatrix: [81.3, 6.35, 1.6],
  Meissa: [83.8, 9.9, 3.4],
  Mintaka: [83.0, -0.3, 2.2],
  Alnilam: [84.05, -1.2, 1.7],
  Alnitak: [85.2, -1.94, 1.8],
  Saiph: [86.9, -9.67, 2.1],
  Rigel: [78.6, -8.2, 0.1],
};
const ORION_LINKS = [
  ['Betelgeuse', 'Meissa'], ['Meissa', 'Bellatrix'], ['Betelgeuse', 'Bellatrix'], ['Betelgeuse', 'Alnitak'],
  ['Bellatrix', 'Mintaka'], ['Mintaka', 'Alnilam'], ['Alnilam', 'Alnitak'], ['Alnitak', 'Saiph'], ['Mintaka', 'Rigel'], ['Saiph', 'Rigel'],
];

const Orion = () => {
  const ref = useRef<Group>(null);
  const ring = useRef<Mesh>(null);
  const stars = useMemo(
    () => Object.fromEntries(Object.entries(ORION).map(([name, [ra, dec, mag]]) => [name, { pos: new Vector3(-(ra - 83.6) * 0.13, (dec + 0.4) * 0.12, 0), mag }])),
    [],
  );
  const lines = useMemo(() => {
    const g = new BufferGeometry();
    const arr = new Float32Array(ORION_LINKS.length * 6);
    ORION_LINKS.forEach(([a, b], i) => arr.set([...stars[a].pos.toArray(), ...stars[b].pos.toArray()], i * 6));
    g.setAttribute('position', new BufferAttribute(arr, 3));
    return g;
  }, [stars]);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ref.current) ref.current.rotation.y = Math.sin(t * 0.3) * 0.35;
    if (ring.current) ring.current.scale.setScalar(1 + Math.sin(t * 2.4) * 0.12);
  });
  const b = stars.Bellatrix.pos;
  return (
    <group ref={ref}>
      <lineSegments geometry={lines}>
        <lineBasicMaterial color={COLORS.accent} transparent opacity={0.45} />
      </lineSegments>
      {Object.entries(stars).map(([name, s]) => (
        <mesh key={name} position={s.pos}>
          <sphereGeometry args={[0.06 - s.mag * 0.01, 16, 12]} />
          <meshBasicMaterial color={name === 'Bellatrix' ? COLORS.accent : name === 'Betelgeuse' ? '#ffb27a' : '#dbe9ff'} toneMapped={false} />
        </mesh>
      ))}
      <mesh ref={ring} position={b}>
        <torusGeometry args={[0.16, 0.006, 6, 48]} />
        <meshBasicMaterial color={COLORS.accent} toneMapped={false} />
      </mesh>
      <Label lines={[{ text: 'BELLATRIX', size: 30, color: COLORS.accent, mono: true, weight: 600 }]} width={360} height={0.16} position={[b.x - 0.5, b.y + 0.2, 0]} />
    </group>
  );
};

/* OP-04 FORENSIC : un disque dur en vue éclatée */
const HardDrive = ({ z }: { z: number }) => {
  const near = useProximity(z, 4, 16);
  const layers = useRef<(Group | null)[]>([]);
  const platters = useRef<(Mesh | null)[]>([]);
  useFrame((state) => {
    const k = ease(near());
    layers.current.forEach((l, i) => l && (l.position.y = (i - 2) * (0.03 + k * 0.28)));
    platters.current.forEach((p) => p && (p.rotation.y = state.clock.elapsedTime * 3));
  });
  const metal = <meshStandardMaterial color="#d7dee5" metalness={1} roughness={0.08} envMapIntensity={4} />;
  return (
    <group rotation={[0.55, -0.5, 0]}>
      <group ref={(el) => (layers.current[0] = el)}>
        <mesh>
          <boxGeometry args={[1.0, 0.03, 1.36]} />
          <meshStandardMaterial color="#0f2a20" roughness={0.6} />
        </mesh>
        {[[-0.25, 0.3], [0.2, -0.35], [0.25, 0.25]].map(([x, zz], i) => (
          <mesh key={i} position={[x, 0.03, zz]}>
            <boxGeometry args={[0.18, 0.03, 0.18]} />
            <meshStandardMaterial color="#111" roughness={0.4} />
          </mesh>
        ))}
      </group>
      <group ref={(el) => (layers.current[1] = el)}>
        <mesh>
          <boxGeometry args={[1.0, 0.06, 1.36]} />
          <meshStandardMaterial color="#20252b" metalness={0.6} roughness={0.35} />
        </mesh>
      </group>
      {[2, 3].map((i) => (
        <group key={i} ref={(el) => (layers.current[i] = el)}>
          <mesh ref={(el) => (platters.current[i] = el)} position={[0, 0, -0.12]}>
            <cylinderGeometry args={[0.42, 0.42, 0.014, 64]} />
            {metal}
          </mesh>
        </group>
      ))}
      <group ref={(el) => (layers.current[4] = el)}>
        <mesh position={[0.32, 0, 0.38]} rotation={[0, 0.7, 0]}>
          <boxGeometry args={[0.06, 0.02, 0.55]} />
          {metal}
        </mesh>
        <mesh position={[0, 0, -0.12]}>
          <cylinderGeometry args={[0.05, 0.05, 0.05, 20]} />
          {metal}
        </mesh>
      </group>
    </group>
  );
};

/* OP-05 HTB x YNOV : un drapeau capturé et les captures du CTF */
const flagTexture = () => {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 308;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#0d1a05';
  ctx.fillRect(0, 0, 512, 308);
  ctx.strokeStyle = COLORS.htb;
  ctx.lineWidth = 6;
  ctx.strokeRect(14, 14, 484, 280);
  ctx.fillStyle = COLORS.htb;
  ctx.textAlign = 'center';
  ctx.font = '600 44px "JetBrains Mono", monospace';
  ctx.fillText('HTB{', 256, 120);
  ctx.fillText('ynov_ctf_2026}', 256, 180);
  ctx.font = '400 20px "JetBrains Mono", monospace';
  ctx.globalAlpha = 0.7;
  ctx.fillText('FLAG CAPTURED', 256, 250);
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  return tex;
};

const Flag = ({ gallery }: { gallery: string[] }) => {
  const shots = useRef<(Group | null)[]>([]);
  const geometry = useMemo(() => new PlaneGeometry(1.2, 0.72, 30, 14), []);
  const flagMap = useMemo(flagTexture, []);
  const base = useMemo(() => Float32Array.from(geometry.attributes.position.array), [geometry]);
  const textures = useMemo(() => {
    const loader = new TextureLoader();
    return gallery.map((src, i) => {
      const tex = loader.load(asset(src), () => {
        const img = tex.image as HTMLImageElement;
        shots.current[i]?.scale.set(img.width / img.height, 1, 1);
      });
      tex.colorSpace = SRGBColorSpace;
      return tex;
    });
  }, [gallery]);
  useEffect(() => () => textures.forEach((t: Texture) => t.dispose()), [textures]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const pos = geometry.attributes.position as BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = base[i * 3] + 0.6;
      pos.setZ(i, Math.sin(x * 5 - t * 4) * 0.06 * x + Math.sin(base[i * 3 + 1] * 4 + t * 2) * 0.02 * x);
    }
    pos.needsUpdate = true;
    geometry.computeVertexNormals();
    shots.current.forEach((s, i) => s && (s.position.y = s.userData.y + Math.sin(t * 0.8 + i) * 0.05));
  });

  return (
    <group>
      <mesh position={[-0.6, -0.15, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 1.9, 12]} />
        <meshStandardMaterial color="#c6ced6" metalness={1} roughness={0.2} />
      </mesh>
      <mesh geometry={geometry} position={[0.0, 0.42, 0]}>
        <meshStandardMaterial map={flagMap} emissiveMap={flagMap} emissive="#ffffff" emissiveIntensity={0.6} roughness={0.7} side={DoubleSide} />
      </mesh>
      {gallery.map((_, i) => {
        const a = (i / gallery.length) * Math.PI * 2;
        const y = Math.sin(a * 2) * 0.6;
        return (
          <group
            key={i}
            ref={(el) => {
              shots.current[i] = el;
              if (el) el.userData.y = y;
            }}
            position={[Math.cos(a) * 2.1, y, Math.sin(a) * 1.2 - 0.8]}
            rotation={[0, -Math.cos(a) * 0.5, 0]}
          >
            <mesh scale={0.5}>
              <planeGeometry />
              <meshBasicMaterial map={textures[i]} toneMapped={false} transparent opacity={0.92} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

export default function ProjectEmblems() {
  return (
    <>
      {projects.map((project, k) => {
        const p = PROJECT_POSITIONS[k];
        return (
          <Station key={project.id} z={p.z} range={26}>
            <group position={p}>
              {project.id === 'sanios' && <QrCode z={p.z} />}
              {project.id === 'tournament' && <Trophy />}
              {project.id === 'bellatrix' && <Orion />}
              {project.id === 'forensic' && <HardDrive z={p.z} />}
              {project.id === 'htb-ynov' && <Flag gallery={project.gallery ?? []} />}
              <Label
                lines={[{ text: `${project.codename} // ${project.category === 'web' ? 'WEB' : 'CYBER'}`, size: 26, color: COLORS.accent, mono: true, weight: 600 }]}
                width={480}
                height={0.2}
                position={[0, 1.45, 0]}
                align="center"
              />
            </group>
          </Station>
        );
      })}
    </>
  );
}
