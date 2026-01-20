import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CountdownTimerProps {
  expiresAt: Date
  onExpire?: () => void
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  className?: string
}

export function CountdownTimer({
  expiresAt,
  onExpire,
  size = 'md',
  showIcon = true,
  className
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())

  function calculateTimeLeft() {
    const now = new Date()
    const diff = expiresAt.getTime() - now.getTime()

    if (diff <= 0) {
      return { hours: 0, minutes: 0, seconds: 0, expired: true }
    }

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    return { hours, minutes, seconds, expired: false }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft()
      setTimeLeft(newTimeLeft)

      if (newTimeLeft.expired && onExpire) {
        onExpire()
        clearInterval(timer)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [expiresAt, onExpire])

  // Calculate urgency level for styling
  const totalHours = timeLeft.hours
  const urgencyLevel = totalHours > 24 ? 'safe' : totalHours > 6 ? 'warning' : 'critical'

  const sizeStyles = {
    sm: {
      container: 'px-2 py-1',
      text: 'text-xs',
      icon: 'w-3 h-3',
    },
    md: {
      container: 'px-3 py-1.5',
      text: 'text-sm',
      icon: 'w-4 h-4',
    },
    lg: {
      container: 'px-4 py-2',
      text: 'text-base',
      icon: 'w-5 h-5',
    },
  }

  const urgencyStyles = {
    safe: {
      bg: 'bg-neon-green/10',
      border: 'border-neon-green/30',
      text: 'text-neon-green',
    },
    warning: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      text: 'text-yellow-500',
    },
    critical: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-500',
    },
  }

  if (timeLeft.expired) {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-2 rounded-full border',
          sizeStyles[size].container,
          'bg-red-500/20 border-red-500/50',
          className
        )}
      >
        <span className={cn('font-medium text-red-400', sizeStyles[size].text)}>
          Expiré
        </span>
      </div>
    )
  }

  const formatTime = (value: number) => value.toString().padStart(2, '0')

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border',
        sizeStyles[size].container,
        urgencyStyles[urgencyLevel].bg,
        urgencyStyles[urgencyLevel].border,
        className
      )}
    >
      {showIcon && (
        <Clock className={cn(sizeStyles[size].icon, urgencyStyles[urgencyLevel].text)} />
      )}
      <span className={cn('font-mono font-medium', sizeStyles[size].text, urgencyStyles[urgencyLevel].text)}>
        {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
      </span>
    </motion.div>
  )
}
