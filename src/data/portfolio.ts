// Source unique du contenu du portfolio : le texte HTML et la scène 3D lisent tous les deux ici.

export const profile = {
  name: 'Hugo Lambert',
  handle: 'HUGO_LAMBERT',
  title: 'Étudiant en Cybersécurité',
  role: 'Apprenti analyste en cybersécurité · Groupe Unofi',
  school: 'Mastère Expert en Cybersécurité · Ynov Campus Bordeaux',
  bio: [
    "Passionné de cybersécurité et de développement, je transforme ma curiosité en pratique au quotidien. Je m'entraîne régulièrement sur Hack The Box et Root-Me, et je participe activement à des CTF (Capture The Flag) dès que l'occasion se présente — autant pour le défi technique que pour le plaisir de comprendre comment les systèmes fonctionnent (et comment les casser).",
    "Côté développement, j'aime concevoir des projets concrets, de l'idée au déploiement, et explorer constamment de nouveaux langages et frameworks. Sérieux, rapide à apprendre et toujours en quête de nouveaux défis, je vois la cybersécurité comme un véritable enjeu technique et stratégique — et c'est là que je veux construire ma carrière.",
  ],
};

export const scanLogs = [
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

export type TimelineItem = {
  year: string;
  type: 'work' | 'education';
  title: string;
  institution: string;
  description: string;
};

export const timeline: TimelineItem[] = [
  {
    year: '2026 - 2028',
    type: 'work',
    title: 'Apprenti analyste en Cybersécurité',
    institution: 'Groupe Unofi Gestion',
    description: "Collaboration avec l'analyste cyber et le rssi du groupe unofi au sein du siège social.",
  },
  {
    year: '2026 - 2028',
    type: 'education',
    title: 'Mastère Expert en Cybersécurité',
    institution: 'Ynov Campus Bordeaux',
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
    description: "Maintenance du parc informatique, support technique, développement d'applications internes",
  },
  {
    year: '2023 - 2025',
    type: 'education',
    title: 'BTS SIO (Services Informatiques aux Organisations) SLAM (Solutions Logicielles et Applications Métiers)',
    institution: 'Cipecma',
    description: 'En alternance chez Etoile Secours',
  },
  {
    year: '2021 - 2022',
    type: 'education',
    title: "Bac STI2D option SIN - Système d'information et numérique",
    institution: 'Lycée Léonce Vieljeux',
    description: '',
  },
];

export type Skill = { name: string; description: string };
export type SkillGroup = { id: string; label: string; items: Skill[] };

export const skillGroups: SkillGroup[] = [
  {
    id: 'cyber',
    label: 'Cybersécurité',
    items: [
      { name: 'Nmap', description: "Outil de scan réseau pour la découverte d'hôtes et de services." },
      { name: 'Metasploit', description: "Framework d'exploitation pour les tests de pénétration" },
      { name: 'Burp Suite', description: "Plateforme d'analyse et de test de sécurité des applications web." },
      { name: 'Wireshark', description: 'Analyseur de paquets réseau pour inspecter le trafic.' },
      { name: 'Aircrack-ng', description: "Suite d'outils pour l'audit et le test de sécurité Wi-Fi." },
      { name: 'Hydra', description: 'Outil de craquage de mots de passe par force brute.' },
      { name: 'Responder', description: 'Outil de poisoning (empoisonnement) de réseau' },
    ],
  },
  {
    id: 'dev',
    label: 'Développement Web / Mobile',
    items: [
      { name: 'HTML / CSS', description: 'Langages de base pour la conception web front-end.' },
      { name: 'JavaScript', description: 'Langage pour le développement web interactif.' },
      { name: 'PHP', description: 'Langage serveur pour le développement back-end.' },
      { name: 'SQL', description: 'Langage de requête pour la gestion de bases de données.' },
      { name: 'Kotlin / Java', description: "Langages pour le développement d'applications mobiles." },
    ],
  },
  {
    id: 'tools',
    label: 'Outils',
    items: [
      { name: 'Linux (Kali/Arch)', description: 'Distribution spécialisée pour les tests de sécurité.' },
      { name: 'Docker', description: "Plateforme de conteneurisation pour le déploiement d'applications." },
      { name: 'GitHub', description: 'Plateforme de gestion de versions et de collaboration.' },
      { name: 'VirtualBox', description: 'Logiciel de virtualisation pour créer des environnements de test.' },
    ],
  },
];

export type Certification = {
  name: string;
  title: string;
  description: string;
  inProgress?: boolean;
  link?: string;
  pdfLink?: string;
};

export const certifications: Certification[] = [
  {
    name: 'CNIL',
    title: 'Atelier RGPD',
    description: 'Obtenue le 23 octobre 2023',
    pdfLink: 'CNIL/customcert-report.pdf',
  },
  {
    name: 'SecNumAcademy ANSSI',
    title: 'Bonnes pratiques de sécurité',
    description: 'Obtenue le 28 Décembre 2025',
    pdfLink: 'ANSSI/ANSSI_hugo_lambert.pdf',
  },
  {
    name: "Le Permis d'osinter",
    title: 'OSINT',
    description: 'Certification vérifiant la capacité à distinguer source ouverte et leak. Score minimum : 80%.',
    pdfLink: 'OSINT/certification-OZ-2026-7D5BW4.pdf',
  },
  {
    name: 'Task',
    title: 'The Assessment for Sustainability Knowledge',
    description: 'Obtenue en avril 2026',
    link: 'https://task.sulitest.org/certificate.html?t=3283563277',
  },
  {
    name: 'HTB CJCA',
    title: 'HTB Certified Junior Cybersecurity Associate',
    description: 'Certification en cours',
    inProgress: true,
  },
  {
    name: 'HTB CDSA',
    title: 'HTB Certified Defensive Security Analyst',
    description: 'Certification en cours',
    inProgress: true,
  },
  {
    name: 'HTB CPTS',
    title: 'HTB Certified Penetration Testing Specialist',
    description: 'Certification en cours',
    inProgress: true,
  },
];

export type Project = {
  id: string;
  codename: string;
  title: string;
  category: 'web' | 'cyber';
  description: string;
  technologies: string[];
  githubLink?: string;
  demoLink?: string;
  presentationLink?: string;
  certificateLink?: string;
  gallery?: string[];
};

export const projects: Project[] = [
  {
    id: 'sanios',
    codename: 'OP-01',
    title: 'SANIOS',
    category: 'web',
    description: "Application web de gestion et de visualisation de la désinfection, de l'hygiène et de l'inventaire des véhicules ambulanciers, intégrant un système de profils utilisateurs (Régulation, Ambulancier, Mécanicien, Administrateur) et un scan de QR codes",
    technologies: ['PHP', 'HTML/CSS', 'JavaScript', 'SQL', 'API', 'Android'],
    presentationLink: 'Présentationsanios.pdf',
  },
  {
    id: 'tournament',
    codename: 'OP-02',
    title: 'TOURNAMENT GAMES',
    category: 'web',
    description: "Projet de fin d'études BTS SIO : conception et développement d'une application web et mobile permettant l'organisation de tournois de jeux vidéo inter-écoles. Le projet repose principalement sur une architecture CRUD pour la gestion des données (tournois, équipes, joueurs, matchs). La plateforme web, développée avec CodeIgniter 4 et Bootstrap, communique via une API REST avec une application mobile Android développée en Kotlin.",
    technologies: ['PHP', 'HTML/CSS', 'CodeIgniter4', 'Bootstrap', 'Kotlin', 'API'],
    githubLink: 'https://github.com/HugoLambertt/Tournament-Games.git',
  },
  {
    id: 'bellatrix',
    codename: 'OP-03',
    title: 'CTF ORION - NOM DE CODE : BELLATRIX',
    category: 'cyber',
    description: "Enquête immersive de 3 jours visant à démanteler une milice séparatiste et localiser la pilote \"Lynx\" retenue en otage. Un défi mêlant analyse de l'information, cyber-renseignement et investigation de terrain numérique.",
    technologies: ['Campagnes de désinformation', 'Investigations numériques', 'Recherches en sources ouvertes'],
    presentationLink: 'CTFBELLATRIX.pdf',
    certificateLink: 'ctf_bellatrix.pdf',
  },
  {
    id: 'forensic',
    codename: 'OP-04',
    title: 'Challenge 48h forensic de M. Philippe JARLOV',
    category: 'cyber',
    description: "Le challenge 48h est un CTF de type forensic immersif où les étudiants participent à une enquête numérique réaliste pendant deux jours. Ils doivent analyser des preuves comme des machines virtuelles et des données de téléphones pour résoudre une affaire d’espionnage, en se mettant dans la peau d’un analyste forensique. L’événement est encadré par Philippe JARLOV, expert reconnu en criminalistique numérique.",
    technologies: ['Autopsy', 'TrueCrypt', 'OpenStego', 'CelleBrite'],
    presentationLink: 'Challenge_48h_Forensic.pdf',
  },
  {
    id: 'htb-ynov',
    codename: 'OP-05',
    title: 'CTF HackTheBox x Ynov Campus',
    category: 'cyber',
    description: "Participation au CTF HackTheBox avec Ynov Campus, encadré par des experts dans le domaine de chez HackTheBox, le ctf s'est déroulé par équipe de 5 avec pour objectif d'obtenir un maximum de Flag.",
    technologies: ['Web', 'Crypto', 'Hardware', 'Pwn', 'Forensic', 'OSINT'],
    presentationLink: 'HackTheBoxxYnovCampusCTF2026.pdf',
    gallery: [
      'assets/ctf_htb_ynov/rank.png',
      'assets/ctf_htb_ynov/panel.png',
      'assets/ctf_htb_ynov/web_jwt.png',
      'assets/ctf_htb_ynov/web_webhook.png',
      'assets/ctf_htb_ynov/crypto1.png',
      'assets/ctf_htb_ynov/crypto2.png',
      'assets/ctf_htb_ynov/satelite_flag.png',
    ],
  },
];

// Côté où apparaît l'emblème 3D de chaque projet (+1 droite, -1 gauche) ; le texte va de l'autre côté.
export const projectSide = (index: number) => (index % 2 === 0 ? 1 : -1);

export const socials = [
  { id: 'github', label: 'GitHub', handle: 'DirTy2304', href: 'https://github.com/DirTy2304' },
  { id: 'linkedin', label: 'LinkedIn', handle: 'hugoo-lambert', href: 'https://www.linkedin.com/in/hugoo-lambert' },
  { id: 'htb', label: 'HackTheBox', handle: 'Durrty', href: 'https://profile.hackthebox.com/profile/019c86c8-7c5c-7307-8cbc-55bfc2836639' },
];

export const emailjsConfig = {
  publicKey: '9dhyiFanAK8u8Xogu',
  serviceId: 'service_wvzm1cq',
  templateId: 'template_l7hphyp',
};

// Chapitres dans l'ordre du scroll : l'index sert aussi au rail de navigation et à la caméra 3D.
export const chapters = [
  { id: 'hero', label: 'Intrusion' },
  { id: 'dive', label: 'Plongée' },
  { id: 'about', label: 'Parcours' },
  { id: 'arsenal', label: 'Arsenal' },
  { id: 'htb', label: 'HackTheBox' },
  { id: 'certifications', label: 'Certifications' },
  { id: 'projects', label: 'Opérations' },
  { id: 'contact', label: 'Contact' },
] as const;

export type ChapterId = (typeof chapters)[number]['id'];

export const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;
