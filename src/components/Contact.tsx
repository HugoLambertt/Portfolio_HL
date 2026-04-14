import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin, Github, Linkedin, Send, Shield } from 'lucide-react';
import { toast } from 'sonner';
import emailjs from '@emailjs/browser';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const PUBLIC_KEY = '9dhyiFanAK8u8Xogu';
  const SERVICE_ID = 'service_wvzm1cq';
  const TEMPLATE_ID = 'template_l7hphyp';

  // Initialize EmailJS with your public key
  emailjs.init(PUBLIC_KEY);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    emailjs.send(SERVICE_ID, TEMPLATE_ID, formData)
      .then((result) => {
        toast.success('Message envoyé avec succès ! 🚀', {
          description: 'Je vous répondrai dans les plus brefs délais.',
          duration: 4000,
        });
        // Reset form
        setFormData({ name: '', email: '', subject: '', message: '' });
      }, (error) => {
        toast.error('Échec de l\'envoi du message. 😟', {
          description: 'Veuillez réessayer ou me contacter directement.',
          duration: 4000,
        });
        console.error('EmailJS error:', error);
      });
  };

  const socialLinks = [
    {
      icon: Github,
      href: 'https://github.com/DirTy2304',
      color: 'primary',
      label: 'Github',
    },
    {
      icon: Linkedin,
      href: 'https://www.linkedin.com/in/hugoo-lambert',
      color: 'secondary',
      label: 'Linkedin',
    },
    {
      icon: Shield,
      href: 'https://profile.hackthebox.com/profile/019c86c8-7c5c-7307-8cbc-55bfc2836639',
      color: 'accent',
      label: 'Hack The Box (Classement en 60ème position parmis les campus Ynov)',
    },
  ];

  return (
    <section id="contact" className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 cyber-grid opacity-5" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16 animate-fade-up">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              <span className="glow-blue">Me</span> <span className="glow-purple">Contacter</span>
            </h2>
            <div className="w-20 h-1 bg-gradient-cyber mx-auto rounded-full shadow-neon-blue mb-4" />
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Une question ? Un projet ? N'hésitez pas à me contacter !
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Social Links */}
            <div className="lg:col-span-1 space-y-6">
              <div className="animate-fade-up h-full">
                <Card className="p-8 bg-card/50 backdrop-blur-sm border-primary/30 h-full flex flex-col justify-center">
                  <h3 className="text-2xl font-display font-bold mb-8 text-center glow-blue">Mes Réseaux</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {socialLinks.map((social, index) => (
                      <a
                        key={index}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-4 bg-card/50 backdrop-blur-sm border border-${social.color}/30 hover:border-${social.color}/50 rounded-xl transition-all duration-300 hover-float group flex items-center gap-4`}
                      >
                        <div className={`p-3 bg-${social.color}/10 rounded-lg group-hover:scale-110 transition-transform`}>
                          <social.icon className={`w-6 h-6 text-${social.color}`} />
                        </div>
                        <span className="text-lg font-medium group-hover:text-primary transition-colors">{social.label}</span>
                      </a>
                    ))}
                  </div>
                </Card>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="p-8 bg-card/50 backdrop-blur-sm border-primary/30 animate-fade-up" style={{ animationDelay: '0.2s' }}>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Nom complet</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Votre nom"
                        required
                        className="bg-background/50 border-primary/30 focus:border-primary h-12"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="votre@email.com"
                        required
                        className="bg-background/50 border-primary/30 focus:border-primary h-12"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Sujet</label>
                    <Input
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Sujet du message"
                      required
                      className="bg-background/50 border-primary/30 focus:border-primary h-12"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Message</label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Votre message..."
                      rows={5}
                      required
                      className="bg-background/50 border-primary/30 focus:border-primary resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary-glow text-primary-foreground shadow-neon-blue font-semibold text-lg py-6 group"
                  >
                    <Send className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                    Envoyer le message
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
