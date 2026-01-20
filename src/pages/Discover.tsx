import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { SlidersHorizontal, Zap } from 'lucide-react'
import { SwipeCard, SwipeActions, MatchPopup, LimitReachedModal } from '@/components/ui'
import { useSwipeStore } from '@/stores'
import type { DiscoveryProfile, SwipeAction } from '@/types/swipe'
import { FREE_LIMITS } from '@/types/swipe'

// Mock profiles for demo
const MOCK_PROFILES: DiscoveryProfile[] = [
  {
    id: '1',
    firstName: 'Sophie',
    age: 24,
    bio: 'Passionnée de voyages et de photographie. Toujours partante pour une nouvelle aventure !',
    interests: ['Voyage', 'Photo', 'Musique', 'Cuisine'],
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800',
    distance: 3,
    isActive: true,
    lastPhotoAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h ago
    wingmanQuote: 'La plus drôle de toutes mes amies, elle illumine chaque soirée !',
  },
  {
    id: '2',
    firstName: 'Emma',
    age: 26,
    bio: 'Développeuse le jour, DJ la nuit. Je cherche quelqu\'un qui aime autant le code que la musique.',
    interests: ['Tech', 'Musique', 'Gaming', 'Fitness'],
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800',
    distance: 7,
    isActive: true,
    lastPhotoAt: new Date(Date.now() - 30 * 60 * 1000), // 30min ago
  },
  {
    id: '3',
    firstName: 'Léa',
    age: 23,
    bio: 'Étudiante en médecine, fan de Netflix et de bonnes pizzas.',
    interests: ['Cinéma', 'Lecture', 'Cuisine', 'Art'],
    photoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800',
    distance: 12,
    isActive: false,
    lastPhotoAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
  },
  {
    id: '4',
    firstName: 'Chloé',
    age: 25,
    bio: 'Coach sportive et amoureuse de la nature. Randonnée le dimanche ?',
    interests: ['Sport', 'Nature', 'Fitness', 'Animaux'],
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800',
    distance: 5,
    isActive: true,
    lastPhotoAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1h ago
    wingmanQuote: 'La personne la plus authentique que je connaisse.',
  },
  {
    id: '5',
    firstName: 'Marie',
    age: 27,
    bio: 'Architecte d\'intérieur, je transforme les espaces et les cœurs ✨',
    interests: ['Art', 'Mode', 'Voyage', 'Photo'],
    photoUrl: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=800',
    distance: 8,
    isActive: true,
    lastPhotoAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4h ago
  },
]

export function DiscoverPage() {
  const navigate = useNavigate()
  const {
    profiles,
    currentIndex,
    setProfiles,
    swipe,
    canSwipe,
    canSuperLike,
    limits,
    newMatch,
    matchedProfile,
    setNewMatch,
    isPremium,
    rewind,
    swipeHistory,
  } = useSwipeStore()

  const [showLimitModal, setShowLimitModal] = useState(false)
  const [limitType, setLimitType] = useState<'swipes' | 'superlikes'>('swipes')

  // Load mock profiles on mount
  useEffect(() => {
    if (profiles.length === 0) {
      setProfiles(MOCK_PROFILES)
    }
  }, [])

  const handleSwipe = (action: SwipeAction) => {
    // Check limits before swiping
    if (action === 'superlike' && !canSuperLike()) {
      setLimitType('superlikes')
      setShowLimitModal(true)
      return
    }

    if (!canSwipe()) {
      setLimitType('swipes')
      setShowLimitModal(true)
      return
    }

    swipe(action)
  }

  const handleRewind = () => {
    if (isPremium && swipeHistory.length > 0) {
      rewind()
    }
  }

  const handleUpgrade = () => {
    setShowLimitModal(false)
    // TODO: Navigate to premium page
    console.log('Navigate to premium')
  }

  const remainingSwipes = FREE_LIMITS.dailySwipes - limits.swipesUsed
  const remainingSuperLikes = FREE_LIMITS.dailySuperLikes - limits.superLikesUsed

  const visibleProfiles = profiles.slice(currentIndex, currentIndex + 2)
  const hasMoreProfiles = currentIndex < profiles.length

  return (
    <div className="h-screen flex flex-col bg-surface-dark">
      {/* Header */}
      <div className="flex items-center justify-between p-4 safe-top">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">Découvrir</h1>
          {!isPremium && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 text-xs text-white/50">
              <Zap className="w-3 h-3" />
              <span>{remainingSwipes}</span>
            </div>
          )}
        </div>
        <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
          <SlidersHorizontal className="w-5 h-5 text-white/70" />
        </button>
      </div>

      {/* Card stack */}
      <div className="flex-1 relative">
        {hasMoreProfiles ? (
          <AnimatePresence>
            {visibleProfiles.map((profile, index) => (
              <SwipeCard
                key={profile.id}
                profile={profile}
                onSwipe={handleSwipe}
                isTop={index === 0}
              />
            ))}
          </AnimatePresence>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <span className="text-5xl">🌟</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              Plus de profils pour le moment
            </h2>
            <p className="text-white/50 max-w-xs mb-6">
              Tu as vu tous les profils disponibles. Reviens plus tard pour en découvrir de nouveaux !
            </p>
            <button
              onClick={() => setProfiles(MOCK_PROFILES)} // Reset for demo
              className="btn-ghost"
            >
              Recharger les profils
            </button>
          </motion.div>
        )}
      </div>

      {/* Action buttons */}
      {hasMoreProfiles && (
        <div className="p-4 pb-6 safe-bottom">
          <SwipeActions
            onNope={() => handleSwipe('nope')}
            onLike={() => handleSwipe('like')}
            onSuperLike={() => handleSwipe('superlike')}
            onRewind={isPremium ? handleRewind : undefined}
            canSwipe={canSwipe()}
            canSuperLike={canSuperLike()}
            canRewind={isPremium && swipeHistory.length > 0}
            superLikesLeft={Math.max(0, remainingSuperLikes)}
          />
        </div>
      )}

      {/* Match popup */}
      <MatchPopup
        match={newMatch}
        profile={matchedProfile}
        onClose={() => setNewMatch(null, null)}
        onMessage={() => {
          setNewMatch(null, null)
          navigate('/matches')
        }}
      />

      {/* Limit reached modal */}
      <LimitReachedModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        onUpgrade={handleUpgrade}
        type={limitType}
        resetTime={new Date(limits.resetAt)}
      />
    </div>
  )
}
