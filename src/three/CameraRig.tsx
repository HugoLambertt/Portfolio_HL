import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { CatmullRomCurve3, PerspectiveCamera, Vector3 } from 'three';
import { scrollState, subscribeAnchors } from './scroll';
import { ROOM, SHOTS, Shot } from './layout';

const UP = new Vector3(0, 1, 0);

// Décale le point visé pour que l'objet se retrouve du côté opposé au texte (sur écran large uniquement).
const lookFor = (shot: Shot, aspect: number) => {
  const look = shot.focus.clone();
  if (aspect < 0.9 && shot.portraitDrop) look.y -= shot.portraitDrop * shot.focus.distanceTo(shot.pos);
  if (!shot.side) return look;
  const dir = shot.focus.clone().sub(shot.pos).normalize();
  const right = dir.cross(UP).normalize();
  const k = Math.min(1, Math.max(0, (aspect - 0.9) / 0.8));
  return look.addScaledVector(right, -shot.side * (shot.lateral ?? 1.6) * k);
};

export default function CameraRig() {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const aspect = useThree((s) => s.size.width / s.size.height);
  const curves = useRef<{ pos: CatmullRomCurve3; look: CatmullRomCurve3; n: number } | null>(null);
  const tmp = useMemo(() => ({ pos: new Vector3(), look: new Vector3(), right: new Vector3(), up: new Vector3() }), []);
  const smooth = useRef<{ pos: Vector3; look: Vector3 } | null>(null);

  useEffect(() => {
    const build = () => {
      let last: Shot = SHOTS['hero-0'];
      const shots = scrollState.anchors.map((a) => (last = SHOTS[a.name] ?? last));
      if (shots.length < 2) return;
      curves.current = {
        pos: new CatmullRomCurve3(shots.map((s) => s.pos), false, 'centripetal'),
        look: new CatmullRomCurve3(shots.map((s) => lookFor(s, aspect)), false, 'centripetal'),
        n: shots.length,
      };
    };
    build();
    return subscribeAnchors(build);
  }, [aspect]);

  useEffect(() => {
    camera.fov = aspect < 1 ? 58 : 42;
    camera.updateProjectionMatrix();
  }, [aspect, camera]);

  useFrame((_, dt) => {
    const c = curves.current;
    if (!c) return;
    const u = Math.min(1, scrollState.anchorPos / (c.n - 1));
    c.pos.getPoint(u, tmp.pos);
    c.look.getPoint(u, tmp.look);

    // Léger parallaxe à la souris, atténué quand la caméra traverse l'écran.
    const nearScreen = Math.min(1, Math.abs(tmp.pos.z - ROOM.screen.z) / 0.8);
    tmp.right.subVectors(tmp.look, tmp.pos).normalize().cross(UP).normalize();
    tmp.pos.addScaledVector(tmp.right, scrollState.pointer.x * 0.12 * nearScreen);
    tmp.pos.y += scrollState.pointer.y * 0.06 * nearScreen;

    if (!smooth.current) {
      smooth.current = { pos: tmp.pos.clone(), look: tmp.look.clone() };
    } else {
      const k = 1 - Math.exp(-Math.min(dt, 0.1) * 5);
      smooth.current.pos.lerp(tmp.pos, k);
      smooth.current.look.lerp(tmp.look, k);
    }
    camera.position.copy(smooth.current.pos);
    camera.lookAt(smooth.current.look);
  });

  return null;
}
