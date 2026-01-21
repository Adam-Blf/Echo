# Product Backlog - ECHO Dating App

## Vision Produit

> ECHO est une application de rencontre qui favorise l'authenticite grace aux photos en temps reel, la validation par des amis (Wingman), et des matchs ephemeres de 48h qui encouragent l'engagement rapide.

**Concepts Uniques:**
- **Photos en temps reel**: Pas de vieilles photos, profil expire apres 7 jours d'inactivite (Echo TTL)
- **Systeme Wingman**: Validation du profil par un ami de confiance
- **Matchs ephemeres 48h**: Les matchs expirent si aucune conversation n'est engagee
- **Resonance**: Match permanent si rencontre physique a moins de 200m

---

## Etat Actuel des Features

### Features DONE (Implementees)

| ID | Feature | Description | Status |
|----|---------|-------------|--------|
| F-001 | Authentification OAuth | Login Google/Apple Sign-In | DONE |
| F-002 | Onboarding 8 etapes | Photos, birthdate, genre, preferences, bio, interets, wingman | DONE |
| F-003 | Detection de visage | La 1ere photo doit montrer un visage | DONE |
| F-004 | Page Discover | Swipe cards avec animations Framer Motion | DONE |
| F-005 | Systeme de Swipe | Like, Nope, Super Like | DONE |
| F-006 | Limites Free | 20 swipes/jour, 0 Super Likes pour gratuit | DONE |
| F-007 | Timer 48h Matchs | Matchs expirent en 48h sans message | DONE |
| F-008 | Echo TTL Status | ACTIVE/EXPIRING/SILENCE (7 jours) | DONE |
| F-009 | Page Matches | Liste avec onglets Actifs/Resonance/Expires | DONE |
| F-010 | Messagerie Chat | Messages temps reel, typing indicator | DONE |
| F-011 | Page Profil | Affichage status Echo, progression profil | DONE |
| F-012 | Edit Profile | Drag-drop photos, bio, interets, preferences recherche | DONE |
| F-013 | Wingman Page | Validation externe par ami (qualites, defauts, vocal, testimonial) | DONE |
| F-014 | Settings Hub | Compte, Notifications, Confidentialite | DONE |
| F-015 | Mode Invisible | Option pour ne pas apparaitre dans le feed | DONE |
| F-016 | Gestion Blocages | Liste utilisateurs bloques, deblocage | DONE |
| F-017 | Splash Screen | Animation de lancement | DONE |
| F-018 | Securite Chat | Rate limiting, sanitization, validation longueur messages | DONE |
| F-019 | Match Popup | Animation lors d'un nouveau match | DONE |
| F-020 | Limit Reached Modal | Upsell Premium quand limite atteinte | DONE |
| F-021 | Countdown Timer | Timer visuel pour expiration match | DONE |
| F-022 | Echo Wave Animation | Visualisation temps restant style waveform | DONE |

---

## Backlog Priorise - Features a Implementer

### EPIC 1: Filtres de Recherche Avances

#### US-001: Filtres de decouverte basiques
**Priorite: P0 - Must Have**

**En tant que** utilisateur
**Je veux** filtrer les profils par age, distance et genre
**Afin de** voir uniquement les profils qui correspondent a mes criteres

**Criteres d'Acceptation:**
- [ ] Bouton filtre fonctionnel dans le header de Discover
- [ ] Modal/Sheet avec sliders pour age (18-80) et distance (1-200km)
- [ ] Toggle pour genre recherche (Hommes/Femmes/Tous)
- [ ] Filtres persistes dans le store (zustand)
- [ ] Profils filtres en temps reel
- [ ] Animation smooth a l'ouverture/fermeture du panel filtres

**Estimation: 5 points**

---

#### US-002: Sauvegarde des preferences de recherche
**Priorite: P1 - Should Have**

**En tant que** utilisateur
**Je veux** que mes filtres soient sauvegardes entre les sessions
**Afin de** ne pas les reconfigurer a chaque ouverture

**Criteres d'Acceptation:**
- [ ] Filtres persistes dans localStorage via zustand persist
- [ ] Synchronisation avec EditProfile (ageRange, maxDistance, lookingFor)
- [ ] Reset possible vers valeurs par defaut

**Estimation: 2 points**

---

### EPIC 2: Systeme Premium

#### US-003: Page Premium/Abonnement
**Priorite: P0 - Must Have**

**En tant que** utilisateur Free
**Je veux** voir les avantages Premium et pouvoir m'abonner
**Afin de** profiter de fonctionnalites avancees

**Criteres d'Acceptation:**
- [ ] Page `/premium` avec design attractif
- [ ] Liste des avantages Premium animee
- [ ] 3 plans: Mensuel, Trimestriel (-20%), Annuel (-40%)
- [ ] Integration paiement (Stripe ou RevenueCat pour mobile)
- [ ] Confirmation d'achat et activation immediate
- [ ] Gestion du statut isPremium dans le store

**Avantages Premium a afficher:**
1. Swipes illimites
2. 5 Super Likes par semaine
3. Voir qui m'a like
4. Rewind (annuler dernier swipe)
5. Boosts (visibilite prioritaire)
6. Pas de publicites

**Estimation: 13 points**

---

#### US-004: Voir qui m'a like (Likes Received)
**Priorite: P0 - Must Have**

**En tant que** utilisateur
**Je veux** voir les profils qui m'ont like
**Afin de** matcher plus facilement

**Criteres d'Acceptation:**
- [ ] Nouvelle page `/likes` accessible depuis le bottom nav ou Matches
- [ ] Grille de profils avec photos floutees (blur) pour Free
- [ ] Compteur de likes recus visible
- [ ] Free: Voir le nombre + profils floutes + CTA Premium
- [ ] Premium: Profils visibles, possibilite de liker directement
- [ ] Animation de "match instantane" si like retourne

**Estimation: 8 points**

---

#### US-005: Fonctionnalite Rewind (Premium)
**Priorite: P1 - Should Have**

**En tant que** utilisateur Premium
**Je veux** annuler mon dernier swipe
**Afin de** corriger une erreur

**Criteres d'Acceptation:**
- [ ] Bouton Rewind dans SwipeActions (deja present, a activer)
- [ ] Animation de retour de la carte precedente
- [ ] Limite: 1 rewind gratuit par session, illimite Premium
- [ ] Historique des swipes consultatble pour rewind

**Estimation: 3 points**

---

#### US-006: Boost de profil (Premium)
**Priorite: P2 - Could Have**

**En tant que** utilisateur Premium
**Je veux** booster mon profil pour etre vu en priorite
**Afin de** maximiser mes chances de match

**Criteres d'Acceptation:**
- [ ] Bouton Boost sur la page Profil
- [ ] 1 Boost gratuit par mois pour Premium
- [ ] Boost dure 30 minutes
- [ ] Badge "Booste" visible sur le profil dans Discover
- [ ] Stats de vues pendant le boost

**Estimation: 5 points**

---

### EPIC 3: Securite & Moderation

#### US-007: Signaler un profil
**Priorite: P0 - Must Have**

**En tant que** utilisateur
**Je veux** signaler un profil inapproprie
**Afin de** proteger la communaute

**Criteres d'Acceptation:**
- [ ] Bouton "Signaler" dans le menu options du profil (SwipeCard)
- [ ] Bouton "Signaler" dans le chat
- [ ] Modal avec raisons predefinies:
  - Profil fake/Catfish
  - Photos inappropriees
  - Comportement offensant
  - Spam/Arnaque
  - Mineur
  - Autre
- [ ] Champ texte optionnel pour details
- [ ] Confirmation de signalement envoyee
- [ ] Le profil signale n'apparait plus dans le feed de l'utilisateur

**Estimation: 5 points**

---

#### US-008: Bloquer un utilisateur
**Priorite: P0 - Must Have**

**En tant que** utilisateur
**Je veux** bloquer quelqu'un
**Afin de** ne plus voir son profil ni recevoir ses messages

**Criteres d'Acceptation:**
- [ ] Bouton "Bloquer" a cote de "Signaler"
- [ ] Confirmation avant blocage
- [ ] Utilisateur bloque:
  - N'apparait plus dans Discover
  - Match supprime si existant
  - Messages supprimes
  - Ne peut plus voir mon profil
- [ ] Liste des bloques dans Privacy Settings (DONE - a connecter)
- [ ] Possibilite de debloquer (DONE)

**Estimation: 3 points**

---

#### US-009: Verification de profil (Badge Verifie)
**Priorite: P1 - Should Have**

**En tant que** utilisateur
**Je veux** verifier mon profil
**Afin de** montrer que je suis authentique

**Criteres d'Acceptation:**
- [ ] Flow de verification: prendre une photo en mimant une pose aleatoire
- [ ] Comparaison avec photo de profil (similarite visage)
- [ ] Badge "Verifie" affiche sur le profil
- [ ] Filtre optionnel "Profils verifies uniquement"

**Estimation: 8 points**

---

### EPIC 4: Experience Utilisateur

#### US-010: Notifications Push
**Priorite: P0 - Must Have**

**En tant que** utilisateur
**Je veux** recevoir des notifications
**Afin de** ne pas manquer de matchs ou messages

**Criteres d'Acceptation:**
- [ ] Integration Service Worker (PWA ready - vite-plugin-pwa present)
- [ ] Permission demandee apres onboarding
- [ ] Types de notifications:
  - Nouveau match
  - Nouveau message
  - Match va expirer (6h avant)
  - Profil va expirer (24h avant)
  - Quelqu'un t'a Super Like
- [ ] Settings pour activer/desactiver chaque type (UI existe dans NotificationSettings)
- [ ] Deep link vers la bonne page

**Estimation: 8 points**

---

#### US-011: Resonance - Check-in Proximite
**Priorite: P1 - Should Have**

**En tant que** utilisateur avec un match
**Je veux** transformer mon match en Resonance quand je rencontre la personne
**Afin de** garder le match pour toujours

**Criteres d'Acceptation:**
- [ ] Bouton "Check-in" dans le chat (UI presente)
- [ ] Permission geolocalisation requise
- [ ] Detection proximite < 200m entre les deux utilisateurs
- [ ] Les deux doivent confirmer le check-in
- [ ] Animation speciale "Resonance"
- [ ] Badge Resonance sur le match (infini - pas d'expiration)
- [ ] Historique des Resonances

**Estimation: 8 points**

---

#### US-012: Prise de photo Echo
**Priorite: P1 - Should Have**

**En tant que** utilisateur
**Je veux** prendre une nouvelle photo Echo depuis l'app
**Afin de** reactiver/rafraichir mon profil

**Criteres d'Acceptation:**
- [ ] Page `/camera` avec CameraView (composant existe)
- [ ] Capture photo avec camera frontale
- [ ] Validation de visage detecte
- [ ] Preview et possibilite de reprendre
- [ ] Upload vers Supabase Storage
- [ ] Mise a jour lastPhotoAt et reset TTL
- [ ] Notification de succes

**Estimation: 5 points**

---

#### US-013: Historique des photos Echo
**Priorite: P2 - Could Have**

**En tant que** utilisateur
**Je veux** voir mes anciennes photos Echo
**Afin de** suivre mon historique

**Criteres d'Acceptation:**
- [ ] Page `/history`
- [ ] Grille chronologique des photos
- [ ] Date de chaque photo
- [ ] Possibilite de supprimer (sauf photo actuelle)

**Estimation: 3 points**

---

#### US-014: Page d'accueil (Home) enrichie
**Priorite: P2 - Could Have**

**En tant que** utilisateur
**Je veux** voir un dashboard sur la Home
**Afin d'** avoir une vue d'ensemble de mon activite

**Criteres d'Acceptation:**
- [ ] Stats resumees (matchs actifs, messages non lus)
- [ ] Raccourci vers Discover
- [ ] Rappel si profil va expirer
- [ ] Suggestions d'actions (prendre photo, completer profil)

**Estimation: 5 points**

---

### EPIC 5: Qualite & Performance

#### US-015: Tests E2E critiques
**Priorite: P1 - Should Have**

**En tant que** developpeur
**Je veux** des tests automatises
**Afin de** garantir la qualite

**Criteres d'Acceptation:**
- [ ] Setup Playwright
- [ ] Test: Flow d'authentification
- [ ] Test: Onboarding complet
- [ ] Test: Swipe et match
- [ ] Test: Envoi de message
- [ ] CI/CD integration

**Estimation: 8 points**

---

#### US-016: Backend Supabase complet
**Priorite: P0 - Must Have**

**En tant que** developpeur
**Je veux** connecter toutes les features au backend
**Afin de** persister les donnees reellement

**Criteres d'Acceptation:**
- [ ] Tables: profiles, matches, messages, swipes, reports, blocks
- [ ] Row Level Security (RLS) sur toutes les tables
- [ ] Realtime subscriptions pour messages et matchs
- [ ] Storage pour photos avec policies
- [ ] Edge Functions pour logique metier (check-in, notifications)

**Estimation: 13 points**

---

## Resume par Priorite

### P0 - Must Have (MVP)
| ID | Story | Points |
|----|-------|--------|
| US-001 | Filtres de decouverte basiques | 5 |
| US-003 | Page Premium/Abonnement | 13 |
| US-004 | Voir qui m'a like | 8 |
| US-007 | Signaler un profil | 5 |
| US-008 | Bloquer un utilisateur | 3 |
| US-010 | Notifications Push | 8 |
| US-016 | Backend Supabase complet | 13 |
| **TOTAL P0** | | **55 points** |

### P1 - Should Have
| ID | Story | Points |
|----|-------|--------|
| US-002 | Sauvegarde preferences recherche | 2 |
| US-005 | Fonctionnalite Rewind | 3 |
| US-009 | Verification de profil | 8 |
| US-011 | Resonance Check-in | 8 |
| US-012 | Prise de photo Echo | 5 |
| US-015 | Tests E2E | 8 |
| **TOTAL P1** | | **34 points** |

### P2 - Could Have
| ID | Story | Points |
|----|-------|--------|
| US-006 | Boost de profil | 5 |
| US-013 | Historique photos | 3 |
| US-014 | Home enrichie | 5 |
| **TOTAL P2** | | **13 points** |

---

## Definition of Done (DoD) - MVP

Le MVP est considere comme DONE quand:

- [ ] Toutes les User Stories P0 sont implementees et testees
- [ ] L'application fonctionne en mode PWA sur mobile
- [ ] Les donnees sont persistees dans Supabase
- [ ] L'authentification OAuth est securisee
- [ ] Les paiements Premium sont fonctionnels (au moins un provider)
- [ ] Le systeme de signalement est operationnel
- [ ] Les notifications push fonctionnent
- [ ] L'application passe un audit de securite basique
- [ ] La performance est acceptable (LCP < 2.5s, FID < 100ms)
- [ ] Aucun bug critique connu

---

## Roadmap Proposee

### Sprint 1 (2 semaines)
**Objectif: Filtres & Securite**
- US-001: Filtres de decouverte
- US-007: Signaler un profil
- US-008: Bloquer un utilisateur

### Sprint 2 (2 semaines)
**Objectif: Backend & Persistence**
- US-016: Backend Supabase complet

### Sprint 3 (2 semaines)
**Objectif: Premium MVP**
- US-003: Page Premium
- US-004: Voir qui m'a like

### Sprint 4 (2 semaines)
**Objectif: Engagement**
- US-010: Notifications Push
- US-012: Prise de photo Echo

### Sprint 5 (2 semaines)
**Objectif: Polish & Launch**
- US-002: Sauvegarde preferences
- US-005: Rewind
- Bug fixes et optimisations

---

## Metriques de Succes

| Metrique | Objectif MVP |
|----------|-------------|
| DAU/MAU ratio | > 25% |
| Match rate | > 10% des swipes |
| Message rate | > 50% des matchs |
| Retention J7 | > 30% |
| Conversion Premium | > 3% |
| Reports traites < 24h | 100% |
| App crashes | < 0.1% |

---

*Document genere le 21/01/2026*
*Product Owner: Echo Team*
