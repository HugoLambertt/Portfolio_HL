import { useState, useEffect } from 'react';
import { Box, Target, Search, ExternalLink, Loader2, Flag } from 'lucide-react';

const S3 = 'https://htb-mp-prod-public-storage.s3.eu-central-1.amazonaws.com';

// Convertit labs.hackthebox.com/avatars/HASH.png → S3 public (même hash, domaine différent)
const toPublicAvatar = (url: string | null): string | null => {
  if (!url) return null;
  if (url.includes('labs.hackthebox.com/avatars/')) {
    const filename = url.split('/avatars/').pop()?.replace('_thumb', '');
    return filename ? `${S3}/avatars/${filename}` : null;
  }
  return url;
};

type Activity = {
  name:       string;
  type:       string;
  action:     string | null;
  difficulty: string | null;
  category:   string | null;
  date:       string;
  points:     number;
  avatar:     string | null;
};

const DIFFICULTY_STYLES: Record<string, string> = {
  'Very Easy': 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
  'Easy':      'text-green-400  border-green-500/40  bg-green-500/10',
  'Medium':    'text-yellow-400 border-yellow-500/40 bg-yellow-500/10',
  'Hard':      'text-orange-400 border-orange-500/40 bg-orange-500/10',
  'Insane':    'text-red-400    border-red-500/40    bg-red-500/10',
};

const TYPE_STYLES: Record<string, string> = {
  machine:   'text-[#9fef00] border-[#9fef00]/30 bg-[#9fef00]/10',
  challenge: 'text-blue-400  border-blue-400/30  bg-blue-400/10',
  sherlock:  'text-purple-400 border-purple-400/30 bg-purple-400/10',
};

const TypeIcon = ({ type, className = 'w-4 h-4' }: { type: string; className?: string }) => {
  if (type === 'challenge') return <Target className={className} />;
  if (type === 'sherlock')  return <Search  className={className} />;
  return <Box className={className} />;
};

const htbUrl = (type: string, name: string) => {
  const slug = encodeURIComponent(name.toLowerCase());
  if (type === 'machine')   return `https://app.hackthebox.com/machines/${slug}`;
  if (type === 'sherlock')  return `https://app.hackthebox.com/sherlocks/${slug}`;
  return null;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

const difficulty = (act: Activity) => act.difficulty ?? null;

export default function HTBActivity() {
  const [filter, setFilter]         = useState('all');
  const [showAll, setShowAll]       = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}htb-activity.json`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(data => setActivities(data.activities ?? []))
      .catch(err => console.error('HTB load failed:', err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all'
    ? activities
    : activities.filter(a => a.type === filter);

  const shown = showAll ? filtered : filtered.slice(0, 9);

  const counts = {
    machine:   activities.filter(a => a.type === 'machine').length,
    challenge: activities.filter(a => a.type === 'challenge').length,
    sherlock:  activities.filter(a => a.type === 'sherlock').length,
  };

  return (
    <section id="skills" className="py-24 relative bg-black/20">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#9fef00]/40 to-transparent" />

      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              <span className="text-[#9fef00]">HackTheBox</span>
            </h2>
            <div className="w-24 h-0.5 bg-[#9fef00]/50 mx-auto rounded-full mb-6" />
          </div>

          {loading && (
            <div className="flex items-center justify-center py-20 gap-3 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin text-[#9fef00]" />
              <span className="text-sm font-mono">Chargement…</span>
            </div>
          )}

          {!loading && (
            <>
              {/* Type filter */}
              <div className="flex items-center gap-2 mb-6">
                {[
                  { key: 'all',       label: `Tout (${activities.length})` },
                  { key: 'machine',   label: `Machines (${counts.machine})`   },
                  { key: 'challenge', label: `Challenges (${counts.challenge})` },
                  { key: 'sherlock',  label: `Sherlocks (${counts.sherlock})`  },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => { setFilter(key); setShowAll(false); }}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wide transition-all border ${
                      filter === key
                        ? 'bg-[#9fef00]/10 border-[#9fef00]/40 text-[#9fef00]'
                        : 'border-white/10 text-gray-500 hover:text-gray-300 hover:border-white/20'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Activity grid */}
              {shown.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground text-sm font-mono">
                  Aucune activité dans cette catégorie.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {shown.map((act, i) => {
                    const diff      = difficulty(act);
                    const url       = htbUrl(act.type, act.name);
                    const imgSrc    = toPublicAvatar(act.avatar);
                    const diffStyle = diff ? (DIFFICULTY_STYLES[diff] ?? 'text-gray-400 border-white/10') : '';
                    const typeStyle = TYPE_STYLES[act.type] ?? TYPE_STYLES.machine;

                    return (
                      <div
                        key={i}
                        className="group bg-[#0f121a]/50 border border-white/5 rounded-xl overflow-hidden hover:border-[#9fef00]/20 transition-all duration-200"
                      >
                        {/* Avatar */}
                        <div className="relative h-28 bg-black/40 flex items-center justify-center overflow-hidden">
                          <div className="text-white/5">
                            <TypeIcon type={act.type} className="w-16 h-16" />
                          </div>
                          {imgSrc && (
                            <img
                              src={imgSrc}
                              alt={act.name}
                              className="absolute inset-0 w-full h-full object-contain p-4"
                              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          )}
                          {/* Type badge top-left */}
                          <div className={`absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md border text-[9px] font-bold uppercase ${typeStyle}`}>
                            <TypeIcon type={act.type} className="w-3 h-3" />
                            {act.type}
                          </div>
                          {/* Difficulty badge top-right */}
                          {diff && (
                            <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-md border text-[9px] font-bold uppercase ${diffStyle}`}>
                              {diff}
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h4 className="font-bold text-white text-sm truncate group-hover:text-[#9fef00] transition-colors">
                                {act.name}
                              </h4>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <Flag className="w-3 h-3 text-[#9fef00] flex-shrink-0" />
                                <span className="text-[10px] text-[#9fef00] font-mono">{act.action ?? 'Solved'}</span>
                                {act.category && (
                                  <>
                                    <span className="text-white/20">·</span>
                                    <span className="text-[10px] text-gray-500 font-mono">{act.category}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            {url && (
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}
                                className="flex-shrink-0 text-gray-600 hover:text-[#9fef00] transition-colors"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                          <div className="mt-2 text-[10px] text-gray-300 font-mono">
                            {formatDate(act.date)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Show more */}
              {filtered.length > 9 && !showAll && (
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={() => setShowAll(true)}
                    className="px-6 py-2 border border-white/10 hover:border-[#9fef00]/30 rounded-lg text-xs font-bold uppercase text-gray-400 hover:text-white transition-all"
                  >
                    Voir les {filtered.length - 9} autres
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
