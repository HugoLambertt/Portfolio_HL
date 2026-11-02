import { useState } from 'react';
import { Award, BookOpen, ExternalLink, FileText, Lock } from 'lucide-react';
import { certifications } from '@/data/portfolio';
import { Anchor, Kicker } from './Chapter';
import MediaDialog, { Media } from './MediaDialog';

export default function Certifications() {
  const [filter, setFilter] = useState<'validated' | 'in-progress'>('validated');
  const [media, setMedia] = useState<Media | null>(null);
  const shown = certifications.filter((c) => (filter === 'in-progress' ? c.inProgress : !c.inProgress));
  const count = (inProgress: boolean) => certifications.filter((c) => !!c.inProgress === inProgress).length;

  return (
    <section id="certifications" data-chapter="certifications" data-stage className="relative flex min-h-[175svh] items-center px-4 py-[30svh] md:px-[6vw]">
      <Anchor name="certs-0" at="25%" />
      <Anchor name="certs-1" at="70%" />
      <div className="panel max-w-[580px] md:ml-auto">
        <Kicker index="04" label="Certifications" />
        <h2 className="mb-6 text-4xl md:text-5xl">Certifications</h2>

        <div className="mb-6 inline-flex rounded-lg border border-white/10 p-1" role="tablist">
          {[
            { key: 'validated' as const, label: 'Validées', icon: Award, n: count(false) },
            { key: 'in-progress' as const, label: 'En préparation', icon: BookOpen, n: count(true) },
          ].map(({ key, label, icon: Icon, n }) => (
            <button
              key={key}
              role="tab"
              aria-selected={filter === key}
              onClick={() => setFilter(key)}
              className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 text-sm transition-colors ${
                filter === key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label} <span className="font-mono text-[11px] opacity-70">{n}</span>
            </button>
          ))}
        </div>

        <ul className="divide-y divide-white/[0.06]">
          {shown.map((cert) => (
            <li key={cert.name} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="font-medium text-foreground">{cert.name}</p>
                <p className="text-sm text-foreground/75">{cert.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{cert.description}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                {cert.pdfLink && (
                  <button className="btn-ghost !py-1.5 text-xs" onClick={() => setMedia({ url: cert.pdfLink!, title: cert.name, kind: 'pdf' })}>
                    <FileText className="h-3.5 w-3.5" /> Voir le certificat
                  </button>
                )}
                {cert.link && (
                  <a className="btn-ghost !py-1.5 text-xs" href={cert.link} target="_blank" rel="noopener noreferrer">
                    Voir le certificat <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
                {cert.inProgress && (
                  <span className="chip !text-htb">
                    <Lock className="h-3 w-3" /> en cours
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
      <MediaDialog media={media} onClose={() => setMedia(null)} />
    </section>
  );
}
