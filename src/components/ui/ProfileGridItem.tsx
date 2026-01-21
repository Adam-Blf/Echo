// ProfileGridItem - Profile card for grid display with premium blur effect
import { motion, AnimatePresence } from 'framer-motion'
import { Crown, Heart, Lock, Sparkles } from 'lucide-react'
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
  /** Blur intensity level (1-5), defaults to max when blurred */
  blurLevel?: 1 | 2 | 3 | 4 | 5
  /** Alternative text for image */
  alt?: string
  /** Callback when card is clicked */
  onClick?: () => void
  /** Show unlock animation */
  showUnlockAnimation?: boolean
  /** Additional CSS classes */
  className?: string
}

// Blur intensity map
const BLUR_LEVELS = {
  1: 'blur-sm',
  2: 'blur-md',
  3: 'blur-lg',
  4: 'blur-xl',
  5: 'blur-2xl',
} as const

/**
 * Profile Grid Item Component
 * Card for displaying user profiles in a grid with photo, name, age, and optional badges
 * Features progressive blur effect, unlock animations, and premium styling
 */
export function ProfileGridItem({
  image,
  name,
  age,
  badge,
  blurred = false,
  blurLevel = 5,
  alt,
  onClick,
  showUnlockAnimation = false,
  className,
}: ProfileGridItemProps) {
  // Badge configuration
  const badgeConfig = {
    'super-like': {
      icon: Heart,
      label: 'Super Like',
      bgColor: 'bg-gradient-to-r from-rose-500 to-pink-500',
      textColor: 'text-white',
      iconColor: 'text-white',
      glow: 'shadow-lg shadow-rose-500/40',
    },
    new: {
      icon: Sparkles,
      label: 'Nouveau',
      bgColor: 'bg-gradient-to-r from-neon-cyan to-blue-500',
      textColor: 'text-white',
      iconColor: 'text-white',
      glow: 'shadow-lg shadow-neon-cyan/40',
    },
    verified: {
      icon: Crown,
      label: 'Verifie',
      bgColor: 'bg-gradient-to-r from-neon-purple to-violet-500',
      textColor: 'text-white',
      iconColor: 'text-white',
      glow: 'shadow-lg shadow-neon-purple/40',
    },
  }

  const currentBadge = badge ? badgeConfig[badge] : null
  const BadgeIcon = currentBadge?.icon
  const blurClass = blurred ? BLUR_LEVELS[blurLevel] : ''

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={cn(
        'group relative aspect-[3/4] overflow-hidden rounded-2xl bg-surface-card cursor-pointer',
        'ring-1 ring-white/10 hover:ring-white/20 transition-all duration-300',
        className
      )}
    >
      {/* Profile image with progressive blur */}
      <motion.img
        src={image}
        alt={alt || `${name}, ${age}`}
        initial={showUnlockAnimation ? { filter: 'blur(20px)' } : false}
        animate={showUnlockAnimation ? { filter: 'blur(0px)' } : false}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className={cn(
          'h-full w-full object-cover transition-all duration-500',
          'group-hover:scale-110',
          !showUnlockAnimation && blurClass
        )}
      />

      {/* Premium blur overlay with animated elements */}
      <AnimatePresence>
        {blurred && !showUnlockAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* Glassmorphism background */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-md" />

            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/20 via-transparent to-neon-cyan/20 animate-pulse" />

            {/* Lock icon with glow */}
            <motion.div
              initial={{ scale: 0.8, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="relative flex flex-col items-center gap-3 z-10"
            >
              {/* Glow ring */}
              <div className="absolute -inset-4 bg-gradient-to-r from-neon-purple/30 to-neon-cyan/30 rounded-full blur-xl animate-pulse" />

              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-neon-purple to-neon-cyan p-[2px] shadow-xl shadow-neon-purple/40">
                <div className="w-full h-full rounded-2xl bg-surface-dark/90 flex items-center justify-center backdrop-blur-sm">
                  <Lock className="h-6 w-6 text-neon-cyan" />
                </div>
              </div>

              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xs font-bold text-white/90 uppercase tracking-widest"
              >
                Premium
              </motion.span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unlock animation sparkles */}
      <AnimatePresence>
        {showUnlockAnimation && (
          <>
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  opacity: 1,
                  scale: 0,
                  x: '50%',
                  y: '50%',
                }}
                animate={{
                  opacity: 0,
                  scale: 1.5,
                  x: `${50 + Math.cos((i * Math.PI) / 4) * 100}%`,
                  y: `${50 + Math.sin((i * Math.PI) / 4) * 100}%`,
                }}
                transition={{ duration: 0.8, delay: i * 0.05, ease: 'easeOut' }}
                className="absolute w-2 h-2 rounded-full bg-neon-cyan pointer-events-none"
              />
            ))}
            <motion.div
              initial={{ scale: 2, opacity: 0.8 }}
              animate={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 bg-gradient-to-r from-neon-cyan/50 to-neon-purple/50 pointer-events-none"
            />
          </>
        )}
      </AnimatePresence>

      {/* Gradient overlay from bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

      {/* Badge with enhanced styling */}
      {currentBadge && !blurred && (
        <div className="absolute right-2.5 top-2.5 z-20">
          <motion.div
            initial={{ scale: 0, rotate: -12 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold',
              currentBadge.bgColor,
              currentBadge.textColor,
              currentBadge.glow,
              'backdrop-blur-sm border border-white/20'
            )}
          >
            {BadgeIcon && (
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              >
                <BadgeIcon className="h-3 w-3" fill="currentColor" />
              </motion.span>
            )}
            {currentBadge.label}
          </motion.div>
        </div>
      )}

      {/* User info at bottom with enhanced typography */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-3.5">
        <motion.div
          initial={false}
          animate={blurred ? { opacity: 0.6 } : { opacity: 1 }}
          className="flex flex-col gap-0.5"
        >
          <h3 className="text-base font-bold text-white leading-tight drop-shadow-lg">
            {blurred ? '???' : name}
          </h3>
          <p className="text-sm font-medium text-white/80 drop-shadow-md">
            {age} ans
          </p>
        </motion.div>
      </div>

      {/* Hover accent line with gradient animation */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        whileHover={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink origin-left"
      />

      {/* Corner glow effect on hover */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="absolute -top-20 -right-20 w-40 h-40 bg-neon-purple/20 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="absolute -bottom-20 -left-20 w-40 h-40 bg-neon-cyan/20 rounded-full blur-3xl pointer-events-none"
      />
    </motion.div>
  )
}
