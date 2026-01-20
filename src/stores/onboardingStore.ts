import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { OnboardingStep, OnboardingFormData, PhotoData, Gender, Preference } from '@/types/onboarding'

interface OnboardingFormState extends Partial<Omit<OnboardingFormData, 'birthDate'>> {
  birthDate?: Date
  gender?: Gender
  preference?: Preference
}

interface OnboardingState {
  // Current step
  step: OnboardingStep
  setStep: (step: OnboardingStep) => void

  // Form data
  formData: OnboardingFormState
  updateFormData: (data: Partial<OnboardingFormState>) => void

  // Photos (up to 5)
  photos: PhotoData[]
  addPhoto: (photo: PhotoData) => void
  removePhoto: (index: number) => void
  reorderPhotos: (fromIndex: number, toIndex: number) => void
  clearPhotos: () => void

  // Loading states
  isUploading: boolean
  setIsUploading: (isUploading: boolean) => void

  // Wingman
  wingmanCode: string | null
  setWingmanCode: (code: string | null) => void

  // Reset
  reset: () => void
}

const initialState = {
  step: 'welcome' as OnboardingStep,
  formData: {} as OnboardingFormState,
  photos: [] as PhotoData[],
  isUploading: false,
  wingmanCode: null,
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      ...initialState,

      setStep: (step) => set({ step }),

      updateFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data },
        })),

      addPhoto: (photo) =>
        set((state) => ({
          photos: state.photos.length < 5 ? [...state.photos, photo] : state.photos,
        })),

      removePhoto: (index) =>
        set((state) => ({
          photos: state.photos.filter((_, i) => i !== index),
        })),

      reorderPhotos: (fromIndex, toIndex) =>
        set((state) => {
          const newPhotos = [...state.photos]
          const [removed] = newPhotos.splice(fromIndex, 1)
          newPhotos.splice(toIndex, 0, removed)
          return { photos: newPhotos }
        }),

      clearPhotos: () => set({ photos: [] }),

      setIsUploading: (isUploading) => set({ isUploading }),

      setWingmanCode: (wingmanCode) => set({ wingmanCode }),

      reset: () => set(initialState),
    }),
    {
      name: 'echo-onboarding',
      partialize: (state) => ({
        step: state.step,
        // Don't persist password or sensitive data
        formData: {
          firstName: state.formData.firstName,
          bio: state.formData.bio,
          gender: state.formData.gender,
          preference: state.formData.preference,
          interests: state.formData.interests,
          // Don't persist: email, password, birthDate
        },
        wingmanCode: state.wingmanCode,
      }),
    }
  )
)
