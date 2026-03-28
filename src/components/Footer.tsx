import { Terminal, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="py-8 border-t border-primary/20 bg-background/50 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-primary glow-blue" />
            <span className="font-display font-bold">
              HUGO_<span className="text-secondary">LAMBERT</span>
            </span>
          </div>

          {/* Copyright */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>© 2026 Hugo Lambert</span>
            <span className="flex items-center gap-1">
             
            </span>
          </div>

          {/* Tech Stack */}
          <div className="text-xs text-muted-foreground">
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
