import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Crown, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PremiumBannerProps {
  /** Main heading text */
  heading: string
  /** Descriptive text */
  description?: string
  /** CTA button text */
  ctaText?: string
  /** Callback when CTA button is clicked */
  onCTA?: () => void
  /** Callback when close button is clicked */
  onClose?: () => void
  /** Show close button */
  closeable?: boolean
  /** Custom icon instead of crown */
  icon?: ReactNode
  /** Banner style variant */
  variant?: 'default' | 'exclusive' | 'limited'
  /** Additional CSS classes */
  className?: string
}

/**
 * Premium Banner Component
 * Eye-catching promotional banner with animated gradient and CTA
 * Features shimmer effect and neon styling for premium offers
 */
export function PremiumBanner({
  heading,
  description,
  ctaText = 'Découvrir',
  onCTA,
  onClose,
  closeable = true,
  icon,
  variant = 'default',
  className,
}: PremiumBannerProps) {
  // Variant configurations
  const variantConfig = {
    default: {
      gradient: 'from-neon-cyan to-neon-purple',
      overlay: 'from-neon-cyan/40 to-neon-purple/40',
      accent: 'bg-neon-cyan',
    },
    exclusive: {
      gradient: 'from-neon-purple via-neon-pink to-neon-purple',
      overlay: 'from-neon-purple/40 via-neon-pink/40 to-neon-purple/40',
      accent: 'bg-neon-purple',
    },
    limited: {
      gradient: 'from-yellow-400 via-yellow-300 to-yellow-400',
      overlay: 'from-yellow-400/40 via-yellow-300/40 to-yellow-400/40',
      accent: 'bg-yellow-400',
    },
  }

  const config = variantConfig[variant]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        'relative overflow-hidden rounded-2xl p-6 md:p-8',
        className
      )}
    >
      {/* Animated gradient background */}
      <div className={cn(
        'absolute inset-0 bg-gradient-to-r',
        config.gradient
      )} />

      {/* Shimmer effect */}
      <motion.div
        animate={{
          backgroundPosition: ['200% center', '-200% center'],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        style={{
          backgroundSize: '200% center',
        }}
      />

      {/* Overlay with opacity */}
      <div className={cn(
        'absolute inset-0 bg-gradient-to-r',
        config.overlay
      )} />

      {/* Content */}
      <div className="relative z-10 flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 mt-1">
          {icon ? (
            <div className="h-8 w-8 text-white">
              {icon}
            </div>
          ) : (
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Crown className="h-8 w-8 text-white drop-shadow-lg" />
            </motion.div>
          )}
        </div>

        {/* Text content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg md:text-xl font-bold text-white mb-1 leading-tight">
            {heading}
          </h3>
          {description && (
            <p className="text-sm md:text-base text-white/90 mb-4 leading-relaxed">
              {description}
            </p>
          )}

          {/* CTA Button */}
          {ctaText && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCTA}
              className={cn(
                'inline-flex items-center justify-center',
                'px-6 py-2.5 rounded-lg',
                'bg-white text-black font-semibold text-sm',
                'hover:shadow-lg transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50'
              )}
            >
              {ctaText}
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="ml-2"
              >
                →
              </motion.div>
            </motion.button>
          )}
        </div>

        {/* Close button */}
        {closeable && onClose && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className={cn(
              'flex-shrink-0',
              'h-8 w-8 rounded-full',
              'bg-white/20 hover:bg-white/30',
              'flex items-center justify-center',
              'transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50'
            )}
            aria-label="Fermer la bannière"
          >
            <X className="h-4 w-4 text-white" />
          </motion.button>
        )}
      </div>

      {/* Accent dot decoration */}
      <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -top-8 -left-8 h-24 w-24 rounded-full bg-white/5 blur-2xl" />
    </motion.div>
  )
}
