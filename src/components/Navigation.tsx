import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { chapters } from '@/data/portfolio';
import { useActiveChapter, useScrollValue } from '@/three/quality';
import { scrollState } from '@/three/scroll';
import { scrollToId } from '@/lib/smoothScroll';

// Les deux premiers chapitres (intrusion, plongée) forment l'intro : pas de lien dédié.
const NAV = chapters.map((c, index) => ({ ...c, index })).filter((c) => c.id !== 'hero' && c.id !== 'dive');

export default function Navigation() {
  const active = useActiveChapter();
  const scrolled = useScrollValue(() => scrollState.y > 40);
  const [open, setOpen] = useState(false);

  const go = (id: string) => {
    scrollToId(id);
    setOpen(false);
  };

  return (
    <nav className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${scrolled || open ? 'border-b border-white/[0.06] bg-background/75 backdrop-blur-md' : ''}`}>
      <div className="flex h-16 items-center justify-between px-4 md:px-[6vw]">
        <button onClick={() => go('hero')} className="font-mono text-sm tracking-tight text-foreground">
          hugo<span className="text-primary">_</span>lambert
        </button>

        <div className="hidden items-center gap-7 md:flex">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => go(item.id)}
              aria-current={active === item.index ? 'true' : undefined}
              className={`relative py-1 text-[13px] transition-colors ${active === item.index ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {item.label}
              <span className={`absolute inset-x-0 -bottom-0.5 h-px bg-primary transition-transform duration-300 ${active === item.index ? 'scale-x-100' : 'scale-x-0'}`} />
            </button>
          ))}
        </div>

        <button className="text-foreground md:hidden" onClick={() => setOpen(!open)} aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={open}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/[0.06] px-4 pb-4 md:hidden">
          {NAV.map((item, i) => (
            <button
              key={item.id}
              onClick={() => go(item.id)}
              className={`flex w-full items-center gap-3 py-3 text-left ${active === item.index ? 'text-primary' : 'text-foreground'}`}
            >
              <span className="font-mono text-[11px] text-muted-foreground">{String(i + 1).padStart(2, '0')}</span>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
