import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  CatmullRomCurve3,
  Color,
  CylinderGeometry,
  DoubleSide,
  EdgesGeometry,
  Group,
  InstancedMesh,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  ShaderMaterial,
  TubeGeometry,
  Vector3,
} from 'three';
import { certifications, skillGroups, timeline } from '@/data/portfolio';
import { HTB_DIFFICULTY_COLORS, loadHtb } from '@/data/htb';
import { anchorIndex, scrollState } from './scroll';
import { ARSENAL_CENTER, CERTS_CENTER, COLORS, HTB_CENTER, TIMELINE_NODES } from './layout';
import { labelTexture } from './labels';
import { Station, useProximity } from './station';

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => t * t * (3 - 2 * t);

export const Label = ({ lines, width = 512, height, position, align = 'left' as CanvasTextAlign }: {
  lines: Parameters<typeof labelTexture>[0];
  width?: number;
  height: number;
  position: [number, number, number];
  align?: CanvasTextAlign;
}) => {
  const key = JSON.stringify(lines);
  const { material, aspect } = useMemo(() => {
    const { texture, aspect } = labelTexture(JSON.parse(key), width, 24, align);
    return { material: new MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, toneMapped: false }), aspect };
  }, [key, width, align]);
  useEffect(() => () => {
    material.map?.dispose();
    material.dispose();
  }, [material]);
  return (
    <mesh material={material} position={position}>
      <planeGeometry args={[height * aspect, height]} />
    </mesh>
  );
};

/* ---------- Parcours : un chemin réseau, un nœud par étape ---------- */

export const TimelineStation = () => {
  const nodes = useRef<(Group | null)[]>([]);
  const curve = useMemo(() => new CatmullRomCurve3([new Vector3(0, 1.3, -4), ...TIMELINE_NODES]), []);
  const tube = useMemo(() => new TubeGeometry(curve, 240, 0.014, 6, false), [curve]);
  const tubeMat = useMemo(
    () =>
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: { uFill: { value: 0 }, uTime: { value: 0 }, uColor: { value: new Color(COLORS.accent) } },
        vertexShader: /* glsl */ `
          varying float vU;
          void main() { vU = uv.x; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: /* glsl */ `
          uniform float uFill;
          uniform float uTime;
          uniform vec3 uColor;
          varying float vU;
          void main() {
            float filled = step(vU, uFill);
            float pulse = smoothstep(0.96, 1.0, fract(vU * 6.0 - uTime * 0.5));
            gl_FragColor = vec4(uColor * (1.0 + filled * 0.8), 0.12 + filled * 0.75 + pulse * 0.25);
          }`,
      }),
    [],
  );

  const coreMats = useMemo(() => timeline.map(() => new MeshBasicMaterial({ color: COLORS.accent, toneMapped: false })), []);
  const wireMat = useMemo(() => new MeshBasicMaterial({ color: COLORS.accent, wireframe: true, transparent: true, opacity: 0.55 }), []);
  const labels = useMemo(
    () =>
      timeline.map((item) => [
        { text: item.year, size: 34, color: COLORS.accent, mono: true },
        { text: item.institution, size: 30, color: COLORS.ink, weight: 600 },
        { text: item.type === 'work' ? 'Expérience' : 'Formation', size: 22, color: COLORS.muted, mono: true },
      ]),
    [],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const first = anchorIndex('about-0');
    const active = first < 0 ? -1 : scrollState.anchorPos - first;
    tubeMat.uniforms.uTime.value = t;
    tubeMat.uniforms.uFill.value = clamp01((active + 1.15) / timeline.length);
    nodes.current.forEach((n, k) => {
      if (!n) return;
      const on = clamp01(1 - Math.abs(active - k));
      const reached = active >= k - 0.3 ? 1 : 0;
      n.rotation.y = t * 0.4 + k;
      n.rotation.x = t * 0.25;
      n.scale.setScalar(0.85 + on * 0.25);
      coreMats[k].color.set(reached ? COLORS.accent : '#20313a').multiplyScalar(1 + on * 0.5);
    });
  });

  return (
    <Station z={-22} range={40}>
      <mesh geometry={tube} material={tubeMat} />
      {TIMELINE_NODES.map((p, k) => (
        <group key={k} position={p}>
          <group ref={(el) => (nodes.current[k] = el)}>
            <mesh material={wireMat}>
              <octahedronGeometry args={[0.38, 0]} />
            </mesh>
            <mesh material={coreMats[k]}>
              <icosahedronGeometry args={[0.13, 1]} />
            </mesh>
          </group>
          <Label lines={labels[k]} height={0.52} width={640} position={[0, 0.85, 0]} align="center" />
        </group>
      ))}
    </Station>
  );
};

/* ---------- Arsenal : anneau de modules, un par outil ---------- */

const SKILL_COLORS: Record<string, string> = { cyber: COLORS.accent, dev: COLORS.ink, tools: COLORS.muted };

export const ArsenalStation = () => {
  const ring = useRef<Group>(null);
  const core = useRef<Mesh>(null);
  const near = useProximity(ARSENAL_CENTER.z, 7, 22);
  const items = useMemo(() => skillGroups.flatMap((g) => g.items.map((s) => ({ ...s, group: g.id }))), []);
  const plate = useMemo(() => new MeshBasicMaterial({ color: '#0a1217', transparent: true, opacity: 0.88, side: DoubleSide }), []);
  const perTier = Math.ceil(items.length / 2);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const g = ring.current;
    if (g) {
      const first = anchorIndex('arsenal-0');
      const local = first < 0 ? 0 : scrollState.anchorPos - first;
      const target = t * 0.06 + local * Math.PI * 0.9;
      g.rotation.y += (target - g.rotation.y) * (1 - Math.exp(-dt * 3));
      g.scale.setScalar(0.6 + ease(near()) * 0.4);
    }
    if (core.current) {
      core.current.rotation.set(t * 0.3, t * 0.45, 0);
    }
  });

  return (
    <Station z={ARSENAL_CENTER.z}>
      <group position={ARSENAL_CENTER}>
        <mesh ref={core}>
          <icosahedronGeometry args={[0.75, 1]} />
          <meshBasicMaterial color={COLORS.accent} wireframe transparent opacity={0.5} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.18, 20, 16]} />
          <meshBasicMaterial color={COLORS.accent} toneMapped={false} />
        </mesh>
        <group ref={ring} rotation={[0.12, 0, 0]}>
          {items.map((item, i) => {
            const tier = i < perTier ? 0 : 1;
            const idx = tier === 0 ? i : i - perTier;
            const angle = (idx / perTier) * Math.PI * 2 + tier * (Math.PI / perTier);
            const color = SKILL_COLORS[item.group];
            return (
              <group key={item.name} position={[Math.sin(angle) * 2.9, tier === 0 ? 0.36 : -0.36, Math.cos(angle) * 2.9]} rotation={[0, angle, 0]}>
                <mesh material={plate}>
                  <planeGeometry args={[1.32, 0.5]} />
                </mesh>
                <mesh position={[-0.655, 0, 0.002]}>
                  <planeGeometry args={[0.012, 0.5]} />
                  <meshBasicMaterial color={color} toneMapped={false} />
                </mesh>
                <Label
                  lines={[
                    { text: item.name, size: 40, color: COLORS.ink, weight: 600 },
                    { text: skillGroups.find((g) => g.id === item.group)!.label.toUpperCase(), size: 20, color, mono: true },
                  ]}
                  width={620}
                  height={0.44}
                  position={[0.02, 0, 0.004]}
                />
              </group>
            );
          })}
        </group>
      </group>
    </Station>
  );
};

/* ---------- HackTheBox : un cube par machine, challenge ou sherlock ---------- */

const HTB_TYPE_COLORS = { challenge: COLORS.accent, sherlock: '#c7a6ff' };

export const HtbStation = () => {
  const mesh = useRef<InstancedMesh>(null);
  const near = useProximity(HTB_CENTER.z, 9, 24);
  const layout = useRef<{ grid: Vector3[]; scatter: Vector3[]; delay: number[] } | null>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const max = 260;

  useEffect(() => {
    let alive = true;
    loadHtb().then(({ activities }) => {
      const m = mesh.current;
      if (!alive || !m) return;
      const n = Math.min(max, activities.length);
      const cols = 16;
      const rows = Math.ceil(n / cols);
      const grid: Vector3[] = [];
      const scatter: Vector3[] = [];
      const delay: number[] = [];
      for (let i = 0; i < n; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        grid.push(new Vector3((col - (cols - 1) / 2) * 0.42, ((rows - 1) / 2 - row) * 0.42, 0));
        scatter.push(new Vector3((Math.random() - 0.5) * 18, (Math.random() - 0.5) * 9, (Math.random() - 0.5) * 14 + 4));
        delay.push(Math.random() * 0.35);
        const a = activities[i];
        const color = a.type === 'machine' ? HTB_DIFFICULTY_COLORS[a.difficulty ?? ''] ?? COLORS.htb : HTB_TYPE_COLORS[a.type];
        m.setColorAt(i, new Color(color));
      }
      m.count = n;
      if (m.instanceColor) m.instanceColor.needsUpdate = true;
      layout.current = { grid, scatter, delay };
    });
    return () => {
      alive = false;
    };
  }, []);

  useFrame((state) => {
    const m = mesh.current;
    const l = layout.current;
    if (!m || !l) return;
    const t = state.clock.elapsedTime;
    const p = near();
    l.grid.forEach((g, i) => {
      const k = ease(clamp01((p - l.delay[i]) / 0.65));
      dummy.position.lerpVectors(l.scatter[i], g, k);
      dummy.position.z += 0.12 * Math.sin(t * 1.6 + g.x * 0.9 + g.y * 1.3) * k;
      dummy.rotation.set((1 - k) * (t + i), (1 - k) * (t * 0.7 + i), 0);
      dummy.scale.setScalar(0.32 * ease(clamp01(p * 2.5)));
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <Station z={HTB_CENTER.z}>
      <group position={HTB_CENTER}>
        <instancedMesh ref={mesh} args={[undefined, undefined, max]} frustumCulled={false}>
          <boxGeometry />
          <meshStandardMaterial roughness={0.35} metalness={0.2} emissive="#0a1a05" />
        </instancedMesh>
        <Label
          lines={[{ text: 'HACKTHEBOX // ACTIVITÉ', size: 30, color: COLORS.htb, mono: true, weight: 600 }]}
          width={640}
          height={0.3}
          position={[-2.15, 1.85, 0]}
        />
      </group>
    </Station>
  );
};

/* ---------- Certifications : badges hexagonaux, pleins si obtenus, filaires si en cours ---------- */

export const CertsStation = () => {
  const badges = useRef<(Group | null)[]>([]);
  const rings = useRef<(Mesh | null)[]>([]);
  const hex = useMemo(() => {
    const g = new CylinderGeometry(0.62, 0.62, 0.08, 6);
    g.rotateX(Math.PI / 2);
    g.rotateZ(Math.PI / 6);
    return g;
  }, []);
  const edges = useMemo(() => new EdgesGeometry(hex), [hex]);
  const n = certifications.length;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    badges.current.forEach((b, i) => {
      if (!b) return;
      b.position.y = Math.sin(t * 0.9 + i) * 0.08;
      b.rotation.y = Math.sin(t * 0.5 + i * 0.7) * 0.25;
    });
    rings.current.forEach((r, i) => r && (r.rotation.z = t * (0.6 + i * 0.05)));
  });

  return (
    <Station z={CERTS_CENTER.z}>
      <group position={CERTS_CENTER}>
        {certifications.map((cert, i) => {
          const a = (i - (n - 1) / 2) * 0.36;
          const R = 4.2;
          const done = !cert.inProgress;
          return (
            <group key={cert.name} position={[Math.sin(a) * R, i % 2 === 0 ? 0.35 : -0.35, (1 - Math.cos(a)) * R]} rotation={[0, -a, 0]}>
              <group ref={(el) => (badges.current[i] = el)}>
                {done ? (
                  <mesh geometry={hex}>
                    <meshPhysicalMaterial color="#bfe6f6" metalness={0.55} roughness={0.22} clearcoat={1} clearcoatRoughness={0.15} emissive={COLORS.accent} emissiveIntensity={0.08} />
                  </mesh>
                ) : (
                  <mesh ref={(el) => (rings.current[i] = el)}>
                    <torusGeometry args={[0.7, 0.008, 6, 48, Math.PI * 1.4]} />
                    <meshBasicMaterial color={COLORS.htb} toneMapped={false} />
                  </mesh>
                )}
                <lineSegments geometry={edges}>
                  <lineBasicMaterial color={done ? COLORS.accent : COLORS.muted} transparent opacity={done ? 0.9 : 0.6} />
                </lineSegments>
                <Label
                  align="center"
                  lines={[
                    { text: cert.name, size: 34, color: done ? '#04121a' : COLORS.ink, weight: 700 },
                    { text: done ? 'VALIDÉE' : 'EN COURS', size: 20, color: done ? '#0b3346' : COLORS.htb, mono: true, weight: 600 },
                  ]}
                  width={420}
                  height={0.36}
                  position={[0, 0, 0.05]}
                />
              </group>
            </group>
          );
        })}
      </group>
    </Station>
  );
};
