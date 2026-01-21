import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Heart, Crown, Sparkles, Lock } from 'lucide-react'
import { ProfileGridItem } from '@/components/ui'
import { useSwipeStore } from '@/stores'
import { cn } from '@/lib/utils'

// Mock data for profiles who liked the user
interface LikeProfile {
  id: string
  firstName: string
  age: number
  photoUrl: string
  isSuperLike?: boolean
  likedAt: Date
}

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

// Stagger animation container
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
}

export function LikesPage() {
  const navigate = useNavigate()
  const { isPremium } = useSwipeStore()
  const [likes] = useState<LikeProfile[]>(MOCK_LIKES)

  const handleUpgrade = () => {
    // TODO: Navigate to premium subscription page
    console.log('Navigate to premium')
  }

  const handleProfileClick = (profileId: string) => {
    if (isPremium) {
      // TODO: Open profile detail or match directly
      console.log('View profile:', profileId)
    }
  }

  return (
    <div className="min-h-screen bg-surface-dark">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-surface-dark/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-4 p-4 safe-top">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white/70" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">Qui t'a like</h1>
            <p className="text-sm text-white/50">
              {likes.length} personne{likes.length > 1 ? 's' : ''} t'ont like
            </p>
          </div>
          {/* Counter badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-neon-pink/20 to-neon-purple/20 border border-neon-pink/30">
            <Heart className="w-4 h-4 text-neon-pink" fill="currentColor" />
            <span className="text-sm font-semibold text-white">{likes.length}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative p-4 pb-24">
        {/* Profile Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
        >
          {likes.map((profile) => (
            <motion.div key={profile.id} variants={itemVariants}>
              <ProfileGridItem
                image={profile.photoUrl}
                name={isPremium ? profile.firstName : '???'}
                age={profile.age}
                badge={profile.isSuperLike ? 'super-like' : undefined}
                blurred={!isPremium}
                onClick={() => handleProfileClick(profile.id)}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Premium Overlay - Show when not premium */}
        {!isPremium && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="fixed inset-x-0 bottom-0 z-20 p-4 pb-6 safe-bottom"
          >
            {/* Gradient fade overlay */}
            <div className="absolute inset-x-0 -top-32 h-32 bg-gradient-to-t from-surface-dark to-transparent pointer-events-none" />

            {/* Premium CTA Card */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, type: 'spring', stiffness: 200 }}
              className={cn(
                'relative overflow-hidden rounded-3xl p-6',
                'bg-gradient-to-br from-neon-purple/20 via-surface-elevated to-neon-cyan/20',
                'border border-neon-purple/30 shadow-2xl shadow-neon-purple/20'
              )}
            >
              {/* Animated background glow */}
              <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-neon-purple/20 blur-3xl animate-pulse" />
              <div className="absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-neon-cyan/20 blur-3xl animate-pulse" />

              {/* Lock icon */}
              <div className="relative flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-purple to-neon-cyan flex items-center justify-center shadow-lg shadow-neon-purple/40">
                  <Lock className="w-8 h-8 text-white" />
                </div>
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

              {/* Features */}
              <div className="relative flex justify-center gap-6 mb-6">
                {[
                  { icon: Heart, label: 'Likes illimites' },
                  { icon: Crown, label: 'Profils reveles' },
                  { icon: Sparkles, label: 'Super Likes' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-neon-cyan" />
                    </div>
                    <span className="text-xs text-white/50">{label}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <motion.button
                onClick={handleUpgrade}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
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
                  Passer a Echo+
                </span>
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {/* Empty state */}
        {likes.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <Heart className="w-12 h-12 text-white/20" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              Pas encore de likes
            </h2>
            <p className="text-white/50 max-w-xs">
              Continue a swiper et les likes arriveront bientot !
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
