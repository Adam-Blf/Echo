import { motion } from 'framer-motion'
import { X, Heart, Star, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SwipeActionsProps {
  onNope: () => void
  onLike: () => void
  onSuperLike: () => void
  onRewind?: () => void
  canSwipe: boolean
  canSuperLike: boolean
  canRewind?: boolean
  superLikesLeft: number
}

export function SwipeActions({
  onNope,
  onLike,
  onSuperLike,
  onRewind,
  canSwipe,
  canSuperLike,
  canRewind = false,
  superLikesLeft,
}: SwipeActionsProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      {/* Rewind button (premium) */}
      {onRewind && (
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onRewind}
          disabled={!canRewind}
          className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center transition-all',
            canRewind
              ? 'bg-surface-card border border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10'
              : 'bg-surface-card/50 border border-white/10 text-white/20'
          )}
        >
          <RotateCcw className="w-5 h-5" />
        </motion.button>
      )}

      {/* Nope button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onNope}
        disabled={!canSwipe}
        className={cn(
          'w-16 h-16 rounded-full flex items-center justify-center transition-all',
          canSwipe
            ? 'bg-surface-card border-2 border-neon-pink text-neon-pink hover:bg-neon-pink/10'
            : 'bg-surface-card/50 border border-white/10 text-white/20'
        )}
      >
        <X className="w-8 h-8" strokeWidth={3} />
      </motion.button>

      {/* Super Like button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onSuperLike}
        disabled={!canSuperLike}
        className={cn(
          'relative w-14 h-14 rounded-full flex items-center justify-center transition-all',
          canSuperLike
            ? 'bg-gradient-to-br from-neon-cyan to-neon-purple text-white hover:opacity-90'
            : 'bg-surface-card/50 border border-white/10 text-white/20'
        )}
      >
        <Star className="w-7 h-7" fill={canSuperLike ? 'currentColor' : 'none'} />
        {/* Counter badge */}
        {superLikesLeft > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white text-xs font-bold text-surface-dark flex items-center justify-center">
            {superLikesLeft}
          </span>
        )}
      </motion.button>

      {/* Like button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onLike}
        disabled={!canSwipe}
        className={cn(
          'w-16 h-16 rounded-full flex items-center justify-center transition-all',
          canSwipe
            ? 'bg-surface-card border-2 border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10'
            : 'bg-surface-card/50 border border-white/10 text-white/20'
        )}
      >
        <Heart className="w-8 h-8" fill={canSwipe ? 'currentColor' : 'none'} />
      </motion.button>
    </div>
  )
}
