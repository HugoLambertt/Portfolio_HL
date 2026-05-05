import { GraduationCap, Briefcase, Award, MapPin, Mail, Phone } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useEffect, useRef, useState } from 'react';

const About = () => {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set([0]));
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers = itemRefs.current.map((ref, index) => {
      if (!ref) return null;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleItems((prev) => new Set(prev).add(index));
            }
          });
        },
        {
          threshold: 0.2,
          rootMargin: '0px 0px -100px 0px',
        }
      );

      observer.observe(ref);
      return observer;
    });

    return () => {
      observers.forEach((observer) => observer?.disconnect());
    };
  }, []);

  const timeline = [
    {
      year: '2026 - 2028',
      type: 'education',
      title: '(A venir) Master Cybersécurité',
      institution: 'Selon l\'entreprise',
      description: 'Formation en alternance - Titre RNCP niveau 7',
    },
    {
      year: '2025 - 2026',
      type: 'education',
      title: 'Bachelor 3 Cyber Sécurité',
      institution: 'Ynov Campus Bordeaux',
      description: 'Formation en alternance chez Etoile Secours - Titre Administrateur systèmes, réseaux et bases de données de niveau 6',
    },
        {
      year: '2023 - 2026',
      type: 'work',
      title: 'Apprenti Informatique',
      institution: 'Étoile Secours Ambulances',
      description: 'Maintenance du parc informatique, support technique, développement d\'applications internes',
    },
    {
      year: '2023 - 2025',
      type: 'education',
      title: 'BTS SIO (Services Informatiques aux Organisations) SLAM (Solutions Logicielles et Aplications Métiers)',
      institution: 'Cipecma',
      description: 'En alternance chez Etoile Secours',
    },
    {
      year: '2021 - 2022',
      type: 'education',
      title: 'Bac STI2D option SIN - Système d\'information et numérique',
      institution: 'Lycée Léonce Vieljeux',
      description: '',
    },
  ];
const contact = [

  ];

  return (
    <section id="about" className="py-20 relative overflow-hidden">
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16 animate-fade-up">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              <span className="glow-blue">À propos</span>
            </h2>
            <div className="w-20 h-1 bg-gradient-cyber mx-auto rounded-full shadow-neon-blue" />
          </div>

          {/* Profile Description */}
          <Card className="p-8 md:p-10 mb-16 bg-card/50 backdrop-blur-sm border-primary/30 shadow-card hover:border-primary/50 transition-all duration-300 animate-fade-up">
            <p className="text-lg leading-relaxed text-muted-foreground">
              Passionné de{' '}
              <span className="text-secondary font-semibold">cybersécurité</span> et de{' '}
              <span className="text-primary font-semibold">développement</span>, je transforme ma curiosité en pratique au quotidien.
              Je m'entraîne régulièrement sur{' '}
              <span className="text-accent font-semibold">Hack The Box</span> et{' '}
              <span className="text-accent font-semibold">Root-Me</span>, et je participe activement à des{' '}
              <span className="text-secondary font-semibold">CTF (Capture The Flag)</span> dès que l'occasion se présente — autant pour le défi technique que pour le plaisir de comprendre comment les systèmes fonctionnent (et comment les casser).
            </p>
            <p className="text-lg leading-relaxed text-muted-foreground mt-4">
              Côté développement, j'aime concevoir des{' '}
              <span className="text-primary font-semibold">projets concrets</span>, de l'idée au déploiement, et explorer constamment de nouveaux langages et frameworks.{' '}
              <span className="text-primary font-semibold">Sérieux, rapide à apprendre</span> et toujours en quête de nouveaux défis, je vois la cybersécurité comme un véritable{' '}
              <span className="text-accent font-semibold">enjeu technique et stratégique</span> — et c'est là que je veux construire ma carrière.
            </p>
          </Card>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
            {contact.map((item, index) => (
              <Card
                key={index}
                className="p-6 bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/50 transition-all duration-300 hover-float"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                </div>
              </Card>
            ))}
          </div>

          {/* Timeline */}
          <div>
            <h3 className="text-3xl font-display font-bold mb-8 text-center animate-fade-up">
              <span className="glow-purple">Parcours</span>
            </h3>
            
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-secondary to-accent" />

              {/* Timeline Items */}
              <div className="space-y-12">
                {timeline.map((item, index) => (
                  <div
                    key={index}
                    ref={(el) => (itemRefs.current[index] = el)}
                    className={`relative flex flex-col md:flex-row items-start md:items-center gap-8 transition-all duration-700 ${
                      index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                    } ${
                      visibleItems.has(index)
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-8'
                    }`}
                  >
                    {/* Timeline Dot */}
                    <div className="absolute left-8 md:left-1/2 w-4 h-4 -ml-2 rounded-full bg-background border-2 border-primary shadow-neon-blue z-10">
                      <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-75" />
                    </div>

                    {/* Content */}
                    <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right md:pr-12' : 'md:text-left md:pl-12'} pl-20 md:pl-0`}>
                      <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/30 hover:border-primary/50 transition-all duration-300 hover-float inline-block w-full">
                        <div className="flex items-center gap-3 mb-3">
                          {item.type === 'education' && <GraduationCap className="w-5 h-5 text-primary" />}
                          {item.type === 'work' && <Briefcase className="w-5 h-5 text-secondary" />}
                          {item.type === 'certification' && <Award className="w-5 h-5 text-accent" />}
                          <span className="text-sm font-semibold text-primary">{item.year}</span>
                        </div>
                        <h4 className="text-xl font-display font-bold mb-2">{item.title}</h4>
                        <p className="text-secondary font-medium mb-2">{item.institution}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </Card>
                    </div>

                    <div className="flex-1 hidden md:block" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
