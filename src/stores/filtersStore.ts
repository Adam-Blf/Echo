import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type GenderPreference = 'men' | 'women' | 'everyone'

export interface FiltersState {
  // Filter values
  ageRange: [number, number]
  maxDistance: number
  genderPreference: GenderPreference

  // Actions
  setFilters: (filters: Partial<Pick<FiltersState, 'ageRange' | 'maxDistance' | 'genderPreference'>>) => void
  setAgeRange: (range: [number, number]) => void
  setMaxDistance: (distance: number) => void
  setGenderPreference: (preference: GenderPreference) => void
  resetFilters: () => void
}

const DEFAULT_FILTERS = {
  ageRange: [18, 40] as [number, number],
  maxDistance: 50,
  genderPreference: 'everyone' as GenderPreference,
}

export const useFiltersStore = create<FiltersState>()(
  persist(
    (set) => ({
      ...DEFAULT_FILTERS,

      setFilters: (filters) => {
        set((state) => ({
          ...state,
          ...filters,
        }))
      },

      setAgeRange: (range) => {
        set({ ageRange: range })
      },

      setMaxDistance: (distance) => {
        set({ maxDistance: Math.max(1, Math.min(100, distance)) })
      },

      setGenderPreference: (preference) => {
        set({ genderPreference: preference })
      },

      resetFilters: () => {
        set(DEFAULT_FILTERS)
      },
    }),
    {
      name: 'echo-filters-storage',
      // Serialize/deserialize the tuple properly
      partialize: (state) => ({
        ageRange: state.ageRange,
        maxDistance: state.maxDistance,
        genderPreference: state.genderPreference,
      }),
    }
  )
)
