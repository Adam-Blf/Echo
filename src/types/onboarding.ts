import { z } from 'zod'

// Onboarding form schema
export const onboardingSchema = z.object({
  firstName: z
    .string()
    .min(2, 'Minimum 2 caractères')
    .max(30, 'Maximum 30 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s-]+$/, 'Caractères invalides'),
  age: z
    .number()
    .min(18, 'Tu dois avoir au moins 18 ans')
    .max(99, 'Âge invalide'),
  bio: z
    .string()
    .min(10, 'Minimum 10 caractères')
    .max(300, 'Maximum 300 caractères')
    .optional(),
  interests: z
    .array(z.string())
    .min(1, 'Sélectionne au moins un intérêt')
    .max(5, 'Maximum 5 intérêts'),
})

export type OnboardingFormData = z.infer<typeof onboardingSchema>

// Onboarding step type
export type OnboardingStep = 'welcome' | 'photo' | 'info' | 'interests' | 'wingman'

// User profile status
export type ProfileStatus = 'INCOMPLETE' | 'PENDING_WINGMAN' | 'ACTIVE' | 'SILENCE'

// Photo data
export interface PhotoData {
  blob: Blob
  url: string
  timestamp: number
}
