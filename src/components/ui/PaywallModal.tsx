import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  X,
  Crown,
  Heart,
  Eye,
  RotateCcw,
  Zap,
  Star,
  EyeOff,
  Infinity,
  CheckCircle,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// =============================================================================
// TYPES
// =============================================================================

export type PremiumFeatureName =
  | 'see_likes'
  | 'rewind'
  | 'unlimited_swipes'
  | 'super_likes'
  | 'invisible_mode'
  | 'boost'
  | 'read_receipts'
  | 'priority_likes'

interface FeatureConfig {
  icon: LucideIcon
  title: string
  description: string
  planRequired: 'echo_plus' | 'echo_unlimited'
}

interface PaywallModalProps {
  isOpen: boolean
  onClose: () => void
  feature: PremiumFeatureName
}

// =============================================================================
// DATA
// =============================================================================

const FEATURE_CONFIGS: Record<PremiumFeatureName, FeatureConfig> = {
  see_likes: {
    icon: Eye,
    title: 'Voir qui t\'a like',
    description: 'Decouvre instantanement les personnes qui ont craque pour toi',
    planRequired: 'echo_plus',
  },
  rewind: {
    icon: RotateCcw,
    title: 'Rewind',
    description: 'Tu as swipe trop vite ? Reviens en arriere et change d\'avis',
    planRequired: 'echo_unlimited',
  },
  unlimited_swipes: {
    icon: Infinity,
    title: 'Swipes illimites',
    description: 'Plus de limite quotidienne, swipe autant que tu veux',
    planRequired: 'echo_plus',
  },
  super_likes: {
    icon: Star,
    title: 'Super Likes',
    description: 'Fais-toi remarquer avec des Super Likes supplementaires',
    planRequired: 'echo_plus',
  },
  invisible_mode: {
    icon: EyeOff,
    title: 'Mode invisible',
    description: 'Navigue incognito, seules les personnes que tu likes te voient',
    planRequired: 'echo_plus',
  },
  boost: {
    icon: Zap,
    title: 'Boost de profil',
    description: 'Sois mis en avant et multiplie tes chances de match',
    planRequired: 'echo_plus',
  },
  read_receipts: {
    icon: CheckCircle,
    title: 'Accuse de lecture',
    description: 'Sache quand tes messages ont ete lus',
    planRequired: 'echo_unlimited',
  },
  priority_likes: {
    icon: Heart,
    title: 'Likes prioritaires',
    description: 'Tes likes sont vus en premier par les autres utilisateurs',
    planRequired: 'echo_unlimited',
  },
}

const PREMIUM_HIGHLIGHTS = [
  { icon: Infinity, label: 'Swipes illimites' },
  { icon: Eye, label: 'Voir les likes' },
  { icon: Zap, label: 'Boosts' },
]

// =============================================================================
// COMPONENT
// =============================================================================

export function PaywallModal({ isOpen, onClose, feature }: PaywallModalProps) {
  const navigate = useNavigate()
  const config = FEATURE_CONFIGS[feature]
  const FeatureIcon = config.icon

  const handleViewPlans = () => {
    onClose()
    navigate('/premium')
  }

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
            initial={{ y: 100, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={cn(
              'w-full max-w-md overflow-hidden',
              'bg-gradient-to-br from-surface-card via-surface-elevated to-surface-card',
              'rounded-t-3xl sm:rounded-3xl',
              'border border-white/10 shadow-2xl'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Animated background glow */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-neon-purple/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-neon-cyan/20 rounded-full blur-3xl animate-pulse" />
            </div>

            {/* Header */}
            <div className="relative p-6 pb-4 text-center">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white/70" />
              </button>

              {/* Feature Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-20 h-20 mx-auto mb-6"
              >
                <div className="w-full h-full rounded-3xl bg-gradient-to-br from-neon-cyan via-neon-purple to-neon-pink p-[2px] shadow-xl shadow-neon-purple/30">
                  <div className="w-full h-full rounded-3xl bg-surface-dark flex items-center justify-center">
                    <FeatureIcon className="w-10 h-10 text-neon-cyan" />
                  </div>
                </div>
              </motion.div>

              {/* Title & Description */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-white mb-2">
                  {config.title}
                </h2>
                <p className="text-white/60 text-sm max-w-xs mx-auto">
                  {config.description}
                </p>
              </motion.div>
            </div>

            {/* Plan Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="px-6"
            >
              <div className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-neon-cyan/10 to-neon-purple/10 border border-neon-cyan/20">
                <Crown className="w-5 h-5 text-neon-cyan" />
                <span className="text-sm font-semibold text-white">
                  Disponible avec{' '}
                  <span className="text-gradient">
                    {config.planRequired === 'echo_plus' ? 'Echo+' : 'Echo Unlimited'}
                  </span>
                </span>
              </div>
            </motion.div>

            {/* Premium Highlights */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="px-6 py-6"
            >
              <p className="text-center text-xs text-white/40 mb-4 uppercase tracking-wider">
                Avantages Premium
              </p>
              <div className="flex justify-center gap-6">
                {PREMIUM_HIGHLIGHTS.map(({ icon: Icon, label }, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                      <Icon className="w-6 h-6 text-neon-cyan" />
                    </div>
                    <span className="text-xs text-white/50">{label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Actions */}
            <div className="relative p-6 pt-2 space-y-3">
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleViewPlans}
                className={cn(
                  'relative w-full h-14 rounded-2xl font-semibold text-lg',
                  'bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink',
                  'text-white shadow-lg shadow-neon-purple/30',
                  'overflow-hidden'
                )}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                <span className="relative flex items-center justify-center gap-2">
                  <Crown className="w-5 h-5" />
                  Voir les plans
                </span>
              </motion.button>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                onClick={onClose}
                className="w-full py-3 text-white/50 text-sm hover:text-white/70 transition-colors"
              >
                Non merci
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
