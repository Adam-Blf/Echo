import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Camera,
  ImagePlus,
  X,
  GripVertical,
  Save,
  Check,
  Loader2,
  ChevronDown,
  Briefcase,
  GraduationCap,
  Ruler,
  Cigarette,
  Wine,
  Dumbbell,
  Heart,
  MapPin,
  User
} from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useUserStore } from '@/stores'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

// Constants
const INTERESTS = [
  'Musique', 'Sport', 'Voyage', 'Cinema', 'Cuisine',
  'Art', 'Tech', 'Nature', 'Gaming', 'Lecture',
  'Danse', 'Photo', 'Mode', 'Fitness', 'Animaux'
]

const MAX_BIO_LENGTH = 500
const MAX_PHOTOS = 6
const MAX_INTERESTS = 5

const HEIGHTS = Array.from({ length: 61 }, (_, i) => 150 + i) // 150-210 cm

const LIFESTYLE_OPTIONS = {
  smoking: [
    { value: 'never', label: 'Jamais' },
    { value: 'occasionally', label: 'Occasionnellement' },
    { value: 'regularly', label: 'Regulierement' }
  ],
  drinking: [
    { value: 'never', label: 'Jamais' },
    { value: 'socially', label: 'En soiree' },
    { value: 'regularly', label: 'Regulierement' }
  ],
  sport: [
    { value: 'never', label: 'Jamais' },
    { value: 'sometimes', label: 'Parfois' },
    { value: 'regularly', label: 'Regulierement' },
    { value: 'daily', label: 'Tous les jours' }
  ]
}

const GENDER_OPTIONS = [
  { value: 'male', label: 'Homme' },
  { value: 'female', label: 'Femme' },
  { value: 'non-binary', label: 'Non-binaire' }
]

const LOOKING_FOR_OPTIONS = [
  { value: 'men', label: 'Hommes' },
  { value: 'women', label: 'Femmes' },
  { value: 'everyone', label: 'Tout le monde' }
]

// Photo item interface
interface PhotoItem {
  id: string
  url: string
  file?: File
}

// Sortable photo component
function SortablePhoto({ photo, onRemove }: { photo: PhotoItem; onRemove: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: photo.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={cn(
        'relative aspect-[3/4] rounded-2xl overflow-hidden group',
        isDragging && 'ring-2 ring-neon-purple shadow-lg shadow-neon-purple/30'
      )}
    >
      <img
        src={photo.url}
        alt="Photo de profil"
        className="w-full h-full object-cover"
      />

      {/* Drag handle overlay */}
      <div
        {...attributes}
        {...listeners}
        className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing flex items-end justify-center pb-3"
      >
        <GripVertical className="w-6 h-6 text-white/80" />
      </div>

      {/* Remove button */}
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:scale-110"
      >
        <X className="w-4 h-4 text-white" />
      </button>

      {/* Main photo badge */}
      {photo.id === '1' && (
        <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-neon-purple/80 backdrop-blur-sm">
          <span className="text-xs text-white font-medium">Principale</span>
        </div>
      )}
    </motion.div>
  )
}

// Empty photo slot component
function EmptyPhotoSlot({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'aspect-[3/4] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all',
        disabled
          ? 'border-white/10 bg-black/20 cursor-not-allowed'
          : 'border-white/20 bg-black/30 hover:border-neon-cyan/50 hover:bg-neon-cyan/5'
      )}
    >
      <ImagePlus className={cn('w-8 h-8', disabled ? 'text-white/20' : 'text-white/40')} />
    </button>
  )
}

// Range slider component
function RangeSlider({
  label,
  value,
  onChange,
  min,
  max,
  unit = '',
  formatValue
}: {
  label: string
  value: [number, number] | number
  onChange: (value: [number, number] | number) => void
  min: number
  max: number
  unit?: string
  formatValue?: (val: number) => string
}) {
  const isRange = Array.isArray(value)
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const displayValue = (val: number) => {
    if (formatValue) return formatValue(val)
    return `${val}${unit}`
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-white/60 text-sm">{label}</span>
        <span className="text-white font-medium text-sm">
          {isRange
            ? `${displayValue((localValue as [number, number])[0])} - ${displayValue((localValue as [number, number])[1])}`
            : displayValue(localValue as number)}
        </span>
      </div>

      {isRange ? (
        <div className="relative pt-1">
          <div className="h-2 bg-white/10 rounded-full">
            <div
              className="absolute h-2 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-full"
              style={{
                left: `${((localValue as [number, number])[0] - min) / (max - min) * 100}%`,
                right: `${100 - ((localValue as [number, number])[1] - min) / (max - min) * 100}%`
              }}
            />
          </div>
          <input
            type="range"
            min={min}
            max={max}
            value={(localValue as [number, number])[0]}
            onChange={(e) => {
              const newVal = Math.min(Number(e.target.value), (localValue as [number, number])[1] - 1)
              const newRange: [number, number] = [newVal, (localValue as [number, number])[1]]
              setLocalValue(newRange)
              onChange(newRange)
            }}
            className="absolute w-full h-2 top-1 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer"
          />
          <input
            type="range"
            min={min}
            max={max}
            value={(localValue as [number, number])[1]}
            onChange={(e) => {
              const newVal = Math.max(Number(e.target.value), (localValue as [number, number])[0] + 1)
              const newRange: [number, number] = [(localValue as [number, number])[0], newVal]
              setLocalValue(newRange)
              onChange(newRange)
            }}
            className="absolute w-full h-2 top-1 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer"
          />
        </div>
      ) : (
        <div className="relative pt-1">
          <div className="h-2 bg-white/10 rounded-full">
            <div
              className="absolute h-2 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-full"
              style={{ width: `${((localValue as number) - min) / (max - min) * 100}%` }}
            />
          </div>
          <input
            type="range"
            min={min}
            max={max}
            value={localValue as number}
            onChange={(e) => {
              const newVal = Number(e.target.value)
              setLocalValue(newVal)
              onChange(newVal)
            }}
            className="absolute w-full h-2 top-1 appearance-none bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer"
          />
        </div>
      )}
    </div>
  )
}

// Select component
function Select({
  icon: Icon,
  label,
  value,
  options,
  onChange,
  placeholder = 'Selectionner...'
}: {
  icon?: typeof User
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <div className="space-y-2">
      <label className="text-white/60 text-sm">{label}</label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
        )}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'w-full h-14 rounded-2xl bg-black/30 border border-white/10 text-white appearance-none focus:outline-none focus:border-neon-purple/50 transition-colors pr-10',
            Icon ? 'pl-12' : 'pl-4'
          )}
        >
          <option value="" className="bg-surface-dark">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-surface-dark">
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
      </div>
    </div>
  )
}

// Main component
export function EditProfilePage() {
  const navigate = useNavigate()
  const { profile, updateProfile } = useUserStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form state
  const [photos, setPhotos] = useState<PhotoItem[]>(() => {
    if (profile?.photoUrl) {
      return [{ id: '1', url: profile.photoUrl }]
    }
    return []
  })
  const [bio, setBio] = useState(profile?.bio || '')
  const [firstName, setFirstName] = useState(profile?.firstName || '')
  const [_birthDate, _setBirthDate] = useState<Date | null>(null)
  const [gender, setGender] = useState('')
  const [job, setJob] = useState('')
  const [education, setEducation] = useState('')
  const [height, setHeight] = useState('')
  const [smoking, setSmoking] = useState('')
  const [drinking, setDrinking] = useState('')
  const [sport, setSport] = useState('')
  const [selectedInterests, setSelectedInterests] = useState<string[]>(profile?.interests || [])
  const [lookingFor, setLookingFor] = useState('')
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 50])
  const [maxDistance, setMaxDistance] = useState(50)

  // UI state
  const [isSaving, setIsSaving] = useState(false)
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false)
  const [photoError, setPhotoError] = useState<string | null>(null)

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  // Handle drag end
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setPhotos((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id)
      const newIndex = items.findIndex((item) => item.id === over.id)
      return arrayMove(items, oldIndex, newIndex)
    })
  }, [])

  // Handle photo selection
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsProcessingPhoto(true)
    setPhotoError(null)

    for (const file of Array.from(files)) {
      if (photos.length >= MAX_PHOTOS) {
        setPhotoError(`Maximum ${MAX_PHOTOS} photos autorisees`)
        break
      }

      if (!file.type.startsWith('image/')) {
        setPhotoError('Seules les images sont acceptees')
        continue
      }

      if (file.size > 10 * 1024 * 1024) {
        setPhotoError('Image trop lourde (max 10MB)')
        continue
      }

      const newPhoto: PhotoItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        url: URL.createObjectURL(file),
        file
      }

      setPhotos((prev) => [...prev, newPhoto])
    }

    setIsProcessingPhoto(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Remove photo
  const handleRemovePhoto = useCallback((id: string) => {
    setPhotos((prev) => {
      const photo = prev.find((p) => p.id === id)
      if (photo?.url.startsWith('blob:')) {
        URL.revokeObjectURL(photo.url)
      }
      return prev.filter((p) => p.id !== id)
    })
  }, [])

  // Toggle interest
  const toggleInterest = useCallback((interest: string) => {
    setSelectedInterests((prev) => {
      if (prev.includes(interest)) {
        return prev.filter((i) => i !== interest)
      }
      if (prev.length < MAX_INTERESTS) {
        return [...prev, interest]
      }
      return prev
    })
  }, [])

  // Save profile
  const handleSave = async () => {
    setIsSaving(true)

    try {
      // Upload photos to Supabase if needed
      const photoUrls: string[] = []

      for (const photo of photos) {
        if (photo.file) {
          const fileName = `${profile?.id || 'user'}-${Date.now()}-${photo.id}`
          const { data, error } = await supabase.storage
            .from('photos')
            .upload(fileName, photo.file)

          if (error) {
            console.error('Error uploading photo:', error)
            photoUrls.push(photo.url) // Keep blob URL as fallback
          } else if (data) {
            const { data: urlData } = supabase.storage
              .from('photos')
              .getPublicUrl(data.path)
            photoUrls.push(urlData.publicUrl)
          }
        } else {
          photoUrls.push(photo.url)
        }
      }

      // Update profile in store
      updateProfile({
        firstName,
        bio,
        interests: selectedInterests,
        photoUrl: photoUrls[0] || ''
      })

      // Show success animation
      setShowSaveSuccess(true)
      setTimeout(() => {
        setShowSaveSuccess(false)
        navigate('/profile')
      }, 1500)
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-dark">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-40 bg-surface-dark/80 backdrop-blur-xl border-b border-white/5"
      >
        <div className="flex items-center justify-between px-4 h-16 safe-top">
          <button
            onClick={() => navigate('/profile')}
            className="p-2 -ml-2 rounded-xl hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>

          <h1 className="text-lg font-semibold text-white">Modifier le profil</h1>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple text-white font-medium disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Sauvegarder</span>
          </motion.button>
        </div>
      </motion.header>

      {/* Content */}
      <div className="pt-20 pb-8 px-4 space-y-6 max-w-lg mx-auto">
        {/* Photos Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface-card rounded-3xl p-5 border border-white/5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Camera className="w-5 h-5 text-neon-cyan" />
              Photos
            </h2>
            <span className="text-white/40 text-sm">{photos.length}/{MAX_PHOTOS}</span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoSelect}
            className="hidden"
          />

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={photos.map((p) => p.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-3 gap-3">
                <AnimatePresence mode="popLayout">
                  {photos.map((photo) => (
                    <SortablePhoto
                      key={photo.id}
                      photo={photo}
                      onRemove={() => handleRemovePhoto(photo.id)}
                    />
                  ))}
                </AnimatePresence>

                {/* Empty slots */}
                {Array.from({ length: MAX_PHOTOS - photos.length }).map((_, i) => (
                  <EmptyPhotoSlot
                    key={`empty-${i}`}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessingPhoto}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {photoError && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm mt-3 text-center"
            >
              {photoError}
            </motion.p>
          )}

          <p className="text-white/30 text-xs text-center mt-4">
            Glisse pour reorganiser. La premiere photo est ta photo principale.
          </p>
        </motion.section>

        {/* Basic Info Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-surface-card rounded-3xl p-5 border border-white/5 space-y-4"
        >
          <h2 className="text-white font-semibold flex items-center gap-2">
            <User className="w-5 h-5 text-neon-purple" />
            Informations
          </h2>

          {/* First Name */}
          <div className="space-y-2">
            <label className="text-white/60 text-sm">Prenom</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Ton prenom"
              className="w-full h-14 px-4 rounded-2xl bg-black/30 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-neon-purple/50 transition-colors"
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-white/60 text-sm">Bio</label>
              <span className={cn(
                'text-xs',
                bio.length > MAX_BIO_LENGTH * 0.9 ? 'text-red-400' : 'text-white/40'
              )}>
                {bio.length}/{MAX_BIO_LENGTH}
              </span>
            </div>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, MAX_BIO_LENGTH))}
              placeholder="Parle-nous de toi..."
              rows={4}
              className="w-full px-4 py-3 rounded-2xl bg-black/30 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-neon-purple/50 transition-colors resize-none"
            />
          </div>

          {/* Gender */}
          <Select
            icon={User}
            label="Genre"
            value={gender}
            options={GENDER_OPTIONS}
            onChange={setGender}
            placeholder="Selectionne ton genre"
          />

          {/* Job */}
          <div className="space-y-2">
            <label className="text-white/60 text-sm">Profession</label>
            <div className="relative">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={job}
                onChange={(e) => setJob(e.target.value)}
                placeholder="Que fais-tu dans la vie ?"
                className="w-full h-14 pl-12 pr-4 rounded-2xl bg-black/30 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-neon-purple/50 transition-colors"
              />
            </div>
          </div>

          {/* Education */}
          <div className="space-y-2">
            <label className="text-white/60 text-sm">Etudes / Ecole</label>
            <div className="relative">
              <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                placeholder="Ou as-tu etudie ?"
                className="w-full h-14 pl-12 pr-4 rounded-2xl bg-black/30 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-neon-purple/50 transition-colors"
              />
            </div>
          </div>

          {/* Height */}
          <Select
            icon={Ruler}
            label="Taille"
            value={height}
            options={HEIGHTS.map((h) => ({ value: h.toString(), label: `${h} cm` }))}
            onChange={setHeight}
            placeholder="Selectionne ta taille"
          />
        </motion.section>

        {/* Lifestyle Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-surface-card rounded-3xl p-5 border border-white/5 space-y-4"
        >
          <h2 className="text-white font-semibold flex items-center gap-2">
            <Heart className="w-5 h-5 text-neon-pink" />
            Mode de vie
          </h2>

          <Select
            icon={Cigarette}
            label="Tabac"
            value={smoking}
            options={LIFESTYLE_OPTIONS.smoking}
            onChange={setSmoking}
          />

          <Select
            icon={Wine}
            label="Alcool"
            value={drinking}
            options={LIFESTYLE_OPTIONS.drinking}
            onChange={setDrinking}
          />

          <Select
            icon={Dumbbell}
            label="Sport"
            value={sport}
            options={LIFESTYLE_OPTIONS.sport}
            onChange={setSport}
          />
        </motion.section>

        {/* Interests Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-surface-card rounded-3xl p-5 border border-white/5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Heart className="w-5 h-5 text-neon-cyan" />
              Centres d'interet
            </h2>
            <div className="flex items-center gap-1">
              {[...Array(MAX_INTERESTS)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all',
                    i < selectedInterests.length
                      ? 'bg-gradient-to-r from-neon-cyan to-neon-purple'
                      : 'bg-white/10'
                  )}
                />
              ))}
              <span className="ml-2 text-white/40 text-sm">{selectedInterests.length}/{MAX_INTERESTS}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((interest, i) => {
              const isSelected = selectedInterests.includes(interest)
              return (
                <motion.button
                  key={interest}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleInterest(interest)}
                  disabled={!isSelected && selectedInterests.length >= MAX_INTERESTS}
                  className={cn(
                    'px-4 py-2.5 rounded-xl text-sm font-medium transition-all border',
                    isSelected
                      ? 'bg-gradient-to-r from-neon-cyan to-neon-purple text-white border-transparent shadow-lg shadow-neon-cyan/20'
                      : 'bg-black/20 text-white/70 border-white/5 hover:border-white/20 hover:bg-black/30 disabled:opacity-30 disabled:cursor-not-allowed'
                  )}
                >
                  {interest}
                </motion.button>
              )
            })}
          </div>
        </motion.section>

        {/* Search Preferences Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-surface-card rounded-3xl p-5 border border-white/5 space-y-6"
        >
          <h2 className="text-white font-semibold flex items-center gap-2">
            <MapPin className="w-5 h-5 text-neon-green" />
            Preferences de recherche
          </h2>

          <Select
            icon={Heart}
            label="Je recherche"
            value={lookingFor}
            options={LOOKING_FOR_OPTIONS}
            onChange={setLookingFor}
          />

          <RangeSlider
            label="Tranche d'age"
            value={ageRange}
            onChange={(val) => setAgeRange(val as [number, number])}
            min={18}
            max={80}
            unit=" ans"
          />

          <RangeSlider
            label="Distance maximum"
            value={maxDistance}
            onChange={(val) => setMaxDistance(val as number)}
            min={1}
            max={200}
            unit=" km"
          />
        </motion.section>
      </div>

      {/* Save Success Overlay */}
      <AnimatePresence>
        {showSaveSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-surface-dark/90 backdrop-blur-xl flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-neon-green to-neon-cyan flex items-center justify-center"
              >
                <Check className="w-10 h-10 text-white" />
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-white text-xl font-semibold"
              >
                Profil mis a jour !
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
