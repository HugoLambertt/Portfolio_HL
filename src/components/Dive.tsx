import { useStickyProgress } from '@/three/quality';
import { Anchor } from './Chapter';

// Transition : la caméra plonge dans l'écran central et entre dans le réseau.
export default function Dive() {
  const p = useStickyProgress(1);
  const opacity = Math.min(1, p * 4) * Math.min(1, (1 - p) * 4);
  return (
    <section id="dive" data-chapter="dive" data-transit className="relative h-[170svh]">
      <Anchor name="dive-0" at="15%" />
      <Anchor name="dive-1" at="50%" />
      <Anchor name="dive-2" at="88%" />
      <div className="sticky top-0 flex h-svh items-end justify-center pb-16" style={{ opacity }}>
        <p className="font-mono text-xs tracking-[0.2em] text-muted-foreground">
          <span className="text-primary">$</span> ssh hugo@portfolio <span className="caret text-primary" />
        </p>
      </div>
    </section>
  );
}
