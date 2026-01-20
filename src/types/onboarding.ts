import { z } from 'zod'

// Gender type
export type Gender = 'male' | 'female' | 'non-binary'

// Attraction preferences
export type Preference = 'men' | 'women' | 'everyone'

// Calculate age from birthdate
function isAtLeast18(date: Date): boolean {
  const today = new Date()
  const age = today.getFullYear() - date.getFullYear()
  const monthDiff = today.getMonth() - date.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    return age - 1 >= 18
  }
  return age >= 18
}

// Onboarding form schema
export const onboardingSchema = z.object({
  email: z
    .string()
    .email('Email invalide'),
  password: z
    .string()
    .min(6, 'Minimum 6 caractères'),
  firstName: z
    .string()
    .min(2, 'Minimum 2 caractères')
    .max(30, 'Maximum 30 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s-]+$/, 'Caractères invalides'),
  birthDate: z
    .date()
    .refine(isAtLeast18, 'Tu dois avoir au moins 18 ans'),
  gender: z
    .enum(['male', 'female', 'non-binary']),
  preference: z
    .enum(['men', 'women', 'everyone']),
  bio: z
    .string()
    .max(300, 'Maximum 300 caractères')
    .optional()
    .or(z.literal('')),
  interests: z
    .array(z.string())
    .min(1, 'Sélectionne au moins un intérêt')
    .max(5, 'Maximum 5 intérêts'),
})

export type OnboardingFormData = z.infer<typeof onboardingSchema>

// Onboarding step type
export type OnboardingStep = 'welcome' | 'photo' | 'birthdate' | 'gender' | 'preference' | 'info' | 'interests' | 'wingman'

// User profile status
export type ProfileStatus = 'INCOMPLETE' | 'PENDING_WINGMAN' | 'ACTIVE' | 'SILENCE'

// Photo data
export interface PhotoData {
  blob: Blob
  url: string
  timestamp: number
}

// Multiple photos support
export interface PhotosData {
  photos: PhotoData[]
  maxPhotos: 5
}
