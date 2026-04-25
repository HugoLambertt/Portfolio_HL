import { Shield, Code, Wrench, Terminal, Network, Bug, Search, Target, Database, Globe, Smartphone } from 'lucide-react';

const Skills = () => {
  const skillsData = {
    cybersecurity: [
      { name: 'Nmap', description: 'Outil de scan réseau pour la découverte d\'hôtes et de services.', icon: Search },
      { name: 'Metasploit', description: 'Framework d\'exploitation pour les tests de pénétration', icon: Bug },
      { name: 'Burp Suite', description: 'Plateforme d\'analyse et de test de sécurité des applications web.', icon: Shield },
      { name: 'Wireshark', description: 'Analyseur de paquets réseau pour inspecter le trafic.', icon: Network },
      { name: 'Aircrack-ng', description: 'Suite d\'outils pour l\'audit et le test de sécurité Wi-Fi.', icon: Terminal },
      { name: 'Hydra', description: 'Outil de craquage de mots de passe par force brute.', icon: Target },
      { name: 'Responder', description: 'outil de poisoning (empoisonnement) de réseau', icon: Target },
    ],
    development: [
      { name: 'HTML / CSS', description: 'Langages de base pour la conception web front-end.', icon: Globe },
      { name: 'JavaScript', description: 'Langage pour le développement web interactif.', icon: Code },
      { name: 'PHP', description: 'Langage serveur pour le développement back-end.', icon: Code },
      { name: 'SQL', description: 'Langage de requête pour la gestion de bases de données.', icon: Database },
      { name: 'Kotlin / Java', description: 'Langages pour le développement d\'applications mobiles.', icon: Smartphone },
    ],
    tools: [
      { name: 'Linux (Kali/Arch)', description: 'Distribution spécialisée pour les tests de sécurité.', icon: Terminal },
      { name: 'Docker', description: 'Plateforme de conteneurisation pour le déploiement d\'applications.', icon: Wrench },
      { name: 'GitHub', description: 'Plateforme de gestion de versions et de collaboration.', icon: Wrench },
      { name: 'VirtualBox', description: 'Logiciel de virtualisation pour créer des environnements de test.', icon: Wrench },
    ],
  };

  return (
    <section id="skills" className="py-20 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="cyber-grid absolute inset-0 opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 glow-blue">
              Compétences Techniques
            </h2>
            <div className="w-32 h-1 bg-gradient-cyber mx-auto rounded-full shadow-neon-blue" />
          </div>

          {/* Cybersecurity Skills */}
          <div className="mb-16">
            <h3 className="text-2xl md:text-3xl font-display font-bold mb-8 text-primary flex items-center gap-3">
              <Shield className="w-8 h-8" />
              Cybersécurité
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {skillsData.cybersecurity.map((skill, index) => (
                <div
                  key={index}
                  className="group bg-card/30 backdrop-blur-sm border border-primary/20 rounded-xl p-6 hover:border-primary/50 hover:bg-card/50 transition-all duration-300 hover:shadow-neon-blue animate-fade-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <skill.icon className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                    <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {skill.name}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {skill.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Development Skills */}
          <div className="mb-16">
            <h3 className="text-2xl md:text-3xl font-display font-bold mb-8 text-secondary flex items-center gap-3">
              <Code className="w-8 h-8" />
              Développement Web / Mobile
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {skillsData.development.map((skill, index) => (
                <div
                  key={index}
                  className="group bg-card/30 backdrop-blur-sm border border-secondary/20 rounded-xl p-6 hover:border-secondary/50 hover:bg-card/50 transition-all duration-300 hover:shadow-neon-purple animate-fade-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <skill.icon className="w-6 h-6 text-secondary group-hover:scale-110 transition-transform" />
                    <span className="font-semibold text-foreground group-hover:text-secondary transition-colors">
                      {skill.name}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {skill.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Tools */}
          <div>
            <h3 className="text-2xl md:text-3xl font-display font-bold mb-8 text-accent flex items-center gap-3">
              <Wrench className="w-8 h-8" />
              Outils
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {skillsData.tools.map((tool, index) => (
                <div
                  key={index}
                  className="group bg-card/30 backdrop-blur-sm border border-accent/20 rounded-xl p-6 hover:border-accent/50 hover:bg-card/50 transition-all duration-300 hover:shadow-card animate-fade-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <tool.icon className="w-6 h-6 text-accent group-hover:scale-110 transition-transform" />
                    <span className="font-semibold text-foreground group-hover:text-accent transition-colors">
                      {tool.name}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {tool.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Skills;
