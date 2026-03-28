import { Shield, Award, Lock, FileCheck } from 'lucide-react';

const Certifications = () => {
  const certifications = [
    {
      name: 'CNIL',
      title: 'Atelier RGPD',
      icon: Shield,
      color: 'from-blue-500 to-cyan-500',
      description: ''
    },
    {
      name: 'SecNumAcademy ANSSI',
      title: 'Bonnes pratiques de sécurité',
      icon: Lock,
      color: 'from-purple-500 to-pink-500',
      description: 'Obtenue le 28 Décembre 2025'
    },
    {
      name: 'CJCA',
      title: 'Hack The Box',
      icon: FileCheck,
      color: 'from-green-500 to-emerald-500',
      description: 'Certification en cours'
    },
        {
      name: 'CDSA',
      title: 'Hack The Box',
      icon: FileCheck,
      color: 'from-green-500 to-emerald-500',
      description: 'Certification en cours'
    },
            {
      name: 'CPTS',
      title: 'Hack The Box',
      icon: FileCheck,
      color: 'from-green-500 to-emerald-500',
      description: 'Certification en cours'
    },

  ];

  return (
    <section id="certifications" className="py-20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 cyber-grid opacity-10" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4 glow-blue">
            Certifications
          </h2>
          <div className="w-24 h-1 bg-gradient-cyber mx-auto rounded-full shadow-neon-blue mb-6" />
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Certifications en cybersécurité
          </p>
        </div>

        {/* Certifications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {certifications.map((cert, index) => (
            <div
              key={index}
              className="group relative animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Card */}
              <div className="relative bg-card/50 backdrop-blur-sm border border-primary/30 rounded-xl p-6 h-full transition-all duration-500 hover:border-primary hover:shadow-neon-blue transform hover:-translate-y-2 perspective-1000">
                {/* Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${cert.color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-500`} />
                
                {/* Icon Container with 3D Rotation */}
                <div className="relative mb-6 flex justify-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center group-hover:rotate-y-180 transition-transform duration-700 transform-style-3d">
                    <cert.icon className="w-10 h-10 text-primary group-hover:scale-110 transition-transform duration-300" />
                  </div>
                </div>

                {/* Content */}
                <div className="text-center space-y-2">
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

                {/* Badge Bottom */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-cyber rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Certifications;
