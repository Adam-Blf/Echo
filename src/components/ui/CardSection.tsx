import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CardSectionProps {
  /** Card title */
  title?: string
  /** Icon component to display next to title */
  icon?: LucideIcon
  /** Child content */
  children: ReactNode
  /** Card style variant */
  variant?: 'default' | 'elevated' | 'danger' | 'premium'
  /** Callback when card is clicked */
  onClick?: () => void
  /** Make card interactive/hoverable */
  interactive?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * Card Section Component
 * Reusable card container with title, icon, and variant styling
 * Features hover effects, neon styling, and glassmorphism
 */
export function CardSection({
  title,
  icon: Icon,
  children,
  variant = 'default',
  onClick,
  interactive = false,
  className,
}: CardSectionProps) {
  // Variant configurations
  const variantConfig = {
    default: {
      bg: 'bg-surface-card',
      border: 'border-white/5',
      glow: '',
      hover: 'hover:border-white/10 hover:shadow-lg',
    },
    elevated: {
      bg: 'bg-surface-elevated',
      border: 'border-white/10',
      glow: 'shadow-xl shadow-neon-cyan/10',
      hover: 'hover:shadow-2xl hover:shadow-neon-cyan/20 hover:border-neon-cyan/30',
    },
    danger: {
      bg: 'bg-red-950/30',
      border: 'border-red-500/30',
      glow: 'shadow-lg shadow-red-500/10',
      hover: 'hover:shadow-xl hover:shadow-red-500/30 hover:border-red-500/50',
    },
    premium: {
      bg: 'bg-gradient-to-br from-neon-purple/10 to-neon-cyan/10',
      border: 'border-neon-purple/30',
      glow: 'shadow-xl shadow-neon-purple/20',
      hover: 'hover:shadow-2xl hover:shadow-neon-purple/40 hover:border-neon-purple/60',
    },
  }

  const config = variantConfig[variant]

  return (
    <motion.div
      whileHover={interactive ? { scale: 1.02 } : undefined}
      whileTap={interactive ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={cn(
        'relative rounded-xl border p-6 transition-all duration-300',
        config.bg,
        config.border,
        config.glow,
        interactive && cn(config.hover, 'cursor-pointer'),
        className
      )}
    >
      {/* Background gradient overlay for premium variant */}
      {variant === 'premium' && (
        <div className="absolute inset-0 overflow-hidden rounded-xl">
          <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-neon-purple/5 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-neon-cyan/5 blur-3xl" />
        </div>
      )}

      {/* Header section */}
      {title && (
        <div className="relative mb-4 flex items-center gap-3">
          {Icon && (
            <div className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg',
              variant === 'danger'
                ? 'bg-red-500/20'
                : variant === 'premium'
                  ? 'bg-neon-purple/20'
                  : 'bg-neon-cyan/20'
            )}>
              <Icon className={cn(
                'h-5 w-5',
                variant === 'danger'
                  ? 'text-red-400'
                  : variant === 'premium'
                    ? 'text-neon-purple'
                    : 'text-neon-cyan'
              )} />
            </div>
          )}
          <h3 className={cn(
            'text-lg font-semibold',
            variant === 'danger'
              ? 'text-red-300'
              : variant === 'premium'
                ? 'text-white'
                : 'text-white'
          )}>
            {title}
          </h3>
        </div>
      )}

      {/* Content section */}
      <div className="relative text-white/80">
        {children}
      </div>

      {/* Accent line for danger variant */}
      {variant === 'danger' && (
        <div className="absolute bottom-0 left-0 h-0.5 w-1/3 bg-gradient-to-r from-red-500/50 to-transparent rounded-full" />
      )}

      {/* Accent line for premium variant */}
      {variant === 'premium' && (
        <div className="absolute bottom-0 left-0 h-1 w-1/3 bg-gradient-to-r from-neon-purple via-neon-cyan to-transparent rounded-full blur-sm opacity-60" />
      )}
    </motion.div>
  )
}
