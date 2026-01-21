import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Heart, Crown, Sparkles, Lock, Unlock, Star, Zap } from 'lucide-react'
import { ProfileGridItem } from '@/components/ui'
import { PaywallModal } from '@/components/ui/PaywallModal'
import { useSwipeStore } from '@/stores'
import { usePremiumGate } from '@/hooks/usePremiumGate'
import { cn } from '@/lib/utils'

// =============================================================================
// TYPES
// =============================================================================

interface LikeProfile {
  id: string
  firstName: string
  age: number
  photoUrl: string
  isSuperLike?: boolean
  likedAt: Date
}

// =============================================================================
// MOCK DATA
// =============================================================================

const MOCK_LIKES: LikeProfile[] = [
  {
    id: '1',
    firstName: 'Camille',
    age: 23,
    photoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
    isSuperLike: true,
    likedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: '2',
    firstName: 'Julie',
    age: 26,
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
    likedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
  {
    id: '3',
    firstName: 'Marine',
    age: 24,
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    likedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: '4',
    firstName: 'Lola',
    age: 22,
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    isSuperLike: true,
    likedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: '5',
    firstName: 'Emma',
    age: 25,
    photoUrl: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400',
    likedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: '6',
    firstName: 'Clara',
    age: 27,
    photoUrl: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=400',
    likedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  },
  {
    id: '7',
    firstName: 'Sarah',
    age: 24,
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
    likedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: '8',
    firstName: 'Lea',
    age: 23,
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    isSuperLike: true,
    likedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
  },
]

// =============================================================================
// ANIMATIONS
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9, rotateX: -15 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 260,
      damping: 20,
    },
  },
}

const unlockVariants = {
  locked: { scale: 1 },
  unlocking: {
    scale: [1, 1.1, 0.95, 1],
    transition: { duration: 0.5 },
  },
}

// =============================================================================
// HELPERS
// =============================================================================

// Calculate progressive blur level based on position
// First few profiles are slightly revealed to tease premium feature
function getBlurLevel(index: number, isPremium: boolean): 1 | 2 | 3 | 4 | 5 {
  if (isPremium) return 1 // No blur for premium
  if (index === 0) return 3 // Slight reveal for first
  if (index === 1) return 4 // More blur for second
  return 5 // Max blur for rest
}

// =============================================================================
// COMPONENTS
// =============================================================================

interface UnlockButtonProps {
  onClick: () => void
  isUnlocking: boolean
}

function UnlockButton({ onClick, isUnlocking }: UnlockButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      variants={unlockVariants}
      animate={isUnlocking ? 'unlocking' : 'locked'}
      className={cn(
        'relative w-full h-14 rounded-2xl font-semibold text-lg',
        'bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink',
        'text-white shadow-xl shadow-neon-purple/40',
        'overflow-hidden'
      )}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />

      {/* Button content */}
      <span className="relative flex items-center justify-center gap-2">
        {isUnlocking ? (
          <>
            <Unlock className="w-5 h-5 animate-bounce" />
            Deverrouillage...
          </>
        ) : (
          <>
            <Crown className="w-5 h-5" />
            Passer a Echo+
          </>
        )}
      </span>

      {/* Glow effect */}
      <motion.div
        animate={{
          opacity: [0.5, 1, 0.5],
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute inset-0 bg-gradient-to-r from-neon-cyan/20 via-transparent to-neon-pink/20 pointer-events-none"
      />
    </motion.button>
  )
}

// =============================================================================
// MAIN PAGE
// =============================================================================

export function LikesPage() {
  const navigate = useNavigate()
  const { isPremium } = useSwipeStore()
  const [likes] = useState<LikeProfile[]>(MOCK_LIKES)
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [revealedProfiles, setRevealedProfiles] = useState<Set<string>>(new Set())

  // Premium gate hook
  const {
    canAccess,
    showPaywall,
    hidePaywall,
    isPaywallVisible,
    featureName,
  } = usePremiumGate('see_likes')

  // Simulate unlock animation when becoming premium
  useEffect(() => {
    if (isPremium && !canAccess) {
      setIsUnlocking(true)
      // Reveal profiles one by one with stagger
      likes.forEach((profile, index) => {
        setTimeout(() => {
          setRevealedProfiles((prev) => new Set([...prev, profile.id]))
        }, index * 150)
      })
      setTimeout(() => setIsUnlocking(false), likes.length * 150 + 500)
    }
  }, [isPremium, canAccess, likes])

  const handleUpgrade = () => {
    showPaywall()
  }

  const handleProfileClick = (profileId: string) => {
    if (isPremium || canAccess) {
      // Premium: open profile detail or match directly
      console.log('View profile:', profileId)
    } else {
      // Show paywall for non-premium
      showPaywall()
    }
  }

  // Count super likes
  const superLikeCount = likes.filter((l) => l.isSuperLike).length

  return (
    <div className="min-h-screen bg-surface-dark">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-40 -left-40 w-80 h-80 bg-neon-purple/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-40 -right-40 w-80 h-80 bg-neon-cyan/10 rounded-full blur-3xl"
        />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-10 bg-surface-dark/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-4 p-4 safe-top">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white/70" />
          </motion.button>

          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">Qui t'a like</h1>
            <p className="text-sm text-white/50">
              {likes.length} personne{likes.length > 1 ? 's' : ''} t'ont like
            </p>
          </div>

          {/* Stats badges */}
          <div className="flex items-center gap-2">
            {/* Super likes badge */}
            {superLikeCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30"
              >
                <Star className="w-3.5 h-3.5 text-amber-400" fill="currentColor" />
                <span className="text-xs font-bold text-amber-400">{superLikeCount}</span>
              </motion.div>
            )}

            {/* Total likes badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-gradient-to-r from-neon-pink/20 to-neon-purple/20 border border-neon-pink/30"
            >
              <Heart className="w-3.5 h-3.5 text-neon-pink" fill="currentColor" />
              <span className="text-xs font-bold text-white">{likes.length}</span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative p-4 pb-32">
        {/* Profile Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
        >
          {likes.map((profile, index) => {
            const isRevealed = revealedProfiles.has(profile.id)
            const showUnlockAnim = isUnlocking && isRevealed

            return (
              <motion.div key={profile.id} variants={itemVariants}>
                <ProfileGridItem
                  image={profile.photoUrl}
                  name={isPremium ? profile.firstName : '???'}
                  age={profile.age}
                  badge={profile.isSuperLike ? 'super-like' : undefined}
                  blurred={!isPremium && !showUnlockAnim}
                  blurLevel={getBlurLevel(index, isPremium)}
                  showUnlockAnimation={showUnlockAnim}
                  onClick={() => handleProfileClick(profile.id)}
                />
              </motion.div>
            )
          })}
        </motion.div>

        {/* Premium Overlay - Show when not premium */}
        <AnimatePresence>
          {!isPremium && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ delay: 0.5 }}
              className="fixed inset-x-0 bottom-0 z-20 p-4 pb-6 safe-bottom"
            >
              {/* Gradient fade overlay */}
              <div className="absolute inset-x-0 -top-40 h-40 bg-gradient-to-t from-surface-dark via-surface-dark/80 to-transparent pointer-events-none" />

              {/* Premium CTA Card */}
              <motion.div
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 60, opacity: 0 }}
                transition={{ delay: 0.7, type: 'spring', stiffness: 200, damping: 25 }}
                className={cn(
                  'relative overflow-hidden rounded-3xl p-6',
                  'bg-gradient-to-br from-surface-elevated via-surface-card to-surface-elevated',
                  'border border-white/10 shadow-2xl'
                )}
              >
                {/* Animated background glow */}
                <motion.div
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="absolute -right-20 -top-20 h-60 w-60 rounded-full opacity-30"
                  style={{
                    background:
                      'conic-gradient(from 0deg, transparent, #8B5CF6, transparent, #06B6D4, transparent)',
                  }}
                />
                <motion.div
                  animate={{
                    rotate: [360, 0],
                  }}
                  transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                  className="absolute -left-20 -bottom-20 h-60 w-60 rounded-full opacity-30"
                  style={{
                    background:
                      'conic-gradient(from 180deg, transparent, #06B6D4, transparent, #8B5CF6, transparent)',
                  }}
                />

                {/* Lock icon with animation */}
                <div className="relative flex items-center justify-center mb-5">
                  <motion.div
                    animate={{
                      y: [0, -5, 0],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-purple to-neon-cyan p-[2px] shadow-xl shadow-neon-purple/40"
                  >
                    <div className="w-full h-full rounded-2xl bg-surface-dark flex items-center justify-center">
                      <Lock className="w-8 h-8 text-neon-cyan" />
                    </div>
                  </motion.div>
                </div>

                {/* Content */}
                <div className="relative text-center mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">
                    Decouvre qui t'a like
                  </h3>
                  <p className="text-white/60 text-sm max-w-xs mx-auto">
                    Avec Echo+, vois tous ceux qui t'ont like et matche instantanement avec eux
                  </p>
                </div>

                {/* Feature highlights with icons */}
                <div className="relative flex justify-center gap-5 mb-6">
                  {[
                    { icon: Heart, label: 'Likes illimites', color: 'text-rose-400' },
                    { icon: Crown, label: 'Profils reveles', color: 'text-neon-cyan' },
                    { icon: Zap, label: 'Match instant', color: 'text-amber-400' },
                  ].map(({ icon: Icon, label, color }, i) => (
                    <motion.div
                      key={label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 + i * 0.1 }}
                      className="flex flex-col items-center gap-1.5"
                    >
                      <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <Icon className={cn('w-5 h-5', color)} />
                      </div>
                      <span className="text-[10px] text-white/50 font-medium">{label}</span>
                    </motion.div>
                  ))}
                </div>

                {/* CTA Button */}
                <UnlockButton onClick={handleUpgrade} isUnlocking={isUnlocking} />

                {/* Trust indicator */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="text-center text-[10px] text-white/30 mt-4"
                >
                  <Sparkles className="inline w-3 h-3 mr-1" />
                  Annulation possible a tout moment
                </motion.p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {likes.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6"
            >
              <Heart className="w-12 h-12 text-white/20" />
            </motion.div>
            <h2 className="text-xl font-bold text-white mb-2">Pas encore de likes</h2>
            <p className="text-white/50 max-w-xs">
              Continue a swiper et les likes arriveront bientot !
            </p>
          </motion.div>
        )}
      </div>

      {/* Paywall Modal */}
      <PaywallModal
        isOpen={isPaywallVisible}
        onClose={hidePaywall}
        feature={featureName}
      />
    </div>
  )
}
