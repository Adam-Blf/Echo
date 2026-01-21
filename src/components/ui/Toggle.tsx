import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ToggleProps {
  /** Whether the toggle is checked */
  checked: boolean
  /** Callback when toggle is clicked */
  onChange: (checked: boolean) => void
  /** Label to display next to toggle */
  label?: string
  /** Position of label relative to toggle */
  labelPosition?: 'left' | 'right'
  /** Disable the toggle */
  disabled?: boolean
  /** Toggle size */
  size?: 'sm' | 'md' | 'lg'
  /** Additional CSS classes */
  className?: string
}

/**
 * Toggle Switch Component
 * An elegant on/off switch with smooth animations and neon styling
 * Complies with WCAG 2.1 accessibility standards
 */
export function Toggle({
  checked,
  onChange,
  label,
  labelPosition = 'right',
  disabled = false,
  size = 'md',
  className,
}: ToggleProps) {
  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'w-10 h-6',
      thumb: 'w-5 h-5',
      padding: 'p-0.5',
      textSize: 'text-xs',
    },
    md: {
      container: 'w-14 h-8',
      thumb: 'w-7 h-7',
      padding: 'p-0.5',
      textSize: 'text-sm',
    },
    lg: {
      container: 'w-16 h-9',
      thumb: 'w-8 h-8',
      padding: 'p-0.5',
      textSize: 'text-base',
    },
  }

  const config = sizeConfig[size]

  return (
    <div
      className={cn('flex items-center gap-3', labelPosition === 'left' && 'flex-row-reverse', className)}
    >
      {/* Toggle button */}
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label || 'Toggle switch'}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          'relative inline-flex items-center rounded-full transition-all duration-200',
          config.container,
          config.padding,
          checked
            ? 'bg-neon-cyan shadow-lg'
            : 'bg-white/10 shadow-md',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-xl',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          checked ? 'focus-visible:ring-neon-cyan' : 'focus-visible:ring-white/40'
        )}
      >
        {/* Animated thumb */}
        <motion.div
          animate={{
            x: checked ? (size === 'sm' ? 16 : size === 'md' ? 24 : 28) : 0,
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }}
          className={cn(
            'rounded-full bg-white shadow-md transition-shadow',
            config.thumb,
            checked && 'shadow-lg shadow-neon-cyan/50'
          )}
        />
      </button>

      {/* Label */}
      {label && (
        <label
          onClick={() => !disabled && onChange(!checked)}
          className={cn(
            'select-none font-medium transition-colors',
            config.textSize,
            disabled ? 'text-white/40 cursor-not-allowed' : 'text-white/80 cursor-pointer hover:text-white'
          )}
        >
          {label}
        </label>
      )}
    </div>
  )
}
