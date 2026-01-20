import { Outlet } from 'react-router-dom'
import { BottomNavigation } from './BottomNavigation'

interface MainLayoutProps {
  showNav?: boolean
}

export function MainLayout({ showNav = true }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-surface-dark flex flex-col">
      {/* Main Content */}
      <main className="flex-1 pb-20 safe-top">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      {showNav && <BottomNavigation />}
    </div>
  )
}
