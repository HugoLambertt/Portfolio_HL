import { Code, Shield, Wrench } from 'lucide-react';
import { skillGroups } from '@/data/portfolio';
import { Anchor, Kicker } from './Chapter';

const ICONS = { cyber: Shield, dev: Code, tools: Wrench } as const;

export default function Skills() {
  return (
    <section id="arsenal" data-chapter="arsenal" data-stage className="relative flex min-h-[190svh] items-center px-4 py-[30svh] md:px-[6vw]">
      <Anchor name="arsenal-0" at="25%" />
      <Anchor name="arsenal-1" at="72%" />
      <div className="panel max-w-[600px] md:ml-auto">
        <Kicker index="02" label="Arsenal" />
        <h2 className="mb-8 text-4xl md:text-5xl">Compétences techniques</h2>
        <div className="space-y-8">
          {skillGroups.map((group) => {
            const Icon = ICONS[group.id as keyof typeof ICONS];
            return (
              <div key={group.id}>
                <h3 className="mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                  {group.label}
                </h3>
                <dl className="divide-y divide-white/[0.06]">
                  {group.items.map((skill) => (
                    <div key={skill.name} className="grid gap-1 py-2.5 sm:grid-cols-[150px_1fr] sm:gap-4">
                      <dt className="text-sm font-medium text-foreground">{skill.name}</dt>
                      <dd className="text-sm text-muted-foreground">{skill.description}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
