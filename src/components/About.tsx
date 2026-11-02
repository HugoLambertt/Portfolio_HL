import { Fragment } from 'react';
import { Briefcase, GraduationCap } from 'lucide-react';
import { profile, timeline } from '@/data/portfolio';
import { Kicker, Stage } from './Chapter';

const HIGHLIGHTS = [
  'cybersécurité',
  'développement',
  'Hack The Box',
  'Root-Me',
  'CTF (Capture The Flag)',
  'projets concrets',
  'Sérieux, rapide à apprendre',
  'enjeu technique et stratégique',
];

const highlight = (text: string) => {
  const pattern = new RegExp(`(${HIGHLIGHTS.map((h) => h.replace(/[()]/g, '\\$&')).join('|')})`, 'g');
  return text.split(pattern).map((part, i) =>
    HIGHLIGHTS.includes(part) ? (
      <strong key={i} className="font-medium text-foreground">
        {part}
      </strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
};

export default function About() {
  return (
    <section id="about" data-chapter="about" className="relative">
      <Stage anchor="about-bio" className="min-h-[140svh]">
        <Kicker index="01" label="Parcours" />
        <h2 className="mb-6 text-4xl md:text-5xl">À propos</h2>
        <div className="space-y-4 text-[15px] leading-relaxed text-muted-foreground md:text-base">
          {profile.bio.map((p, i) => (
            <p key={i}>{highlight(p)}</p>
          ))}
        </div>
      </Stage>

      {timeline.map((item, k) => (
        <Stage key={item.title} anchor={`about-${k}`} className="min-h-[95svh]">
          <div className="mb-4 flex items-center gap-3">
            {item.type === 'work' ? <Briefcase className="h-4 w-4 text-primary" /> : <GraduationCap className="h-4 w-4 text-primary" />}
            <span className="font-mono text-sm text-primary">{item.year}</span>
            <span className="chip">{item.type === 'work' ? 'Expérience' : 'Formation'}</span>
          </div>
          <h3 className="mb-2 text-2xl leading-tight md:text-3xl">{item.title}</h3>
          <p className="mb-3 text-foreground/80">{item.institution}</p>
          {item.description && <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>}
          <p className="mt-6 font-mono text-[11px] text-muted-foreground/70">
            [{String(k + 1).padStart(2, '0')}/{String(timeline.length).padStart(2, '0')}]
          </p>
        </Stage>
      ))}
    </section>
  );
}
