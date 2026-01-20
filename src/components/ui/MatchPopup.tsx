import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, MessageCircle, X, Star } from 'lucide-react'
import type { Match, DiscoveryProfile } from '@/types/swipe'
import { vibrate } from '@/lib/utils'

interface MatchPopupProps {
  match: Match | null
  profile: DiscoveryProfile | null
  onClose: () => void
  onMessage: () => void
}

export function MatchPopup({ match, profile, onClose, onMessage }: MatchPopupProps) {
  // Vibrate on match
  useEffect(() => {
    if (match) {
      vibrate([100, 50, 100])
    }
  }, [match])

  return (
    <AnimatePresence>
      {match && profile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute -top-2 -right-2 z-10 p-2 rounded-full bg-surface-card border border-white/10"
            >
              <X className="w-5 h-5 text-white/70" />
            </button>

            {/* Match card */}
            <div className="bg-surface-card rounded-3xl overflow-hidden border border-white/10">
              {/* Header */}
              <div className="relative h-64">
                <img
                  src={profile.photoUrl}
                  alt={profile.firstName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-card via-transparent to-transparent" />

                {/* Super like badge */}
                {match.isSuperLike && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3 }}
                    className="absolute top-4 right-4"
                  >
                    <div className="p-3 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple">
                      <Star className="w-6 h-6 text-white fill-white" />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Content */}
              <div className="p-6 text-center">
                {/* It's a match! */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="flex items-center justify-center gap-3 mb-4"
                >
                  <Heart className="w-8 h-8 text-neon-pink fill-neon-pink" />
                  <h2 className="text-3xl font-bold text-gradient">It's a Match!</h2>
                  <Heart className="w-8 h-8 text-neon-pink fill-neon-pink" />
                </motion.div>

                <p className="text-white/70 mb-6">
                  Toi et <span className="text-white font-semibold">{profile.firstName}</span> vous êtes likés mutuellement
                </p>

                {/* Timer warning */}
                <div className="flex items-center justify-center gap-2 text-yellow-500 text-sm mb-6">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    ⏱️
                  </motion.div>
                  <span>Vous avez 48h pour vous parler !</span>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 font-medium hover:bg-white/10 transition-colors"
                  >
                    Continuer
                  </button>
                  <button
                    onClick={onMessage}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple text-white font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Message
                  </button>
                </div>
              </div>
            </div>

            {/* Floating hearts animation */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 0, x: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  y: -150 - Math.random() * 100,
                  x: (Math.random() - 0.5) * 200,
                }}
                transition={{
                  duration: 2,
                  delay: 0.3 + i * 0.2,
                  ease: 'easeOut',
                }}
                className="absolute bottom-1/2 left-1/2 pointer-events-none"
              >
                <Heart
                  className="w-6 h-6 text-neon-pink fill-neon-pink"
                  style={{ filter: 'drop-shadow(0 0 10px #ff006e)' }}
                />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
