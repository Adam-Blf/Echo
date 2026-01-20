import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SwipeAction, DiscoveryProfile, Match, SwipeLimits } from '@/types/swipe'
import { FREE_LIMITS } from '@/types/swipe'

interface SwipeState {
  // Discovery profiles
  profiles: DiscoveryProfile[]
  currentIndex: number
  setProfiles: (profiles: DiscoveryProfile[]) => void

  // Swipe limits
  limits: SwipeLimits
  canSwipe: () => boolean
  canSuperLike: () => boolean
  useSwipe: () => void
  useSuperLike: () => void
  resetLimitsIfNeeded: () => void

  // Swipe history
  swipeHistory: Array<{ oderId: string; action: SwipeAction; timestamp: number }>
  addToHistory: (oderId: string, action: SwipeAction) => void

  // Matches
  matches: Match[]
  addMatch: (match: Match) => void
  removeMatch: (matchId: string) => void

  // New match popup
  newMatch: Match | null
  matchedProfile: DiscoveryProfile | null
  setNewMatch: (match: Match | null, profile: DiscoveryProfile | null) => void

  // Premium
  isPremium: boolean
  setPremium: (isPremium: boolean) => void

  // Actions
  swipe: (action: SwipeAction) => DiscoveryProfile | null
  rewind: () => boolean

  // Stats
  stats: {
    totalSwipes: number
    totalLikes: number
    totalSuperLikes: number
    totalMatches: number
  }
}

const getResetTime = () => {
  const now = new Date()
  const reset = new Date(now)
  reset.setHours(24, 0, 0, 0) // Midnight tonight
  return reset
}

const initialLimits: SwipeLimits = {
  dailySwipes: FREE_LIMITS.dailySwipes,
  dailySuperLikes: FREE_LIMITS.dailySuperLikes,
  swipesUsed: 0,
  superLikesUsed: 0,
  resetAt: getResetTime(),
}

export const useSwipeStore = create<SwipeState>()(
  persist(
    (set, get) => ({
      // Discovery profiles
      profiles: [],
      currentIndex: 0,
      setProfiles: (profiles) => set({ profiles, currentIndex: 0 }),

      // Swipe limits
      limits: initialLimits,

      canSwipe: () => {
        const { limits, isPremium } = get()
        if (isPremium) return true
        get().resetLimitsIfNeeded()
        return limits.swipesUsed < limits.dailySwipes
      },

      canSuperLike: () => {
        const { limits, isPremium } = get()
        get().resetLimitsIfNeeded()
        if (isPremium) return limits.superLikesUsed < 5 // Premium gets 5/day
        return limits.superLikesUsed < limits.dailySuperLikes
      },

      useSwipe: () => {
        set((state) => ({
          limits: {
            ...state.limits,
            swipesUsed: state.limits.swipesUsed + 1,
          },
        }))
      },

      useSuperLike: () => {
        set((state) => ({
          limits: {
            ...state.limits,
            superLikesUsed: state.limits.superLikesUsed + 1,
          },
        }))
      },

      resetLimitsIfNeeded: () => {
        const { limits } = get()
        const now = new Date()
        if (now >= new Date(limits.resetAt)) {
          set({
            limits: {
              ...limits,
              swipesUsed: 0,
              superLikesUsed: 0,
              resetAt: getResetTime(),
            },
          })
        }
      },

      // Swipe history
      swipeHistory: [],
      addToHistory: (oderId, action) => {
        set((state) => ({
          swipeHistory: [
            ...state.swipeHistory.slice(-100), // Keep last 100
            { oderId, action, timestamp: Date.now() },
          ],
        }))
      },

      // Matches
      matches: [],
      addMatch: (match) => {
        set((state) => ({
          matches: [match, ...state.matches],
          stats: {
            ...state.stats,
            totalMatches: state.stats.totalMatches + 1,
          },
        }))
      },
      removeMatch: (matchId) => {
        set((state) => ({
          matches: state.matches.filter((m) => m.id !== matchId),
        }))
      },

      // New match popup
      newMatch: null,
      matchedProfile: null,
      setNewMatch: (match, profile) => set({ newMatch: match, matchedProfile: profile }),

      // Premium
      isPremium: false,
      setPremium: (isPremium) => set({ isPremium }),

      // Swipe action
      swipe: (action) => {
        const { profiles, currentIndex, canSwipe, canSuperLike, useSwipe, useSuperLike, addToHistory } = get()

        if (currentIndex >= profiles.length) return null

        const profile = profiles[currentIndex]

        // Check limits
        if (action === 'superlike') {
          if (!canSuperLike()) return null
          useSuperLike()
        } else {
          if (!canSwipe()) return null
        }

        useSwipe()
        addToHistory(profile.id, action)

        // Update stats
        set((state) => ({
          currentIndex: state.currentIndex + 1,
          stats: {
            ...state.stats,
            totalSwipes: state.stats.totalSwipes + 1,
            totalLikes: action === 'like' ? state.stats.totalLikes + 1 : state.stats.totalLikes,
            totalSuperLikes: action === 'superlike' ? state.stats.totalSuperLikes + 1 : state.stats.totalSuperLikes,
          },
        }))

        // Simulate match (30% chance for like, 60% for superlike)
        const matchChance = action === 'superlike' ? 0.6 : action === 'like' ? 0.3 : 0
        if (Math.random() < matchChance) {
          const match: Match = {
            id: crypto.randomUUID(),
            oderId: profile.id,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48h
            status: 'matched',
            isSuperLike: action === 'superlike',
          }
          get().addMatch(match)
          get().setNewMatch(match, profile)
        }

        return profile
      },

      // Rewind (premium only)
      rewind: () => {
        const { isPremium, currentIndex, swipeHistory } = get()
        if (!isPremium || currentIndex === 0 || swipeHistory.length === 0) return false

        set((state) => ({
          currentIndex: state.currentIndex - 1,
          swipeHistory: state.swipeHistory.slice(0, -1),
        }))
        return true
      },

      // Stats
      stats: {
        totalSwipes: 0,
        totalLikes: 0,
        totalSuperLikes: 0,
        totalMatches: 0,
      },
    }),
    {
      name: 'echo-swipe',
      partialize: (state) => ({
        limits: state.limits,
        swipeHistory: state.swipeHistory,
        matches: state.matches,
        isPremium: state.isPremium,
        stats: state.stats,
      }),
    }
  )
)
