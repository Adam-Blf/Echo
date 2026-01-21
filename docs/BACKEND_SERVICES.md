# Backend Services - Echo Dating App

Documentation des services backend Supabase créés pour Echo.

## Vue d'ensemble

Trois services principaux ont été créés pour connecter le frontend aux fonctions RPC Supabase définies dans les migrations SQL 001, 002 et 003.

---

## 1. Block Service (`src/services/blockService.ts`)

### Fonctionnalités

#### Blocage d'utilisateurs
- `blockUser(userId: string)` - Bloque un utilisateur
  - Rate limit: 20 blocks/heure
  - Supprime automatiquement les matches/swipes existants
  - Déclenche le trigger de cleanup SQL

- `unblockUser(userId: string)` - Débloque un utilisateur

- `getBlockedUsers()` - Récupère la liste des IDs bloqués
  - Utilise RPC: `get_blocked_user_ids`

- `isUserBlocked(userId: string)` - Vérifie si un utilisateur est bloqué
  - Utilise RPC: `is_blocked`

- `isMutuallyBlocked(userId: string)` - Vérifie le blocage mutuel
  - Utilise RPC: `is_mutually_blocked`

#### Signalements
- `reportUser({ userId, reason, description, screenshotUrl })` - Signale un utilisateur
  - Rate limit: 5 signalements/24h (appliqué par trigger DB)
  - Bloque automatiquement l'utilisateur
  - Raisons disponibles:
    - `fake_profile` - Profil frauduleux
    - `inappropriate` - Contenu inapproprié
    - `harassment` - Harcèlement
    - `spam` - Spam/Publicité
    - `underage` - Utilisateur mineur
    - `scam` - Arnaque
    - `other` - Autre

- `getMyReports()` - Liste mes signalements

#### Helpers
- `getReportReasonLabel(reason)` - Traduction française des raisons
- `getReportReasons()` - Liste toutes les raisons pour UI

### Intégration avec `settingsStore`

Le store a été étendu avec:

```typescript
// Nouvelles propriétés
blockedUserIds: string[]
isLoadingBlocks: boolean

// Nouvelles méthodes async
blockUser(user) → Promise<{ success, error? }>
unblockUser(userId) → Promise<{ success, error? }>
checkIfBlocked(userId) → Promise<boolean>
syncBlockedUsers() → Promise<void>
```

**Cache local** : Les IDs bloqués sont mis en cache pour éviter les appels réseau répétés.

---

## 2. Discovery Service (`src/services/discoveryService.ts`)

### Fonctionnalités

#### Discovery avancé
- `getDiscoveryProfiles(filters)` - Profils discovery avec filtres
  - Utilise RPC: `get_discovery_profiles_advanced`
  - Filtres disponibles:
    - `minAge` / `maxAge` - Plage d'âge
    - `maxDistanceKm` - Distance max (PostGIS)
    - `verifiedOnly` - Profils validés uniquement
    - `limit` / `offset` - Pagination

- `getProfilesNearby(radiusKm, limit)` - Profils à proximité
  - Utilise RPC: `get_profiles_within_distance`
  - Utilise l'index spatial GiST pour performance

- `getBasicDiscoveryProfiles(limit)` - Fallback sans filtres
  - Utilise RPC: `get_discovery_profiles`

#### Géolocalisation
- `updateLocation({ latitude, longitude })` - Met à jour la position
  - Déclenche automatiquement la mise à jour de la colonne PostGIS `geography`
  - Valide les coordonnées (-90/90, -180/180)

- `getCurrentLocation()` - Récupère position actuelle

- `requestAndUpdateLocation()` - Demande permission et met à jour
  - Utilise l'API Geolocation du navigateur
  - Gère les erreurs de permission

- `countNearbyUsers(radiusKm)` - Compte utilisateurs proches
  - Utilise RPC: `count_nearby_users`
  - Par défaut 10km de rayon

- `getDistanceToUser(targetUserId)` - Distance vers un utilisateur
  - Utilise RPC: `distance_between_users`
  - Retour en kilomètres

#### Préférences de recherche
- `updateSearchPreferences(preferences)` - Met à jour les préférences
  - Utilise RPC: `update_search_preferences`
  - Stocké en JSONB dans `profiles.search_preferences`

- `getSearchPreferences()` - Récupère avec valeurs par défaut
  - Utilise RPC: `get_search_preferences`

#### Helpers
- `formatDistance(km)` - Formatage d'affichage
- `checkLocationPermission()` - Vérifie permission géoloc

### Intégration avec `swipeStore`

Le store a été étendu avec:

```typescript
// Nouvelles propriétés
isLoadingProfiles: boolean
isLoadingLocation: boolean
nearbyCount: number

// Nouvelles méthodes async
fetchDiscoveryProfiles(filters?) → Promise<void>
updateUserLocation() → Promise<{ success, error? }>
refreshNearbyCount() → Promise<void>
```

**Auto-sync avec filtersStore** : Utilise automatiquement les filtres de `filtersStore` si non fournis.

---

## 3. Premium Service (`src/services/premiumService.ts`)

### Fonctionnalités

#### Status Premium
- `getPremiumStatus()` - Status premium complet
  - Retourne: `{ isPremium, currentPlan, expiresAt, features }`
  - Combine `subscriptions` + `premium_features`

- `getUserPremiumState()` - State premium caché (optimisé)
  - Table denormalisée `user_premium_state`
  - Plus rapide que `getPremiumStatus()`

- `isUserPremium()` - Vérifie si premium
  - Utilise RPC: `is_user_premium`

- `getUserPlan()` - Plan actuel
  - Utilise RPC: `get_user_plan`
  - Valeurs: `free`, `echo_plus`, `echo_unlimited`

#### Features Premium
- `checkPremiumFeature(featureName)` - Vérifie accès à une feature
  - Utilise RPC: `can_use_feature`
  - Features disponibles:
    - `see_who_likes_you` - Voir qui m'a liké
    - `rewind_swipes` - Annuler un swipe
    - `invisible_mode` - Mode invisible
    - `read_receipts` - Accusés de lecture
    - `priority_likes` - Likes prioritaires

- `getAllPremiumFeatures()` - Toutes les features par plan
  - Pour afficher les offres premium

#### Likes reçus (Feature Premium)
- `getReceivedLikes(limit, offset)` - Likes reçus
  - Utilise RPC: `get_received_likes`
  - **Free users** : données floutées (`isBlurred: true`)
  - **Premium users** : détails complets

- `countReceivedLikes()` - Nombre de likes reçus
  - Utilise RPC: `count_received_likes`

#### Realtime
- `subscribeToPremiumChanges(callback)` - Sync temps réel
  - Écoute les changements de `user_premium_state`
  - Met à jour automatiquement le status premium

#### Helpers
- `getPlanDisplayName(plan)` - Nom d'affichage
- `getPlanPrice(features, period)` - Prix formaté
- `getFeatureAvailability(feature, plan)` - Disponibilité feature
- `formatSwipeLimit(limit)` - Format limite swipes
- `formatSuperLikeLimit(limit)` - Format limite super likes

### Intégration avec `userStore`

Le store a été étendu avec:

```typescript
// Nouvelles propriétés
premiumStatus: PremiumStatus | null
isPremium: boolean
currentPlan: SubscriptionPlan
isLoadingPremium: boolean

// Nouvelles méthodes async
fetchPremiumStatus() → Promise<void>
syncPremiumState() → Promise<void>
startPremiumSync() → RealtimeChannel
```

**Realtime sync** : Démarre automatiquement la synchro temps réel avec Supabase.

---

## Architecture

### Flow des données

```
Frontend Store
    ↓ (appelle)
Service Layer (TypeScript)
    ↓ (appelle)
Supabase RPC Functions (PostgreSQL)
    ↓ (accède)
Database Tables + Views
```

### Sécurité

#### Row Level Security (RLS)
Toutes les tables ont RLS activé:
- `blocks` - Utilisateur ne voit que ses propres blocks
- `reports` - Utilisateur ne voit que ses propres signalements
- `subscriptions` - Utilisateur ne voit que son propre abonnement
- `user_premium_state` - Utilisateur ne voit que son propre état

#### Rate Limiting
- **Block**: 20 blocks/heure (trigger DB)
- **Report**: 5 signalements/24h (trigger DB)
- Client-side aussi pour meilleure UX

#### Validation
- Coordonnées géographiques validées
- Longueur des messages validée
- Sanitization des inputs (via `lib/security.ts`)

---

## Exemples d'utilisation

### Bloquer un utilisateur

```typescript
import { useSettingsStore } from '@/stores/settingsStore'

const { blockUser } = useSettingsStore()

const handleBlock = async (userId: string) => {
  const result = await blockUser({
    id: userId,
    firstName: 'John',
    photoUrl: 'https://...',
  })

  if (result.success) {
    toast.success('Utilisateur bloqué')
  } else {
    toast.error(result.error)
  }
}
```

### Charger des profils discovery

```typescript
import { useSwipeStore } from '@/stores/swipeStore'
import { useFiltersStore } from '@/stores/filtersStore'

const { fetchDiscoveryProfiles } = useSwipeStore()
const { ageRange, maxDistance } = useFiltersStore()

// Utilise les filtres du store
await fetchDiscoveryProfiles()

// Ou avec des filtres custom
await fetchDiscoveryProfiles({
  minAge: 25,
  maxAge: 35,
  maxDistanceKm: 20,
  verifiedOnly: true,
})
```

### Gérer le status premium

```typescript
import { useUserStore } from '@/stores/userStore'
import { checkPremiumFeature } from '@/services/premiumService'

const { isPremium, fetchPremiumStatus, startPremiumSync } = useUserStore()

// Au login
useEffect(() => {
  fetchPremiumStatus()
  const channel = startPremiumSync()
  return () => channel.unsubscribe()
}, [])

// Vérifier une feature
const handleSeeWhoLikesYou = async () => {
  const { hasAccess } = await checkPremiumFeature('see_who_likes_you')

  if (!hasAccess) {
    // Afficher paywall
    showPremiumModal()
  } else {
    // Afficher les likes
    showLikesPage()
  }
}
```

### Mettre à jour la localisation

```typescript
import { useSwipeStore } from '@/stores/swipeStore'

const { updateUserLocation, refreshNearbyCount } = useSwipeStore()

const handleEnableLocation = async () => {
  const result = await updateUserLocation()

  if (result.success) {
    toast.success('Position mise à jour')
    await refreshNearbyCount()
  } else {
    toast.error(result.error)
  }
}
```

---

## Prochaines étapes

### À implémenter
1. **Stripe Integration**
   - Webhooks pour sync subscriptions
   - Checkout session création
   - Gestion des événements de paiement

2. **UI Components**
   - Modal de signalement
   - Page des utilisateurs bloqués
   - Paywall premium
   - Carte des profils proches

3. **Tests**
   - Tests unitaires des services
   - Tests d'intégration avec Supabase
   - Tests de sécurité RLS

4. **Optimisations**
   - Cache des profils discovery
   - Prefetch des profils suivants
   - Debounce des updates de location

---

## Dépendances SQL

Ces services dépendent des migrations Supabase suivantes:

- **001_add_blocks_reports.sql** - Tables blocks/reports + RPC
- **002_add_premium_subscriptions.sql** - Tables premium + RPC
- **003_add_geolocation.sql** - PostGIS + fonctions distance

**Avant d'utiliser ces services**, assurez-vous que les migrations ont été appliquées:

```bash
supabase db push
```

---

## Support

Pour toute question ou problème:
1. Vérifier que Supabase est configuré (`.env`)
2. Vérifier que les migrations sont appliquées
3. Consulter les logs dans la console du navigateur
4. Consulter les logs Supabase Dashboard

---

**Dernière mise à jour**: 2026-01-21
**Auteur**: Adam Beloucif
