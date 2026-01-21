import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserProfile, EchoStatus } from '@/types/user'
import { getEchoStatus, getDaysUntilExpiration, isProfileActive } from '@/types/user'
import {
  getPremiumStatus,
  getUserPremiumState,
  subscribeToPremiumChanges,
  type PremiumStatus,
} from '@/services/premiumService'
import type { SubscriptionPlan } from '@/types/database'

interface UserState {
  // Current user profile
  profile: UserProfile | null
  isAuthenticated: boolean

  // Computed properties
  echoStatus: EchoStatus
  daysUntilExpiration: number
  isActive: boolean

  // Premium status
  premiumStatus: PremiumStatus | null
  isPremium: boolean
  currentPlan: SubscriptionPlan

  // Loading states
  isLoadingPremium: boolean

  // Actions
  setProfile: (profile: UserProfile) => void
  updatePhoto: (photoUrl: string) => void
  updateProfile: (updates: Partial<UserProfile>) => void
  setWingmanValidation: (quote: string, qualities: string[], flaws: string[]) => void
  refreshEchoStatus: () => void

  // Premium actions
  fetchPremiumStatus: () => Promise<void>
  syncPremiumState: () => Promise<void>
  startPremiumSync: () => void

  logout: () => void
}

// Default guest profile for demo
const createGuestProfile = (): UserProfile => ({
  id: 'guest',
  firstName: 'Invité',
  age: 25,
  bio: '',
  interests: [],
  photoUrl: '',
  lastPhotoAt: new Date(),
  echoStatus: 'ACTIVE',
  isValidated: false,
  notificationsEnabled: true,
  language: 'fr',
  createdAt: new Date(),
  updatedAt: new Date(),
})

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      profile: null,
      isAuthenticated: false,
      echoStatus: 'SILENCE',
      daysUntilExpiration: 0,
      isActive: false,

      // Premium
      premiumStatus: null,
      isPremium: false,
      currentPlan: 'free',
      isLoadingPremium: false,

      setProfile: (profile) => {
        const echoStatus = getEchoStatus(profile.lastPhotoAt)
        const daysUntilExpiration = getDaysUntilExpiration(profile.lastPhotoAt)
        const isActive = isProfileActive(profile.lastPhotoAt)

        set({
          profile: { ...profile, echoStatus },
          isAuthenticated: true,
          echoStatus,
          daysUntilExpiration,
          isActive,
        })
      },

      updatePhoto: (photoUrl) => {
        const { profile } = get()
        if (!profile) return

        const now = new Date()
        const updatedProfile: UserProfile = {
          ...profile,
          photoUrl,
          lastPhotoAt: now,
          echoStatus: 'ACTIVE',
          updatedAt: now,
        }

        set({
          profile: updatedProfile,
          echoStatus: 'ACTIVE',
          daysUntilExpiration: 7,
          isActive: true,
        })
      },

      updateProfile: (updates) => {
        const { profile } = get()
        if (!profile) return

        const updatedProfile: UserProfile = {
          ...profile,
          ...updates,
          updatedAt: new Date(),
        }

        set({ profile: updatedProfile })
      },

      setWingmanValidation: (quote, qualities, flaws) => {
        const { profile } = get()
        if (!profile) return

        const updatedProfile: UserProfile = {
          ...profile,
          isValidated: true,
          wingmanQuote: quote,
          wingmanQualities: qualities,
          wingmanFlaws: flaws,
          updatedAt: new Date(),
        }

        set({ profile: updatedProfile })
      },

      refreshEchoStatus: () => {
        const { profile } = get()
        if (!profile) return

        const echoStatus = getEchoStatus(profile.lastPhotoAt)
        const daysUntilExpiration = getDaysUntilExpiration(profile.lastPhotoAt)
        const isActive = isProfileActive(profile.lastPhotoAt)

        set({
          profile: { ...profile, echoStatus },
          echoStatus,
          daysUntilExpiration,
          isActive,
        })
      },

      // Fetch premium status from Supabase
      fetchPremiumStatus: async () => {
        set({ isLoadingPremium: true })

        const result = await getPremiumStatus()

        if (result.data) {
          set({
            premiumStatus: result.data,
            isPremium: result.data.isPremium,
            currentPlan: result.data.currentPlan,
            isLoadingPremium: false,
          })
        } else {
          set({ isLoadingPremium: false })
        }
      },

      // Sync premium state (cached, faster)
      syncPremiumState: async () => {
        const result = await getUserPremiumState()

        if (result.data) {
          set({
            isPremium: result.data.is_premium,
            currentPlan: result.data.current_plan,
          })
        }
      },

      // Start realtime premium sync
      startPremiumSync: () => {
        const channel = subscribeToPremiumChanges((premiumState) => {
          set({
            isPremium: premiumState.is_premium,
            currentPlan: premiumState.current_plan,
          })
        })

        // Store channel for cleanup (could be added to state if needed)
        return channel
      },

      logout: () => {
        set({
          profile: null,
          isAuthenticated: false,
          echoStatus: 'SILENCE',
          daysUntilExpiration: 0,
          isActive: false,
          premiumStatus: null,
          isPremium: false,
          currentPlan: 'free',
        })
      },
    }),
    {
      name: 'echo-user-storage',
      partialize: (state) => ({
        profile: state.profile,
        isAuthenticated: state.isAuthenticated,
        isPremium: state.isPremium,
        currentPlan: state.currentPlan,
      }),
    }
  )
)

// Initialize demo profile for testing
export const initializeDemoProfile = () => {
  const store = useUserStore.getState()
  if (!store.profile) {
    // Create a demo profile with photo taken 5 days ago (expiring soon)
    const demoProfile = createGuestProfile()
    demoProfile.firstName = 'Alex'
    demoProfile.age = 28
    demoProfile.bio = 'Passionné de voyages et de musique 🎵'
    demoProfile.interests = ['Voyages', 'Musique', 'Photo', 'Cinéma']
    demoProfile.lastPhotoAt = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
    demoProfile.photoUrl = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop'

    store.setProfile(demoProfile)
  }
}
