import { useState } from 'react';
import { Box, ExternalLink, Flag, Loader2, Search, Target, Terminal } from 'lucide-react';
import { HTB_DIFFICULTY_COLORS, HtbType, useHtb } from '@/data/htb';
import { socials } from '@/data/portfolio';
import { Anchor, Kicker, Stage } from './Chapter';

const S3 = 'https://htb-mp-prod-public-storage.s3.eu-central-1.amazonaws.com';

const toPublicAvatar = (url: string | null): string | null => {
  if (!url) return null;
  if (url.includes('labs.hackthebox.com/avatars/')) {
    const filename = url.split('/avatars/').pop()?.replace('_thumb', '');
    return filename ? `${S3}/avatars/${filename}` : null;
  }
  return url;
};

const TypeIcon = ({ type, className = 'w-4 h-4' }: { type: string; className?: string }) => {
  if (type === 'challenge') return <Target className={className} />;
  if (type === 'sherlock') return <Search className={className} />;
  return <Box className={className} />;
};

const htbUrl = (type: string, name: string) => {
  const slug = encodeURIComponent(name.toLowerCase());
  if (type === 'machine') return `https://app.hackthebox.com/machines/${slug}`;
  if (type === 'sherlock') return `https://app.hackthebox.com/sherlocks/${slug}`;
  return null;
};

const formatDate = (iso: string | null) => {
  if (!iso) return 'Date inconnue';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return 'Date inconnue';
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};

const TYPE_LABELS: Record<HtbType, string> = { machine: 'Machines', challenge: 'Challenges', sherlock: 'Sherlocks' };

export default function HTBActivity() {
  const data = useHtb();
  const [filter, setFilter] = useState<'all' | HtbType>('all');
  const [showAll, setShowAll] = useState(false);
  const activities = data?.activities ?? [];
  const profileUrl = socials.find((s) => s.id === 'htb')!.href;

  const counts = {
    machine: activities.filter((a) => a.type === 'machine').length,
    challenge: activities.filter((a) => a.type === 'challenge').length,
    sherlock: activities.filter((a) => a.type === 'sherlock').length,
  };
  const filtered = filter === 'all' ? activities : activities.filter((a) => a.type === filter);
  const shown = showAll ? filtered : filtered.slice(0, 9);

  return (
    <section id="htb" data-chapter="htb" className="relative">
      <Stage anchor="htb-0" className="min-h-[130svh]">
        <Kicker index="03" label="Entraînement" />
        <h2 className="mb-4 text-4xl md:text-5xl">
          <span className="text-htb">HackTheBox</span>
        </h2>
        <p className="mb-8 text-muted-foreground">
          Chaque cube est une machine, un challenge ou un sherlock résolu. Les données sont synchronisées automatiquement chaque nuit depuis l'API HackTheBox.
        </p>
        <div className="mb-8 grid grid-cols-3 gap-3">
          {(Object.keys(TYPE_LABELS) as HtbType[]).map((type) => (
            <div key={type} className="rounded-xl border border-white/[0.07] bg-black/30 p-4">
              <p className="font-mono text-3xl text-foreground">{data ? counts[type] : '—'}</p>
              <p className="mt-1 text-xs text-muted-foreground">{TYPE_LABELS[type]}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="link-arrow !text-htb">
            Profil HackTheBox <ExternalLink className="h-3.5 w-3.5" />
          </a>
          {data?.updatedAt && <span className="font-mono text-[11px] text-muted-foreground">sync {formatDate(data.updatedAt)}</span>}
        </div>
      </Stage>

      <div data-stage className="relative px-4 pb-[30svh] md:px-[6vw]">
        <Anchor name="htb-grid" at="20%" />
        <div className="panel mx-auto max-w-6xl !bg-card/90">
          <div className="mb-6 flex flex-wrap items-center gap-2">
            {[
              { key: 'all' as const, label: `Tout (${activities.length})` },
              ...(Object.keys(TYPE_LABELS) as HtbType[]).map((key) => ({ key, label: `${TYPE_LABELS[key]} (${counts[key]})` })),
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => {
                  setFilter(key);
                  setShowAll(false);
                }}
                className={`rounded-lg border px-3.5 py-2 font-mono text-[11px] uppercase tracking-wider transition-colors ${
                  filter === key ? 'border-htb/40 bg-htb/10 text-htb' : 'border-white/10 text-muted-foreground hover:border-white/25 hover:text-foreground'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {!data && (
            <div className="flex items-center justify-center gap-3 py-20 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-htb" />
              <span className="font-mono text-sm">Chargement…</span>
            </div>
          )}

          {data && shown.length === 0 && (
            <div className="rounded-xl border border-white/5 py-16 text-center">
              <Terminal className="mx-auto mb-3 h-8 w-8 text-white/20" />
              <p className="font-mono text-sm text-muted-foreground">Aucune activité dans cette catégorie.</p>
            </div>
          )}

          {data && shown.length > 0 && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((act) => {
                const url = htbUrl(act.type, act.name);
                const img = toPublicAvatar(act.avatar);
                const diffColor = act.difficulty ? HTB_DIFFICULTY_COLORS[act.difficulty] : undefined;
                return (
                  <div key={`${act.type}:${act.name}`} className="group flex items-center gap-4 rounded-xl border border-white/[0.06] bg-black/30 p-3.5 transition-colors hover:border-htb/30">
                    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/[0.03] text-white/15">
                      <TypeIcon type={act.type} className="h-6 w-6" />
                      {img && (
                        <img
                          src={img}
                          alt=""
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-contain p-1.5"
                          onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="truncate text-sm font-semibold tracking-normal text-foreground group-hover:text-htb">{act.name}</h4>
                        {url && (
                          <a href={url} target="_blank" rel="noopener noreferrer" aria-label={`Ouvrir ${act.name} sur HackTheBox`} className="text-muted-foreground hover:text-htb">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] uppercase text-muted-foreground">
                        <span className="flex items-center gap-1 text-htb">
                          <Flag className="h-3 w-3" />
                          {act.action ?? 'Solved'}
                        </span>
                        {act.difficulty && <span style={{ color: diffColor }}>{act.difficulty}</span>}
                        {act.category && <span className="max-w-[110px] truncate">{act.category}</span>}
                      </div>
                      <div className="mt-1 flex items-center gap-2 font-mono text-[10px] text-muted-foreground/70">
                        <span>{formatDate(act.date)}</span>
                        {act.points > 0 && <span className="text-yellow-500/80">+{act.points} pts</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {filtered.length > 9 && !showAll && (
            <div className="mt-6 flex justify-center">
              <button onClick={() => setShowAll(true)} className="btn-ghost font-mono text-xs uppercase tracking-wider hover:!border-htb/50 hover:!text-htb">
                Voir les {filtered.length - 9} autres activités
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
