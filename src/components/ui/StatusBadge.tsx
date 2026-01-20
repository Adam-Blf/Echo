import { motion } from 'framer-motion'
import { Zap, AlertTriangle, Moon } from 'lucide-react'
import type { EchoStatus } from '@/types/user'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: EchoStatus
  daysLeft?: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

const statusConfig = {
  ACTIVE: {
    icon: Zap,
    label: 'Actif',
    bgColor: 'bg-neon-green/20',
    borderColor: 'border-neon-green/50',
    textColor: 'text-neon-green',
    dotColor: 'bg-neon-green',
  },
  EXPIRING: {
    icon: AlertTriangle,
    label: 'Expire bientôt',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/50',
    textColor: 'text-yellow-500',
    dotColor: 'bg-yellow-500',
  },
  SILENCE: {
    icon: Moon,
    label: 'En silence',
    bgColor: 'bg-white/10',
    borderColor: 'border-white/20',
    textColor: 'text-white/50',
    dotColor: 'bg-white/50',
  },
}

const sizeConfig = {
  sm: {
    padding: 'px-2 py-1',
    iconSize: 'w-3 h-3',
    textSize: 'text-[10px]',
    dotSize: 'w-1.5 h-1.5',
  },
  md: {
    padding: 'px-3 py-1.5',
    iconSize: 'w-4 h-4',
    textSize: 'text-xs',
    dotSize: 'w-2 h-2',
  },
  lg: {
    padding: 'px-4 py-2',
    iconSize: 'w-5 h-5',
    textSize: 'text-sm',
    dotSize: 'w-2.5 h-2.5',
  },
}

export function StatusBadge({
  status,
  daysLeft,
  size = 'md',
  showLabel = true
}: StatusBadgeProps) {
  const config = statusConfig[status]
  const sizeStyles = sizeConfig[size]
  const Icon = config.icon

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border',
        config.bgColor,
        config.borderColor,
        sizeStyles.padding
      )}
    >
      {/* Animated dot for ACTIVE status */}
      {status === 'ACTIVE' && (
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className={cn('rounded-full', config.dotColor, sizeStyles.dotSize)}
        />
      )}

      {/* Icon for other statuses */}
      {status !== 'ACTIVE' && (
        <Icon className={cn(config.textColor, sizeStyles.iconSize)} />
      )}

      {/* Label */}
      {showLabel && (
        <span className={cn('font-medium', config.textColor, sizeStyles.textSize)}>
          {status === 'EXPIRING' && daysLeft !== undefined
            ? `${daysLeft}j restant${daysLeft > 1 ? 's' : ''}`
            : config.label}
        </span>
      )}
    </div>
  )
}
