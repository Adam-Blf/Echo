import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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

  // Blocked users
  blockedUsers: BlockedUser[]

  // Actions
  updateNotification: (key: keyof NotificationSettings, value: boolean) => void
  updatePrivacy: <K extends keyof PrivacySettings>(key: K, value: PrivacySettings[K]) => void
  blockUser: (user: Omit<BlockedUser, 'blockedAt'>) => void
  unblockUser: (userId: string) => void
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
    (set) => ({
      notifications: defaultNotifications,
      privacy: defaultPrivacy,
      blockedUsers: [],

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

      blockUser: (user) => {
        set((state) => ({
          blockedUsers: [
            ...state.blockedUsers,
            { ...user, blockedAt: new Date() },
          ],
        }))
      },

      unblockUser: (userId) => {
        set((state) => ({
          blockedUsers: state.blockedUsers.filter((u) => u.id !== userId),
        }))
      },

      resetSettings: () => {
        set({
          notifications: defaultNotifications,
          privacy: defaultPrivacy,
          blockedUsers: [],
        })
      },
    }),
    {
      name: 'echo-settings-storage',
    }
  )
)
