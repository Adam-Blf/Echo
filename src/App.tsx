import { lazy, Suspense, useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MainLayout } from '@/components/layout'
import { SplashScreen } from '@/components/ui'

// Lazy load pages for code splitting
const HomePage = lazy(() => import('@/pages/Home').then(m => ({ default: m.HomePage })))
const DiscoverPage = lazy(() => import('@/pages/Discover').then(m => ({ default: m.DiscoverPage })))
const MatchesPage = lazy(() => import('@/pages/Matches').then(m => ({ default: m.MatchesPage })))
const ProfilePage = lazy(() => import('@/pages/Profile').then(m => ({ default: m.ProfilePage })))
const OnboardingPage = lazy(() => import('@/pages/Onboarding').then(m => ({ default: m.OnboardingPage })))
const WingmanPage = lazy(() => import('@/pages/Wingman').then(m => ({ default: m.WingmanPage })))
const ChatPage = lazy(() => import('@/pages/Chat').then(m => ({ default: m.ChatPage })))

// Loading skeleton for lazy loaded pages
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Chargement...</p>
      </div>
    </div>
  )
}

function App() {
  const [showSplash, setShowSplash] = useState(() => {
    // Only show splash on first visit per session
    const hasShownSplash = sessionStorage.getItem('echo-splash-shown')
    return !hasShownSplash
  })

  useEffect(() => {
    if (!showSplash) {
      sessionStorage.setItem('echo-splash-shown', 'true')
    }
  }, [showSplash])

  const handleSplashComplete = () => {
    sessionStorage.setItem('echo-splash-shown', 'true')
    setShowSplash(false)
  }

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Main app routes with bottom navigation */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/discover" element={<DiscoverPage />} />
              <Route path="/matches" element={<MatchesPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* Routes without navigation */}
            <Route path="/onboarding" element={<OnboardingPage />} />

            {/* Chat page */}
            <Route path="/chat/:matchId" element={<ChatPage />} />

            {/* Wingman validation page (public) */}
            <Route path="/wingman/:token" element={<WingmanPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </>
  )
}

export default App
