import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MainLayout } from '@/components/layout'
import { HomePage, DiscoverPage, MatchesPage, ProfilePage, OnboardingPage, WingmanPage, ChatPage } from '@/pages'

function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  )
}

export default App
