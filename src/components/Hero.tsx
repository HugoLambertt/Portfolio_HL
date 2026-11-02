import { useMemo } from 'react';
import { ArrowDown, FileText, Lock, Unlock } from 'lucide-react';
import { profile, scanLogs } from '@/data/portfolio';
import { useStickyProgress } from '@/three/quality';
import { Anchor } from './Chapter';

const GLYPHS = '!<>-_\\/[]{}—=+*^?#01ABCDEF';

// Texte « déchiffré » par le scroll : chaque caractère se fixe quand la progression l'atteint.
const scramble = (text: string, progress: number) =>
  text
    .split('')
    .map((ch, i) => (ch === ' ' || i < progress * text.length ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
    .join('');

// Repères caméra répartis sur la zone épinglée (340svh de section = 240svh de défilement).
const HERO_SHOTS = [0, 0.33, 0.62, 0.95];

export default function Hero() {
  const p = useStickyProgress(0);
  const phase = p < 0.1 ? 'locked' : p < 0.6 ? 'scanning' : 'granted';
  const scan = Math.min(1, Math.max(0, (p - 0.1) / 0.5));
  const reveal = Math.min(1, Math.max(0, (p - 0.6) / 0.14));
  const logs = useMemo(() => scanLogs.slice(0, Math.max(1, Math.ceil(scan * scanLogs.length))).slice(-4), [scan]);

  const status = {
    locked: { label: 'ACCÈS REFUSÉ', dot: 'bg-destructive', text: 'text-destructive' },
    scanning: { label: `INTRUSION EN COURS · ${Math.round(scan * 100)}%`, dot: 'bg-primary animate-pulse', text: 'text-primary' },
    granted: { label: 'ACCÈS AUTORISÉ', dot: 'bg-ok', text: 'text-ok' },
  }[phase];

  return (
    <section id="hero" data-chapter="hero" className="relative h-[340svh]">
      {HERO_SHOTS.map((f, i) => (
        <Anchor key={i} name={`hero-${i}`} at={`${50 + f * 240}svh`} />
      ))}

      <div className="sticky top-0 flex h-svh flex-col justify-end px-4 pb-24 pt-28 md:justify-center md:px-[6vw] md:pb-0">
        <div className="max-w-[580px]">
          <div className={`mb-6 inline-flex items-center gap-2.5 font-mono text-xs tracking-[0.2em] ${status.text}`}>
            <span className={`h-2 w-2 rounded-full ${status.dot}`} />
            {status.label}
          </div>

          {phase === 'locked' && (
            <>
              <h1 className="mb-6 text-5xl leading-[1.02] md:text-7xl">Accès refusé.</h1>
              <p className="max-w-md text-lg leading-relaxed text-muted-foreground">
                Cible sécurisée. <span className="text-foreground">Hugo LAMBERT</span> est actuellement chiffré. Contournez la couche de sécurité pour révéler l'asset.
              </p>
            </>
          )}

          {phase === 'scanning' && (
            <>
              <h1 className="mb-6 font-mono text-5xl leading-[1.02] tracking-tight text-muted-foreground md:text-7xl" aria-label="Déchiffrement en cours">
                {scramble(profile.name, 0)}
              </h1>
              <div className="panel max-w-md !p-4 font-mono text-[12px] leading-6 text-ok/80">
                {logs.map((line) => (
                  <p key={line} className={line.includes('FOUND') ? 'text-primary' : ''}>
                    {line}
                  </p>
                ))}
                <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full bg-primary transition-[width] duration-150" style={{ width: `${scan * 100}%` }} />
                </div>
              </div>
            </>
          )}

          {phase === 'granted' && (
            <>
              <h1 className="mb-3 text-5xl leading-[1.02] md:text-7xl" aria-label={profile.name}>
                {scramble(profile.name, reveal)}
              </h1>
              <p className="mb-8 text-xl text-muted-foreground md:text-2xl">
                Étudiant en <span className="text-primary">Cybersécurité</span>
              </p>
              <div className="panel max-w-md !p-5" style={{ opacity: reveal }}>
                <div className="min-w-0 space-y-1.5 text-sm">
                  <p className="text-foreground">{profile.role}</p>
                  <p className="text-muted-foreground">{profile.school}</p>
                  <span className="chip mt-1" title="Le CV sera bientôt mis en ligne">
                    <FileText className="h-3 w-3" /> CV · bientôt disponible
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="absolute inset-x-4 bottom-8 flex items-center gap-4 md:inset-x-[6vw]">
          <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            {phase === 'granted' ? <Unlock className="h-3.5 w-3.5 text-ok" /> : <Lock className="h-3.5 w-3.5" />}
            {phase === 'granted' ? 'Continuer vers le réseau' : 'Faites défiler pour lancer l’intrusion'}
            <ArrowDown className="h-3.5 w-3.5 animate-bounce" />
          </span>
          <div className="h-px flex-1 bg-white/10">
            <div className="h-px bg-primary" style={{ width: `${p * 100}%` }} />
          </div>
        </div>
      </div>
    </section>
  );
}
