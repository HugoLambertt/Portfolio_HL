import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

// Curseur de visée : point précis + réticule qui suit avec un léger retard.
const CustomCursor = () => {
  const [enabled] = useState(() => window.matchMedia('(pointer: fine)').matches);
  const [isClicking, setIsClicking] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const coreRef = useRef<HTMLDivElement>(null);
  const crosshairRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const core = coreRef.current;
    const crosshair = crosshairRef.current;
    if (!core || !crosshair) return;
    const moveCore = { x: gsap.quickSetter(core, 'x', 'px'), y: gsap.quickSetter(core, 'y', 'px') };
    const moveCross = { x: gsap.quickTo(crosshair, 'x', { duration: 0.25, ease: 'power3.out' }), y: gsap.quickTo(crosshair, 'y', { duration: 0.25, ease: 'power3.out' }) };

    const onMouseMove = (e: MouseEvent) => {
      moveCore.x(e.clientX);
      moveCore.y(e.clientY);
      moveCross.x(e.clientX);
      moveCross.y(e.clientY);
    };
    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      setIsHovering(!!target.closest('a, button, [role="button"], input, textarea, label'));
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mouseover', onMouseOver);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mouseover', onMouseOver);
    };
  }, [enabled]);

  if (!enabled) return null;
  const color = isClicking ? '#ffffff' : 'hsl(199 100% 75%)';

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]" aria-hidden="true">
      <div ref={coreRef} className="fixed left-0 top-0 -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
      <div ref={crosshairRef} className="fixed left-0 top-0">
        <div className={`transition-transform duration-300 ${isHovering ? 'rotate-45 scale-125' : ''} ${isClicking ? 'scale-75' : ''}`}>
          <div className="absolute -left-[14px] top-0 h-px w-[8px] opacity-60" style={{ background: color }} />
          <div className="absolute left-[6px] top-0 h-px w-[8px] opacity-60" style={{ background: color }} />
          <div className="absolute -top-[14px] left-0 h-[8px] w-px opacity-60" style={{ background: color }} />
          <div className="absolute left-0 top-[6px] h-[8px] w-px opacity-60" style={{ background: color }} />
        </div>
      </div>
    </div>
  );
};

export default CustomCursor;
