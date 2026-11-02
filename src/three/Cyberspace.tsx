import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, Group, ShaderMaterial } from 'three';
import { COLORS } from './layout';
import { ArsenalStation, CertsStation, HtbStation, TimelineStation } from './Stations';
import ProjectEmblems from './ProjectEmblems';

const Z_START = -2;
const Z_END = -175;

const Grid = ({ y, strength }: { y: number; strength: number }) => {
  const camera = useThree((s) => s.camera);
  const material = useMemo(
    () =>
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: { uColor: { value: new Color(COLORS.accent) }, uTime: { value: 0 }, uCam: { value: camera.position }, uStrength: { value: strength } },
        vertexShader: /* glsl */ `
          varying vec3 vWorld;
          void main() {
            vec4 w = modelMatrix * vec4(position, 1.0);
            vWorld = w.xyz;
            gl_Position = projectionMatrix * viewMatrix * w;
          }`,
        fragmentShader: /* glsl */ `
          uniform vec3 uColor;
          uniform float uTime;
          uniform vec3 uCam;
          uniform float uStrength;
          varying vec3 vWorld;
          float line(vec2 p, float size) {
            vec2 q = p / size;
            vec2 g = abs(fract(q - 0.5) - 0.5) / fwidth(q);
            return 1.0 - min(min(g.x, g.y), 1.0);
          }
          void main() {
            float minor = line(vWorld.xz, 1.0);
            float major = line(vWorld.xz, 6.0);
            float d = distance(vWorld.xz, uCam.xz);
            float fade = exp(-d * 0.075);
            float band = 1.0 - smoothstep(0.0, 0.035, abs(fract(vWorld.z * 0.025 + uTime * 0.12) - 0.5));
            float a = (minor * 0.12 + major * 0.38 + band * major * 0.6) * fade * uStrength;
            gl_FragColor = vec4(uColor, a);
          }`,
      }),
    [camera, strength],
  );
  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
  });
  return (
    <mesh material={material} rotation={[-Math.PI / 2, 0, 0]} position={[0, y, (Z_START + Z_END) / 2]}>
      <planeGeometry args={[90, Z_START - Z_END + 30]} />
    </mesh>
  );
};

const Particles = ({ count }: { count: number }) => {
  const { geometry, material } = useMemo(() => {
    const g = new BufferGeometry();
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = -0.5 + Math.random() * 8;
      pos[i * 3 + 2] = Z_START - Math.random() * (Z_START - Z_END);
      seed[i] = Math.random();
    }
    g.setAttribute('position', new BufferAttribute(pos, 3));
    g.setAttribute('aSeed', new BufferAttribute(seed, 1));
    const m = new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uColor: { value: new Color(COLORS.accent) }, uPixel: { value: Math.min(window.devicePixelRatio, 2) } },
      vertexShader: /* glsl */ `
        attribute float aSeed;
        uniform float uTime;
        uniform float uPixel;
        varying float vAlpha;
        void main() {
          vec3 p = position;
          p.y = -0.5 + mod(position.y + 0.5 + uTime * (0.05 + aSeed * 0.12), 8.0);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = (1.0 + aSeed * 2.5) * uPixel * (18.0 / -mv.z);
          vAlpha = (0.35 + 0.65 * abs(sin(uTime * (0.6 + aSeed) + aSeed * 20.0))) * smoothstep(60.0, 8.0, -mv.z);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.0, d) * vAlpha;
          gl_FragColor = vec4(uColor, a);
        }`,
    });
    return { geometry: g, material: m };
  }, [count]);
  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
  });
  return <points geometry={geometry} material={material} />;
};

// Fibres lumineuses parallèles à l'axe du voyage, parcourues par des impulsions.
const Streams = () => {
  const { geometry, material } = useMemo(() => {
    const lines = 26;
    const pos = new Float32Array(lines * 6);
    const seed = new Float32Array(lines * 2);
    for (let i = 0; i < lines; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const x = side * (3.5 + Math.random() * 9);
      const y = -0.4 + Math.random() * 6.5;
      pos.set([x, y, Z_START, x, y, Z_END], i * 6);
      seed[i * 2] = seed[i * 2 + 1] = Math.random();
    }
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(pos, 3));
    g.setAttribute('aSeed', new BufferAttribute(seed, 1));
    const m = new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uColor: { value: new Color(COLORS.accent) } },
      vertexShader: /* glsl */ `
        attribute float aSeed;
        varying float vZ;
        varying float vSeed;
        varying float vDepth;
        void main() {
          vZ = position.z;
          vSeed = aSeed;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vDepth = -mv.z;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        uniform vec3 uColor;
        varying float vZ;
        varying float vSeed;
        varying float vDepth;
        void main() {
          float pulse = smoothstep(0.9, 1.0, fract(-vZ * 0.02 + uTime * (0.25 + vSeed * 0.4) + vSeed * 10.0));
          float a = (0.06 + pulse * 0.9) * smoothstep(70.0, 5.0, vDepth);
          gl_FragColor = vec4(uColor, a);
        }`,
    });
    return { geometry: g, material: m };
  }, []);
  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
  });
  return <lineSegments geometry={geometry} material={material} />;
};

export default function Cyberspace({ lowPower }: { lowPower: boolean }) {
  const camera = useThree((s) => s.camera);
  const ref = useRef<Group>(null);
  useFrame(() => {
    if (ref.current) ref.current.visible = camera.position.z < 0.3;
  });

  return (
    <group ref={ref}>
      <hemisphereLight args={['#9fdcff', '#05080b', 1.1]} />
      <directionalLight position={[4, 8, 6]} intensity={1.4} color="#dff4ff" />
      <Grid y={-0.6} strength={1} />
      <Grid y={7.5} strength={0.35} />
      <Particles count={lowPower ? 900 : 2600} />
      <Streams />
      <TimelineStation />
      <ArsenalStation />
      <HtbStation />
      <CertsStation />
      <ProjectEmblems />
    </group>
  );
}
