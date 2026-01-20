import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { OnboardingStep, OnboardingFormData, PhotoData } from '@/types/onboarding'

interface OnboardingState {
  // Current step
  step: OnboardingStep
  setStep: (step: OnboardingStep) => void

  // Form data
  formData: Partial<OnboardingFormData>
  updateFormData: (data: Partial<OnboardingFormData>) => void

  // Photo
  photo: PhotoData | null
  setPhoto: (photo: PhotoData | null) => void

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
  formData: {},
  photo: null,
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

      setPhoto: (photo) => set({ photo }),

      setIsUploading: (isUploading) => set({ isUploading }),

      setWingmanCode: (wingmanCode) => set({ wingmanCode }),

      reset: () => set(initialState),
    }),
    {
      name: 'echo-onboarding',
      partialize: (state) => ({
        step: state.step,
        // Don't persist password for security
        formData: {
          ...state.formData,
          password: undefined,
        },
        wingmanCode: state.wingmanCode,
      }),
    }
  )
)
