import { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';

const CustomCursor = () => {
  const [isClicking, setIsClicking] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const crosshairRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (cursorRef.current && coreRef.current && glowRef.current && crosshairRef.current) {
        // Precise movement for the core
        gsap.to(coreRef.current, {
          x: e.clientX,
          y: e.clientY,
          duration: 0,
        });

        // Slight lag for the glow for a fluid feel
        gsap.to(glowRef.current, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.15,
          ease: "power2.out"
        });

        // Movement for the whole container
        gsap.to(cursorRef.current, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.1,
          ease: "power2.out"
        });

        // Movement for crosshair
        gsap.to(crosshairRef.current, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.2,
          ease: "power3.out"
        });
      }
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'A' || 
        target.tagName === 'BUTTON' || 
        target.closest('button') || 
        target.classList.contains('interactive') ||
        target.classList.contains('cursor-pointer') ||
        target.getAttribute('role') === 'button'
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
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
  }, []);

  const colorClass = isClicking ? 'green' : 'red';
  const colorHex = isClicking ? '#22c55e' : '#ef4444';

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {/* Laser Core - The brightest point */}
      <div 
        ref={coreRef}
        className={`fixed top-0 left-0 w-1.5 h-1.5 -ml-0.75 -mt-0.75 rounded-full z-[10001] transition-colors duration-200 ${
          isClicking ? 'bg-white' : 'bg-white'
        }`}
        style={{
          boxShadow: `0 0 10px 2px ${colorHex}, 0 0 5px white`
        }}
      />

      {/* Primary Laser Glow */}
      <div 
        ref={glowRef}
        className={`fixed top-0 left-0 w-6 h-6 -ml-3 -mt-3 rounded-full z-[10000] opacity-60 blur-[2px] transition-all duration-300 ${
          isHovering ? 'scale-150' : 'scale-100'
        }`}
        style={{
          background: `radial-gradient(circle, ${colorHex} 0%, transparent 70%)`,
          boxShadow: `0 0 15px ${colorHex}`
        }}
      />

      {/* Cyber Crosshair lines */}
      <div 
        ref={crosshairRef}
        className={`fixed top-0 left-0 z-[9999] transition-all duration-500 ${
          isHovering ? 'scale-125 rotate-45' : 'scale-100 rotate-0'
        }`}
      >
        {/* Horizontal Line */}
        <div 
          className="absolute top-0 left-[-15px] w-[30px] h-[1px] opacity-40 transition-colors duration-300"
          style={{ backgroundColor: colorHex, boxShadow: `0 0 5px ${colorHex}` }}
        />
        {/* Vertical Line */}
        <div 
          className="absolute top-[-15px] left-0 w-[1px] h-[30px] opacity-40 transition-colors duration-300"
          style={{ backgroundColor: colorHex, boxShadow: `0 0 5px ${colorHex}` }}
        />
        
        {/* Corner marks for futuristic feel */}
        <div className="absolute -top-4 -left-4 w-2 h-2 border-t border-l opacity-30" style={{ borderColor: colorHex }} />
        <div className="absolute -top-4 -right-4 w-2 h-2 border-t border-r opacity-30" style={{ borderColor: colorHex }} />
        <div className="absolute -bottom-4 -left-4 w-2 h-2 border-b border-l opacity-30" style={{ borderColor: colorHex }} />
        <div className="absolute -bottom-4 -right-4 w-2 h-2 border-b border-r opacity-30" style={{ borderColor: colorHex }} />
      </div>

      {/* Large Ambient Glow */}
      <div 
        ref={cursorRef}
        className={`fixed top-0 left-0 w-24 h-24 -ml-12 -mt-12 rounded-full z-[9998] opacity-10 blur-xl transition-all duration-500 ${
          isClicking ? 'scale-75' : 'scale-100'
        }`}
        style={{
          background: `radial-gradient(circle, ${colorHex} 0%, transparent 70%)`
        }}
      />
    </div>
  );
};

export default CustomCursor;
