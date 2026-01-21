import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SwipeAction, DiscoveryProfile, Match, SwipeLimits } from '@/types/swipe'
import { FREE_LIMITS, PREMIUM_LIMITS } from '@/types/swipe'
import {
  getDiscoveryProfiles,
  countNearbyUsers,
  requestAndUpdateLocation,
  type DiscoveryFilters,
} from '@/services/discoveryService'
import { useFiltersStore } from './filtersStore'

interface SwipeState {
  // Discovery profiles
  profiles: DiscoveryProfile[]
  currentIndex: number
  setProfiles: (profiles: DiscoveryProfile[]) => void

  // Loading states
  isLoadingProfiles: boolean
  isLoadingLocation: boolean

  // Nearby count
  nearbyCount: number

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

  // Discovery with Supabase
  fetchDiscoveryProfiles: (filters?: DiscoveryFilters) => Promise<void>
  updateUserLocation: () => Promise<{ success: boolean; error?: string }>
  refreshNearbyCount: () => Promise<void>

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

const getDailyResetTime = () => {
  const now = new Date()
  const reset = new Date(now)
  reset.setHours(24, 0, 0, 0) // Midnight tonight
  return reset
}

const getWeeklyResetTime = () => {
  const now = new Date()
  const reset = new Date(now)
  // Next Monday at midnight
  const daysUntilMonday = (8 - now.getDay()) % 7 || 7
  reset.setDate(reset.getDate() + daysUntilMonday)
  reset.setHours(0, 0, 0, 0)
  return reset
}

const initialLimits: SwipeLimits = {
  dailySwipes: FREE_LIMITS.dailySwipes,
  weeklySuperLikes: FREE_LIMITS.dailySuperLikes, // 0 for free
  swipesUsed: 0,
  superLikesUsed: 0,
  resetAt: getDailyResetTime(),
  superLikeResetAt: getWeeklyResetTime(),
}

export const useSwipeStore = create<SwipeState>()(
  persist(
    (set, get) => ({
      // Discovery profiles
      profiles: [],
      currentIndex: 0,
      setProfiles: (profiles) => set({ profiles, currentIndex: 0 }),

      // Loading states
      isLoadingProfiles: false,
      isLoadingLocation: false,

      // Nearby count
      nearbyCount: 0,

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
        // Only Premium users can Super Like (5 per week)
        if (isPremium) return limits.superLikesUsed < PREMIUM_LIMITS.weeklySuperLikes
        // Free users: 0 Super Likes
        return false
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
        let newLimits = { ...limits }
        let hasChanges = false

        // Reset daily swipes
        if (now >= new Date(limits.resetAt)) {
          newLimits.swipesUsed = 0
          newLimits.resetAt = getDailyResetTime()
          hasChanges = true
        }

        // Reset weekly super likes
        if (now >= new Date(limits.superLikeResetAt)) {
          newLimits.superLikesUsed = 0
          newLimits.superLikeResetAt = getWeeklyResetTime()
          hasChanges = true
        }

        if (hasChanges) {
          set({ limits: newLimits })
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

      // Fetch discovery profiles with filters
      fetchDiscoveryProfiles: async (filters) => {
        set({ isLoadingProfiles: true })

        // Get filters from filtersStore if not provided
        const filtersState = useFiltersStore.getState()
        const finalFilters: DiscoveryFilters = {
          minAge: filters?.minAge ?? filtersState.ageRange[0],
          maxAge: filters?.maxAge ?? filtersState.ageRange[1],
          maxDistanceKm: filters?.maxDistanceKm ?? filtersState.maxDistance,
          verifiedOnly: filters?.verifiedOnly ?? false,
          limit: filters?.limit ?? 20,
          offset: filters?.offset ?? 0,
        }

        const result = await getDiscoveryProfiles(finalFilters)

        if (result.data) {
          // Transform service DiscoveryProfile to swipe DiscoveryProfile
          const profiles: DiscoveryProfile[] = result.data.map((p) => ({
            id: p.profileId,
            firstName: p.firstName,
            age: p.age,
            bio: p.bio || '',
            interests: p.interests,
            photoUrl: p.photoUrl || '',
            echoStatus: p.echoStatus,
            lastPhotoAt: new Date(p.lastPhotoAt),
            isActive: p.echoStatus === 'ACTIVE' || p.echoStatus === 'EXPIRING',
            wingmanQuote: p.wingmanQuote ?? undefined,
            distance: p.distanceKm ?? undefined,
          }))

          set({
            profiles,
            currentIndex: 0,
            isLoadingProfiles: false,
          })
        } else {
          console.error('Error fetching profiles:', result.error)
          set({ isLoadingProfiles: false })
        }
      },

      // Update user location
      updateUserLocation: async () => {
        set({ isLoadingLocation: true })

        const result = await requestAndUpdateLocation()

        set({ isLoadingLocation: false })

        if (result.error) {
          return { success: false, error: result.error }
        }

        // Refresh nearby count after location update
        await get().refreshNearbyCount()

        return { success: true }
      },

      // Refresh nearby users count
      refreshNearbyCount: async () => {
        const count = await countNearbyUsers(10) // 10km radius
        set({ nearbyCount: count })
      },

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
