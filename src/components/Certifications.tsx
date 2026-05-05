import { useState } from 'react';
import { FileCheck, Award, Trophy, Leaf, Shield, Lock, ShieldCheck, Sword, BookOpen, ExternalLink, FileText, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

interface Certification {
  name: string;
  title: string;
  icon: any;
  color: string;
  description: string;
  link?: string;
  pdfLink?: string;
}

const Certifications = () => {
  const [filter, setFilter] = useState<'validated' | 'in-progress'>('validated');
  const [selectedPdf, setSelectedPdf] = useState<{ url: string; title: string } | null>(null);

  const certifications: Certification[] = [
    {
      name: 'CNIL',
      title: 'Atelier RGPD',
      icon: Shield,
      color: 'from-blue-500 to-cyan-500',
      description: 'Obtenue le 23 octobre 2023',
      pdfLink: './CNIL/customcert-report.pdf'
    },
    {
      name: 'SecNumAcademy ANSSI',
      title: 'Bonnes pratiques de sécurité',
      icon: Lock,
      color: 'from-purple-500 to-pink-500',
      description: 'Obtenue le 28 Décembre 2025',
      pdfLink: './ANSSI/ANSSI_hugo_lambert.pdf'
    },
    {
      name: 'Le Permis d\'osinter',
      title: "OSINT",
      icon: Search,
      color: 'from-amber-500 to-orange-500',
      description: "Certification vérifiant la capacité à distinguer source ouverte et leak. Score minimum : 80%.",
      pdfLink: './OSINT/certification-OZ-2026-7D5BW4.pdf'
    },
    {
      name: 'HTB CJCA',
      title: 'HTB Certified Junior Cybersecurity Associate',
      icon: BookOpen,
      color: 'from-green-500 to-emerald-500',
      description: 'Certification en cours'
    },
    {
      name: 'HTB CDSA',
      title: 'HTB Certified Defensive Security Analyst',
      icon: ShieldCheck,
      color: 'from-green-500 to-emerald-500',
      description: 'Certification en cours'
    },
    {
      name: 'HTB CPTS',
      title: 'HTB Certified Penetration Testing Specialist',
      icon: Sword,
      color: 'from-green-500 to-emerald-500',
      description: 'Certification en cours'
    },
    {
      name: 'Task',
      title: 'The Assessment for Sustainability Knowledge',
      icon: Leaf,
      color: 'from-green-500 to-emerald-500',
      description: 'Obtenue en avril 2026',
      link: 'https://task.sulitest.org/certificate.html?t=3283563277'
    },
  ];

  const filteredCertifications = certifications.filter(cert => {
    const isInProgress = cert.description.includes('Certification en cours');
    return filter === 'in-progress' ? isInProgress : !isInProgress;
  });

  return (
    <section id="certifications" className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4 glow-blue">
            Certifications
          </h2>
          <div className="w-24 h-1 bg-gradient-cyber mx-auto rounded-full shadow-neon-blue mb-6" />
          
          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Button
              variant={filter === 'validated' ? 'default' : 'outline'}
              onClick={() => setFilter('validated')}
              className={`transition-all duration-300 ${
                filter === 'validated' 
                ? 'bg-primary text-primary-foreground shadow-neon-blue scale-105' 
                : 'hover:border-primary/50'
              }`}
            >
              <Award className="w-4 h-4 mr-2" />
              Certifications Validées
            </Button>
            <Button
              variant={filter === 'in-progress' ? 'default' : 'outline'}
              onClick={() => setFilter('in-progress')}
              className={`transition-all duration-300 ${
                filter === 'in-progress' 
                ? 'bg-primary text-primary-foreground shadow-neon-blue scale-105' 
                : 'hover:border-primary/50'
              }`}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              En cours de préparation
            </Button>
          </div>
        </div>

        {/* Certifications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {filteredCertifications.map((cert, index) => (
            <div
              key={cert.name}
              className="group relative animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Card */}
              <div className="relative bg-card/50 backdrop-blur-sm border border-primary/30 rounded-xl p-6 h-full transition-all duration-500 hover:border-primary hover:shadow-neon-blue transform hover:-translate-y-2 perspective-1000 flex flex-col">
                {/* Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${cert.color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-500`} />
                
                {/* Icon Container with 3D Rotation */}
                <div className="relative mb-6 flex justify-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center group-hover:rotate-y-180 transition-transform duration-700 transform-style-3d">
                    <cert.icon className="w-10 h-10 text-primary group-hover:scale-110 transition-transform duration-300" />
                  </div>
                </div>

                {/* Content */}
                <div className="text-center space-y-2 flex-grow">
                  <h3 className="text-2xl font-display font-bold text-primary group-hover:glow-blue transition-all duration-300">
                    {cert.name}
                  </h3>
                  <p className="text-sm font-semibold text-foreground">
                    {cert.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {cert.description}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex flex-wrap justify-center gap-2 relative z-20">
                  {cert.link && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="border-primary/30 hover:border-primary hover:bg-primary/10 transition-all duration-300 group/btn"
                    >
                      <a href={cert.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                        Voir le certificat
                        <ExternalLink className="w-3 h-3 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                      </a>
                    </Button>
                  )}
                  {cert.pdfLink && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-primary/30 hover:border-primary hover:bg-primary/10 transition-all duration-300 group/btn"
                      onClick={() => setSelectedPdf({ url: cert.pdfLink!, title: cert.name })}
                    >
                      <FileText className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                      Voir le certificat
                    </Button>
                  )}
                </div>

                {/* Badge Bottom */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-cyber rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PDF Viewer Modal */}
      <Dialog open={!!selectedPdf} onOpenChange={(open) => !open && setSelectedPdf(null)}>
        <DialogContent className="max-w-[95vw] w-[95vw] h-[95vh] p-0 overflow-hidden bg-card/95 backdrop-blur-md border-primary/50 shadow-neon-blue">
          <div className="w-full h-full px-4 md:px-12 lg:px-24 py-12 flex items-center justify-center">
            {selectedPdf && (
              <iframe
                src={`${selectedPdf.url}#toolbar=0&navpanes=0&scrollbar=1`}
                className="w-full h-full border border-primary/20 rounded shadow-2xl bg-white"
                title={selectedPdf.title}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Certifications;
