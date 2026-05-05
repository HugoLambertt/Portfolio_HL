# Portfolio Étudiant – Informatique, Développement Web & Cybersécurité

Ce projet est mon portfolio personnel d'étudiant en informatique, conçu pour présenter mon parcours, mes compétences et mes projets dans les domaines du développement web et de la cybersécurité.

Il me permet de mettre en avant mon évolution, mes réalisations techniques ainsi que les technologies que j'utilise au quotidien dans le cadre de mes études et de mes projets en autonomie.

---

## 🚀 Installation & Démarrage

Pour exécuter ce projet en local :

```bash
# 1. Cloner le dépôt
git clone https://github.com/HugoLambertt/Portfolio_HL.git

# 2. Accéder au dossier du projet
cd Portfolio_HL

# 3. Installer les dépendances
npm install

# 4. Lancer l'application en mode développement
npm run dev
```

**Build & déploiement manuel :**
```bash
npm run build       # Génère le dossier dist/
npm run deploy      # Pousse dist/ sur la branche gh-pages
```

---

## 🛠️ Technologies utilisées

| Technologie | Rôle |
|---|---|
| ⚛️ React 18 | Framework UI |
| 📘 TypeScript | Typage statique |
| ⚡ Vite | Bundler & dev server |
| 🎨 TailwindCSS | Styles utilitaires |
| 🧩 shadcn-ui | Composants UI |
| 🎞️ GSAP | Animations |
| 📧 EmailJS | Formulaire de contact |

---

## 🟢 Synchronisation automatique HackTheBox

La section **Activité Récente HackTheBox** est alimentée automatiquement via l'API HTB.

### Fonctionnement

Un **GitHub Actions workflow** (`.github/workflows/update-htb.yml`) tourne chaque nuit à 6h UTC :

1. Appelle `https://labs.hackthebox.com/api/v4/profile/activity/{user_id}` avec le token HTB
2. Génère `public/htb-activity.json` avec les données fraîches
3. Build le projet (`npm run build`)
4. Redéploie automatiquement sur GitHub Pages

Le composant React (`src/components/HTBActivity.tsx`) fait ensuite un simple `fetch` vers ce fichier statique — **le token HTB n'est jamais exposé côté client**.

### Variables à configurer (GitHub Secrets)

Dans **Settings → Secrets and variables → Actions** du repo :

| Secret | Description |
|---|---|
| `HTB_TOKEN` | App Token généré sur app.hackthebox.com/profile/settings |
| `HTB_USER_ID` | ID numérique du profil HTB (ex: 2675179) |

### Déclenchement manuel

`Actions → Update HTB Activity & Deploy → Run workflow`

> **Note :** Le token HTB expire le **01/05/2027**. Penser à le renouveler avant cette date dans les secrets GitHub.

---

## 🎯 Objectif du projet

- Présenter mon parcours en informatique
- Mettre en avant mes compétences en développement web
- Illustrer mes connaissances en cybersécurité
- Centraliser mes projets académiques et personnels
- Servir de support pour mes recherches de stage / alternance
