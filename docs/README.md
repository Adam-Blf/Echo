# Echo Documentation

<div align="center">

![Echo Logo](https://img.shields.io/badge/ECHO-Dating%20Authentique-bf00ff?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.2.0-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/status-production%20ready-brightgreen?style=for-the-badge)

**Authentic Dating with Friend Validation**

</div>

---

## Overview

Echo is a modern dating Progressive Web App (PWA) that revolutionizes online dating with three core principles:

1. **Real-time Photos** - Only instant photos are accepted, no old photos or filters
2. **Wingman Validation** - Your profile must be validated by a friend who vouches for your personality
3. **Ephemeral Matches** - Matches expire in 48h, encouraging genuine interactions

## Quick Start

```bash
# Clone the repository
git clone https://github.com/Adam-Blf/Echo.git
cd Echo

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| **Framework** | React | 19 |
| **Language** | TypeScript | 5.9 |
| **Build Tool** | Vite | 7.2 |
| **Styling** | Tailwind CSS | 4.1 |
| **Animation** | Framer Motion | 12 |
| **State Management** | Zustand | 5 |
| **Forms** | React Hook Form + Zod | 7 / 4 |
| **Routing** | React Router DOM | 7 |
| **Backend** | Supabase | 2.91 |
| **Icons** | Lucide React | 0.562 |
| **PWA** | Vite Plugin PWA + Workbox | 1.2 |

## Documentation Index

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System architecture, data flow, and patterns |
| [DEVELOPMENT.md](./DEVELOPMENT.md) | Development setup, conventions, and guidelines |
| [API.md](./API.md) | Supabase services, RPC functions, and types |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Build process, Vercel deployment, migrations |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Git workflow, PR process, code standards |
| [COMPONENTS.md](./COMPONENTS.md) | UI component library documentation |
| [BACKEND_SERVICES.md](./BACKEND_SERVICES.md) | Detailed backend service documentation |

## Key Features

### Authentication
- OAuth with Google and Apple Sign-In
- Email/password authentication
- Protected routes with onboarding flow

### Discovery
- Swipe-based profile discovery
- PostGIS-powered geolocation filtering
- Age and distance filters
- Verified profiles filter

### Matching
- Like, Nope, and Super Like actions
- 48h match expiration timer
- Resonance status (permanent match after meetup)
- Real-time match notifications

### Premium Features
- Unlimited swipes (free: 20/day)
- Super Likes (5/week for Premium)
- See who liked you
- Rewind swipes
- Invisible mode
- Read receipts

### Wingman System
- Unique validation tokens
- Voice recording testimonials
- Quality/flaw selection
- Public validation page

## Project Structure

```
src/
├── App.tsx              # Main app with routing
├── main.tsx             # Entry point
├── index.css            # Global styles
├── components/
│   ├── layout/          # Layout components (MainLayout, BottomNavigation)
│   └── ui/              # Reusable UI components (30+ components)
├── contexts/            # React contexts (AuthContext)
├── hooks/               # Custom hooks (useCamera, useAudioRecorder, useLocation)
├── lib/                 # Utilities (supabase, security, i18n, faceDetection)
├── pages/               # Page components (15+ pages)
├── services/            # Backend services (block, discovery, premium, chat)
├── stores/              # Zustand stores (user, swipe, filters, onboarding, settings)
└── types/               # TypeScript type definitions
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |

## Scripts

```bash
npm run dev      # Start development server (Vite)
npm run build    # Production build (TypeScript + Vite)
npm run preview  # Preview production build locally
npm run lint     # Run ESLint
```

## Security

Echo implements multiple security measures:

- **Input Validation**: Zod schemas on all forms
- **XSS Protection**: Message sanitization
- **Rate Limiting**: Client-side + Database triggers
- **File Validation**: Image type and size checks
- **Row Level Security**: Supabase RLS policies
- **Security Headers**: Vercel configuration

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- iOS Safari 14+
- Android Chrome 90+

## License

MIT License - see [LICENSE](../LICENSE) for details.

---

<div align="center">

**Built with love by Adam Beloucif**

[GitHub](https://github.com/Adam-Blf) | [Echo App](https://echo-dating.vercel.app)

</div>
