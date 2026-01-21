import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  blockUser as blockUserService,
  unblockUser as unblockUserService,
  getBlockedUsers,
  isUserBlocked,
} from '@/services/blockService'

export interface NotificationSettings {
  newMatches: boolean
  newMessages: boolean
  likesReceived: boolean
  activityReminders: boolean
  marketingEmails: boolean
  pushNotifications: boolean
}

export interface PrivacySettings {
  invisibleMode: boolean
  showDistance: boolean
  showOnlineStatus: boolean
  whoCanSeeMe: 'everyone' | 'preferences_only'
}

export interface BlockedUser {
  id: string
  firstName: string
  photoUrl?: string
  blockedAt: Date
}

interface SettingsState {
  // Notification settings
  notifications: NotificationSettings

  // Privacy settings
  privacy: PrivacySettings

  // Blocked users (local cache)
  blockedUsers: BlockedUser[]
  blockedUserIds: string[]

  // Loading states
  isLoadingBlocks: boolean

  // Actions
  updateNotification: (key: keyof NotificationSettings, value: boolean) => void
  updatePrivacy: <K extends keyof PrivacySettings>(key: K, value: PrivacySettings[K]) => void

  // Block operations with Supabase sync
  blockUser: (user: Omit<BlockedUser, 'blockedAt'>) => Promise<{ success: boolean; error?: string }>
  unblockUser: (userId: string) => Promise<{ success: boolean; error?: string }>
  checkIfBlocked: (userId: string) => Promise<boolean>
  syncBlockedUsers: () => Promise<void>

  resetSettings: () => void
}

const defaultNotifications: NotificationSettings = {
  newMatches: true,
  newMessages: true,
  likesReceived: true,
  activityReminders: true,
  marketingEmails: false,
  pushNotifications: true,
}

const defaultPrivacy: PrivacySettings = {
  invisibleMode: false,
  showDistance: true,
  showOnlineStatus: true,
  whoCanSeeMe: 'everyone',
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      notifications: defaultNotifications,
      privacy: defaultPrivacy,
      blockedUsers: [],
      blockedUserIds: [],
      isLoadingBlocks: false,

      updateNotification: (key, value) => {
        set((state) => ({
          notifications: { ...state.notifications, [key]: value },
        }))
      },

      updatePrivacy: (key, value) => {
        set((state) => ({
          privacy: { ...state.privacy, [key]: value },
        }))
      },

      // Block user with Supabase sync
      blockUser: async (user) => {
        const result = await blockUserService(user.id)

        if (result.error) {
          return { success: false, error: result.error }
        }

        // Update local state
        set((state) => ({
          blockedUsers: [
            ...state.blockedUsers,
            { ...user, blockedAt: new Date() },
          ],
          blockedUserIds: [...state.blockedUserIds, user.id],
        }))

        return { success: true }
      },

      // Unblock user with Supabase sync
      unblockUser: async (userId) => {
        const result = await unblockUserService(userId)

        if (result.error) {
          return { success: false, error: result.error }
        }

        // Update local state
        set((state) => ({
          blockedUsers: state.blockedUsers.filter((u) => u.id !== userId),
          blockedUserIds: state.blockedUserIds.filter((id) => id !== userId),
        }))

        return { success: true }
      },

      // Check if user is blocked
      checkIfBlocked: async (userId) => {
        const { blockedUserIds } = get()

        // Check local cache first
        if (blockedUserIds.includes(userId)) return true

        // Verify with backend
        return await isUserBlocked(userId)
      },

      // Sync blocked users from Supabase
      syncBlockedUsers: async () => {
        set({ isLoadingBlocks: true })

        const result = await getBlockedUsers()

        if (result.data) {
          set({
            blockedUserIds: result.data,
            isLoadingBlocks: false,
          })
        } else {
          set({ isLoadingBlocks: false })
        }
      },

      resetSettings: () => {
        set({
          notifications: defaultNotifications,
          privacy: defaultPrivacy,
          blockedUsers: [],
          blockedUserIds: [],
        })
      },
    }),
    {
      name: 'echo-settings-storage',
      partialize: (state) => ({
        notifications: state.notifications,
        privacy: state.privacy,
        blockedUsers: state.blockedUsers,
        blockedUserIds: state.blockedUserIds,
      }),
    }
  )
)
