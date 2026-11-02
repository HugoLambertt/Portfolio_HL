import { ArrowUp } from 'lucide-react';
import { scrollToId } from '@/lib/smoothScroll';

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/[0.06] bg-background/80 backdrop-blur-md">
      <div className="flex flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground md:flex-row md:px-[6vw]">
        <span className="font-mono text-foreground">
          hugo<span className="text-primary">_</span>lambert
        </span>
        <span>© 2026 Hugo Lambert</span>
        <button onClick={() => scrollToId('hero')} className="flex items-center gap-1.5 hover:text-foreground">
          Retour en haut <ArrowUp className="h-3.5 w-3.5" />
        </button>
      </div>
    </footer>
  );
}
