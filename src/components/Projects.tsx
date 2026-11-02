import { useState } from 'react';
import { Award, FileText, Github, ExternalLink } from 'lucide-react';
import { asset, projectSide, projects } from '@/data/portfolio';
import { Kicker, Stage } from './Chapter';
import MediaDialog, { Media } from './MediaDialog';

export default function Projects() {
  const [media, setMedia] = useState<Media | null>(null);

  return (
    <section id="projects" data-chapter="projects" className="relative">
      <Stage anchor="projects-intro" className="min-h-[110svh]">
        <Kicker index="05" label="Opérations" />
        <h2 className="mb-4 text-4xl md:text-5xl">Projets</h2>
        <p className="text-muted-foreground">
          {projects.length} opérations, du développement web et mobile à l'investigation numérique. Chacune a son dossier : présentation, code ou diplôme.
        </p>
      </Stage>

      {projects.map((project, k) => (
        <Stage key={project.id} anchor={`projects-${k}`} side={projectSide(k) > 0 ? 'left' : 'right'} className="min-h-[125svh] items-end pb-[8svh] md:items-center md:pb-0">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm text-primary">{project.codename}</span>
            <span className="chip">{project.category === 'web' ? 'Web' : 'Cybersécurité'}</span>
          </div>
          <h3 className="mb-4 text-2xl leading-tight md:text-3xl">{project.title}</h3>
          <p className="mb-5 text-sm leading-relaxed text-muted-foreground">{project.description}</p>
          <div className="mb-6 flex flex-wrap gap-1.5">
            {project.technologies.map((tech) => (
              <span key={tech} className="rounded-md border border-primary/20 bg-primary/[0.06] px-2 py-0.5 font-mono text-[11px] text-primary">
                {tech}
              </span>
            ))}
          </div>

          {project.gallery && (
            <div className="mb-6 grid grid-cols-4 gap-2">
              {project.gallery.map((src, i) => (
                <button
                  key={src}
                  onClick={() => setMedia({ url: src, title: `${project.title} — capture ${i + 1}`, kind: 'image' })}
                  className="aspect-video overflow-hidden rounded-md border border-white/10 transition hover:border-primary/60"
                >
                  <img src={asset(src)} alt={`${project.title}, capture ${i + 1}`} loading="lazy" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {project.githubLink && (
              <a className="btn-ghost" href={project.githubLink} target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4" /> Code
              </a>
            )}
            {project.demoLink && (
              <a className="btn-ghost" href={project.demoLink} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" /> Visiter
              </a>
            )}
            {project.presentationLink && (
              <button className="btn-ghost" onClick={() => setMedia({ url: project.presentationLink!, title: project.title, kind: 'pdf' })}>
                <FileText className="h-4 w-4" /> Présentation
              </button>
            )}
            {project.certificateLink && (
              <button className="btn-ghost" onClick={() => setMedia({ url: project.certificateLink!, title: `Diplôme - ${project.title}`, kind: 'pdf' })}>
                <Award className="h-4 w-4 text-amber-400" /> Diplôme
              </button>
            )}
          </div>
        </Stage>
      ))}
      <MediaDialog media={media} onClose={() => setMedia(null)} />
    </section>
  );
}
