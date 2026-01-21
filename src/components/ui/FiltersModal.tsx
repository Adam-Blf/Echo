import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, RotateCcw, Check, Users, MapPin, Calendar } from 'lucide-react'
import { useFiltersStore } from '@/stores/filtersStore'
import { cn } from '@/lib/utils'

interface FiltersModalProps {
  isOpen: boolean
  onClose: () => void
}

type GenderPreference = 'men' | 'women' | 'everyone'

const genderOptions: { value: GenderPreference; label: string; icon: string }[] = [
  { value: 'men', label: 'Hommes', icon: '♂' },
  { value: 'women', label: 'Femmes', icon: '♀' },
  { value: 'everyone', label: 'Tout le monde', icon: '⚥' },
]

// Custom double range slider component
interface RangeSliderProps {
  min: number
  max: number
  value: [number, number]
  onChange: (value: [number, number]) => void
  step?: number
  formatValue?: (value: number) => string
}

function RangeSlider({ min, max, value, onChange, step = 1, formatValue }: RangeSliderProps) {
  const [localValue, setLocalValue] = useState(value)
  const [activeThumb, setActiveThumb] = useState<'min' | 'max' | null>(null)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const getPercentage = (val: number) => ((val - min) / (max - min)) * 100

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Math.min(Number(e.target.value), localValue[1] - step)
    const newValue: [number, number] = [newMin, localValue[1]]
    setLocalValue(newValue)
    onChange(newValue)
  }

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Math.max(Number(e.target.value), localValue[0] + step)
    const newValue: [number, number] = [localValue[0], newMax]
    setLocalValue(newValue)
    onChange(newValue)
  }

  const format = formatValue || ((v) => v.toString())

  return (
    <div className="relative pt-2 pb-6">
      {/* Track background */}
      <div className="relative h-2 bg-white/10 rounded-full">
        {/* Active track */}
        <div
          className="absolute h-full bg-gradient-to-r from-neon-cyan to-neon-purple rounded-full"
          style={{
            left: `${getPercentage(localValue[0])}%`,
            width: `${getPercentage(localValue[1]) - getPercentage(localValue[0])}%`,
          }}
        />
      </div>

      {/* Value labels */}
      <div className="absolute -top-1 flex items-center justify-between w-full pointer-events-none">
        <motion.div
          className="absolute -translate-x-1/2 -translate-y-full"
          style={{ left: `${getPercentage(localValue[0])}%` }}
          animate={{ scale: activeThumb === 'min' ? 1.1 : 1 }}
        >
          <span className="px-2 py-1 rounded-lg bg-surface-elevated text-xs font-semibold text-white border border-white/10">
            {format(localValue[0])}
          </span>
        </motion.div>
        <motion.div
          className="absolute -translate-x-1/2 -translate-y-full"
          style={{ left: `${getPercentage(localValue[1])}%` }}
          animate={{ scale: activeThumb === 'max' ? 1.1 : 1 }}
        >
          <span className="px-2 py-1 rounded-lg bg-surface-elevated text-xs font-semibold text-white border border-white/10">
            {format(localValue[1])}
          </span>
        </motion.div>
      </div>

      {/* Hidden range inputs for accessibility */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={localValue[0]}
        onChange={handleMinChange}
        onFocus={() => setActiveThumb('min')}
        onBlur={() => setActiveThumb(null)}
        className="absolute w-full h-2 opacity-0 cursor-pointer z-10"
        style={{ pointerEvents: 'auto' }}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={localValue[1]}
        onChange={handleMaxChange}
        onFocus={() => setActiveThumb('max')}
        onBlur={() => setActiveThumb(null)}
        className="absolute w-full h-2 opacity-0 cursor-pointer z-10"
        style={{ pointerEvents: 'auto' }}
      />

      {/* Visual thumbs */}
      <motion.div
        className="absolute top-0 w-5 h-5 -translate-x-1/2 -translate-y-1/4 rounded-full bg-white shadow-lg border-2 border-neon-cyan cursor-pointer"
        style={{ left: `${getPercentage(localValue[0])}%` }}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
      />
      <motion.div
        className="absolute top-0 w-5 h-5 -translate-x-1/2 -translate-y-1/4 rounded-full bg-white shadow-lg border-2 border-neon-purple cursor-pointer"
        style={{ left: `${getPercentage(localValue[1])}%` }}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
      />
    </div>
  )
}

// Single slider component
interface SingleSliderProps {
  min: number
  max: number
  value: number
  onChange: (value: number) => void
  step?: number
  formatValue?: (value: number) => string
}

function SingleSlider({ min, max, value, onChange, step = 1, formatValue }: SingleSliderProps) {
  const getPercentage = (val: number) => ((val - min) / (max - min)) * 100
  const format = formatValue || ((v) => v.toString())

  return (
    <div className="relative pt-2 pb-6">
      {/* Track background */}
      <div className="relative h-2 bg-white/10 rounded-full">
        {/* Active track */}
        <div
          className="absolute h-full bg-gradient-to-r from-neon-cyan to-neon-purple rounded-full"
          style={{ width: `${getPercentage(value)}%` }}
        />
      </div>

      {/* Value label */}
      <motion.div
        className="absolute -top-1 -translate-x-1/2 -translate-y-full pointer-events-none"
        style={{ left: `${getPercentage(value)}%` }}
      >
        <span className="px-2 py-1 rounded-lg bg-surface-elevated text-xs font-semibold text-white border border-white/10">
          {format(value)}
        </span>
      </motion.div>

      {/* Range input */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="absolute w-full h-2 opacity-0 cursor-pointer z-10"
      />

      {/* Visual thumb */}
      <motion.div
        className="absolute top-0 w-5 h-5 -translate-x-1/2 -translate-y-1/4 rounded-full bg-white shadow-lg border-2 border-neon-cyan cursor-pointer"
        style={{ left: `${getPercentage(value)}%` }}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
      />
    </div>
  )
}

export function FiltersModal({ isOpen, onClose }: FiltersModalProps) {
  const { ageRange, maxDistance, genderPreference, setFilters, resetFilters } = useFiltersStore()

  const [localAgeRange, setLocalAgeRange] = useState<[number, number]>(ageRange)
  const [localDistance, setLocalDistance] = useState(maxDistance)
  const [localGender, setLocalGender] = useState<GenderPreference>(genderPreference)

  // Sync local state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalAgeRange(ageRange)
      setLocalDistance(maxDistance)
      setLocalGender(genderPreference)
    }
  }, [isOpen, ageRange, maxDistance, genderPreference])

  const handleApply = useCallback(() => {
    setFilters({
      ageRange: localAgeRange,
      maxDistance: localDistance,
      genderPreference: localGender,
    })
    onClose()
  }, [localAgeRange, localDistance, localGender, setFilters, onClose])

  const handleReset = useCallback(() => {
    resetFilters()
    setLocalAgeRange([18, 40])
    setLocalDistance(50)
    setLocalGender('everyone')
  }, [resetFilters])

  const hasChanges =
    localAgeRange[0] !== ageRange[0] ||
    localAgeRange[1] !== ageRange[1] ||
    localDistance !== maxDistance ||
    localGender !== genderPreference

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-h-[85vh] bg-surface-elevated rounded-t-3xl border-t border-white/10 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-surface-elevated/90 backdrop-blur-xl border-b border-white/5 p-4 flex items-center justify-between">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="text-sm font-medium">Reset</span>
              </button>
              <h3 className="text-lg font-bold text-white">Filtres</h3>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8 overflow-y-auto max-h-[calc(85vh-160px)]">
              {/* Age Range */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-neon-cyan" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">Tranche d'age</h4>
                    <p className="text-white/40 text-sm">
                      {localAgeRange[0]} - {localAgeRange[1]} ans
                    </p>
                  </div>
                </div>
                <div className="px-2">
                  <RangeSlider
                    min={18}
                    max={99}
                    value={localAgeRange}
                    onChange={setLocalAgeRange}
                    formatValue={(v) => `${v}`}
                  />
                </div>
                <div className="flex justify-between text-xs text-white/30 mt-1 px-1">
                  <span>18 ans</span>
                  <span>99 ans</span>
                </div>
              </motion.div>

              {/* Distance */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-neon-purple" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">Distance maximale</h4>
                    <p className="text-white/40 text-sm">{localDistance} km</p>
                  </div>
                </div>
                <div className="px-2">
                  <SingleSlider
                    min={1}
                    max={100}
                    value={localDistance}
                    onChange={setLocalDistance}
                    formatValue={(v) => `${v} km`}
                  />
                </div>
                <div className="flex justify-between text-xs text-white/30 mt-1 px-1">
                  <span>1 km</span>
                  <span>100 km</span>
                </div>
              </motion.div>

              {/* Gender Preference */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-neon-cyan" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">Je recherche</h4>
                    <p className="text-white/40 text-sm">Qui souhaitez-vous rencontrer ?</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {genderOptions.map((option) => (
                    <motion.button
                      key={option.value}
                      onClick={() => setLocalGender(option.value)}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        'relative p-4 rounded-2xl border transition-all duration-200',
                        localGender === option.value
                          ? 'bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 border-neon-cyan/50'
                          : 'bg-surface-card border-white/10 hover:border-white/20'
                      )}
                    >
                      {localGender === option.value && (
                        <motion.div
                          layoutId="gender-selected"
                          className="absolute inset-0 bg-gradient-to-br from-neon-cyan/10 to-neon-purple/10 rounded-2xl"
                          initial={false}
                          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <div className="relative">
                        <span className="text-2xl mb-2 block">{option.icon}</span>
                        <span
                          className={cn(
                            'text-sm font-medium',
                            localGender === option.value ? 'text-white' : 'text-white/60'
                          )}
                        >
                          {option.label}
                        </span>
                      </div>
                      {localGender === option.value && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 right-2 w-5 h-5 rounded-full bg-neon-cyan flex items-center justify-center"
                        >
                          <Check className="w-3 h-3 text-black" />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Footer with Apply Button */}
            <div className="sticky bottom-0 p-4 bg-surface-elevated/90 backdrop-blur-xl border-t border-white/5 safe-bottom">
              <motion.button
                onClick={handleApply}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'w-full h-14 rounded-2xl font-semibold text-lg transition-all duration-200',
                  hasChanges
                    ? 'bg-gradient-to-r from-neon-cyan to-neon-purple text-white shadow-lg shadow-neon-purple/20'
                    : 'bg-white/10 text-white/50'
                )}
              >
                Appliquer les filtres
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
