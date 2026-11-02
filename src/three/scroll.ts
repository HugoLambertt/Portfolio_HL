import { chapters } from '@/data/portfolio';

// Moteur de scroll partagé entre le DOM et la scène 3D.
// Les éléments [data-chapter] découpent la page en chapitres ; les éléments [data-anchor]
// marquent l'instant où la caméra doit atteindre un plan précis (quand le repère passe au milieu de l'écran).

type Listener = () => void;

type Anchor = { name: string; scroll: number };

export const scrollState = {
  y: 0,
  maxY: 1,
  vh: 1,
  // Progression 0..1 de chaque chapitre (ordre de `chapters`).
  chapterProgress: chapters.map(() => 0),
  // Progression 0..1 pendant que le contenu « sticky » du chapitre est épinglé à l'écran.
  chapterSticky: chapters.map(() => 0),
  activeChapter: 0,
  // Position fractionnaire entre les repères : 2.5 = à mi-chemin entre le repère 2 et le repère 3.
  anchorPos: 0,
  anchors: [] as Anchor[],
  pointer: { x: 0, y: 0 },
  velocity: 0,
};

let chapterEls: { top: number; height: number }[] = [];
const listeners = new Set<Listener>();
const anchorListeners = new Set<Listener>();

export const subscribeScroll = (fn: Listener) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};

export const subscribeAnchors = (fn: Listener) => {
  anchorListeners.add(fn);
  return () => {
    anchorListeners.delete(fn);
  };
};

const absTop = (el: Element) => el.getBoundingClientRect().top + window.scrollY;

export const measure = () => {
  const vh = window.innerHeight;
  scrollState.vh = vh;
  scrollState.maxY = Math.max(1, document.documentElement.scrollHeight - vh);

  chapterEls = chapters.map(({ id }) => {
    const el = document.querySelector(`[data-chapter="${id}"]`);
    if (!el) return { top: Infinity, height: 1 };
    return { top: absTop(el), height: Math.max(1, (el as HTMLElement).offsetHeight) };
  });

  let last = -1;
  scrollState.anchors = Array.from(document.querySelectorAll<HTMLElement>('[data-anchor]'))
    .filter((el) => el.offsetParent !== null || el.getClientRects().length > 0)
    .map((el) => {
      const raw = Math.min(scrollState.maxY, Math.max(0, absTop(el) - vh * 0.5));
      // Les repères doivent rester strictement croissants pour l'interpolation.
      const scroll = Math.max(raw, last + 1);
      last = scroll;
      return { name: el.dataset.anchor!, scroll };
    });

  anchorListeners.forEach((fn) => fn());
  update();
};

const update = () => {
  const y = window.scrollY;
  scrollState.velocity = y - scrollState.y;
  scrollState.y = y;

  let active = 0;
  chapterEls.forEach(({ top, height }, i) => {
    scrollState.chapterProgress[i] = Math.min(1, Math.max(0, (y - top) / height));
    scrollState.chapterSticky[i] = Math.min(1, Math.max(0, (y - top) / Math.max(1, height - scrollState.vh)));
    if (y + scrollState.vh * 0.5 >= top) active = i;
  });
  scrollState.activeChapter = active;

  const { anchors } = scrollState;
  if (anchors.length > 1) {
    let i = 0;
    while (i < anchors.length - 2 && y >= anchors[i + 1].scroll) i++;
    const a = anchors[i];
    const b = anchors[i + 1];
    const t = Math.min(1, Math.max(0, (y - a.scroll) / (b.scroll - a.scroll)));
    scrollState.anchorPos = i + t;
  }

  listeners.forEach((fn) => fn());
};

export const anchorIndex = (name: string) => scrollState.anchors.findIndex((a) => a.name === name);

// Une seule boucle requestAnimationFrame pilote Lenis et la mesure du scroll.
export const startScrollLoop = (onFrame?: (time: number) => void) => {
  let raf = 0;
  let lastY = -1;
  const loop = (time: number) => {
    onFrame?.(time);
    if (window.scrollY !== lastY) {
      lastY = window.scrollY;
      update();
    }
    raf = requestAnimationFrame(loop);
  };

  const onPointer = (e: PointerEvent) => {
    scrollState.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    scrollState.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
  };

  const ro = new ResizeObserver(() => measure());
  ro.observe(document.body);
  window.addEventListener('resize', measure);
  window.addEventListener('pointermove', onPointer, { passive: true });
  document.fonts?.ready.then(measure);
  measure();
  raf = requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    window.removeEventListener('resize', measure);
    window.removeEventListener('pointermove', onPointer);
  };
};
