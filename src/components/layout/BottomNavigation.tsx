import { NavLink, useLocation } from 'react-router-dom'
import { Home, Search, MessageCircle, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface NavItem {
  path: string
  label: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { path: '/', label: 'Accueil', icon: Home },
  { path: '/discover', label: 'Explorer', icon: Search },
  { path: '/matches', label: 'Matchs', icon: MessageCircle },
  { path: '/profile', label: 'Profil', icon: User },
]

export function BottomNavigation() {
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      {/* Glass background */}
      <div className="absolute inset-0 bg-surface-dark/80 backdrop-blur-xl border-t border-white/10" />

      {/* Navigation items */}
      <div className="relative flex items-center justify-around h-16 safe-bottom px-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center justify-center w-16 h-full"
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}

              {/* Icon */}
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1,
                  y: isActive ? -2 : 0,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <Icon
                  className={cn(
                    'w-6 h-6 transition-colors duration-200',
                    isActive ? 'text-neon-cyan' : 'text-white/50'
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </motion.div>

              {/* Label */}
              <span
                className={cn(
                  'text-[10px] mt-1 font-medium transition-colors duration-200',
                  isActive ? 'text-white' : 'text-white/40'
                )}
              >
                {item.label}
              </span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
