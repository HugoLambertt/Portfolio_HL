import { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';

const CustomCursor = () => {
  const [isClicking, setIsClicking] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (cursorRef.current && glowRef.current) {
        gsap.to(cursorRef.current, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.1,
          ease: "power2.out"
        });
        gsap.to(glowRef.current, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.3,
          ease: "power2.out"
        });
      }
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return (
    <>
      <div 
        ref={cursorRef}
        className={`custom-cursor fixed top-0 left-0 w-3 h-3 -ml-1.5 -mt-1.5 rounded-full z-[9999] pointer-events-none transition-colors duration-300 ${
          isClicking ? 'bg-green-500 shadow-[0_0_15px_#22c55e]' : 'bg-red-500 shadow-[0_0_15px_#ef4444]'
        }`}
      />
      <div 
        ref={glowRef}
        className={`custom-cursor-glow fixed top-0 left-0 w-12 h-12 -ml-6 -mt-6 rounded-full z-[9998] pointer-events-none border opacity-20 transition-all duration-300 ${
          isClicking ? 'border-green-500 bg-green-500/10 scale-125' : 'border-red-500 bg-red-500/10 scale-100'
        }`}
      />
    </>
  );
};

export default CustomCursor;
