import { lazy, Suspense, useEffect, useState } from 'react';
import Lenis from 'lenis';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import Dive from '@/components/Dive';
import About from '@/components/About';
import Skills from '@/components/Skills';
import HTBActivity from '@/components/HTBActivity';
import Certifications from '@/components/Certifications';
import Projects from '@/components/Projects';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import { startScrollLoop } from '@/three/scroll';
import { detectQuality, prefersReducedMotion } from '@/three/quality';
import { setLenis } from '@/lib/smoothScroll';

// La scène 3D est chargée à part pour que le texte s'affiche immédiatement.
const Experience = lazy(() => import('@/three/Experience'));

const Index = () => {
  const [quality] = useState(detectQuality);
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('no-webgl', quality === 'none');
    const lenis = prefersReducedMotion() ? null : new Lenis({ lerp: 0.09, wheelMultiplier: 0.9 });
    setLenis(lenis);
    const stop = startScrollLoop((time) => lenis?.raf(time));
    // Les étiquettes 3D sont dessinées avec les polices du site : on attend qu'elles soient chargées.
    document.fonts.ready.then(() => setFontsReady(true));
    return () => {
      stop();
      lenis?.destroy();
      setLenis(null);
    };
  }, [quality]);

  return (
    <div className="relative min-h-screen bg-background">
      {quality !== 'none' && fontsReady && (
        <Suspense fallback={null}>
          <Experience lowPower={quality === 'low'} />
        </Suspense>
      )}
      <div className="grain" aria-hidden="true" />

      <Navigation />
      <main className="relative z-10">
        <Hero />
        <Dive />
        <About />
        <Skills />
        <HTBActivity />
        <Certifications />
        <Projects />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
