# ECHO - Dating Authentique

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![Version](https://img.shields.io/badge/version-1.0.0--beta-blue)
![PWA](https://img.shields.io/badge/PWA-ready-green)

> Rencontres authentiques avec validation par un ami

## Concept

ECHO réinvente les applications de dating avec trois principes fondamentaux :

1. **Photos en temps réel** - Pas de vieilles photos ou de filtres trompeurs. Seules les photos prises dans l'instant sont acceptées.

2. **Validation Wingman** - Ton profil doit être validé par un ami qui témoigne de ta personnalité.

3. **Matchs éphémères** - Les matchs expirent en 48h. Pas de temps à perdre, agis vite !

## Features

- [x] Structure projet Vite + React + TypeScript
- [x] Configuration Tailwind CSS avec thème neon dark
- [x] PWA ready (manifest, service worker)
- [x] Navigation bottom mobile-first
- [x] Pages principales (Home, Discover, Matches, Profile)
- [x] Animations Framer Motion
- [x] Système d'onboarding avec caméra temps réel
- [x] Validation de formulaire avec Zod
- [x] Store Zustand pour l'onboarding
- [x] Swipe cards avec drag gestures
- [x] Super Like avec animation
- [x] Limite quotidienne (50 swipes/jour, 1 Super Like)
- [x] Match popup avec timer 48h
- [x] Modal Premium upsell
- [x] Statistiques de swipe
- [ ] Système Wingman (validation par ami)
- [ ] Chat temps réel
- [ ] Appels vidéo WebRTC

## Installation

```bash
# Clone le repo
git clone https://github.com/Adam-Blf/Echo.git
cd Echo

# Installe les dépendances
npm install

# Lance le serveur de développement
npm run dev
```

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS + Framer Motion
- **State**: Zustand
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **PWA**: Vite Plugin PWA + Workbox
- **Backend**: Supabase (à venir)

## Scripts

```bash
npm run dev      # Serveur de développement
npm run build    # Build de production
npm run preview  # Preview du build
npm run lint     # Linting ESLint
```

## Structure du Projet

```
src/
├── components/
│   ├── layout/      # MainLayout, BottomNavigation
│   └── ui/          # Composants réutilisables
├── hooks/           # Custom hooks
├── lib/             # Utilitaires (cn, utils)
├── pages/           # Pages de l'application
├── stores/          # Zustand stores
└── types/           # Types TypeScript
```

## Changelog

### 2026-01-20 (v0.3.0)
- Système de swipe complet avec drag gestures
- Super Like avec animation et limite quotidienne
- Limite de 50 swipes/jour pour utilisateurs gratuits
- Match popup avec timer 48h et confettis
- Modal Premium upsell avec features list
- Store swipe avec statistiques et historique
- Rewind pour utilisateurs Premium

### 2026-01-20 (v0.2.0)
- Module Onboarding complet avec 5 étapes
- CameraView avec capture photo temps réel
- Validation formulaire avec Zod + React Hook Form
- Store Zustand avec persistance
- Génération code Wingman et partage natif

### 2026-01-20 (v0.1.0)
- Setup PWA avec manifest ECHO
- Navigation bottom avec animations
- Pages principales (Home, Discover, Matches, Profile)
- Thème neon dark avec glassmorphism
- Configuration Tailwind CSS personnalisée

### Initial
- Init projet Vite + React + TypeScript

---

Made with love by Adam Beloucif
