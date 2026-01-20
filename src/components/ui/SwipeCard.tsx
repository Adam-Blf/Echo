import { useState } from 'react'
import { motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion'
import { MapPin, Clock, Star, Sparkles } from 'lucide-react'
import type { DiscoveryProfile, SwipeAction } from '@/types/swipe'
import { cn, formatRelativeTime } from '@/lib/utils'
import { StatusBadge } from './StatusBadge'

interface SwipeCardProps {
  profile: DiscoveryProfile
  onSwipe: (action: SwipeAction) => void
  isTop?: boolean
}

export function SwipeCard({ profile, onSwipe, isTop = false }: SwipeCardProps) {
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | 'up' | null>(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Rotation based on drag
  const rotate = useTransform(x, [-200, 200], [-25, 25])

  // Opacity of action indicators
  const likeOpacity = useTransform(x, [0, 100], [0, 1])
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0])
  const superLikeOpacity = useTransform(y, [-100, 0], [1, 0])

  // Background colors
  const backgroundColor = useTransform(
    x,
    [-200, 0, 200],
    ['rgba(255, 0, 110, 0.3)', 'rgba(0, 0, 0, 0)', 'rgba(0, 245, 255, 0.3)']
  )

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100
    const velocityThreshold = 500

    const { offset, velocity } = info

    // Super like (swipe up)
    if (offset.y < -threshold || velocity.y < -velocityThreshold) {
      setExitDirection('up')
      onSwipe('superlike')
      return
    }

    // Like (swipe right)
    if (offset.x > threshold || velocity.x > velocityThreshold) {
      setExitDirection('right')
      onSwipe('like')
      return
    }

    // Nope (swipe left)
    if (offset.x < -threshold || velocity.x < -velocityThreshold) {
      setExitDirection('left')
      onSwipe('nope')
      return
    }
  }

  const exitAnimation = {
    left: { x: -500, opacity: 0, rotate: -30 },
    right: { x: 500, opacity: 0, rotate: 30 },
    up: { y: -500, opacity: 0, scale: 1.1 },
  }

  return (
    <motion.div
      className={cn(
        'absolute inset-4 rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing',
        !isTop && 'pointer-events-none'
      )}
      style={{
        x: isTop ? x : 0,
        y: isTop ? y : 0,
        rotate: isTop ? rotate : 0,
        zIndex: isTop ? 10 : 1,
        scale: isTop ? 1 : 0.95,
      }}
      drag={isTop}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      animate={exitDirection ? exitAnimation[exitDirection] : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Background overlay for drag feedback */}
      <motion.div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{ backgroundColor }}
      />

      {/* Profile photo */}
      <div className="absolute inset-0">
        <img
          src={profile.photoUrl}
          alt={profile.firstName}
          className={cn(
            'w-full h-full object-cover transition-all duration-500',
            profile.echoStatus === 'SILENCE' && 'grayscale opacity-70',
            profile.echoStatus === 'EXPIRING' && 'saturate-75'
          )}
          draggable={false}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      {/* Action indicators */}
      {isTop && (
        <>
          {/* LIKE indicator */}
          <motion.div
            className="absolute top-8 left-8 z-20 px-4 py-2 rounded-xl border-4 border-neon-cyan rotate-[-20deg]"
            style={{ opacity: likeOpacity }}
          >
            <span className="text-3xl font-black text-neon-cyan">LIKE</span>
          </motion.div>

          {/* NOPE indicator */}
          <motion.div
            className="absolute top-8 right-8 z-20 px-4 py-2 rounded-xl border-4 border-neon-pink rotate-[20deg]"
            style={{ opacity: nopeOpacity }}
          >
            <span className="text-3xl font-black text-neon-pink">NOPE</span>
          </motion.div>

          {/* SUPER LIKE indicator */}
          <motion.div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center"
            style={{ opacity: superLikeOpacity }}
          >
            <Star className="w-16 h-16 text-neon-cyan fill-neon-cyan" />
            <span className="text-2xl font-black text-neon-cyan mt-2">SUPER LIKE</span>
          </motion.div>
        </>
      )}

      {/* Echo status indicator */}
      <div className="absolute top-4 right-4 z-20">
        <StatusBadge status={profile.echoStatus} size="sm" />
      </div>

      {/* Profile info */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
        {/* Name and age */}
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-3xl font-bold text-white">
            {profile.firstName}, {profile.age}
          </h2>
          {profile.wingmanQuote && (
            <Sparkles className="w-6 h-6 text-neon-purple" />
          )}
        </div>

        {/* Distance and last activity */}
        <div className="flex items-center gap-4 text-white/70 text-sm mb-3">
          {profile.distance && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{profile.distance} km</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>Photo {formatRelativeTime(profile.lastPhotoAt)}</span>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-white/80 text-sm mb-3 line-clamp-2">{profile.bio}</p>
        )}

        {/* Interests */}
        <div className="flex flex-wrap gap-2">
          {profile.interests.slice(0, 4).map((interest) => (
            <span
              key={interest}
              className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium"
            >
              {interest}
            </span>
          ))}
          {profile.interests.length > 4 && (
            <span className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium">
              +{profile.interests.length - 4}
            </span>
          )}
        </div>

        {/* Wingman quote */}
        {profile.wingmanQuote && (
          <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10">
            <p className="text-white/60 text-xs mb-1">Son ami dit :</p>
            <p className="text-white/90 text-sm italic">"{profile.wingmanQuote}"</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
