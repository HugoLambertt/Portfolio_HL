import { useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import { ACESFilmicToneMapping, Color, Fog, PMREMGenerator } from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import CameraRig from './CameraRig';
import Room from './Room';
import Cyberspace from './Cyberspace';
import { COLORS } from './layout';

// Brouillard serré autour des écrans, plus profond dans le cyberespace ; reflets doux pour les métaux.
const Atmosphere = () => {
  const { gl, scene, camera } = useThree();

  useEffect(() => {
    scene.background = new Color(COLORS.bg);
    scene.fog = new Fog(COLORS.bg, 4, 16);
    const pmrem = new PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.22;
    return () => {
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);

  useFrame(() => {
    const fog = scene.fog as Fog | null;
    if (!fog) return;
    const k = Math.min(1, Math.max(0, -camera.position.z / 4));
    fog.near = 4 + k * 5;
    fog.far = 16 + k * 26;
  });

  return null;
};

export default function Experience({ lowPower }: { lowPower: boolean }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
      <Canvas
        dpr={lowPower ? [1, 1.25] : [1, 1.75]}
        gl={{ antialias: lowPower, powerPreference: 'high-performance', stencil: false }}
        camera={{ fov: 42, near: 0.03, far: 140, position: [2.1, 1.7, 2.3] }}
        onCreated={({ gl }) => {
          gl.toneMapping = ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
      >
        <Atmosphere />
        <CameraRig />
        <Room />
        <Cyberspace lowPower={lowPower} />
        {!lowPower && (
          <EffectComposer multisampling={4}>
            <Bloom intensity={0.65} luminanceThreshold={0.72} luminanceSmoothing={0.2} mipmapBlur />
            <Vignette offset={0.28} darkness={0.72} />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
}
