import { ReactNode, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Group } from 'three';

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

// N'affiche un groupe que lorsque la caméra est à portée, pour limiter le coût de rendu.
export const Station = ({ z, range = 32, children }: { z: number; range?: number; children: ReactNode }) => {
  const camera = useThree((s) => s.camera);
  const ref = useRef<Group>(null);
  useFrame(() => {
    if (ref.current) ref.current.visible = Math.abs(camera.position.z - z) < range;
  });
  return <group ref={ref}>{children}</group>;
};

// 1 quand la caméra est à moins de `near` de la station, 0 au-delà de `far`.
export const useProximity = (z: number, near = 6, far = 20) => {
  const camera = useThree((s) => s.camera);
  return () => clamp01(1 - (Math.abs(camera.position.z - z) - near) / (far - near));
};
