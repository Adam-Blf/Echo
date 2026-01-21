import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Crown, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProfileGridItemProps {
  /** Image URL for profile photo */
  image: string
  /** User name */
  name: string
  /** User age */
  age: number
  /** Badge type to display */
  badge?: 'super-like' | 'new' | 'verified'
  /** Whether profile is blurred (premium feature) */
  blurred?: boolean
  /** Alternative text for image */
  alt?: string
  /** Callback when card is clicked */
  onClick?: () => void
  /** Additional CSS classes */
  className?: string
}

/**
 * Profile Grid Item Component
 * Card for displaying user profiles in a grid with photo, name, age, and optional badges
 * Features overlay gradient, animations, and premium blur effect
 */
export function ProfileGridItem({
  image,
  name,
  age,
  badge,
  blurred = false,
  alt,
  onClick,
  className,
}: ProfileGridItemProps) {
  // Badge configuration
  const badgeConfig = {
    'super-like': {
      icon: Heart,
      label: 'Super Like',
      bgColor: 'bg-red-500/90',
      textColor: 'text-white',
      iconColor: 'text-white',
    },
    new: {
      icon: Heart,
      label: 'Nouveau',
      bgColor: 'bg-neon-cyan/90',
      textColor: 'text-white',
      iconColor: 'text-white',
    },
    verified: {
      icon: Crown,
      label: 'Vérifié',
      bgColor: 'bg-neon-purple/90',
      textColor: 'text-white',
      iconColor: 'text-white',
    },
  }

  const currentBadge = badge ? badgeConfig[badge] : null
  const BadgeIcon = currentBadge?.icon

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        'group relative aspect-[3/4] overflow-hidden rounded-2xl bg-white/10 cursor-pointer',
        className
      )}
    >
      {/* Profile image */}
      <img
        src={image}
        alt={alt || `${name}, ${age}`}
        className={cn(
          'h-full w-full object-cover transition-transform duration-300 group-hover:scale-110',
          blurred && 'blur-xl'
        )}
      />

      {/* Premium blur overlay */}
      {blurred && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-md">
          <div className="flex flex-col items-center gap-2">
            <Crown className="h-8 w-8 text-neon-purple" />
            <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">
              Premium
            </span>
          </div>
        </div>
      )}

      {/* Gradient overlay from bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

      {/* Badge */}
      {currentBadge && (
        <div className="absolute right-3 top-3 z-20">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
              currentBadge.bgColor,
              currentBadge.textColor,
              'backdrop-blur-sm border border-white/20'
            )}
          >
            {BadgeIcon && <BadgeIcon className="h-3 w-3" />}
            {currentBadge.label}
          </motion.div>
        </div>
      )}

      {/* User info at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-bold text-white leading-tight">
            {name}
          </h3>
          <p className="text-sm font-medium text-white/80">
            {age} ans
          </p>
        </div>
      </div>

      {/* Hover accent line */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.3 }}
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink origin-left"
        style={{ transformOrigin: 'left center' }}
      />

      {/* Glow effect on hover */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        className="absolute inset-0 bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 pointer-events-none"
      />
    </motion.div>
  )
}
