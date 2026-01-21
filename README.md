# ECHO - Dating Authentique

![Status](https://img.shields.io/badge/status-production%20ready-brightgreen)
![Version](https://img.shields.io/badge/version-1.3.0-blue)
![PWA](https://img.shields.io/badge/PWA-ready-green)
![Progress](https://img.shields.io/badge/progress-100%25-brightgreen)
![Supabase](https://img.shields.io/badge/Supabase-connected-3FCF8E)
![Vercel](https://img.shields.io/badge/Vercel-deployed-black)
![Security](https://img.shields.io/badge/Security-hardened-orange)

> Rencontres authentiques avec validation par un ami. Fenêtre 48h. Matches éphémères.

## Concept

ECHO réinvente les applications de dating avec trois principes fondamentaux :

1. **Photos en temps réel** - Pas de vieilles photos ou de filtres trompeurs. Seules les photos prises dans l'instant sont acceptées.

2. **Validation Wingman** - Ton profil doit être validé par un ami qui témoigne de ta personnalité.

3. **Matchs éphémères** - Les matchs expirent en 48h. Pas de temps à perdre, agis vite !

## Features

### Phase I-IV (Complété ✅)
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
- [x] Limite quotidienne (20 swipes/jour, Super Like Premium only)
- [x] Match popup avec timer 48h
- [x] Modal Premium upsell
- [x] Statistiques de swipe
- [x] Système Wingman complet
- [x] Page publique /wingman/:token
- [x] Enregistrement vocal avec visualizer
- [x] Sélection qualités/défauts

### Phase V - Echo TTL (Complété ✅)
- [x] Système Echo TTL (profil expire après 7 jours)
- [x] StatusBadge (Actif/Expiring/Silence)
- [x] ExpirationBanner avec CTA
- [x] Grayscale filter pour profils inactifs
- [x] CountdownTimer component
- [x] EchoTimerWave (waveform animé)
- [x] User store avec persistance

### Phase VI - Match & Chat (Complété ✅)
- [x] Match list avec timer 48h
- [x] Waveform timer UI
- [x] Chat UI avec messages
- [x] Typing indicator
- [x] Résonance badge (match permanent)
- [x] Supabase backend integration
- [x] AuthContext avec authentification
- [x] Chat service temps réel
- [x] Géolocalisation avec Haversine
- [x] Résonance check-in (200m)
- [ ] Appels vidéo WebRTC (Phase VII)

### Phase VII - Finalisation (Complété ✅)
- [x] Splash screen animé avec logo
- [x] i18n complet (FR/EN)
- [x] Code splitting et lazy loading
- [x] Optimisation Lighthouse (chunks vendors)
- [x] Configuration Vercel
- [x] Deploy prêt

## Quick Start

### Installation

```bash
# Clone le repo
git clone https://github.com/Adam-Blf/Echo.git
cd Echo

# Installe les dépendances
npm install

# Configure les variables d'environnement
cp .env.example .env
# Ajoute ta clé Supabase dans .env

# Lance le serveur de développement
npm run dev
```

### Variables d'Environnement

```bash
# .env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Structure des Fichiers de Configuration

- `.env` - Variables d'environnement (NE PAS COMMITTER)
- `.env.example` - Template des variables
- `vite.config.ts` - Configuration Vite avec PWA plugin
- `tailwind.config.ts` - Thème neon personnalisé
- `tsconfig.json` - Configuration TypeScript strict

## Key Features Explained

### Fenêtre 48h
Les matchs expirent après 48 heures d'inactivité. Cette urgence pousse à l'action et maintient les utilisateurs engagés. Un timer visible rappelle le deadline.

### Système Wingman
Validation par un ami pour garantir l'authenticité. Chaque profil doit être validé par un ami témoignant de la personnalité réelle de l'utilisateur.

### Photos Temps Réel
Pas de vieilles photos. Le système encourage les selfies frais avec timestamp pour l'authenticité.

### Swipe System
- **Like** : Swipe droite
- **Super Like** : Double tap (Premium only)
- **Rewind** : Annuler le dernier swipe (Premium only)
- **Block** : Swipe bas

### Chat & Résonance
- Chat temps réel avec Supabase
- Résonance badge = Match qui s'est transformé en relation stable
- Check-in géolocalisation (200m) pour confiance

## Tech Stack

- **Frontend**: React 19 + TypeScript 5
- **Styling**: Tailwind CSS v4 + Framer Motion
- **State**: Zustand avec persistance localStorage
- **Routing**: React Router DOM v7
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React (24px)
- **PWA**: Vite Plugin PWA + Workbox
- **Security**: DOMPurify (XSS sanitization)
- **Backend**: Supabase (Auth, Database, Realtime, Storage, PostGIS)
- **Deployment**: Vercel

## Design System

Echo utilise un **design system neon cohérent** avec composants réutilisables et accessibles.

### Composants UI Disponibles

1. **RangeSlider** - Selecteur de plage double (age, distance)
2. **Toggle** - Switch on/off elegant avec animations
3. **CardSection** - Container reutilisable avec variantes
4. **ProfileGridItem** - Carte profil pour grille avec badges
5. **PremiumBanner** - Banniere promotionnelle animee
6. **FiltersModal** - Modale de filtres (age, distance, genre) avec sliders

### Showcase & Documentation

- **Showcase interactif** : `/components/showcase`
- **Documentation complète** : `docs/COMPONENTS.md`
- **Galerie de stories** : `docs/COMPONENT_STORIES.md`
- **Cheat sheet** : `docs/COMPONENTS_CHEATSHEET.md`

### Couleurs Neon

```
Cyan:   #00f5ff  | Purple: #bf00ff  | Pink: #ff006e
Green:  #39ff14  | Dark:   #0a0a0f  | Card: #12121a
```

---

## Sécurité

Score audit frontend: **9/10** ⬆️

### Implémenté
- ✅ **XSS Sanitization** - DOMPurify pour tous les inputs utilisateur (messages, bios)
- ✅ Validation Zod stricte sur tous les formulaires
- ✅ **Rate limiting** côté client (messages, swipes, reports)
- ✅ **RLS Policies** sur toutes les tables Supabase (block, premium, discovery)
- ✅ Validation des types de fichiers (images JPEG/PNG uniquement)
- ✅ Gestion sécurisée de la mémoire (Object URLs cleanup)
- ✅ TypeScript strict mode activé
- ✅ Headers sécurisés Vercel (CSP, HSTS)

### Architecture Sécurité
- Tokens d'authentification Supabase stockés en session (jamais localStorage)
- Sanitization XSS centralisée via `sanitizeString()` dans `/lib/security.ts`
- Rate limiting en-mémoire avec `RateLimiter` class
- Validation des requêtes côté backend via RPC functions sécurisées

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
│       ├── RangeSlider.tsx          # Sélecteur de plage
│       ├── Toggle.tsx               # Switch on/off
│       ├── CardSection.tsx          # Container avec variantes
│       ├── ProfileGridItem.tsx      # Carte profil
│       ├── PremiumBanner.tsx        # Bannière promo
│       ├── CameraView.tsx
│       ├── SwipeCard.tsx
│       ├── SwipeActions.tsx
│       ├── MatchPopup.tsx
│       ├── LimitReachedModal.tsx
│       ├── AudioVisualizer.tsx
│       ├── VoiceRecorder.tsx
│       ├── StatusBadge.tsx
│       ├── ExpirationBanner.tsx
│       ├── CountdownTimer.tsx
│       ├── EchoTimerWave.tsx
│       ├── SplashScreen.tsx
│       ├── LanguageSelector.tsx
│       ├── PaywallModal.tsx         # Premium paywall avec blur effects
│       └── index.ts                 # Exports
├── contexts/        # React contexts (AuthContext)
├── hooks/           # Custom hooks
│   ├── useCamera.ts
│   ├── useAudioRecorder.ts
│   ├── useLocation.ts
│   ├── useResonanceCheckIn.ts
│   └── usePremiumGate.ts            # Premium gate pour les features bloquées
├── lib/             # Utilitaires
│   ├── cn.ts                    # Tailwind class merger (clsx + tailwind-merge)
│   ├── security.ts              # XSS sanitization + Rate limiting
│   ├── supabase.ts              # Supabase client config
│   └── i18n.ts                  # Internationalization (FR/EN)
├── services/        # Services backend
│   ├── blockService.ts       # Block/Report avec RLS
│   ├── discoveryService.ts   # Discovery + PostGIS geolocation
│   ├── premiumService.ts     # Premium features + subscriptions
│   └── chatService.ts        # Messages temps réel
├── pages/           # Pages de l'application
│   ├── Home.tsx             # Landing page avec CTA
│   ├── Discover.tsx         # Swipe cards avec filtres
│   ├── Matches.tsx          # Matchs avec timer 48h
│   ├── Chat.tsx             # Messages temps réel
│   ├── Profile.tsx          # Profil utilisateur
│   ├── EditProfile.tsx
│   ├── Onboarding.tsx       # 5 étapes onboarding
│   ├── Wingman.tsx          # Validation par ami
│   ├── Settings.tsx         # Paramètres avec card UI
│   ├── Likes.tsx            # Qui m'a liké (Premium gate)
│   └── Premium.tsx          # Page subscription premium
├── stores/          # Zustand stores
│   ├── onboardingStore.ts
│   ├── swipeStore.ts
│   ├── userStore.ts
│   ├── settingsStore.ts
│   └── filtersStore.ts    # Store des filtres de recherche
├── types/           # Types TypeScript
│   ├── database.ts
│   ├── onboarding.ts
│   ├── swipe.ts
│   ├── user.ts
│   └── wingman.ts
├── supabase/        # Supabase configuration
│   ├── schema.sql
│   └── migrations/
│       ├── 001_add_blocks_reports.sql
│       ├── 002_add_premium_subscriptions.sql
│       ├── 003_add_geolocation.sql
│       └── 004_security_hardening.sql        # RLS policies, indexes
└── docs/            # Documentation
    ├── COMPONENTS.md                 # Design system complet
    ├── COMPONENT_STORIES.md          # Usage stories
    ├── COMPONENTS_CHEATSHEET.md      # Copy-paste ready
    ├── BACKEND_SERVICES.md           # Services Supabase
    ├── ARCHITECTURE.md               # Architecture générale
    └── README.md                     # Ce fichier
```

## Premium Features & Limitations

| Feature | Gratuit | Premium |
|---------|---------|---------|
| Swipes/jour | 20 | Illimité |
| Super Likes/semaine | 0 | 5 |
| Voir qui t'a liké | ❌ Blur progressif | ✅ Grille complète |
| Rewind (annuler swipe) | ❌ | ✅ |
| Mode invisible | ❌ | ✅ |
| Filtres avancés | Basique | Tous |
| Géolocalisation | ✅ | ✅ |
| Validation Wingman | ✅ | ✅ |

### PaywallModal
Implémentation élégante avec :
- Blur progressif des profils premium (gradient overlay)
- Cards animées avec Framer Motion
- CTA avec micro-interactions
- Statistiques premium (top stats, engagement metrics)

## Backend Services

Echo utilise Supabase avec des migrations SQL avancées pour les fonctionnalités backend.

### Services Disponibles

1. **Block Service** - Blocage et signalement d'utilisateurs
   - Rate limiting (20 blocks/h, 5 reports/24h)
   - RPC functions avec RLS policies
   - Cleanup automatique des matches

2. **Discovery Service** - Discovery avec géolocalisation
   - PostGIS pour calculs de distance optimisés
   - Filtres avancés (âge, distance, validation)
   - Index spatial GiST pour performance

3. **Premium Service** - Gestion des abonnements
   - Sync temps réel avec Supabase Realtime
   - Features premium (see likes, rewind, invisible mode)
   - Tables denormalisées pour cache rapide

**Documentation complète** : [docs/BACKEND_SERVICES.md](docs/BACKEND_SERVICES.md)

### Migrations SQL

```bash
# Appliquer les migrations
supabase db push

# Migrations incluses:
# - 001: Blocks & Reports avec RLS
# - 002: Premium & Subscriptions
# - 003: PostGIS Geolocation
```

---

## Changelog

### 2026-01-21 (v1.3.0) - Security Hardening & Premium Paywall
- **XSS Sanitization** - DOMPurify sur tous les inputs utilisateur (messages, bios, posts)
- **Premium Paywall** - PaywallModal avec blur progressif des profils premium
- **Micro-interactions** - Animations Framer Motion smoothes sur tous les CTAs
- Security audit score passé de 8/10 à 9/10
- RLS policies optimisées pour premium features
- Documentation sécurité complète dans `/lib/security.ts`

### 2026-01-21 (v1.2.0) - Backend Services
- Services Supabase complets (block, discovery, premium)
- Intégration PostGIS pour géolocalisation
- RPC functions avec Row Level Security
- Stores Zustand étendus avec synchro backend
- Documentation complète des services

### 2026-01-21 (v1.1.0) - Core Pages Enhancement
- FiltersModal avec double range slider (age, distance) et selection genre
- filtersStore Zustand avec persistance localStorage
- Settings page refonte complete avec Deck card-style UI
- Quick toggles (mode invisible, notifications push)
- Page Likes "Qui m'a like" avec grille profils et overlay premium
- Animation shimmer sur bouton premium
- Integration des filtres dans la page Discover
- Correction bugs TypeScript (Framer Motion variants)

### 2026-01-20 (v1.0.0) - Production Ready
- Phase VII complète
- Splash screen animé avec logo Echo
- Système i18n complet (FR/EN) avec détection automatique
- Code splitting avec lazy loading des pages
- Chunks vendors optimisés (React, Motion, Supabase, Forms)
- Configuration Vercel avec headers sécurisés
- PWA complète avec caching optimisé

### 2026-01-20 (v0.6.0)
- Supabase backend integration complète
- AuthContext pour authentification
- ChatService temps réel avec rate limiting
- useLocation hook avec formule Haversine
- useResonanceCheckIn pour check-in 200m
- Schema SQL complet avec RLS policies
- Types database TypeScript

### 2026-01-20 (v0.5.0)
- Phase V Echo TTL complète
- Système de profil "vivant" (expire après 7 jours)
- StatusBadge et ExpirationBanner
- CountdownTimer et EchoTimerWave
- Chat UI avec typing indicator
- Match list avec waveform timer
- Résonance status (match permanent)
- Utilitaires de sécurité (sanitization, rate limiting)

### 2026-01-20 (v0.4.0)
- Système Wingman complet avec page publique
- Enregistrement audio avec visualizer temps réel
- Sélection qualités/défauts pour le profil
- Animation de succès après validation
- Limites : 20 swipes/jour, 0 Super Like gratuit, 5/semaine Premium

### 2026-01-20 (v0.3.0)
- Système de swipe complet avec drag gestures
- Super Like avec animation (Premium only - 5/semaine)
- Limite de 20 swipes/jour pour utilisateurs gratuits
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

---

Made with love by Adam Beloucif
