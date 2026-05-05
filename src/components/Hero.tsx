import { useEffect, useState, useRef } from 'react';
import { Shield, Terminal, Activity, AlertTriangle, FileText, Lock, Unlock, Cpu, Network } from 'lucide-react';
import { Button } from '@/components/ui/button';
import avatar from '@/assets/avatar.jpg';
import gsap from 'gsap';

interface HeroProps {
  mousePos: { x: number; y: number };
}

const Hero = ({ mousePos }: HeroProps) => {
  const [phase, setPhase] = useState<'briefing' | 'scanning' | 'complete'>('briefing');
  const [scanProgress, setScanProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [typedText, setTypedText] = useState('');
  const fullText = '> Initializing penetration testing environment...';
  const [cursorVisible, setCursorVisible] = useState(true);
  const logsContainerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  
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

  // Initial Typing Effect
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

  // GSAP HUD Animations
  useEffect(() => {
    if (phase === 'scanning') {
      const tl = gsap.timeline();
      
      // Glitch effect on start
      tl.to(heroRef.current, {
        duration: 0.1,
        x: () => (Math.random() - 0.5) * 20,
        y: () => (Math.random() - 0.5) * 20,
        repeat: 5,
        yoyo: true,
        ease: "power2.inOut",
        onComplete: () => gsap.set(heroRef.current, { x: 0, y: 0 })
      });

      // HUD Rotation
      gsap.to(".hud-ring", {
        rotation: 360,
        duration: 20,
        repeat: -1,
        ease: "none"
      });

      gsap.to(".hud-ring-reverse", {
        rotation: -360,
        duration: 15,
        repeat: -1,
        ease: "none"
      });

      // Scan Progress Logic
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 5;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setTimeout(() => {
            gsap.to(heroRef.current, {
              opacity: 0,
              duration: 0.5,
              onComplete: () => {
                setPhase('complete');
                gsap.to(heroRef.current, { opacity: 1, duration: 1 });
              }
            });
          }, 1000);
        }
        setScanProgress(Math.floor(progress));
        
        // Add logs based on progress
        const logIndex = Math.floor((progress / 100) * scanLogs.length);
        setLogs(scanLogs.slice(0, logIndex + 1));
      }, 150);

      return () => clearInterval(interval);
    }
  }, [phase]);

  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const startMission = () => {
    gsap.to(".briefing-card", {
      scale: 0.8,
      opacity: 0,
      duration: 0.4,
      ease: "back.in",
      onComplete: () => setPhase('scanning')
    });
  };

  return (
    <section id="hero" ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* HUD BACKGROUND ELEMENTS */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-20">
          <svg viewBox="0 0 200 200" className="w-full h-full hud-ring">
            <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="10 5" className="text-primary" />
            <circle cx="100" cy="100" r="70" fill="none" stroke="currentColor" strokeWidth="0.2" strokeDasharray="2 2" className="text-primary/50" />
          </svg>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-10">
          <svg viewBox="0 0 200 200" className="w-full h-full hud-ring-reverse">
            <path d="M 100, 10 A 90,90 0 0,1 190,100" fill="none" stroke="currentColor" strokeWidth="1" className="text-secondary" />
            <path d="M 100, 190 A 90,90 0 0,1 10,100" fill="none" stroke="currentColor" strokeWidth="1" className="text-secondary" />
          </svg>
        </div>
      </div>

      {/* CONTENT LAYER */}
      <div className="container mx-auto px-4 z-10 relative">
        {phase === 'briefing' && (
          <div className="max-w-4xl mx-auto briefing-card">
            <div className="flex justify-center mb-8 animate-fade-in">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-red-500/10 border border-red-500/30 rounded-full shadow-neon-blue">
                <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
                <span className="text-sm font-mono text-red-500 font-semibold tracking-widest">CRITICAL MISSION</span>
              </div>
            </div>

            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 tracking-tighter">
                <span className="glow-blue">ACCESS</span> <span className="glow-purple">DENIED</span>
              </h1>
              <div className="w-48 h-1 bg-gradient-cyber mx-auto rounded-full shadow-neon-blue mb-8" />
            </div>

            <div className="bg-card/40 backdrop-blur-md border border-primary/30 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-start gap-6 mb-8 relative z-10">
                <div className="p-4 bg-primary/20 rounded-2xl border border-primary/40 shadow-neon-blue">
                  <Lock className="w-10 h-10 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-display font-bold mb-2 glow-blue tracking-tight">
                    Security Protocol
                  </h2>
                  <p className="text-sm text-muted-foreground font-mono uppercase tracking-widest opacity-70">
                    System Restricted | Encryption Active
                  </p>
                </div>
              </div>

              <div className="space-y-6 mb-10 relative z-10">
                <p className="text-xl md:text-2xl leading-relaxed font-light">
                  Target secured. <span className="text-primary font-bold italic underline decoration-primary/30">Hugo LAMBERT</span> profile is currently encrypted. Bypass the security layer to reveal the asset.
                </p>
              </div>

              <Button
                size="lg"
                onClick={startMission}
                className="w-full bg-primary hover:bg-primary-glow text-primary-foreground shadow-neon-blue font-mono font-bold text-xl py-8 group relative overflow-hidden transition-all duration-500 hover:scale-[1.02]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <Activity className="w-6 h-6 mr-3 group-hover:animate-spin" />
                CLIQUEZ_ICI.exe
              </Button>
            </div>

            <div className="mt-12 text-center">
              <p className="text-primary font-mono text-sm md:text-base opacity-80">
                {typedText}
                <span className={`inline-block w-2 h-4 bg-primary ml-1 ${cursorVisible ? 'opacity-100' : 'opacity-0'}`} />
              </p>
            </div>
          </div>
        )}

        {phase === 'scanning' && (
          <div className="max-w-6xl mx-auto scan-dashboard">
            {/* HUD Status Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="bg-black/60 backdrop-blur-xl border border-primary/30 rounded-2xl p-6 shadow-neon-blue">
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Cpu className="w-6 h-6 text-primary animate-pulse" />
                  </div>
                  <span className="font-mono text-xs text-primary uppercase tracking-widest">CPU LOAD</span>
                </div>
                <div className="h-2 bg-background/50 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[85%] animate-pulse" />
                </div>
              </div>
              <div className="bg-black/60 backdrop-blur-xl border border-secondary/30 rounded-2xl p-6 shadow-neon-purple">
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-2 bg-secondary/20 rounded-lg">
                    <Network className="w-6 h-6 text-secondary animate-pulse" />
                  </div>
                  <span className="font-mono text-xs text-secondary uppercase tracking-widest">NETWORK TRAFFIC</span>
                </div>
                <div className="flex items-end gap-1 h-8">
                  {[...Array(12)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-full bg-secondary opacity-50" 
                      style={{ 
                        height: `${Math.random() * 100}%`,
                        animation: `pulse 1s infinite ${Math.random()}s`
                      }} 
                    />
                  ))}
                </div>
              </div>
              <div className="bg-black/60 backdrop-blur-xl border border-red-500/30 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-2 bg-red-500/20 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                  </div>
                  <span className="font-mono text-xs text-red-500 uppercase tracking-widest">THREAT LEVEL</span>
                </div>
                <div className="text-2xl font-mono font-bold text-red-500">MAXIMUM</div>
              </div>
            </div>

            {/* Main Scan Display */}
            <div className="relative mb-12">
              <div className="absolute -inset-4 bg-primary/5 blur-3xl rounded-full animate-pulse" />
              <div className="bg-black/80 backdrop-blur-2xl border-2 border-primary/40 rounded-3xl p-1 shadow-neon-blue overflow-hidden">
                <div className="bg-gradient-to-r from-primary/20 via-transparent to-primary/20 p-8 md:p-12 relative">
                  <div className="flex items-center justify-between mb-8">
                    <div className="font-mono text-primary text-xl flex items-center gap-3">
                      <Terminal className="w-6 h-6" />
                      DECRYPTING ASSET...
                    </div>
                    <div className="font-mono text-primary text-4xl font-black">{scanProgress}%</div>
                  </div>
                  
                  <div className="w-full h-6 bg-background rounded-full border border-primary/20 p-1 mb-12">
                    <div 
                      className="h-full bg-gradient-to-r from-primary via-secondary to-primary shadow-neon-blue transition-all duration-300"
                      style={{ width: `${scanProgress}%` }}
                    />
                  </div>

                  {/* Terminal Output */}
                  <div className="bg-black/90 rounded-xl p-6 font-mono text-sm h-[300px] overflow-hidden relative border border-primary/20 shadow-inner">
                    <div ref={logsContainerRef} className="space-y-2 overflow-y-auto h-full scrollbar-thin scrollbar-thumb-primary/30">
                      {logs.map((log, index) => (
                        <div key={index} className="text-green-400/90 animate-fade-in flex gap-3">
                          <span className="opacity-50">[{new Date().toLocaleTimeString()}]</span>
                          <span className={log.includes('FOUND') ? 'text-primary font-bold' : ''}>{log}</span>
                        </div>
                      ))}
                      <div className="inline-block w-2 h-4 bg-green-400 animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {phase === 'complete' && (
          <div className="max-w-5xl mx-auto text-center pt-10 reveal-card">
            {/* Final Reveal Header */}
            <div className="inline-flex items-center gap-3 px-8 py-4 bg-green-500/10 border border-green-500/30 rounded-full mb-12 animate-fade-in shadow-neon-purple">
              <Unlock className="w-6 h-6 text-green-500" />
              <span className="text-lg font-mono text-green-500 font-bold tracking-widest">DECRYPTION SUCCESSFUL</span>
            </div>

            {/* Avatar & Info */}
            <div className="mb-12 relative inline-block group">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl opacity-50 animate-glow-pulse group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <img
                  src={avatar}
                  alt="Hugo Lambert"
                  className="relative w-48 h-48 md:w-64 md:h-64 rounded-full border-4 border-primary shadow-neon-blue mx-auto object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center border-4 border-background shadow-2xl animate-bounce">
                  <Shield className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            <h1 className="text-5xl md:text-8xl font-display font-bold mb-8 tracking-tighter">
              <span className="glow-blue">Hugo LAMBERT</span>
            </h1>

            <div className="mb-16">
              <p className="text-2xl md:text-4xl text-muted-foreground font-light">
                Spécialiste en <span className="text-primary font-bold tracking-tight">Cybersécurité</span>
              </p>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <Button
                size="lg"
                className="bg-black/80 border-2 border-primary hover:bg-primary/20 text-primary shadow-neon-blue font-mono font-bold px-12 py-10 text-2xl group relative overflow-hidden w-full md:w-auto transition-all hover:scale-105"
                onClick={() => {
                  const pdfUrl = `${import.meta.env.BASE_URL}cv/CV_Hugo_LAMBERT.pdf`;
                  window.open(pdfUrl, '_blank');
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-scan" />
                <Terminal className="w-8 h-8 mr-4" />
                CV_HUGO_LAMBERT.pdf
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-secondary text-secondary hover:bg-secondary/10 font-mono font-bold px-12 py-10 text-2xl w-full md:w-auto"
                onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
              >
                VIEW_INTEL
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Scroll Indicator */}
      {phase === 'complete' && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 border-2 border-primary rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-4 bg-primary rounded-full animate-pulse" />
          </div>
        </div>
      )}
    </section>
  );
};

export default Hero;
