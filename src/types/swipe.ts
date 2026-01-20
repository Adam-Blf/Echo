import type { EchoStatus } from './user'

// Swipe action types
export type SwipeAction = 'like' | 'nope' | 'superlike'

// User profile for discovery
export interface DiscoveryProfile {
  id: string
  firstName: string
  age: number
  bio?: string
  interests: string[]
  photoUrl: string
  distance?: number // in km
  isActive: boolean // Echo still alive
  echoStatus: EchoStatus // ACTIVE, EXPIRING, SILENCE
  lastPhotoAt: Date
  wingmanQuote?: string
}

// Match status
export type MatchStatus = 'pending' | 'matched' | 'expired' | 'resonance'

// Match data
export interface Match {
  id: string
  oderId: string
  createdAt: Date
  expiresAt: Date // 48h after match
  status: MatchStatus
  lastMessageAt?: Date
  isSuperLike: boolean
}

// Swipe limits configuration
export interface SwipeLimits {
  dailySwipes: number
  weeklySuperLikes: number
  swipesUsed: number
  superLikesUsed: number
  resetAt: Date // Daily reset for swipes
  superLikeResetAt: Date // Weekly reset for super likes
}

// Premium features
export interface PremiumFeatures {
  unlimitedSwipes: boolean
  unlimitedSuperLikes: boolean
  seeWhoLikesYou: boolean
  rewind: boolean
  boosts: number
}

// Default limits for free users
export const FREE_LIMITS = {
  dailySwipes: 20,
  dailySuperLikes: 0,
} as const

// Premium limits
export const PREMIUM_LIMITS = {
  dailySwipes: Infinity,
  weeklySuperLikes: 5, // 5 per week, not per day
} as const
