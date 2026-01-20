import { motion, AnimatePresence } from 'framer-motion'
import { X, Zap, Star, Eye, RotateCcw, Infinity, Crown } from 'lucide-react'

interface LimitReachedModalProps {
  isOpen: boolean
  onClose: () => void
  onUpgrade: () => void
  type: 'swipes' | 'superlikes'
  resetTime: Date
}

export function LimitReachedModal({
  isOpen,
  onClose,
  onUpgrade,
  type,
  resetTime,
}: LimitReachedModalProps) {
  const getTimeRemaining = () => {
    const now = new Date()
    const diff = resetTime.getTime() - now.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  const premiumFeatures = [
    { icon: Infinity, label: 'Swipes illimités', desc: 'Plus de limites quotidiennes' },
    { icon: Star, label: '5 Super Likes/jour', desc: 'Fais-toi remarquer' },
    { icon: Eye, label: 'Voir qui t\'a liké', desc: 'Gagne du temps' },
    { icon: RotateCcw, label: 'Rewind', desc: 'Reviens en arrière' },
    { icon: Zap, label: 'Boosts', desc: 'Sois vu en priorité' },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-full max-w-md bg-surface-card rounded-t-3xl sm:rounded-3xl overflow-hidden border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative p-6 pb-4 text-center bg-gradient-to-b from-neon-purple/20 to-transparent">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white/70" />
              </button>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-neon-purple to-neon-pink p-[2px]"
              >
                <div className="w-full h-full rounded-full bg-surface-dark flex items-center justify-center">
                  {type === 'swipes' ? (
                    <Zap className="w-10 h-10 text-neon-purple" />
                  ) : (
                    <Star className="w-10 h-10 text-neon-cyan" />
                  )}
                </div>
              </motion.div>

              <h2 className="text-2xl font-bold text-white mb-2">
                {type === 'swipes' ? 'Plus de swipes !' : 'Plus de Super Likes !'}
              </h2>

              <p className="text-white/60 text-sm">
                Reviens dans <span className="text-neon-cyan font-semibold">{getTimeRemaining()}</span> ou passe à Premium
              </p>
            </div>

            {/* Premium features */}
            <div className="px-6 py-4">
              <div className="flex items-center gap-2 mb-4">
                <Crown className="w-5 h-5 text-yellow-500" />
                <span className="text-white font-semibold">ECHO Premium</span>
              </div>

              <div className="space-y-3">
                {premiumFeatures.map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 flex items-center justify-center">
                      <feature.icon className="w-5 h-5 text-neon-cyan" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{feature.label}</p>
                      <p className="text-white/40 text-xs">{feature.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 pt-2 space-y-3">
              <button
                onClick={onUpgrade}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Crown className="w-6 h-6" />
                Passer à Premium
              </button>

              <button
                onClick={onClose}
                className="w-full py-3 text-white/50 text-sm hover:text-white/70 transition-colors"
              >
                Non merci, je patiente
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
