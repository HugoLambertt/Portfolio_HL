import { useEffect, useState, useRef } from 'react';
import { Shield, Terminal, Activity, AlertTriangle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroBg from '@/assets/hero-bg.jpg';
import avatar from '@/assets/avatar.jpg';

interface HeroProps {
  mousePos: { x: number; y: number };
}

const Hero = ({ mousePos }: HeroProps) => {
  const [missionStarted, setMissionStarted] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanComplete, setScanComplete] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [typedText, setTypedText] = useState('');
  const fullText = '> Initializing penetration testing environment...';
  const [cursorVisible, setCursorVisible] = useState(true);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  const scanLogs = [
    '> Initializing network scan...',
    '> Detecting active hosts: 192.168.1.0/24',
    '> Port scan in progress: 80, 443, 22, 3306',
    '> Analyzing traffic patterns...',
    '> Vulnerability assessment: RUNNING',
    '> Checking OWASP Top 10 vulnerabilities...',
    '> SQL Injection test: NEGATIVE',
    '> XSS detection: NEGATIVE', 
    '> Authentication bypass attempt: FAILED',
    '> Network intrusion detected: FALSE ALARM',
    '> Firewall status: ACTIVE',
    '> IDS/IPS systems: OPERATIONAL',
    '> Analyzing security headers...',
    '> SSL/TLS certificate: VALID',
    '> Backdoor detection: NONE FOUND',
    '> Malware signature scan: CLEAN',
    '> System integrity: VERIFIED',
    '> Threat level assessment: LOW',
    '> Mission objective located...',
    '> Accessing candidate profile...',
    '> PROFILE FOUND: Hugo LAMBERT',
    '> Status: CYBERSECURITY SPECIALIST',
    '> Clearance level: AUTHORIZED',
    '> Loading mission report...',
  ];

  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setTypedText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 50);

    const cursorInterval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 500);

    return () => {
      clearInterval(typingInterval);
      clearInterval(cursorInterval);
    };
  }, []);

  useEffect(() => {
    if (missionStarted && !scanComplete) {
      const logInterval = setInterval(() => {
        setLogs(prev => {
          const nextIndex = prev.length;
          if (nextIndex < scanLogs.length) {
            return [...prev, scanLogs[nextIndex]];
          } else {
            clearInterval(logInterval);
            setTimeout(() => setScanComplete(true), 1000);
            return prev;
          }
        });
      }, 200);

      const progressInterval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 2;
        });
      }, 100);

      return () => {
        clearInterval(logInterval);
        clearInterval(progressInterval);
      };
    }
  }, [missionStarted, scanComplete]);

  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const startMission = () => {
    setMissionStarted(true);
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* local scanning effect - PERSISTENT during scan */}
      <div className="absolute inset-0 z-0">
        <div className={`absolute inset-0 overflow-hidden pointer-events-none transition-opacity duration-500 ${missionStarted && !scanComplete ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 animate-scan" />
        </div>
      </div>

      {/* CONTENT LAYER */}
      <div className="container mx-auto px-4 z-10 relative">
        {!missionStarted ? (
          /* Mission Briefing */
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center mb-8 animate-fade-in">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-red-500/10 border border-red-500/30 rounded-full">
                <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
                <span className="text-sm font-mono text-red-500 font-semibold">MISSION</span>
              </div>
            </div>

            <div className="text-center mb-12 animate-fade-up">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold mb-6">
                <span className="glow-blue">Bienvenue</span>
              </h1>
              <div className="w-32 h-1 bg-gradient-cyber mx-auto rounded-full shadow-neon-blue mb-8" />
            </div>

            <div className="bg-card/50 backdrop-blur-sm border border-primary/30 rounded-2xl p-8 md:p-12 shadow-card animate-fade-up mb-8" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl md:text-3xl font-display font-bold mb-2 glow-blue">
                    Mission
                  </h2>
                  <p className="text-sm text-muted-foreground font-mono">
                    PRIORITE : ELEVE | RISQUE : NIVEAU 3
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <p className="text-lg md:text-xl leading-relaxed">
                  Votre mission : <span className="text-primary font-semibold">Identifier une vulnérabilité et exploiter l’accès à une ressource protégée.</span>
                </p>
              </div>

              <Button
                size="lg"
                onClick={startMission}
                className="w-full bg-primary hover:bg-primary-glow text-primary-foreground shadow-neon-blue font-semibold text-lg py-6 group"
              >
                <Activity className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Lancer la mission
              </Button>
            </div>

            <div className="text-center animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <p className="text-primary font-mono text-sm md:text-base">
                {typedText}
                <span className={`inline-block w-2 h-4 bg-primary ml-1 ${cursorVisible ? 'opacity-100' : 'opacity-0'}`} />
              </p>
            </div>
          </div>
        ) : !scanComplete ? (
          /* SOC Dashboard scanning screen */
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-primary/10 border border-primary/30 rounded-full mb-4">
                <Activity className="w-5 h-5 text-primary animate-pulse" />
                <span className="text-sm font-mono text-primary font-semibold">SCAN IN PROGRESS</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold glow-blue mb-2">
                Red Team Operations
              </h2>
              <p className="text-muted-foreground font-mono text-sm">Network Analysis Protocol v3.2</p>
            </div>

            <div className="mb-8 bg-card/50 backdrop-blur-sm border border-primary/30 rounded-lg p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-mono text-primary">Scan Progress</span>
                <span className="text-sm font-mono text-primary font-bold">{scanProgress}%</span>
              </div>
              <div className="w-full h-3 bg-background/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300 shadow-neon-blue"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            </div>

            <div className="bg-black/80 backdrop-blur-sm border border-primary/30 rounded-lg p-6 font-mono text-sm h-[400px] overflow-hidden relative shadow-neon-blue">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-primary/20">
                <Terminal className="w-4 h-4 text-primary" />
                <span className="text-primary">root@kali:~$</span>
              </div>
              <div ref={logsContainerRef} className="space-y-1 overflow-y-auto h-[320px] scrollbar-thin scrollbar-thumb-primary/30">
                {logs.map((log, index) => (
                  <div 
                    key={index}
                    className="text-green-400 animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {log}
                  </div>
                ))}
                <div className="inline-block w-2 h-4 bg-green-400 animate-pulse ml-1" />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {[
                { label: 'Hosts Scanned', value: '256', icon: Activity },
                { label: 'Open Ports', value: '12', icon: Shield },
                { label: 'Threats Found', value: '0', icon: AlertTriangle },
                { label: 'Profiles Found', value: '1', icon: FileText },
              ].map((stat, index) => (
                <div 
                  key={index}
                  className="bg-card/50 backdrop-blur-sm border border-primary/20 rounded-lg p-4 text-center"
                >
                  <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
                  <div className="text-xs text-muted-foreground font-mono">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Mission complete - Profile revealed */
          <div className="max-w-5xl mx-auto text-center pt-20">
            {/* Success Banner */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 mb-8 animate-fade-in">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-green-500/10 border border-green-500/30 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-mono text-green-500 font-semibold">MISSION RÉUSSITE - CV TROUVÉ</span>
              </div>
            </div>

            {/* Avatar */}
            <div className="mb-8 animate-fade-up">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-cyber rounded-full blur-2xl opacity-50 animate-glow-pulse" />
                <img
                  src={avatar}
                  alt="Hugo Lambert"
                  className="relative w-40 h-40 md:w-48 md:h-48 rounded-full border-4 border-primary shadow-neon-blue mx-auto object-cover"
                />
                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center border-4 border-background shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-8 animate-fade-up">
              <span className="glow-blue">Hugo LAMBERT</span>
            </h1>

            {/* Status */}
            <div className="mb-12 animate-fade-up" style={{ animationDelay: '0.1s' }}>
              <p className="text-xl md:text-2xl lg:text-3xl text-muted-foreground">
                Étudiant en <span className="text-primary font-semibold">Cybersécurité</span>
              </p>
            </div>

            {/* CTA Button */}
            <div className="flex items-center justify-center animate-fade-up" style={{ animationDelay: '0.2s' }}>
              <Button
                size="lg"
                className="bg-black/80 border-2 border-primary hover:bg-primary/20 text-primary shadow-neon-blue font-mono font-bold px-12 py-8 text-xl group relative overflow-hidden"
                onClick={() => {
                  const pdfUrl = `${import.meta.env.BASE_URL}cv/CV_Hugo_LAMBERT.pdf`;
                  window.open(pdfUrl, '_blank');
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-scan" />
                <Terminal className="w-6 h-6 mr-3 group-hover:animate-pulse relative z-10" />
                <span className="relative z-10">&gt; TELECHARGER_CV.pdf</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Scroll Indicator - Only at the end */}
      {missionStarted && scanComplete && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-primary rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-primary rounded-full animate-pulse" />
          </div>
        </div>
      )}
    </section>
  );
};

export default Hero;
