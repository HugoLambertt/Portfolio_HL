import { useEffect, useState } from 'react';
import { asset } from './portfolio';

// Données HackTheBox générées chaque nuit par le workflow GitHub Actions (public/htb-activity.json).

export type HtbType = 'machine' | 'challenge' | 'sherlock';

export type HtbActivity = {
  name: string;
  type: HtbType;
  action: string | null;
  difficulty: string | null;
  category: string | null;
  date: string;
  points: number;
  avatar: string | null;
};

type RawActivity = Omit<HtbActivity, 'type'> & { type: string };

// Les anciennes entrées « root » / « user » sont des doublons de machines déjà présentes.
const normalize = (raw: RawActivity[]): HtbActivity[] => {
  const seen = new Set<string>();
  const out: HtbActivity[] = [];
  raw.forEach((a) => {
    const type: HtbType = a.type === 'challenge' || a.type === 'sherlock' ? a.type : 'machine';
    const key = `${type}:${a.name}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ ...a, type });
  });
  return out;
};

export type HtbData = { activities: HtbActivity[]; updatedAt: string | null };

let cache: Promise<HtbData> | null = null;

export const loadHtb = () => {
  cache ??= fetch(asset('htb-activity.json'))
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
    .then((data) => ({ activities: normalize(data.activities ?? []), updatedAt: data.updated_at ?? null }))
    .catch((err) => {
      console.error('HTB load failed:', err);
      return { activities: [], updatedAt: null };
    });
  return cache;
};

export const useHtb = () => {
  const [data, setData] = useState<HtbData | null>(null);
  useEffect(() => {
    let alive = true;
    loadHtb().then((d) => alive && setData(d));
    return () => {
      alive = false;
    };
  }, []);
  return data;
};

export const HTB_DIFFICULTY_COLORS: Record<string, string> = {
  'Very Easy': '#5df2a6',
  Easy: '#9fef00',
  Medium: '#ffaf00',
  Hard: '#ff5d5d',
  Insane: '#c77dff',
};
