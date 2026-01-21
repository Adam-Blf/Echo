import { lazy, Suspense, useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { MainLayout } from '@/components/layout'
import { SplashScreen } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'

// Lazy load pages for code splitting
const HomePage = lazy(() => import('@/pages/Home').then(m => ({ default: m.HomePage })))
const DiscoverPage = lazy(() => import('@/pages/Discover').then(m => ({ default: m.DiscoverPage })))
const MatchesPage = lazy(() => import('@/pages/Matches').then(m => ({ default: m.MatchesPage })))
const ProfilePage = lazy(() => import('@/pages/Profile').then(m => ({ default: m.ProfilePage })))
const OnboardingPage = lazy(() => import('@/pages/Onboarding').then(m => ({ default: m.OnboardingPage })))
const WingmanPage = lazy(() => import('@/pages/Wingman').then(m => ({ default: m.WingmanPage })))
const ChatPage = lazy(() => import('@/pages/Chat').then(m => ({ default: m.ChatPage })))
const EditProfilePage = lazy(() => import('@/pages/EditProfile').then(m => ({ default: m.EditProfilePage })))
const AuthPage = lazy(() => import('@/pages/Auth').then(m => ({ default: m.AuthPage })))
const AuthCallbackPage = lazy(() => import('@/pages/AuthCallback').then(m => ({ default: m.AuthCallbackPage })))
const SettingsPage = lazy(() => import('@/pages/Settings').then(m => ({ default: m.SettingsPage })))
const AccountSettingsPage = lazy(() => import('@/pages/settingsPages/AccountSettings').then(m => ({ default: m.AccountSettingsPage })))
const NotificationSettingsPage = lazy(() => import('@/pages/settingsPages/NotificationSettings').then(m => ({ default: m.NotificationSettingsPage })))
const PrivacySettingsPage = lazy(() => import('@/pages/settingsPages/PrivacySettings').then(m => ({ default: m.PrivacySettingsPage })))
const LikesPage = lazy(() => import('@/pages/Likes').then(m => ({ default: m.LikesPage })))
const ComponentShowcase = lazy(() => import('@/pages/ComponentShowcase').then(m => ({ default: m.ComponentShowcase })))

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

// Protected route component
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, hasCompletedOnboarding } = useAuth()
  const location = useLocation()

  // Show loader while checking auth state
  if (loading) {
    return <PageLoader />
  }

  // Not authenticated → redirect to auth page
  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  // Authenticated but hasn't completed onboarding → redirect to onboarding
  if (!hasCompletedOnboarding && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }

  return <>{children}</>
}

// Public route that redirects to home if already authenticated
function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, hasCompletedOnboarding } = useAuth()

  if (loading) {
    return <PageLoader />
  }

  if (isAuthenticated) {
    if (hasCompletedOnboarding) {
      return <Navigate to="/" replace />
    } else {
      return <Navigate to="/onboarding" replace />
    }
  }

  return <>{children}</>
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
            {/* Auth routes (public only) */}
            <Route
              path="/auth"
              element={
                <PublicOnlyRoute>
                  <AuthPage />
                </PublicOnlyRoute>
              }
            />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />

            {/* Onboarding (requires auth but not completed profile) */}
            <Route
              path="/onboarding"
              element={
                <PrivateRoute>
                  <OnboardingPage />
                </PrivateRoute>
              }
            />

            {/* Main app routes with bottom navigation (protected) */}
            <Route element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }>
              <Route path="/" element={<HomePage />} />
              <Route path="/discover" element={<DiscoverPage />} />
              <Route path="/matches" element={<MatchesPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* Chat page (protected) */}
            <Route
              path="/chat/:matchId"
              element={
                <PrivateRoute>
                  <ChatPage />
                </PrivateRoute>
              }
            />

            {/* Edit Profile page (protected) */}
            <Route
              path="/profile/edit"
              element={
                <PrivateRoute>
                  <EditProfilePage />
                </PrivateRoute>
              }
            />

            {/* Settings pages (protected) */}
            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <SettingsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/settings/account"
              element={
                <PrivateRoute>
                  <AccountSettingsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/settings/notifications"
              element={
                <PrivateRoute>
                  <NotificationSettingsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/settings/privacy"
              element={
                <PrivateRoute>
                  <PrivacySettingsPage />
                </PrivateRoute>
              }
            />

            {/* Likes page (protected) */}
            <Route
              path="/likes"
              element={
                <PrivateRoute>
                  <LikesPage />
                </PrivateRoute>
              }
            />

            {/* Wingman validation page (public - external link) */}
            <Route path="/wingman/:token" element={<WingmanPage />} />

            {/* Component Showcase (dev/design) */}
            <Route
              path="/components/showcase"
              element={
                <PrivateRoute>
                  <ComponentShowcase />
                </PrivateRoute>
              }
            />

            {/* Catch-all redirect to auth */}
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </>
  )
}

export default App
