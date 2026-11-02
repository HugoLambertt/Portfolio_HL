import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

// Repère invisible : la caméra 3D atteint le plan `name` quand ce point passe au milieu de l'écran.
export const Anchor = ({ name, at = '50%' }: { name: string; at?: string }) => (
  <span aria-hidden="true" data-anchor={name} className="pointer-events-none absolute left-0 h-px w-px" style={{ top: at }} />
);

export const Kicker = ({ index, label }: { index: string; label: string }) => (
  <p className="kicker mb-4">
    {index} <span className="text-muted-foreground">/</span> {label}
  </p>
);

// Un « temps » du récit : un bloc haut d'au moins un écran, avec un panneau de texte d'un côté.
export const Stage = ({
  anchor,
  side = 'left',
  className,
  panelClassName,
  children,
}: {
  anchor?: string;
  side?: 'left' | 'right';
  className?: string;
  panelClassName?: string;
  children: ReactNode;
}) => (
  <div data-stage className={cn('relative flex min-h-[115svh] items-center px-4 md:px-[6vw]', className)}>
    {anchor && <Anchor name={anchor} />}
    <div className={cn('panel max-w-[560px]', side === 'right' && 'md:ml-auto', panelClassName)}>{children}</div>
  </div>
);
