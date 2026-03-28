import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Github, Shield, Globe, Smartphone, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Project {
  title: string;
  category: string;
  description: string;
  technologies: string[];
  icon: any;
  color: string;
  demoLink?: string;
  pdfPath?: string;
}

const Projects = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  const projects: Project[] = [
    {
      title: 'SANIOStest',
      category: 'web',
      description: 'Application web pour la gestion gestion des ambulances (invenaire et désinfection), avec 4 profils utilisateurs ( Régulation, Ambulancier, Mécanicien et Administrateur)',
      technologies: ['PHP', 'HTML/CSS', 'JavaScript', 'SQL'],
      icon: Globe,
      color: 'primary',
      demoLink: 'https://ambu17.com/nouveausanios/index.php',
      pdfPath: '/Présentationsanios.pdf',
    },
    {
      title: 'HONEY PAWN',
      category: 'cyber',
      description: 'Honeypawn est un laboratoire de cybersécurité simulant un système d’information complet avec serveurs, réseau sécurisé, SIEM, IDS/IPS et honeypots. Il permet de tester des attaques et d’évaluer l’efficacité des défenses dans un environnement réaliste.',
      technologies: ['Python', 'Nmap', 'HTML/CSS', 'REACT','JS','Docker'],
      icon: Shield,
      color: 'secondary',
      
    },
    /*{
      title: 'Application Mobile de Sécurité',
      category: 'mobile',
      description: 'Application Android de gestion de mots de passe avec chiffrement AES-256 et authentification biométrique.',
      technologies: ['Kotlin', 'Android Studio', 'SQLite'],
      icon: Smartphone,
      color: 'accent',
    },*/
    {
      title: 'TOURNAMENT GAMES',
      category: 'web',
      description: 'Projet de BTS SIO qui avait pour but de faire une application web et mobile pour organiser des tournois de jeux vidéos entre école.',
      technologies: ['PHP', 'HTML/CSS','CodeIgniter4', 'Bootstrap', 'Kotlin', 'API'],
      icon: Globe,
      color: 'primary',
      
    },
    /*{
      title: 'Lab OSINT Automation',
      category: 'cyber',
      description: 'Suite d\'outils automatisés pour la collecte d\'informations OSINT (Maltego, Sherlock, TheHarvester).',
      technologies: ['Python', 'Maltego', 'APIs'],
      icon: Shield,
      color: 'secondary',
    },
    {
      title: 'Portfolio Cyberpunk 3D',
      category: 'web',
      description: 'Ce portfolio immersif avec animations 3D, effets néon et mini-jeux de cybersécurité.',
      technologies: ['React', 'TypeScript', 'Tailwind CSS'],
      icon: Globe,
      color: 'primary',
    },*/
  ];

  const filters = [
    { id: 'all', label: 'Tous les projets' },
    { id: 'web', label: 'Web' },
    /*{ id: 'mobile', label: 'Mobile' },*/
    { id: 'cyber', label: 'Cybersécurité' },
  ];

  const filteredProjects = activeFilter === 'all' 
    ? projects 
    : projects.filter(p => p.category === activeFilter);

  return (
    <section id="projects" className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 cyber-grid opacity-5" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16 animate-fade-up">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              <span className="glow-blue">Mes</span> <span className="glow-purple">Projets</span>
            </h2>
            <div className="w-20 h-1 bg-gradient-cyber mx-auto rounded-full shadow-neon-blue" />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-4 mb-12 animate-fade-up">
            {filters.map((filter) => (
              <Button
                key={filter.id}
                variant={activeFilter === filter.id ? 'default' : 'outline'}
                onClick={() => setActiveFilter(filter.id)}
                className={`
                  ${activeFilter === filter.id 
                    ? 'bg-primary hover:bg-primary-glow text-primary-foreground shadow-neon-blue' 
                    : 'border-primary/30 hover:border-primary hover:bg-primary/10'
                  }
                  transition-all duration-300
                `}
              >
                {filter.label}
              </Button>
            ))}
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project, index) => (
              <Card
                key={index}
                className="group bg-card/50 backdrop-blur-sm border-primary/30 hover:border-primary/50 transition-all duration-300 overflow-hidden hover-float animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Project Header */}
                <div className={`relative p-6 bg-gradient-to-br from-${project.color}/20 to-transparent border-b border-${project.color}/30`}>
                  <div className="absolute top-4 right-4 p-3 bg-background/50 backdrop-blur-sm rounded-lg">
                    <project.icon className={`w-6 h-6 text-${project.color}`} />
                  </div>
                  <h3 className="text-xl font-display font-bold mb-2 pr-16">{project.title}</h3>
                </div>

                {/* Project Content */}
                <div className="p-6">
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Technologies */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies.map((tech, techIndex) => (
                      <span
                        key={techIndex}
                        className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary border border-primary/30 rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 justify-center">
                    {project.demoLink && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-secondary/30 hover:border-secondary hover:bg-secondary/10 group"
                        asChild
                      >
                        <a href={project.demoLink} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                          Site en ligne
                        </a>
                      </Button>
                    )}
                    {project.pdfPath && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 border-primary/30 hover:border-primary hover:bg-primary/10 group"
                          >
                            <FileText className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                            Présentation
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-7xl w-[95vw] h-[95vh] p-0 gap-0 overflow-hidden bg-background border-primary/30">
                          <div className="w-full h-full">
                            <iframe
                              src={`${import.meta.env.BASE_URL}${project.pdfPath?.startsWith('/') ? project.pdfPath.slice(1) : project.pdfPath}`}
                              className="w-full h-full border-none"
                              title={`${project.title} Presentation`}
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Projects;
