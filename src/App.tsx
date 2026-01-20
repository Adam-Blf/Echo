import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MainLayout } from '@/components/layout'
import { HomePage, DiscoverPage, MatchesPage, ProfilePage } from '@/pages'

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

        {/* Routes without navigation (will be added later) */}
        {/* <Route path="/onboarding" element={<OnboardingPage />} /> */}
        {/* <Route path="/wingman/:token" element={<WingmanPage />} /> */}
      </Routes>
    </BrowserRouter>
  )
}

export default App
