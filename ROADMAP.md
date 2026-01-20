# ECHO - Roadmap Complète (150 Étapes)

> PWA Dating App avec validation Wingman

---

## 📊 Progression Globale

| Phase | Étapes | Status |
|-------|--------|--------|
| I. Infrastructure & Core | 001-020 | ✅ Complété |
| II. Onboarding & Caméra | 021-040 | ✅ Complété |
| III. Système Swipe | 041-060 | ✅ Complété |
| IV. Système Wingman | 061-090 | ✅ Complété |
| V. Echo TTL (Profil Vivant) | 091-110 | 🔲 À faire |
| VI. Match & Résonance | 111-140 | 🔲 À faire |
| VII. Finalisation | 141-150 | 🔲 À faire |

---

## ✅ PHASE I - Infrastructure & Core (001-020)

- [x] **001** - Init Vite + React + TypeScript
- [x] **002** - Cleanup fichiers par défaut
- [x] **003** - Git init + premier push GitHub
- [x] **004** - Install Tailwind CSS v4
- [x] **005** - Config fonts (Inter)
- [x] **006** - Install lucide-react icons
- [x] **007** - Install react-router-dom
- [x] **008** - Install Zustand state management
- [x] **009** - Install Framer Motion animations
- [x] **010** - Install vite-plugin-pwa
- [x] **011** - Config manifest.json (ECHO branding)
- [x] **012** - Setup Service Worker
- [x] **013** - Config PostCSS
- [x] **014** - Setup path aliases (@/)
- [x] **015** - Create MainLayout (mobile-first)
- [x] **016** - Create BottomNavigation
- [x] **017** - Setup dark theme CSS variables
- [x] **018** - Create utility helpers (cn, dates)
- [x] **019** - Create pages structure
- [x] **020** - Update README

---

## ✅ PHASE II - Onboarding & Caméra (021-040)

- [x] **021** - Create /onboarding route
- [x] **022** - Install Zod + React Hook Form
- [x] **023** - Create Zod schemas (name, age, bio)
- [x] **024** - Create useOnboardingStore (Zustand)
- [x] **025** - Create useCamera hook
- [x] **026** - Handle camera permissions
- [x] **027** - Build CameraView component
- [x] **028** - Implement photo capture (Canvas)
- [x] **029** - Add camera switch (front/back)
- [x] **030** - Create photo review UI
- [x] **031** - Add retry/confirm buttons
- [x] **032** - Create flash animation
- [x] **033** - Add form fields (name, age)
- [x] **034** - Add bio textarea
- [x] **035** - Create interests selection
- [x] **036** - Generate Wingman code (UUID)
- [x] **037** - Implement Web Share API
- [x] **038** - Create 5-step onboarding flow
- [x] **039** - Add loading states
- [x] **040** - Add error handling

---

## ✅ PHASE III - Système Swipe (041-060)

- [x] **041** - Create swipe types
- [x] **042** - Create useSwipeStore (Zustand)
- [x] **043** - Build SwipeCard component
- [x] **044** - Implement drag gestures (Framer Motion)
- [x] **045** - Add swipe direction detection
- [x] **046** - Create LIKE indicator (right)
- [x] **047** - Create NOPE indicator (left)
- [x] **048** - Create SUPER LIKE indicator (up)
- [x] **049** - Build SwipeActions buttons
- [x] **050** - Implement daily swipe limit (20/jour)
- [x] **051** - Implement Super Like limit (0 gratuit, 5/semaine Premium)
- [x] **052** - Create MatchPopup component
- [x] **053** - Add confetti hearts animation
- [x] **054** - Create LimitReachedModal
- [x] **055** - Build Premium upsell UI
- [x] **056** - Add rewind feature (Premium)
- [x] **057** - Track swipe statistics
- [x] **058** - Create card stack UI
- [x] **059** - Add empty state
- [x] **060** - Persist swipe history

---

## ✅ PHASE IV - Système Wingman (061-090)

- [x] **061** - Create Wingman types
- [x] **062** - Define qualities list
- [x] **063** - Define flaws list (fun)
- [x] **064** - Create /wingman/:token route
- [x] **065** - Build intro step
- [x] **066** - Build qualities selection step
- [x] **067** - Build flaws selection step
- [x] **068** - Create useAudioRecorder hook
- [x] **069** - Build AudioVisualizer (Canvas)
- [x] **070** - Build VoiceRecorder component
- [x] **071** - Add recording controls
- [x] **072** - Add playback preview
- [x] **073** - Build testimonial step
- [x] **074** - Build relationship step
- [x] **075** - Add form validation
- [x] **076** - Create success animation
- [x] **077** - Handle expired links
- [x] **078** - Add loading states
- [x] **079** - Update README
- [x] **080-090** - Tests et polish

---

## 🔲 PHASE V - Echo TTL / Profil Vivant (091-110)

> Le profil "meurt" si pas de nouvelle photo depuis 7 jours

- [ ] **091** - Add `lastPhotoAt` field to user schema
- [ ] **092** - Create `isActive` computed property
- [ ] **093** - Build StatusBadge component (Actif/Silence)
- [ ] **094** - Add grayscale filter for inactive profiles
- [ ] **095** - Create "Expire dans X jours" banner
- [ ] **096** - Build refresh photo flow
- [ ] **097** - Add push notification reminder (24h before)
- [ ] **098** - Filter inactive users from discovery
- [ ] **099** - Create "Réactiver mon Echo" CTA
- [ ] **100** - Add fade out animation for expiring profiles
- [ ] **101** - Update profile page with TTL info
- [ ] **102** - Add countdown timer component
- [ ] **103** - Create echo history (past photos)
- [ ] **104** - Add photo timestamp display
- [ ] **105** - Implement auto-silence after 7 days
- [ ] **106** - Add reactivation success animation
- [ ] **107** - Create TTL settings in profile
- [ ] **108** - Add notification preferences
- [ ] **109** - Test TTL logic
- [ ] **110** - Update README

---

## 🔲 PHASE VI - Match & Résonance (111-140)

> Matchs expirent en 48h, Résonance = permanent après check-in

### A. Système de Match (111-120)

- [ ] **111** - Create matches table schema
- [ ] **112** - Add `expiresAt` (48h after match)
- [ ] **113** - Build match timer UI (waveform)
- [ ] **114** - Add color gradient (green → red)
- [ ] **115** - Create match expiration logic
- [ ] **116** - Build expired match state
- [ ] **117** - Add "Temps restant" display
- [ ] **118** - Create match list page
- [ ] **119** - Add match sorting (by time left)
- [ ] **120** - Build match card component

### B. Chat Temps Réel (121-130)

- [ ] **121** - Setup Supabase Realtime
- [ ] **122** - Create messages table
- [ ] **123** - Build chat UI
- [ ] **124** - Add message input
- [ ] **125** - Implement real-time sync
- [ ] **126** - Add typing indicator
- [ ] **127** - Add read receipts
- [ ] **128** - Create message bubbles
- [ ] **129** - Add image sharing (from camera)
- [ ] **130** - Add push notifications for messages

### C. Résonance & Appels Vidéo (131-140)

- [ ] **131** - Create useDistance hook (Haversine)
- [ ] **132** - Add location check (<200m)
- [ ] **133** - Build "Check-in" UI button
- [ ] **134** - Create Résonance status (permanent match)
- [ ] **135** - Add infinity icon animation
- [ ] **136** - Setup WebRTC peer connection
- [ ] **137** - Build video call UI overlay
- [ ] **138** - Add call duration tracker
- [ ] **139** - Create post-call summary
- [ ] **140** - Add call history

---

## 🔲 PHASE VII - Finalisation (141-150)

- [ ] **141** - Create splash screen (Lottie)
- [ ] **142** - Build onboarding tutorial carousel
- [ ] **143** - Create settings page complete
- [ ] **144** - Add language switcher (FR/EN)
- [ ] **145** - Optimize images (WebP, lazy loading)
- [ ] **146** - Run Lighthouse audit
- [ ] **147** - Fix audit findings
- [ ] **148** - Production build config
- [ ] **149** - Deploy to Vercel
- [ ] **150** - Tag release v1.0.0

---

## 📋 Limites Actuelles

| Feature | Gratuit | Premium |
|---------|---------|---------|
| Swipes/jour | 20 | Illimité |
| Super Likes | 0 | 5/semaine |
| Rewind | ❌ | ✅ |
| Voir qui t'a liké | ❌ | ✅ |
| Boosts | ❌ | ✅ |

---

## 🛠️ Stack Technique

| Catégorie | Technologie |
|-----------|-------------|
| Frontend | React 19 + TypeScript |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| State | Zustand |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| PWA | Vite Plugin PWA |
| Backend | Supabase (à venir) |
| Realtime | Supabase Realtime |
| Video | WebRTC |
| Deploy | Vercel |

---

## 📅 Estimation

| Phase | Étapes | Status |
|-------|--------|--------|
| Phase I-IV | 90/150 | ✅ 60% |
| Phase V | 20 | 🔲 À faire |
| Phase VI | 30 | 🔲 À faire |
| Phase VII | 10 | 🔲 À faire |

---

*Dernière mise à jour : 2026-01-20*
