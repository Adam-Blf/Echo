# Architecture Documentation

## System Overview

Echo follows a modern frontend-first architecture with Supabase as the Backend-as-a-Service (BaaS). The application is built as a Progressive Web App (PWA) with offline capabilities.

```mermaid
graph TB
    subgraph "Frontend (React PWA)"
        A[React 19] --> B[React Router]
        A --> C[Zustand Stores]
        A --> D[React Context]
        B --> E[Pages]
        C --> F[State Management]
        D --> G[Auth Provider]
    end

    subgraph "Services Layer"
        H[blockService]
        I[discoveryService]
        J[premiumService]
        K[chatService]
    end

    subgraph "Supabase Backend"
        L[(PostgreSQL + PostGIS)]
        M[Auth]
        N[Realtime]
        O[Storage]
        P[RPC Functions]
    end

    E --> H
    E --> I
    E --> J
    E --> K

    H --> L
    I --> L
    I --> P
    J --> L
    J --> N
    K --> L
    K --> N

    G --> M
```

## Frontend Architecture

### Component Hierarchy

```mermaid
graph TD
    App[App.tsx] --> Router[BrowserRouter]
    Router --> SplashScreen
    Router --> AuthRoutes[Auth Routes]
    Router --> ProtectedRoutes[Protected Routes]

    AuthRoutes --> AuthPage
    AuthRoutes --> AuthCallback

    ProtectedRoutes --> MainLayout
    MainLayout --> BottomNavigation
    MainLayout --> HomePage
    MainLayout --> DiscoverPage
    MainLayout --> MatchesPage
    MainLayout --> ProfilePage

    ProtectedRoutes --> ChatPage
    ProtectedRoutes --> SettingsPage
    ProtectedRoutes --> EditProfilePage
    ProtectedRoutes --> LikesPage
```

### State Management

Echo uses a hybrid approach combining Zustand for global state and React Context for auth:

```mermaid
graph LR
    subgraph "Zustand Stores"
        A[userStore] --> |Profile, Premium| UI
        B[swipeStore] --> |Discovery, Matches| UI
        C[filtersStore] --> |Age, Distance| UI
        D[onboardingStore] --> |Form Data| UI
        E[settingsStore] --> |Preferences| UI
    end

    subgraph "React Context"
        F[AuthContext] --> |User, Session| UI
        G[I18nContext] --> |Translations| UI
    end

    UI[UI Components]
```

#### Store Details

| Store | Purpose | Persistence |
|-------|---------|-------------|
| `userStore` | User profile, echo status, premium state | localStorage |
| `swipeStore` | Discovery profiles, matches, limits, stats | localStorage |
| `filtersStore` | Search filters (age, distance, gender) | localStorage |
| `onboardingStore` | Onboarding form data | localStorage |
| `settingsStore` | App preferences, notifications | localStorage |

### Routing Architecture

```typescript
// Route Protection Hierarchy
/auth              // Public only (redirects if authenticated)
/auth/callback     // OAuth callback handler
/onboarding        // Requires auth, no completed profile
/                  // Protected + completed onboarding
/discover          // Protected + completed onboarding
/matches           // Protected + completed onboarding
/profile           // Protected + completed onboarding
/chat/:matchId     // Protected + completed onboarding
/settings/*        // Protected + completed onboarding
/wingman/:token    // Public (external validation link)
```

## Data Flow

### Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant A as AuthPage
    participant S as Supabase Auth
    participant C as AuthContext
    participant P as Profile DB

    U->>A: Sign In (Google/Apple/Email)
    A->>S: OAuth/Credentials
    S-->>A: Session + User
    A->>C: Update Auth State
    C->>P: Fetch Profile
    P-->>C: Profile Data
    C-->>U: Redirect to Home/Onboarding
```

### Discovery Flow

```mermaid
sequenceDiagram
    participant U as User
    participant D as DiscoverPage
    participant SS as swipeStore
    participant DS as discoveryService
    participant DB as Supabase

    U->>D: Open Discover
    D->>SS: fetchDiscoveryProfiles()
    SS->>DS: getDiscoveryProfiles(filters)
    DS->>DB: RPC get_discovery_profiles_advanced
    DB-->>DS: Profiles with distance
    DS-->>SS: Transform profiles
    SS-->>D: Update UI
    D-->>U: Show SwipeCards
```

### Swipe & Match Flow

```mermaid
sequenceDiagram
    participant U as User
    participant SC as SwipeCard
    participant SS as swipeStore
    participant DB as Supabase

    U->>SC: Swipe Right (Like)
    SC->>SS: swipe('like')
    SS->>SS: Check limits
    SS->>SS: Add to history
    SS->>SS: Update stats

    alt Is Match (30% chance)
        SS->>SS: Create match
        SS->>SC: Show MatchPopup
        SC-->>U: Match Animation
    end

    SS-->>SC: Next profile
```

## Database Schema

### Entity Relationship Diagram

```mermaid
erDiagram
    PROFILES ||--o{ SWIPES : creates
    PROFILES ||--o{ MATCHES : participates
    PROFILES ||--o{ MESSAGES : sends
    PROFILES ||--o{ BLOCKS : creates
    PROFILES ||--o{ REPORTS : creates
    PROFILES ||--|| SUBSCRIPTIONS : has
    PROFILES ||--|| USER_PREMIUM_STATE : has
    MATCHES ||--o{ MESSAGES : contains
    SUBSCRIPTIONS ||--o{ SUBSCRIPTION_EVENTS : logs

    PROFILES {
        uuid id PK
        string email
        string first_name
        int age
        string bio
        array interests
        string photo_url
        timestamp last_photo_at
        enum echo_status
        boolean is_validated
        geography location
        jsonb search_preferences
    }

    SWIPES {
        uuid id PK
        uuid swiper_id FK
        uuid swiped_id FK
        enum action
        timestamp created_at
    }

    MATCHES {
        uuid id PK
        uuid user1_id FK
        uuid user2_id FK
        enum status
        timestamp expires_at
        boolean is_super_like
    }

    SUBSCRIPTIONS {
        uuid id PK
        uuid user_id FK
        enum plan
        enum status
        string stripe_customer_id
        timestamp current_period_end
    }
```

### Key Tables

| Table | Description |
|-------|-------------|
| `profiles` | User profiles with location (PostGIS) |
| `swipes` | Swipe actions (like, nope, superlike) |
| `matches` | Mutual likes with expiration |
| `messages` | Chat messages |
| `blocks` | User blocks |
| `reports` | Content reports |
| `subscriptions` | Premium subscriptions |
| `premium_features` | Feature limits by plan |
| `user_premium_state` | Cached premium state |

## Design Patterns

### 1. Service Layer Pattern

All backend interactions go through typed service modules:

```typescript
// services/blockService.ts
export const blockUser = async (userId: string): Promise<BlockServiceResult> => {
  // Rate limit check
  // Auth check
  // Database operation
  // Error handling
}
```

### 2. Store Pattern (Zustand)

Centralized state with persistence:

```typescript
// stores/userStore.ts
export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      profile: null,
      setProfile: (profile) => set({ profile }),
      // Actions with computed updates
    }),
    { name: 'echo-user-storage' }
  )
)
```

### 3. Protected Route Pattern

Route guards for authentication and onboarding:

```typescript
function PrivateRoute({ children }) {
  const { isAuthenticated, hasCompletedOnboarding } = useAuth()

  if (!isAuthenticated) return <Navigate to="/auth" />
  if (!hasCompletedOnboarding) return <Navigate to="/onboarding" />

  return children
}
```

### 4. Optimistic Updates

UI updates before server confirmation:

```typescript
const swipe = (action) => {
  // Immediately update UI
  set(state => ({ currentIndex: state.currentIndex + 1 }))

  // Then sync to server (async)
  syncSwipeToServer(action)
}
```

### 5. Rate Limiting Pattern

Client + server-side rate limiting:

```typescript
// Client-side (UX)
if (!checkRateLimit('block-user', 20, 60 * 60 * 1000)) {
  return { error: 'Rate limit reached' }
}

// Server-side (Security) - via database triggers
```

## Security Architecture

### Authentication

```mermaid
graph LR
    A[User] --> B[OAuth Provider]
    B --> C[Supabase Auth]
    C --> D[JWT Token]
    D --> E[API Requests]
    E --> F[RLS Policies]
```

### Row Level Security (RLS)

All tables have RLS policies:

```sql
-- Users can only see unblocked profiles
CREATE POLICY "Users can view unblocked profiles" ON profiles
  FOR SELECT USING (
    NOT EXISTS (
      SELECT 1 FROM blocks
      WHERE blocker_id = auth.uid() AND blocked_id = profiles.id
    )
  );
```

### Input Validation

```mermaid
graph LR
    A[User Input] --> B[Zod Schema]
    B --> C{Valid?}
    C -->|Yes| D[Process]
    C -->|No| E[Error Message]
```

## Performance Optimizations

### 1. Code Splitting

```typescript
// Lazy load pages
const HomePage = lazy(() => import('@/pages/Home'))
const DiscoverPage = lazy(() => import('@/pages/Discover'))
```

### 2. Chunk Optimization

```typescript
// vite.config.ts
manualChunks: {
  'vendor-react': ['react', 'react-dom', 'react-router-dom'],
  'vendor-motion': ['framer-motion'],
  'vendor-supabase': ['@supabase/supabase-js'],
}
```

### 3. State Persistence

```typescript
// Persist essential state to localStorage
partialize: (state) => ({
  profile: state.profile,
  isPremium: state.isPremium,
})
```

### 4. PostGIS for Geospatial Queries

```sql
-- Spatial index for fast distance queries
CREATE INDEX profiles_location_idx ON profiles
  USING GIST (location);
```

## PWA Architecture

```mermaid
graph TB
    A[Browser] --> B[Service Worker]
    B --> C{Cache}
    B --> D[Network]
    C --> E[Static Assets]
    C --> F[Fonts]
    D --> G[API Calls]
```

### Caching Strategy

| Resource | Strategy | TTL |
|----------|----------|-----|
| Static assets | Cache First | 1 year |
| Fonts | Cache First | 1 year |
| API calls | Network First | - |
| Service Worker | No Cache | - |

## Technology Decisions

| Decision | Rationale |
|----------|-----------|
| **React 19** | Latest features, concurrent rendering |
| **Zustand** | Simple, performant, TypeScript-first |
| **Supabase** | Auth + DB + Realtime in one, PostgreSQL power |
| **PostGIS** | Native geospatial queries, efficient indexing |
| **Vite** | Fast HMR, modern build tooling |
| **Framer Motion** | Declarative animations, gesture support |

---

*See [ARCHITECTURE_DECISIONS.md](./ARCHITECTURE_DECISIONS.md) for detailed ADRs.*
