import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, Camera, User, Heart, Share2, Sparkles, Check, Mail, Lock, Loader2, Calendar, Users, ChevronDown, Plus, X, ImagePlus, Phone } from 'lucide-react'
import { useOnboardingStore } from '@/stores'
import type { OnboardingStep, Gender, Preference, PhotoData } from '@/types/onboarding'
import { cn, generateUUID } from '@/lib/utils'
import { sanitizeText, sanitizeUserContent } from '@/lib/security'
import { useAuth } from '@/contexts/AuthContext'
import { detectFace } from '@/lib/faceDetection'

const INTEREST_CATEGORIES = [
  {
    name: 'Loisirs',
    emoji: '🎬',
    interests: ['Musique', 'Cinéma', 'Séries', 'Lecture', 'Gaming', 'Podcast', 'Théâtre', 'Concerts']
  },
  {
    name: 'Sport',
    emoji: '⚽',
    interests: ['Fitness', 'Yoga', 'Running', 'Football', 'Basketball', 'Tennis', 'Natation', 'Musculation', 'Danse']
  },
  {
    name: 'Créativité',
    emoji: '🎨',
    interests: ['Art', 'Photo', 'Dessin', 'Écriture', 'Musique (jouer)', 'DIY', 'Design']
  },
  {
    name: 'Lifestyle',
    emoji: '✨',
    interests: ['Voyage', 'Cuisine', 'Mode', 'Bien-être', 'Méditation', 'Skincare', 'Shopping']
  },
  {
    name: 'Nature',
    emoji: '🌿',
    interests: ['Nature', 'Animaux', 'Jardinage', 'Randonnée', 'Camping', 'Plage']
  },
  {
    name: 'Tech',
    emoji: '💻',
    interests: ['Tech', 'Startups', 'Crypto', 'Science', 'Espace', 'IA']
  },
  {
    name: 'Social',
    emoji: '🎉',
    interests: ['Soirées', 'Brunch', 'Apéro', 'Networking', 'Bénévolat']
  },
  {
    name: 'Food',
    emoji: '🍕',
    interests: ['Café', 'Vin', 'Bière', 'Vegan', 'Foodie', 'Sushi']
  },
  {
    name: 'Culture',
    emoji: '📚',
    interests: ['Histoire', 'Politique', 'Philo', 'Langues', 'Spiritualité']
  }
]

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0
  })
}

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
]

const MAX_PHOTOS = 5

export function OnboardingPage() {
  const navigate = useNavigate()
  const { signUp, user, isAuthenticated } = useAuth()
  const { step, setStep, formData, updateFormData, photos, addPhoto, removePhoto, wingmanCode, setWingmanCode } = useOnboardingStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Check if user is already authenticated (via OAuth)
  const isOAuthUser = isAuthenticated && !!user

  const [direction, setDirection] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false)

  // Form local states - pre-fill from OAuth if available
  const [email, setEmail] = useState(formData.email || user?.email || '')
  const [password, setPassword] = useState(formData.password || '')
  const [phoneNumber, setPhoneNumber] = useState('')
  // Extract first name from Google user metadata
  const googleFirstName = user?.user_metadata?.full_name?.split(' ')[0] || user?.user_metadata?.name?.split(' ')[0] || ''
  const [firstName, setFirstName] = useState(formData.firstName || googleFirstName || '')
  const [bio, setBio] = useState(formData.bio || '')
  const [selectedInterests, setSelectedInterests] = useState<string[]>(formData.interests || [])

  // Date picker state (DD/MM/YYYY format)
  const [birthDateInput, setBirthDateInput] = useState('')

  // Gender & preference states
  const [gender, setGender] = useState<Gender | null>(formData.gender || null)
  const [preference, setPreference] = useState<Preference | null>(formData.preference || null)

  // Form validation states
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [nameError, setNameError] = useState('')
  const [birthError, setBirthError] = useState('')

  const steps: OnboardingStep[] = ['welcome', 'photo', 'birthdate', 'gender', 'preference', 'info', 'interests', 'wingman']
  const currentIndex = steps.indexOf(step)

  const goToStep = (newStep: OnboardingStep) => {
    const newIndex = steps.indexOf(newStep)
    setDirection(newIndex > currentIndex ? 1 : -1)
    setStep(newStep)
  }

  const nextStep = () => {
    const nextIndex = currentIndex + 1
    if (nextIndex < steps.length) {
      goToStep(steps[nextIndex])
    }
  }

  const prevStep = () => {
    const prevIndex = currentIndex - 1
    if (prevIndex >= 0) {
      goToStep(steps[prevIndex])
    }
  }

  const calculateAge = (day: number, month: number, year: number): number => {
    const today = new Date()
    const birthDate = new Date(year, month - 1, day)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  // Handle photo selection
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsProcessingPhoto(true)
    setPhotoError(null)

    for (const file of Array.from(files)) {
      if (photos.length >= MAX_PHOTOS) {
        setPhotoError(`Maximum ${MAX_PHOTOS} photos autorisées`)
        break
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setPhotoError('Seules les images sont acceptées')
        continue
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setPhotoError('Image trop lourde (max 10MB)')
        continue
      }

      // For the first photo, check if it contains a face
      if (photos.length === 0) {
        const faceResult = await detectFace(file)
        if (!faceResult.hasFace) {
          setPhotoError('La première photo doit montrer ton visage')
          continue
        }
      }

      const photoData: PhotoData = {
        blob: file,
        url: URL.createObjectURL(file),
        timestamp: Date.now()
      }
      addPhoto(photoData)
    }

    setIsProcessingPhoto(false)
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemovePhoto = (index: number) => {
    // Revoke URL to prevent memory leak
    URL.revokeObjectURL(photos[index].url)
    removePhoto(index)
  }

  // Format birthdate input with auto-slashes
  const handleBirthDateChange = (value: string) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, '')

    // Format as DD/MM/YYYY
    let formatted = ''
    if (digits.length > 0) {
      formatted = digits.slice(0, 2)
    }
    if (digits.length > 2) {
      formatted += '/' + digits.slice(2, 4)
    }
    if (digits.length > 4) {
      formatted += '/' + digits.slice(4, 8)
    }

    setBirthDateInput(formatted)
  }

  const handleBirthdateSubmit = () => {
    // Parse DD/MM/YYYY
    const parts = birthDateInput.split('/')
    if (parts.length !== 3 || birthDateInput.length !== 10) {
      setBirthError('Format invalide (JJ/MM/AAAA)')
      return
    }

    const day = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10)
    const year = parseInt(parts[2], 10)

    // Validate values
    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      setBirthError('Date invalide')
      return
    }

    if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1920 || year > new Date().getFullYear() - 18) {
      setBirthError('Date invalide')
      return
    }

    const age = calculateAge(day, month, year)
    if (age < 18) {
      setBirthError('Tu dois avoir au moins 18 ans')
      return
    }

    const birthDate = new Date(year, month - 1, day)
    updateFormData({ birthDate })
    setBirthError('')
    nextStep()
  }

  const handleGenderSubmit = () => {
    if (!gender) return
    updateFormData({ gender })
    nextStep()
  }

  const handlePreferenceSubmit = () => {
    if (!preference) return
    updateFormData({ preference })
    nextStep()
  }

  const handleInfoSubmit = () => {
    let hasError = false

    // Only validate email/password for non-OAuth users
    if (!isOAuthUser) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!email || !emailRegex.test(email)) {
        setEmailError('Email invalide')
        hasError = true
      } else {
        setEmailError('')
      }

      if (!password || password.length < 6) {
        setPasswordError('Minimum 6 caractères')
        hasError = true
      } else {
        setPasswordError('')
      }
    }

    // Validate phone number (optional but if provided, must be valid)
    const phoneRegex = /^(\+33|0)[1-9](\d{2}){4}$/
    const cleanPhone = phoneNumber.replace(/\s/g, '')
    if (cleanPhone && !phoneRegex.test(cleanPhone)) {
      setPhoneError('Numéro invalide (ex: 0612345678)')
      hasError = true
    } else {
      setPhoneError('')
    }

    const nameRegex = /^[a-zA-ZÀ-ÿ\s-]+$/
    if (!firstName || firstName.length < 2 || !nameRegex.test(firstName)) {
      setNameError('Prénom invalide (2-30 caractères)')
      hasError = true
    } else {
      setNameError('')
    }

    if (hasError) return

    updateFormData({
      email: isOAuthUser ? user?.email || '' : email,
      password,
      firstName: sanitizeText(firstName),
      bio: sanitizeUserContent(bio),
      phoneNumber: cleanPhone || undefined,
    })
    nextStep()
  }

  const handleInterestsSubmit = async () => {
    if (selectedInterests.length === 0) return

    setIsSubmitting(true)
    setAuthError(null)

    try {
      updateFormData({ interests: selectedInterests })

      const age = formData.birthDate ? calculateAge(
        formData.birthDate.getDate(),
        formData.birthDate.getMonth() + 1,
        formData.birthDate.getFullYear()
      ) : 18

      // If OAuth user, just create profile (user already exists)
      if (isOAuthUser && user) {
        const { supabase } = await import('@/lib/supabase')
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: user.id,
          email: user.email,
          first_name: formData.firstName || firstName,
          age,
          bio: formData.bio || bio,
          interests: selectedInterests,
          gender: formData.gender,
          preference: formData.preference,
          phone_number: formData.phoneNumber || null,
        })

        if (profileError) {
          setAuthError(profileError.message)
          setIsSubmitting(false)
          return
        }
      } else {
        // Non-OAuth: create account with email/password
        const { error } = await signUp(
          formData.email || email,
          formData.password || password,
          formData.firstName || firstName,
          age
        )

        if (error) {
          setAuthError(error.message)
          setIsSubmitting(false)
          return
        }
      }

      const code = generateUUID().slice(0, 8).toUpperCase()
      setWingmanCode(code)
      nextStep()
    } catch (err) {
      setAuthError('Erreur lors de la création du compte')
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest))
    } else if (selectedInterests.length < 5) {
      setSelectedInterests([...selectedInterests, interest])
    }
  }

  const shareWingmanLink = async () => {
    const link = `${window.location.origin}/wingman/${wingmanCode}`

    if (navigator.share) {
      await navigator.share({
        title: 'ECHO - Valide mon profil',
        text: 'Hey ! J\'ai besoin de toi pour valider mon profil sur ECHO.',
        url: link
      })
    } else {
      await navigator.clipboard.writeText(link)
    }
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 63 }, (_, i) => currentYear - 18 - i)
  const days = Array.from({ length: 31 }, (_, i) => i + 1)

  return (
    <div className="min-h-screen bg-surface-dark flex flex-col">
      {/* Progress bar */}
      <div className="px-4 pt-4 safe-top">
        <div className="flex items-center gap-1.5">
          {steps.map((s, i) => (
            <div
              key={s}
              className={cn(
                'h-1 flex-1 rounded-full transition-all duration-300',
                i <= currentIndex ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500' : 'bg-white/10'
              )}
            />
          ))}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handlePhotoSelect}
        className="hidden"
      />

      {/* Content */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute inset-0 p-6 flex flex-col"
          >
            {/* Welcome Step */}
            {step === 'welcome' && (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', delay: 0.2, stiffness: 200 }}
                  className="relative mb-8"
                >
                  <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-violet-500/30">
                    <Sparkles className="w-14 h-14 text-white" />
                  </div>
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-500 blur-2xl opacity-40 -z-10" />
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl font-bold text-white mb-3 tracking-tight"
                >
                  Bienvenue sur <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">ECHO</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-white/50 max-w-xs mb-10 text-lg"
                >
                  Crée ton profil et fais-le valider par un ami
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="w-full max-w-sm bg-white/5 backdrop-blur-xl rounded-3xl p-5 border border-white/10 shadow-2xl"
                >
                  <div className="space-y-3">
                    {[
                      { icon: ImagePlus, text: 'Ajoute tes photos', color: 'from-cyan-500 to-blue-500' },
                      { icon: User, text: 'Profil authentique', color: 'from-violet-500 to-purple-500' },
                      { icon: Share2, text: 'Validé par un ami', color: 'from-fuchsia-500 to-pink-500' },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + i * 0.1 }}
                        className="flex items-center gap-4 p-3 rounded-2xl bg-black/20 border border-white/5 hover:border-white/10 transition-all"
                      >
                        <div className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-lg',
                          item.color
                        )}>
                          <item.icon className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-white/90 font-medium">{item.text}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            )}

            {/* Photo Step */}
            {step === 'photo' && (
              <div className="flex-1 flex flex-col">
                <div className="text-center mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25"
                  >
                    <ImagePlus className="w-8 h-8 text-white" />
                  </motion.div>
                  <h1 className="text-2xl font-bold text-white mb-1">Tes photos</h1>
                  <p className="text-white/50 text-sm">
                    Ajoute jusqu'à 5 photos • La première doit montrer ton visage
                  </p>
                </div>

                {/* Photo grid */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex-1 bg-white/5 backdrop-blur-xl rounded-3xl p-4 border border-white/10 shadow-2xl mb-6"
                >
                  <div className="grid grid-cols-3 gap-3 h-full">
                    {/* Main photo slot */}
                    <div className="col-span-2 row-span-2">
                      {photos[0] ? (
                        <div className="relative h-full group">
                          <img
                            src={photos[0].url}
                            alt="Photo principale"
                            className="w-full h-full object-cover rounded-2xl"
                          />
                          <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm">
                            <span className="text-xs text-white font-medium">Principale</span>
                          </div>
                          <button
                            onClick={() => handleRemovePhoto(0)}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500/80 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isProcessingPhoto}
                          className="w-full h-full min-h-[200px] rounded-2xl bg-black/30 border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-3 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all"
                        >
                          {isProcessingPhoto ? (
                            <Loader2 className="w-10 h-10 text-white/40 animate-spin" />
                          ) : (
                            <>
                              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                                <Camera className="w-8 h-8 text-white/40" />
                              </div>
                              <span className="text-white/40 text-sm">Photo avec visage</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Secondary photo slots */}
                    {[1, 2, 3, 4].map((index) => (
                      <div key={index} className="aspect-square">
                        {photos[index] ? (
                          <div className="relative h-full group">
                            <img
                              src={photos[index].url}
                              alt={`Photo ${index + 1}`}
                              className="w-full h-full object-cover rounded-xl"
                            />
                            <button
                              onClick={() => handleRemovePhoto(index)}
                              className="absolute top-1 right-1 p-1 rounded-full bg-red-500/80 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3 text-white" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isProcessingPhoto || photos.length === 0}
                            className={cn(
                              'w-full h-full rounded-xl border-2 border-dashed flex items-center justify-center transition-all',
                              photos.length === 0
                                ? 'border-white/10 bg-black/20 cursor-not-allowed'
                                : 'border-white/20 bg-black/30 hover:border-cyan-500/50 hover:bg-cyan-500/5'
                            )}
                          >
                            <Plus className={cn(
                              'w-6 h-6',
                              photos.length === 0 ? 'text-white/20' : 'text-white/40'
                            )} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Error message */}
                {photoError && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20"
                  >
                    <p className="text-red-400 text-sm text-center">{photoError}</p>
                  </motion.div>
                )}

                {/* Counter */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  {[...Array(MAX_PHOTOS)].map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'w-2 h-2 rounded-full transition-all',
                        i < photos.length
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-500'
                          : 'bg-white/10'
                      )}
                    />
                  ))}
                  <span className="ml-2 text-white/60 text-sm font-medium">{photos.length}/{MAX_PHOTOS}</span>
                </div>

                {/* Add button */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={photos.length >= MAX_PHOTOS || isProcessingPhoto}
                  className="w-full h-14 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-shadow disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessingPhoto ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    <>
                      <ImagePlus className="w-5 h-5" />
                      Ajouter des photos
                    </>
                  )}
                </motion.button>
              </div>
            )}

            {/* Birthdate Step */}
            {step === 'birthdate' && (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-6 shadow-lg shadow-amber-500/25"
                >
                  <Calendar className="w-8 h-8 text-white" />
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-bold text-white mb-2"
                >
                  Ta date de naissance
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-white/50 max-w-xs mb-8"
                >
                  On ne l'affichera jamais, promis !
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="w-full max-w-sm bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl mb-6"
                >
                  <div className={cn(
                    'flex items-center gap-3 h-16 px-5 rounded-2xl bg-black/30 border transition-all',
                    birthError ? 'border-red-500/50' : 'border-white/10 focus-within:border-amber-500/50'
                  )}>
                    <Calendar className="w-6 h-6 text-white/40" />
                    <input
                      type="text"
                      inputMode="numeric"
                      value={birthDateInput}
                      onChange={(e) => handleBirthDateChange(e.target.value)}
                      placeholder="JJ/MM/AAAA"
                      maxLength={10}
                      className="flex-1 bg-transparent text-white text-xl font-medium tracking-wider placeholder:text-white/30 focus:outline-none text-center"
                    />
                  </div>

                  {birthError && (
                    <p className="text-red-400 text-sm mt-4 text-center">{birthError}</p>
                  )}
                </motion.div>

                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBirthdateSubmit}
                  disabled={birthDateInput.length !== 10}
                  className="h-14 px-8 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-shadow disabled:opacity-50"
                >
                  Continuer
                </motion.button>
              </div>
            )}

            {/* Gender Step */}
            {step === 'gender' && (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mb-6 shadow-lg shadow-pink-500/25"
                >
                  <User className="w-8 h-8 text-white" />
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-bold text-white mb-2"
                >
                  Tu es...
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-white/50 max-w-xs mb-8"
                >
                  Choisis ce qui te correspond
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="w-full max-w-sm space-y-3 mb-8"
                >
                  {[
                    { value: 'male', label: 'Un homme', emoji: '👨' },
                    { value: 'female', label: 'Une femme', emoji: '👩' },
                    { value: 'non-binary', label: 'Non-binaire', emoji: '🌈' },
                  ].map((option, i) => (
                    <motion.button
                      key={option.value}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setGender(option.value as Gender)}
                      className={cn(
                        'w-full p-4 rounded-2xl border transition-all flex items-center gap-4',
                        gender === option.value
                          ? 'bg-gradient-to-r from-pink-500/20 to-rose-500/20 border-pink-500/50'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      )}
                    >
                      <span className="text-2xl">{option.emoji}</span>
                      <span className="text-white font-medium text-lg">{option.label}</span>
                      {gender === option.value && (
                        <Check className="ml-auto w-5 h-5 text-pink-400" />
                      )}
                    </motion.button>
                  ))}
                </motion.div>

                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGenderSubmit}
                  disabled={!gender}
                  className="h-14 px-8 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition-shadow disabled:opacity-50"
                >
                  Continuer
                </motion.button>
              </div>
            )}

            {/* Preference Step */}
            {step === 'preference' && (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center mb-6 shadow-lg shadow-red-500/25"
                >
                  <Heart className="w-8 h-8 text-white" />
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-bold text-white mb-2"
                >
                  Tu recherches...
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-white/50 max-w-xs mb-8"
                >
                  Qui fait battre ton cœur ?
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="w-full max-w-sm space-y-3 mb-8"
                >
                  {[
                    { value: 'men', label: 'Des hommes', emoji: '👨' },
                    { value: 'women', label: 'Des femmes', emoji: '👩' },
                    { value: 'everyone', label: 'Tout le monde', emoji: '💫' },
                  ].map((option, i) => (
                    <motion.button
                      key={option.value}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setPreference(option.value as Preference)}
                      className={cn(
                        'w-full p-4 rounded-2xl border transition-all flex items-center gap-4',
                        preference === option.value
                          ? 'bg-gradient-to-r from-red-500/20 to-pink-500/20 border-red-500/50'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      )}
                    >
                      <span className="text-2xl">{option.emoji}</span>
                      <span className="text-white font-medium text-lg">{option.label}</span>
                      {preference === option.value && (
                        <Check className="ml-auto w-5 h-5 text-red-400" />
                      )}
                    </motion.button>
                  ))}
                </motion.div>

                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePreferenceSubmit}
                  disabled={!preference}
                  className="h-14 px-8 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-shadow disabled:opacity-50"
                >
                  Continuer
                </motion.button>
              </div>
            )}

            {/* Info Step */}
            {step === 'info' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="text-center mb-4 flex-shrink-0">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/25"
                  >
                    <Users className="w-7 h-7 text-white" />
                  </motion.div>

                  <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xl font-bold text-white mb-1 text-center"
                  >
                    {isOAuthUser ? 'Complète ton profil' : 'Crée ton compte'}
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-white/50 text-sm text-center"
                  >
                    {isOAuthUser ? 'Dis-nous en plus sur toi' : 'Plus que quelques infos'}
                  </motion.p>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex-1 w-full max-w-sm mx-auto bg-white/5 backdrop-blur-xl rounded-3xl p-4 border border-white/10 shadow-2xl overflow-y-auto min-h-0"
                >
                  <div className="space-y-4">
                    {/* Show email/password only for non-OAuth users */}
                    {!isOAuthUser && (
                      <>
                        <div>
                          <div className={cn(
                            'flex items-center gap-3 h-14 px-4 rounded-2xl bg-black/30 border transition-all',
                            emailError ? 'border-red-500/50' : 'border-white/10 focus-within:border-violet-500/50'
                          )}>
                            <Mail className="w-5 h-5 text-white/40" />
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="Email"
                              className="flex-1 bg-transparent text-white placeholder:text-white/30 focus:outline-none"
                            />
                          </div>
                          {emailError && <p className="text-red-400 text-xs mt-1 ml-1">{emailError}</p>}
                        </div>

                        <div>
                          <div className={cn(
                            'flex items-center gap-3 h-14 px-4 rounded-2xl bg-black/30 border transition-all',
                            passwordError ? 'border-red-500/50' : 'border-white/10 focus-within:border-violet-500/50'
                          )}>
                            <Lock className="w-5 h-5 text-white/40" />
                            <input
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Mot de passe (min. 6)"
                              className="flex-1 bg-transparent text-white placeholder:text-white/30 focus:outline-none"
                            />
                          </div>
                          {passwordError && <p className="text-red-400 text-xs mt-1 ml-1">{passwordError}</p>}
                        </div>

                        <div className="flex items-center gap-3 py-1">
                          <div className="flex-1 h-px bg-white/10" />
                          <span className="text-white/30 text-xs">PROFIL</span>
                          <div className="flex-1 h-px bg-white/10" />
                        </div>
                      </>
                    )}

                    {/* Show connected email for OAuth users */}
                    {isOAuthUser && user?.email && (
                      <div className="flex items-center gap-3 h-14 px-4 rounded-2xl bg-green-500/10 border border-green-500/20">
                        <Mail className="w-5 h-5 text-green-400" />
                        <span className="text-white/70 text-sm truncate">{user.email}</span>
                        <span className="ml-auto text-green-400 text-xs font-medium">Connecté</span>
                      </div>
                    )}

                    <div>
                      <div className={cn(
                        'flex items-center gap-3 h-14 px-4 rounded-2xl bg-black/30 border transition-all',
                        nameError ? 'border-red-500/50' : 'border-white/10 focus-within:border-violet-500/50'
                      )}>
                        <User className="w-5 h-5 text-white/40" />
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Prénom"
                          className="flex-1 bg-transparent text-white placeholder:text-white/30 focus:outline-none"
                        />
                      </div>
                      {nameError && <p className="text-red-400 text-xs mt-1 ml-1">{nameError}</p>}
                    </div>

                    <div>
                      <div className={cn(
                        'flex items-center gap-3 h-14 px-4 rounded-2xl bg-black/30 border transition-all',
                        phoneError ? 'border-red-500/50' : 'border-white/10 focus-within:border-violet-500/50'
                      )}>
                        <Phone className="w-5 h-5 text-white/40" />
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="Téléphone (pour retrouver tes amis)"
                          className="flex-1 bg-transparent text-white placeholder:text-white/30 focus:outline-none"
                        />
                      </div>
                      {phoneError && <p className="text-red-400 text-xs mt-1 ml-1">{phoneError}</p>}
                      <p className="text-white/30 text-xs mt-1 ml-1">Optionnel • Pour des recommandations basées sur tes contacts</p>
                    </div>

                    <div>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Bio (optionnel)"
                        rows={2}
                        className="w-full px-4 py-3 rounded-2xl bg-black/30 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 transition-all resize-none"
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Button - always visible */}
                <div className="flex-shrink-0 pt-4 w-full max-w-sm mx-auto">
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleInfoSubmit}
                    className="w-full h-14 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold shadow-lg shadow-violet-500/25"
                  >
                    Continuer
                  </motion.button>
                </div>
              </div>
            )}

            {/* Interests Step */}
            {step === 'interests' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="text-center mb-4 flex-shrink-0">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/25"
                  >
                    <Heart className="w-7 h-7 text-white" />
                  </motion.div>
                  <h1 className="text-xl font-bold text-white mb-1">
                    Tes centres d'intérêt
                  </h1>
                  <p className="text-white/50 text-sm">
                    Choisis jusqu'à 5 intérêts
                  </p>
                </div>

                {/* Counter sticky */}
                <div className="flex items-center justify-between mb-3 px-1 flex-shrink-0">
                  <span className="text-white/40 text-sm">Sélectionnés</span>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          'w-2 h-2 rounded-full transition-all',
                          i < selectedInterests.length
                            ? 'bg-gradient-to-r from-orange-500 to-rose-500'
                            : 'bg-white/10'
                        )}
                      />
                    ))}
                    <span className="ml-2 text-white/60 text-sm font-medium">{selectedInterests.length}/5</span>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex-1 bg-white/5 backdrop-blur-xl rounded-3xl p-4 border border-white/10 shadow-2xl overflow-hidden min-h-0"
                >
                  <div className="space-y-4 h-full overflow-y-auto pr-2">
                    {INTEREST_CATEGORIES.map((category, catIndex) => (
                      <motion.div
                        key={category.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: catIndex * 0.05 }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{category.emoji}</span>
                          <span className="text-white/60 text-xs font-medium uppercase tracking-wide">{category.name}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {category.interests.map((interest) => {
                            const isSelected = selectedInterests.includes(interest)
                            return (
                              <motion.button
                                key={interest}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => toggleInterest(interest)}
                                className={cn(
                                  'px-3 py-2 rounded-xl text-sm font-medium transition-all border',
                                  isSelected
                                    ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white border-transparent shadow-lg shadow-orange-500/20'
                                    : 'bg-black/20 text-white/70 border-white/5 hover:border-white/20 hover:bg-black/30'
                                )}
                              >
                                {interest}
                              </motion.button>
                            )
                          })}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Button section - always visible */}
                <div className="flex-shrink-0 pt-4 space-y-3">
                  {authError && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-xl bg-red-500/10 border border-red-500/20"
                    >
                      <p className="text-red-400 text-sm text-center">{authError}</p>
                    </motion.div>
                  )}

                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleInterestsSubmit}
                    disabled={selectedInterests.length === 0 || isSubmitting}
                    className="w-full h-14 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 text-white font-semibold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Création du compte...
                      </>
                    ) : (
                      'Créer mon compte'
                    )}
                  </motion.button>
                </div>
              </div>
            )}

            {/* Wingman Step */}
            {step === 'wingman' && (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="relative mb-8"
                >
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500 flex items-center justify-center shadow-2xl shadow-purple-500/30">
                    <Heart className="w-12 h-12 text-white" />
                  </div>
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, opacity: 1 }}
                      animate={{
                        scale: [0, 1, 1],
                        opacity: [1, 1, 0],
                        x: Math.cos(i * 60 * Math.PI / 180) * 60,
                        y: Math.sin(i * 60 * Math.PI / 180) * 60,
                      }}
                      transition={{ delay: 0.3, duration: 0.6 }}
                      className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full bg-gradient-to-r from-fuchsia-400 to-purple-400"
                      style={{ marginLeft: -6, marginTop: -6 }}
                    />
                  ))}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500 blur-2xl opacity-40 -z-10" />
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-bold text-white mb-2"
                >
                  Dernière étape ! 🎉
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-white/50 max-w-xs mb-8"
                >
                  Invite un ami de confiance à valider ton profil
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="w-full max-w-sm bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl mb-6"
                >
                  <p className="text-white/40 text-sm mb-3">Ton code Wingman</p>
                  <div className="bg-black/30 rounded-2xl p-4 mb-4">
                    <p className="text-4xl font-mono font-bold bg-gradient-to-r from-fuchsia-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent tracking-[0.3em]">
                      {wingmanCode}
                    </p>
                  </div>
                  <p className="text-white/30 text-xs">
                    Partage ce code avec un ami pour valider ton profil
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-3 w-full max-w-sm"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={shareWingmanLink}
                    className="w-full h-14 rounded-2xl bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-shadow flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-5 h-5" />
                    Envoyer le lien
                  </motion.button>

                  <button
                    onClick={() => navigate('/')}
                    className="w-full h-12 rounded-xl text-white/50 text-sm hover:text-white/70 hover:bg-white/5 transition-all"
                  >
                    Je ferai ça plus tard
                  </button>
                </motion.div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
      <div className="p-6 safe-bottom flex items-center justify-between">
        {currentIndex > 0 && step !== 'wingman' ? (
          <button
            onClick={prevStep}
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white/70" />
          </button>
        ) : (
          <div />
        )}

        {step === 'welcome' && (
          <button
            onClick={nextStep}
            className="h-14 px-8 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold shadow-lg shadow-violet-500/25 flex items-center gap-2"
          >
            C'est parti
            <ArrowRight className="w-5 h-5" />
          </button>
        )}

        {step === 'photo' && photos.length > 0 && (
          <button
            onClick={nextStep}
            className="h-14 px-8 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-lg shadow-cyan-500/25 flex items-center gap-2"
          >
            Continuer
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
}
