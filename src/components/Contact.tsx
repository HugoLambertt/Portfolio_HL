import { useState } from 'react';
import { Github, Linkedin, Send, Shield, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import emailjs from '@emailjs/browser';
import { emailjsConfig, socials } from '@/data/portfolio';
import { Anchor, Kicker } from './Chapter';

const ICONS = { github: Github, linkedin: Linkedin, htb: Shield } as const;

const fieldClass =
  'w-full rounded-lg border border-white/10 bg-black/40 px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/40';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const update = (key: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData({ ...formData, [key]: e.target.value });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    emailjs
      .send(emailjsConfig.serviceId, emailjsConfig.templateId, formData, { publicKey: emailjsConfig.publicKey })
      .then(
        () => {
          toast.success('Message envoyé avec succès ! 🚀', {
            description: 'Je vous répondrai dans les plus brefs délais.',
            duration: 4000,
          });
          setFormData({ name: '', email: '', subject: '', message: '' });
        },
        (error) => {
          toast.error("Échec de l'envoi du message. 😟", {
            description: 'Veuillez réessayer ou me contacter directement.',
            duration: 4000,
          });
          console.error('EmailJS error:', error);
        },
      )
      .finally(() => setSending(false));
  };

  return (
    <section id="contact" data-chapter="contact" className="relative">
      {/* Exfiltration : la caméra remonte le réseau et ressort par l'écran */}
      <div data-transit className="relative h-[90svh]">
        <Anchor name="exfil" at="0%" />
        <Anchor name="contact-gate" at="70%" />
      </div>

      <div data-stage className="relative flex min-h-[150svh] items-center px-4 md:px-[6vw]">
        <Anchor name="contact-0" at="40%" />
        <div className="panel max-w-[600px]">
          <Kicker index="06" label="Contact" />
          <h2 className="mb-6 text-4xl md:text-5xl">Me contacter</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Nom complet</span>
                <input value={formData.name} onChange={update('name')} placeholder="Votre nom" required className={fieldClass} autoComplete="name" />
              </label>
              <label className="block">
                <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Email</span>
                <input type="email" value={formData.email} onChange={update('email')} placeholder="votre@email.com" required className={fieldClass} autoComplete="email" />
              </label>
            </div>
            <label className="block">
              <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Sujet</span>
              <input value={formData.subject} onChange={update('subject')} placeholder="Sujet du message" required className={fieldClass} />
            </label>
            <label className="block">
              <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Message</span>
              <textarea value={formData.message} onChange={update('message')} placeholder="Votre message..." rows={5} required className={`${fieldClass} resize-none`} />
            </label>
            <button
              type="submit"
              disabled={sending}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3.5 font-medium text-primary-foreground transition hover:brightness-110 disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
              {sending ? 'Envoi…' : 'Envoyer le message'}
            </button>
          </form>

          <div className="mt-8 border-t border-white/[0.06] pt-6">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Mes réseaux</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {socials.map((s) => {
                const Icon = ICONS[s.id as keyof typeof ICONS];
                return (
                  <a key={s.id} href={s.href} target="_blank" rel="noopener noreferrer" className="btn-ghost justify-between">
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4" /> {s.label}
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-60" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
