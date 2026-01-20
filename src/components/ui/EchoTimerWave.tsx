import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface EchoTimerWaveProps {
  hoursLeft: number
  maxHours?: number
  className?: string
}

export function EchoTimerWave({
  hoursLeft,
  maxHours = 48,
  className
}: EchoTimerWaveProps) {
  // Calculate percentage and color gradient
  const percentage = Math.max(0, Math.min(100, (hoursLeft / maxHours) * 100))

  // Color transitions: green → yellow → red
  const getColor = () => {
    if (percentage > 50) return 'from-neon-green to-neon-cyan'
    if (percentage > 25) return 'from-yellow-500 to-orange-500'
    return 'from-orange-500 to-red-500'
  }

  // Wave animation bars
  const bars = 12

  return (
    <div className={cn('relative w-full h-8', className)}>
      {/* Background track */}
      <div className="absolute inset-0 rounded-full bg-white/5 overflow-hidden">
        {/* Animated progress */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={cn(
            'h-full rounded-full bg-gradient-to-r',
            getColor()
          )}
        />
      </div>

      {/* Waveform overlay */}
      <div className="absolute inset-0 flex items-center justify-around px-2">
        {Array.from({ length: bars }).map((_, i) => {
          const isActive = (i / bars) * 100 < percentage
          const delay = i * 0.1

          return (
            <motion.div
              key={i}
              initial={{ scaleY: 0.3 }}
              animate={{
                scaleY: isActive ? [0.3, 1, 0.3] : 0.3,
                opacity: isActive ? 1 : 0.2,
              }}
              transition={{
                duration: 0.8,
                delay,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
              }}
              className={cn(
                'w-1 rounded-full',
                isActive
                  ? percentage > 50
                    ? 'bg-neon-green'
                    : percentage > 25
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  : 'bg-white/20'
              )}
              style={{
                height: '60%',
                transformOrigin: 'center',
              }}
            />
          )
        })}
      </div>

      {/* Time display */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2">
        <span
          className={cn(
            'text-xs font-mono font-medium',
            percentage > 50
              ? 'text-neon-green'
              : percentage > 25
                ? 'text-yellow-500'
                : 'text-red-500'
          )}
        >
          {hoursLeft}h
        </span>
      </div>
    </div>
  )
}
