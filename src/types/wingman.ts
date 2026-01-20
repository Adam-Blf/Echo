// Wingman validation status
export type WingmanStatus = 'pending' | 'completed' | 'expired'

// Wingman invite data
export interface WingmanInvite {
  token: string
  oderId: string
  createdAt: Date
  expiresAt: Date // 7 days
  status: WingmanStatus
}

// Wingman validation payload
export interface WingmanPayload {
  // Qualities and flaws
  qualities: string[]
  flaws: string[]

  // Voice testimonial
  audioBlob?: Blob
  audioUrl?: string
  audioDuration?: number

  // Written testimonial
  testimonial: string

  // Relationship
  relationship: 'friend' | 'bestfriend' | 'family' | 'colleague' | 'other'
  knowsSince: string // e.g., "2 ans"

  // Metadata
  submittedAt: Date
}

// Predefined qualities
export const QUALITIES = [
  'Drôle', 'Attentionné(e)', 'Généreux(se)', 'Honnête', 'Loyal(e)',
  'Aventurier(ère)', 'Créatif(ve)', 'Intelligent(e)', 'Passionné(e)', 'Calme',
  'Optimiste', 'Courageux(se)', 'Empathique', 'Spontané(e)', 'Fiable'
] as const

// Predefined flaws (fun/light ones)
export const FLAWS = [
  'Toujours en retard', 'Accro au café', 'Trop bavard(e)', 'Têtu(e)',
  'Perfectionniste', 'Distrait(e)', 'Impatient(e)', 'Indécis(e)',
  'Accro au téléphone', 'Ronfleur(se)', 'Mauvais(e) cuisinier(ère)', 'Workaholic'
] as const

// User profile preview for Wingman page
export interface UserPreview {
  firstName: string
  age: number
  photoUrl: string
}
