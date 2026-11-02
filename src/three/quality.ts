import { useSyncExternalStore } from 'react';
import { scrollState, subscribeScroll } from './scroll';

export type Quality = 'high' | 'low' | 'none';

const hasWebGL = () => {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
};

export const detectQuality = (): Quality => {
  if (!hasWebGL()) return 'none';
  const nav = navigator as Navigator & { deviceMemory?: number };
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const weakCpu = (nav.hardwareConcurrency ?? 8) <= 4;
  const weakMemory = (nav.deviceMemory ?? 8) <= 4;
  return coarse || weakCpu || weakMemory ? 'low' : 'high';
};

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Lit une valeur dérivée du scroll ; le composant ne se re-rend que si la valeur change.
export const useScrollValue = <T,>(select: () => T): T => useSyncExternalStore(subscribeScroll, select, select);

export const useStickyProgress = (index: number, steps = 1000) =>
  useScrollValue(() => Math.round(scrollState.chapterSticky[index] * steps) / steps);

export const useActiveChapter = () => useScrollValue(() => scrollState.activeChapter);
