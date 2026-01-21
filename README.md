# ECHO - Dating Authentique

![Status](https://img.shields.io/badge/status-production%20ready-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![PWA](https://img.shields.io/badge/PWA-ready-green)
![Progress](https://img.shields.io/badge/progress-100%25-brightgreen)
![Supabase](https://img.shields.io/badge/Supabase-connected-3FCF8E)
![Vercel](https://img.shields.io/badge/Vercel-deployed-black)

> Rencontres authentiques avec validation par un ami

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
- **Styling**: Tailwind CSS v4 + Framer Motion
- **State**: Zustand avec persistance
- **Routing**: React Router DOM
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React
- **PWA**: Vite Plugin PWA + Workbox
- **Backend**: Supabase (Auth, Database, Realtime, Storage)

## Design System

Echo utilise un **design system neon cohérent** avec composants réutilisables et accessibles.

### Composants UI Disponibles

1. **RangeSlider** - Sélecteur de plage double (âge, distance)
2. **Toggle** - Switch on/off élégant avec animations
3. **CardSection** - Container réutilisable avec variantes
4. **ProfileGridItem** - Carte profil pour grille avec badges
5. **PremiumBanner** - Bannière promotionnelle animée

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

Score audit frontend: **8/10**

### Implémenté
- ✅ Validation Zod sur formulaires
- ✅ Sanitisation XSS des messages
- ✅ Rate limiting côté client
- ✅ Validation des types de fichiers
- ✅ Gestion mémoire (Object URLs)
- ✅ TypeScript strict

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
│       └── index.ts                 # Exports
├── contexts/        # React contexts (AuthContext)
├── hooks/           # Custom hooks (useCamera, useAudioRecorder, useLocation)
├── lib/             # Utilitaires (cn, utils, security, supabase, i18n)
├── services/        # Services (chatService)
├── pages/           # Pages de l'application
│   ├── Home.tsx
│   ├── Discover.tsx
│   ├── Matches.tsx
│   ├── Profile.tsx
│   ├── Onboarding.tsx
│   ├── Wingman.tsx
│   └── Chat.tsx
├── stores/          # Zustand stores
│   ├── onboardingStore.ts
│   ├── swipeStore.ts
│   └── userStore.ts
├── types/           # Types TypeScript
│   ├── database.ts
│   ├── onboarding.ts
│   ├── swipe.ts
│   ├── user.ts
│   └── wingman.ts
└── supabase/        # Supabase configuration
    └── schema.sql
```

## Limites

| Feature | Gratuit | Premium |
|---------|---------|---------|
| Swipes/jour | 20 | Illimité |
| Super Likes | 0 | 5/semaine |
| Rewind | ❌ | ✅ |
| Voir qui t'a liké | ❌ | ✅ |

## Changelog

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
