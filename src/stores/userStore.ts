import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserProfile, EchoStatus } from '@/types/user'
import { getEchoStatus, getDaysUntilExpiration, isProfileActive } from '@/types/user'

interface UserState {
  // Current user profile
  profile: UserProfile | null
  isAuthenticated: boolean

  // Computed properties
  echoStatus: EchoStatus
  daysUntilExpiration: number
  isActive: boolean

  // Actions
  setProfile: (profile: UserProfile) => void
  updatePhoto: (photoUrl: string) => void
  updateProfile: (updates: Partial<UserProfile>) => void
  setWingmanValidation: (quote: string, qualities: string[], flaws: string[]) => void
  refreshEchoStatus: () => void
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

      logout: () => {
        set({
          profile: null,
          isAuthenticated: false,
          echoStatus: 'SILENCE',
          daysUntilExpiration: 0,
          isActive: false,
        })
      },
    }),
    {
      name: 'echo-user-storage',
      partialize: (state) => ({
        profile: state.profile,
        isAuthenticated: state.isAuthenticated,
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
