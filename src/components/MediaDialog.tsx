import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { asset } from '@/data/portfolio';

export type Media = { url: string; title: string; kind: 'pdf' | 'image' };

// Visionneuse partagée pour les certificats, présentations et captures.
export default function MediaDialog({ media, onClose }: { media: Media | null; onClose: () => void }) {
  return (
    <Dialog open={!!media} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex h-[92svh] w-[94vw] max-w-[94vw] flex-col gap-3 border-white/10 bg-card/95 p-4 md:p-6">
        <DialogTitle className="pr-8 font-mono text-sm font-normal tracking-normal text-muted-foreground">{media?.title}</DialogTitle>
        {media?.kind === 'pdf' && (
          <iframe
            src={`${encodeURI(asset(media.url))}#toolbar=0&navpanes=0&scrollbar=1`}
            className="h-full w-full rounded-lg border border-white/10 bg-white"
            title={media.title}
          />
        )}
        {media?.kind === 'image' && (
          <div className="flex min-h-0 flex-1 items-center justify-center">
            <img src={asset(media.url)} alt={media.title} className="max-h-full max-w-full rounded-lg object-contain" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
