import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, Camera, User, Heart, Share2, Sparkles, Check, Mail, Lock, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useOnboardingStore } from '@/stores'
import { CameraView } from '@/components/ui'
import { onboardingSchema, type OnboardingFormData, type OnboardingStep } from '@/types/onboarding'
import { cn, generateUUID } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

const INTERESTS = [
  'Musique', 'Sport', 'Voyage', 'Cinéma', 'Cuisine',
  'Art', 'Tech', 'Nature', 'Gaming', 'Lecture',
  'Danse', 'Photo', 'Mode', 'Fitness', 'Animaux'
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

export function OnboardingPage() {
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const { step, setStep, formData, updateFormData, photo, setPhoto, wingmanCode, setWingmanCode } = useOnboardingStore()

  const [direction, setDirection] = useState(0)
  const [showCamera, setShowCamera] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      email: formData.email || '',
      password: formData.password || '',
      firstName: formData.firstName || '',
      age: formData.age || 18,
      bio: formData.bio || '',
      interests: formData.interests || [],
    },
  })

  const selectedInterests = watch('interests') || []

  const steps: OnboardingStep[] = ['welcome', 'photo', 'info', 'interests', 'wingman']
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

  const handlePhotoCapture = (blob: Blob) => {
    const url = URL.createObjectURL(blob)
    setPhoto({ blob, url, timestamp: Date.now() })
    setShowCamera(false)
    nextStep()
  }

  const handleInfoSubmit = (data: Partial<OnboardingFormData>) => {
    updateFormData({
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      age: data.age,
      bio: data.bio
    })
    nextStep()
  }

  const handleInterestsSubmit = async () => {
    setIsSubmitting(true)
    setAuthError(null)

    try {
      updateFormData({ interests: selectedInterests })

      // Create account in Supabase
      const { error } = await signUp(
        formData.email || '',
        formData.password || '',
        formData.firstName || '',
        formData.age || 18
      )

      if (error) {
        setAuthError(error.message)
        setIsSubmitting(false)
        return
      }

      // Generate wingman code
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
    const current = selectedInterests || []
    if (current.includes(interest)) {
      setValue('interests', current.filter(i => i !== interest))
    } else if (current.length < 5) {
      setValue('interests', [...current, interest])
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
      // TODO: Show toast
    }
  }

  // Full-screen camera view
  if (showCamera) {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        <CameraView
          onCapture={handlePhotoCapture}
          onCancel={() => setShowCamera(false)}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-dark flex flex-col">
      {/* Progress bar */}
      <div className="px-4 pt-4 safe-top">
        <div className="flex items-center gap-2">
          {steps.map((s, i) => (
            <div
              key={s}
              className={cn(
                'h-1 flex-1 rounded-full transition-all duration-300',
                i <= currentIndex ? 'bg-gradient-to-r from-neon-cyan to-neon-purple' : 'bg-white/10'
              )}
            />
          ))}
        </div>
      </div>

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
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple p-[2px] mb-8"
                >
                  <div className="w-full h-full rounded-full bg-surface-dark flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-neon-cyan" />
                  </div>
                </motion.div>

                <h1 className="text-3xl font-bold text-white mb-4">
                  Bienvenue sur ECHO
                </h1>

                <p className="text-white/60 max-w-xs mb-8">
                  Crée ton profil en 2 minutes et fais-le valider par un ami de confiance.
                </p>

                <div className="space-y-4 w-full max-w-xs">
                  {[
                    { icon: Camera, text: 'Prends une photo en temps réel' },
                    { icon: User, text: 'Remplis tes infos' },
                    { icon: Share2, text: 'Invite un Wingman' },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="flex items-center gap-3 text-left"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-neon-cyan" />
                      </div>
                      <span className="text-white/80">{item.text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Photo Step */}
            {step === 'photo' && (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <Camera className="w-16 h-16 text-neon-cyan mb-6" />

                <h1 className="text-2xl font-bold text-white mb-2">
                  Ta photo ECHO
                </h1>

                <p className="text-white/60 max-w-xs mb-8">
                  Pas de vieilles photos ! Montre qui tu es vraiment, maintenant.
                </p>

                {photo ? (
                  <div className="relative mb-6">
                    <img
                      src={photo.url}
                      alt="Profile"
                      className="w-48 h-48 rounded-2xl object-cover"
                    />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-neon-green flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="w-48 h-48 rounded-2xl bg-surface-card border-2 border-dashed border-white/20 flex items-center justify-center mb-6">
                    <Camera className="w-12 h-12 text-white/30" />
                  </div>
                )}

                <button
                  onClick={() => setShowCamera(true)}
                  className="btn-primary"
                >
                  {photo ? 'Reprendre la photo' : 'Ouvrir la caméra'}
                </button>
              </div>
            )}

            {/* Info Step */}
            {step === 'info' && (
              <div className="flex-1 flex flex-col overflow-y-auto">
                <h1 className="text-2xl font-bold text-white mb-2">
                  Crée ton compte
                </h1>
                <p className="text-white/60 mb-6">
                  Quelques infos pour commencer
                </p>

                <form onSubmit={handleSubmit(handleInfoSubmit)} className="space-y-4 flex-1">
                  {/* Email */}
                  <div>
                    <label className="block text-sm text-white/70 mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                      <input
                        {...register('email')}
                        type="email"
                        placeholder="ton@email.com"
                        className={cn(
                          'w-full h-14 pl-12 pr-4 rounded-2xl bg-surface-card border text-white placeholder:text-white/30',
                          'focus:outline-none focus:border-neon-cyan/50 transition-colors',
                          errors.email ? 'border-red-500' : 'border-white/10'
                        )}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm text-white/70 mb-2">Mot de passe</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                      <input
                        {...register('password')}
                        type="password"
                        placeholder="••••••"
                        className={cn(
                          'w-full h-14 pl-12 pr-4 rounded-2xl bg-surface-card border text-white placeholder:text-white/30',
                          'focus:outline-none focus:border-neon-cyan/50 transition-colors',
                          errors.password ? 'border-red-500' : 'border-white/10'
                        )}
                      />
                    </div>
                    {errors.password && (
                      <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
                    )}
                  </div>

                  {/* First Name */}
                  <div>
                    <label className="block text-sm text-white/70 mb-2">Prénom</label>
                    <input
                      {...register('firstName')}
                      type="text"
                      placeholder="Ton prénom"
                      className={cn(
                        'w-full h-14 px-4 rounded-2xl bg-surface-card border text-white placeholder:text-white/30',
                        'focus:outline-none focus:border-neon-cyan/50 transition-colors',
                        errors.firstName ? 'border-red-500' : 'border-white/10'
                      )}
                    />
                    {errors.firstName && (
                      <p className="text-red-400 text-sm mt-1">{errors.firstName.message}</p>
                    )}
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block text-sm text-white/70 mb-2">Âge</label>
                    <input
                      {...register('age', { valueAsNumber: true })}
                      type="number"
                      min={18}
                      max={99}
                      placeholder="18"
                      className={cn(
                        'w-full h-14 px-4 rounded-2xl bg-surface-card border text-white placeholder:text-white/30',
                        'focus:outline-none focus:border-neon-cyan/50 transition-colors',
                        errors.age ? 'border-red-500' : 'border-white/10'
                      )}
                    />
                    {errors.age && (
                      <p className="text-red-400 text-sm mt-1">{errors.age.message}</p>
                    )}
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm text-white/70 mb-2">Bio (optionnel)</label>
                    <textarea
                      {...register('bio')}
                      placeholder="Décris-toi en quelques mots..."
                      rows={3}
                      className={cn(
                        'w-full px-4 py-3 rounded-2xl bg-surface-card border text-white placeholder:text-white/30',
                        'focus:outline-none focus:border-neon-cyan/50 transition-colors resize-none',
                        errors.bio ? 'border-red-500' : 'border-white/10'
                      )}
                    />
                    {errors.bio && (
                      <p className="text-red-400 text-sm mt-1">{errors.bio.message}</p>
                    )}
                  </div>

                  <div className="flex-1" />

                  <button type="submit" className="w-full btn-primary">
                    Continuer
                  </button>
                </form>
              </div>
            )}

            {/* Interests Step */}
            {step === 'interests' && (
              <div className="flex-1 flex flex-col">
                <h1 className="text-2xl font-bold text-white mb-2">
                  Tes centres d'intérêt
                </h1>
                <p className="text-white/60 mb-6">
                  Choisis jusqu'à 5 intérêts ({selectedInterests.length}/5)
                </p>

                <div className="flex flex-wrap gap-3 mb-8">
                  {INTERESTS.map((interest) => {
                    const isSelected = selectedInterests.includes(interest)
                    return (
                      <motion.button
                        key={interest}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleInterest(interest)}
                        className={cn(
                          'px-4 py-2 rounded-full text-sm font-medium transition-all',
                          isSelected
                            ? 'bg-gradient-to-r from-neon-cyan to-neon-purple text-white'
                            : 'bg-white/5 text-white/70 hover:bg-white/10'
                        )}
                      >
                        {interest}
                      </motion.button>
                    )
                  })}
                </div>

                {errors.interests && (
                  <p className="text-red-400 text-sm mb-4">{errors.interests.message}</p>
                )}

                <div className="flex-1" />

                {authError && (
                  <p className="text-red-400 text-sm mb-4 text-center">{authError}</p>
                )}

                <button
                  onClick={handleInterestsSubmit}
                  disabled={selectedInterests.length === 0 || isSubmitting}
                  className="w-full btn-primary disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Création du compte...
                    </>
                  ) : (
                    'Créer mon compte'
                  )}
                </button>
              </div>
            )}

            {/* Wingman Step */}
            {step === 'wingman' && (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring' }}
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-neon-purple to-neon-pink p-[2px] mb-8"
                >
                  <div className="w-full h-full rounded-full bg-surface-dark flex items-center justify-center">
                    <Heart className="w-10 h-10 text-neon-pink" />
                  </div>
                </motion.div>

                <h1 className="text-2xl font-bold text-white mb-2">
                  Dernière étape !
                </h1>

                <p className="text-white/60 max-w-xs mb-8">
                  Invite un ami de confiance à valider ton profil. C'est ce qui rend ECHO unique !
                </p>

                {/* Code display */}
                <div className="bg-surface-card rounded-2xl p-6 mb-6 w-full max-w-xs">
                  <p className="text-white/50 text-sm mb-2">Ton code Wingman</p>
                  <p className="text-3xl font-mono font-bold text-gradient tracking-wider">
                    {wingmanCode}
                  </p>
                </div>

                <button
                  onClick={shareWingmanLink}
                  className="btn-primary flex items-center gap-2 mb-4"
                >
                  <Share2 className="w-5 h-5" />
                  Envoyer le lien
                </button>

                <button
                  onClick={() => navigate('/')}
                  className="text-white/50 text-sm hover:text-white/70 transition-colors"
                >
                  Je ferai ça plus tard
                </button>
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
            className="btn-primary flex items-center gap-2"
          >
            C'est parti
            <ArrowRight className="w-5 h-5" />
          </button>
        )}

        {step === 'photo' && photo && (
          <button
            onClick={nextStep}
            className="btn-primary flex items-center gap-2"
          >
            Continuer
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
}
