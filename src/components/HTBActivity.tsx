import { useState, useEffect } from 'react';
import {
  Target,
  Box,
  ChevronRight,
  Activity,
  History,
  Search,
  Calendar,
  BookOpen,
  ExternalLink,
  Info,
  Loader2,
  Zap,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type RawActivity = {
  name:       string;
  type:       string;
  action:     string | null;
  difficulty: string | null;
  category:   string | null;
  date:       string;
  points:     number;
  avatar:     string | null;
};

type DisplayActivity = {
  name:       string;
  type:       'Machine' | 'Challenge' | 'Sherlock';
  action:     string;
  difficulty: string | null;
  date:       string;
  fullDate:   string;
  points:     number;
  avatar:     string | null;
  htbUrl:     string | null;
};

const toDisplayType = (raw: string): 'Machine' | 'Challenge' | 'Sherlock' => {
  switch (raw.toLowerCase()) {
    case 'challenge': return 'Challenge';
    case 'sherlock':  return 'Sherlock';
    default:          return 'Machine';
  }
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

const formatFullDate = (iso: string) => {
  const d = new Date(iso);
  return (
    d.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }) +
    ' à ' +
    d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  );
};

const toDisplay = (raw: RawActivity): DisplayActivity => {
  const type = toDisplayType(raw.type);
  const slug = encodeURIComponent(raw.name.toLowerCase());
  return {
    name:       raw.name,
    type,
    action:     raw.action ?? 'Solved',
    difficulty: raw.difficulty ?? null,
    date:       formatDate(raw.date),
    fullDate:   formatFullDate(raw.date),
    points:     raw.points ?? 0,
    avatar:     raw.avatar ?? null,
    htbUrl:
      type === 'Machine'  ? `https://app.hackthebox.com/machines/${slug}`  :
      type === 'Sherlock' ? `https://app.hackthebox.com/sherlocks/${slug}` :
      null,
  };
};

const HTBActivity = () => {
  const [filterType, setFilterType] = useState('All');
  const [filterDifficulty, setFilterDifficulty] = useState('All');
  const [showAll, setShowAll] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<DisplayActivity | null>(null);
  const [activities, setActivities] = useState<DisplayActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}htb-activity.json`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        setActivities((data.activities || []).map(toDisplay));
        setUpdatedAt(data.updated_at ?? null);
      })
      .catch(err => console.error('HTB data load failed:', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredActivity = activities.filter(act => {
    const typeMatch = filterType === 'All' || act.type === filterType;
    const diffMatch = filterDifficulty === 'All' || act.difficulty === filterDifficulty;
    return typeMatch && diffMatch;
  });

  const displayedActivity = showAll ? filteredActivity : filteredActivity.slice(0, 5);

  const getDifficultyColor = (diff: string | null) => {
    switch (diff) {
      case 'Very Easy': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Easy':      return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'Medium':    return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'Hard':      return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'Insane':    return 'text-red-500 bg-red-500/10 border-red-500/20';
      default:          return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getTypeIcon = (type: string, size = 'w-4 h-4') => {
    switch (type) {
      case 'Machine':   return <Box className={size} />;
      case 'Challenge': return <Target className={size} />;
      case 'Sherlock':  return <Search className={size} />;
      default:          return <Activity className={size} />;
    }
  };

  const lastUpdateLabel = updatedAt
    ? new Date(updatedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  return (
    <section id="skills" className="py-24 relative overflow-hidden bg-black/20">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#9fef00]/50 to-transparent opacity-30" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="text-center mb-16 animate-fade-up">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              <span className="text-[#9fef00]">HackTheBox</span>
            </h2>
            <div className="w-32 h-1 bg-[#9fef00]/50 mx-auto rounded-full shadow-[0_0_10px_rgba(159,239,0,0.5)] mb-6" />
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-bold">
              Mes expériences HackTheBox
            </p>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-20 gap-3 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin text-[#9fef00]" />
              <span className="text-sm font-mono">Chargement de l'activité HTB...</span>
            </div>
          )}

          {!loading && (
            <div className="animate-fade-up">
              {/* Filters header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-white/5 pb-6">
                <div className="flex items-center gap-3">
                  <History className="w-6 h-6 text-[#9fef00]" />
                  <h3 className="text-2xl font-display font-bold text-white uppercase tracking-wider">Activité Récente</h3>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Type:</span>
                    <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                      {['All', 'Machine', 'Challenge', 'Sherlock'].map(t => (
                        <button
                          key={t}
                          onClick={() => { setFilterType(t); setShowAll(false); }}
                          className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${
                            filterType === t ? 'bg-[#9fef00] text-black shadow-[0_0_10px_rgba(159,239,0,0.5)]' : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Difficulté:</span>
                    <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                      {['All', 'Very Easy', 'Easy', 'Medium', 'Hard', 'Insane'].map(d => (
                        <button
                          key={d}
                          onClick={() => { setFilterDifficulty(d); setShowAll(false); }}
                          className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${
                            filterDifficulty === d ? 'bg-primary text-black shadow-[0_0_10px_rgba(0,242,254,0.5)]' : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity List */}
              <div className="space-y-3">
                {displayedActivity.length > 0 ? (
                  displayedActivity.map((act, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedActivity(act)}
                      className="group bg-[#0f121a]/40 backdrop-blur-md border border-white/5 rounded-xl p-4 hover:border-[#9fef00]/30 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        {/* Avatar — icon in background, image on top if it loads */}
                        <div className="relative flex-shrink-0">
                          <div className="w-12 h-12 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center group-hover:border-[#9fef00]/50 transition-colors overflow-hidden relative">
                            {/* Icon always visible as base layer */}
                            <div className="text-white/20 scale-150">
                              {getTypeIcon(act.type, 'w-5 h-5')}
                            </div>
                            {/* Image floats on top — hidden if it fails to load */}
                            {act.avatar && (
                              <img
                                src={act.avatar}
                                alt={act.name}
                                className="absolute inset-0 w-full h-full object-contain p-1 opacity-90 group-hover:opacity-100 transition-opacity"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                              />
                            )}
                          </div>
                          <div className="absolute -bottom-1 -right-1 p-1 bg-black rounded-md border border-white/10 scale-75">
                            {getTypeIcon(act.type)}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-bold text-white group-hover:text-[#9fef00] transition-colors">{act.name}</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase text-muted-foreground font-mono">{act.type}</span>
                            <span className="w-1 h-1 rounded-full bg-white/20" />
                            <span className="text-[10px] text-[#9fef00] font-mono">{act.action}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-6">
                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getDifficultyColor(act.difficulty)}`}>
                          {act.difficulty ?? '—'}
                        </div>
                        {act.points > 0 && (
                          <div className="hidden md:flex items-center gap-1 text-[#9fef00]">
                            <Zap className="w-3 h-3" />
                            <span className="text-[10px] font-bold">{act.points} pts</span>
                          </div>
                        )}
                        <div className="text-right">
                          <div className="text-xs font-mono text-gray-400">{act.date}</div>
                          <div className="text-[9px] uppercase text-muted-foreground font-bold tracking-tighter">Completion Date</div>
                        </div>
                        <div className="hidden md:block opacity-0 group-hover:opacity-100 transition-opacity">
                          <Info className="w-5 h-5 text-[#9fef00]" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
                    <p className="text-muted-foreground">Aucune activité trouvée avec ces filtres.</p>
                  </div>
                )}
              </div>

              {filteredActivity.length > 5 && !showAll && (
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={() => setShowAll(true)}
                    className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#9fef00]/50 rounded-xl text-white font-bold text-xs tracking-widest transition-all flex items-center gap-2 group"
                  >
                    VOIR PLUS
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}

              <div className="mt-8 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
                  System synchronized with HackTheBox API • Last Update: {lastUpdateLabel}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selectedActivity} onOpenChange={(open) => !open && setSelectedActivity(null)}>
        <DialogContent className="bg-[#0f121a]/95 backdrop-blur-2xl border-[#9fef00]/20 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display font-bold flex items-center gap-3">
              <span className="text-[#9fef00]">{selectedActivity?.name}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded uppercase border ${getDifficultyColor(selectedActivity?.difficulty ?? null)}`}>
                {selectedActivity?.difficulty ?? '—'}
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="mt-6 space-y-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                {selectedActivity && getTypeIcon(selectedActivity.type)}
                <span className="text-xs font-bold uppercase text-gray-400">{selectedActivity?.type}</span>
              </div>
              <div className="flex items-center gap-2 bg-[#9fef00]/10 px-3 py-1.5 rounded-lg border border-[#9fef00]/20 text-[#9fef00]">
                <Activity className="w-4 h-4" />
                <span className="text-xs font-bold uppercase">{selectedActivity?.action}</span>
              </div>
              {selectedActivity && selectedActivity.points > 0 && (
                <div className="flex items-center gap-2 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 text-amber-400">
                  <Zap className="w-4 h-4" />
                  <span className="text-xs font-bold">{selectedActivity.points} points</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#9fef00]">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-bold uppercase tracking-wider">Date de complétion</span>
              </div>
              <div className="text-sm text-gray-300">{selectedActivity?.fullDate}</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#9fef00]">
                <BookOpen className="w-4 h-4" />
                <span className="text-sm font-bold uppercase tracking-wider">Scenario</span>
              </div>
              <div className="text-sm text-gray-300 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                Aucun scénario détaillé disponible pour ce challenge.
              </div>
            </div>

            {selectedActivity?.htbUrl && (
              <a
                href={selectedActivity.htbUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#9fef00] hover:underline text-sm font-bold"
              >
                Voir sur HackTheBox
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default HTBActivity;
