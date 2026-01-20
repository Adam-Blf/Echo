// User profile status based on Echo TTL
export type EchoStatus = 'ACTIVE' | 'EXPIRING' | 'SILENCE'

// Full user profile
export interface UserProfile {
  id: string
  firstName: string
  age: number
  bio?: string
  interests: string[]
  photoUrl: string

  // Echo TTL system
  lastPhotoAt: Date
  echoStatus: EchoStatus

  // Wingman validation
  isValidated: boolean
  wingmanQuote?: string
  wingmanQualities?: string[]
  wingmanFlaws?: string[]

  // Location
  latitude?: number
  longitude?: number

  // Settings
  notificationsEnabled: boolean
  language: 'fr' | 'en'

  // Timestamps
  createdAt: Date
  updatedAt: Date
}

// Echo TTL configuration
export const ECHO_TTL = {
  ACTIVE_DAYS: 7,        // Photo valid for 7 days
  WARNING_DAYS: 1,       // Warning 24h before expiration
  GRACE_PERIOD_HOURS: 24 // Grace period after expiration
} as const

// Calculate Echo status from lastPhotoAt
export function getEchoStatus(lastPhotoAt: Date): EchoStatus {
  const now = new Date()
  const diffMs = now.getTime() - lastPhotoAt.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)

  if (diffDays < ECHO_TTL.ACTIVE_DAYS - ECHO_TTL.WARNING_DAYS) {
    return 'ACTIVE'
  } else if (diffDays < ECHO_TTL.ACTIVE_DAYS) {
    return 'EXPIRING'
  } else {
    return 'SILENCE'
  }
}

// Get days until expiration
export function getDaysUntilExpiration(lastPhotoAt: Date): number {
  const now = new Date()
  const expirationDate = new Date(lastPhotoAt)
  expirationDate.setDate(expirationDate.getDate() + ECHO_TTL.ACTIVE_DAYS)

  const diffMs = expirationDate.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
}

// Check if profile is active (visible in discovery)
export function isProfileActive(lastPhotoAt: Date): boolean {
  return getEchoStatus(lastPhotoAt) !== 'SILENCE'
}
