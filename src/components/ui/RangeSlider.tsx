import { useRef, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface RangeSliderProps {
  /** Minimum value of the range */
  min: number
  /** Maximum value of the range */
  max: number
  /** Current values [min, max] */
  value: [number, number]
  /** Callback when range changes */
  onChange: (value: [number, number]) => void
  /** Unit label (e.g., 'ans', 'km') */
  unit?: string
  /** Step increment */
  step?: number
  /** Disable the slider */
  disabled?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * Double Range Slider Component
 * Allows users to select a value range with two draggable thumbs
 * Features gradient track, accessible labels, and neon styling
 */
export function RangeSlider({
  min,
  max,
  value,
  onChange,
  unit = '',
  step = 1,
  disabled = false,
  className,
}: RangeSliderProps) {
  const [minVal, maxVal] = value
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null)
  const minThumbRef = useRef<HTMLDivElement>(null)
  const maxThumbRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  // Calculate percentage for positioning
  const getPercent = (val: number) => ((val - min) / (max - min)) * 100

  // Handle mouse down on thumbs
  const handleMouseDown = (thumb: 'min' | 'max') => (e: React.MouseEvent) => {
    if (disabled) return
    setIsDragging(thumb)
    e.preventDefault()
  }

  // Handle touch down on thumbs
  const handleTouchStart = (thumb: 'min' | 'max') => (e: React.TouchEvent) => {
    if (disabled) return
    setIsDragging(thumb)
    e.preventDefault()
  }

  // Handle mouse/touch move
  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !trackRef.current) return

      const rect = trackRef.current.getBoundingClientRect()
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      let newVal = Math.round((percent * (max - min) + min) / step) * step

      newVal = Math.max(min, Math.min(max, newVal))

      if (isDragging === 'min') {
        const newMin = Math.min(newVal, maxVal)
        onChange([newMin, maxVal])
      } else {
        const newMax = Math.max(newVal, minVal)
        onChange([minVal, newMax])
      }
    }

    const handleUp = () => setIsDragging(null)

    if (isDragging) {
      document.addEventListener('mousemove', handleMove)
      document.addEventListener('touchmove', handleMove)
      document.addEventListener('mouseup', handleUp)
      document.addEventListener('touchend', handleUp)

      return () => {
        document.removeEventListener('mousemove', handleMove)
        document.removeEventListener('touchmove', handleMove)
        document.removeEventListener('mouseup', handleUp)
        document.removeEventListener('touchend', handleUp)
      }
    }
  }, [isDragging, minVal, maxVal, min, max, step, onChange])

  const minPercent = getPercent(minVal)
  const maxPercent = getPercent(maxVal)

  return (
    <div className={cn('w-full', className)}>
      {/* Labels above thumbs */}
      <div className="mb-6 flex justify-between px-1">
        <div className="flex flex-col items-start">
          <span className="text-xs text-white/60 uppercase tracking-wide">Min</span>
          <span className="text-sm font-semibold text-neon-cyan">
            {minVal} {unit}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-white/60 uppercase tracking-wide">Max</span>
          <span className="text-sm font-semibold text-neon-purple">
            {maxVal} {unit}
          </span>
        </div>
      </div>

      {/* Track container */}
      <div className="relative h-12 w-full">
        {/* Base track */}
        <div
          ref={trackRef}
          className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-white/10"
          role="presentation"
        />

        {/* Gradient fill between min and max */}
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple"
          style={{
            left: `${minPercent}%`,
            right: `${100 - maxPercent}%`,
            boxShadow:
              '0 0 10px rgba(0, 245, 255, 0.5), 0 0 20px rgba(191, 0, 255, 0.3)',
          }}
          role="presentation"
        />

        {/* Min thumb */}
        <div
          ref={minThumbRef}
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-label={`Minimum ${unit}`}
          aria-valuemin={min}
          aria-valuemax={maxVal}
          aria-valuenow={minVal}
          onMouseDown={handleMouseDown('min')}
          onTouchStart={handleTouchStart('min')}
          className={cn(
            'absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full',
            'bg-neon-cyan shadow-lg cursor-pointer transition-all',
            'hover:w-7 hover:h-7 hover:shadow-xl',
            isDragging === 'min' && 'ring-4 ring-neon-cyan/50',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          style={{
            left: `${minPercent}%`,
            boxShadow: isDragging === 'min'
              ? '0 0 20px rgba(0, 245, 255, 1), 0 0 40px rgba(0, 245, 255, 0.6)'
              : '0 0 10px rgba(0, 245, 255, 0.6)',
          }}
        />

        {/* Max thumb */}
        <div
          ref={maxThumbRef}
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-label={`Maximum ${unit}`}
          aria-valuemin={minVal}
          aria-valuemax={max}
          aria-valuenow={maxVal}
          onMouseDown={handleMouseDown('max')}
          onTouchStart={handleTouchStart('max')}
          className={cn(
            'absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full',
            'bg-neon-purple shadow-lg cursor-pointer transition-all',
            'hover:w-7 hover:h-7 hover:shadow-xl',
            isDragging === 'max' && 'ring-4 ring-neon-purple/50',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          style={{
            left: `${maxPercent}%`,
            boxShadow: isDragging === 'max'
              ? '0 0 20px rgba(191, 0, 255, 1), 0 0 40px rgba(191, 0, 255, 0.6)'
              : '0 0 10px rgba(191, 0, 255, 0.6)',
          }}
        />
      </div>

      {/* Range display */}
      <div className="mt-4 flex justify-center">
        <span className="text-center text-sm font-medium text-white/80">
          <span className="text-neon-cyan">{minVal}</span>
          <span className="mx-2 text-white/40">—</span>
          <span className="text-neon-purple">{maxVal}</span>
          {unit && <span className="ml-1 text-white/60">{unit}</span>}
        </span>
      </div>
    </div>
  )
}
