import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronRight, X, Sparkles, AlertCircle } from 'lucide-react'
import { VoiceRecorder } from '@/components/ui'
import { QUALITIES, FLAWS, type WingmanPayload, type UserPreview } from '@/types/wingman'
import { cn } from '@/lib/utils'

type WingmanStep = 'intro' | 'qualities' | 'flaws' | 'voice' | 'testimonial' | 'relationship' | 'success'

// Mock user preview (would come from API)
const MOCK_USER: UserPreview = {
  firstName: 'Alex',
  age: 25,
  photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
}

export function WingmanPage() {
  const { token } = useParams<{ token: string }>()

  const [step, setStep] = useState<WingmanStep>('intro')
  const [isLoading, setIsLoading] = useState(true)
  const [isExpired, setIsExpired] = useState(false)
  const [user, setUser] = useState<UserPreview | null>(null)

  // Form state
  const [selectedQualities, setSelectedQualities] = useState<string[]>([])
  const [selectedFlaws, setSelectedFlaws] = useState<string[]>([])
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioDuration, setAudioDuration] = useState(0)
  const [testimonial, setTestimonial] = useState('')
  const [relationship, setRelationship] = useState<WingmanPayload['relationship']>('friend')
  const [knowsSince, setKnowsSince] = useState('')

  // Simulate loading user data
  useEffect(() => {
    const loadUser = async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Check if token is valid (mock)
      if (token === 'EXPIRED') {
        setIsExpired(true)
      } else {
        setUser(MOCK_USER)
      }
      setIsLoading(false)
    }
    loadUser()
  }, [token])

  const toggleQuality = (quality: string) => {
    if (selectedQualities.includes(quality)) {
      setSelectedQualities(prev => prev.filter(q => q !== quality))
    } else if (selectedQualities.length < 3) {
      setSelectedQualities(prev => [...prev, quality])
    }
  }

  const toggleFlaw = (flaw: string) => {
    if (selectedFlaws.includes(flaw)) {
      setSelectedFlaws(prev => prev.filter(f => f !== flaw))
    } else if (selectedFlaws.length < 2) {
      setSelectedFlaws(prev => [...prev, flaw])
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)

    const payload: WingmanPayload = {
      qualities: selectedQualities,
      flaws: selectedFlaws,
      audioBlob: audioBlob ?? undefined,
      audioDuration: audioDuration || undefined,
      testimonial,
      relationship,
      knowsSince,
      submittedAt: new Date(),
    }

    // Simulate API call
    console.log('Submitting wingman validation:', payload)
    await new Promise(resolve => setTimeout(resolve, 1500))

    setIsLoading(false)
    setStep('success')
  }

  const canProceed = () => {
    switch (step) {
      case 'qualities': return selectedQualities.length >= 2
      case 'flaws': return selectedFlaws.length >= 1
      case 'voice': return true // Voice is optional
      case 'testimonial': return testimonial.length >= 20
      case 'relationship': return knowsSince.length > 0
      default: return true
    }
  }

  const nextStep = () => {
    const steps: WingmanStep[] = ['intro', 'qualities', 'flaws', 'voice', 'testimonial', 'relationship']
    const currentIndex = steps.indexOf(step)
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1])
    } else {
      handleSubmit()
    }
  }

  // Loading state
  if (isLoading && !user) {
    return (
      <div className="min-h-screen bg-surface-dark flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-12 h-12 border-2 border-neon-cyan border-t-transparent rounded-full"
        />
      </div>
    )
  }

  // Expired state
  if (isExpired) {
    return (
      <div className="min-h-screen bg-surface-dark flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Lien expiré</h1>
        <p className="text-white/60 max-w-xs mb-6">
          Ce lien de validation n'est plus valide. Demande à ton ami d'en générer un nouveau.
        </p>
        <button
          onClick={() => window.close()}
          className="btn-ghost"
        >
          Fermer
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-dark">
      {/* Header */}
      <div className="p-4 flex items-center justify-between safe-top">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center">
            <span className="text-sm font-bold text-white">E</span>
          </div>
          <span className="text-white font-semibold">ECHO</span>
        </div>
        {step !== 'success' && step !== 'intro' && (
          <button onClick={() => window.close()} className="p-2 text-white/50">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="p-6"
        >
          {/* Intro Step */}
          {step === 'intro' && user && (
            <div className="flex flex-col items-center text-center">
              <motion.img
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' }}
                src={user.photoUrl}
                alt={user.firstName}
                className="w-32 h-32 rounded-full object-cover border-4 border-neon-purple mb-6"
              />

              <h1 className="text-2xl font-bold text-white mb-2">
                {user.firstName} a besoin de toi !
              </h1>

              <p className="text-white/60 max-w-xs mb-8">
                En tant que Wingman, tu vas aider {user.firstName} à créer un profil authentique sur ECHO.
              </p>

              <div className="w-full space-y-3 mb-8">
                {[
                  'Sélectionne ses qualités',
                  'Mentionne un petit défaut (fun)',
                  'Laisse un message vocal ou écrit',
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-3 text-left">
                    <div className="w-8 h-8 rounded-full bg-neon-purple/20 flex items-center justify-center text-neon-purple font-bold text-sm">
                      {i + 1}
                    </div>
                    <span className="text-white/80">{text}</span>
                  </div>
                ))}
              </div>

              <button onClick={nextStep} className="btn-primary w-full">
                C'est parti !
              </button>
            </div>
          )}

          {/* Qualities Step */}
          {step === 'qualities' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                Ses 3 meilleures qualités
              </h2>
              <p className="text-white/50 text-sm mb-6">
                Sélectionne 2-3 qualités ({selectedQualities.length}/3)
              </p>

              <div className="flex flex-wrap gap-2 mb-8">
                {QUALITIES.map((quality) => {
                  const isSelected = selectedQualities.includes(quality)
                  return (
                    <motion.button
                      key={quality}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleQuality(quality)}
                      className={cn(
                        'px-4 py-2 rounded-full text-sm font-medium transition-all',
                        isSelected
                          ? 'bg-neon-cyan text-white'
                          : 'bg-white/5 text-white/70 hover:bg-white/10'
                      )}
                    >
                      {quality}
                    </motion.button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Flaws Step */}
          {step === 'flaws' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                Un petit défaut (fun) 😄
              </h2>
              <p className="text-white/50 text-sm mb-6">
                Sélectionne 1-2 défauts ({selectedFlaws.length}/2)
              </p>

              <div className="flex flex-wrap gap-2 mb-8">
                {FLAWS.map((flaw) => {
                  const isSelected = selectedFlaws.includes(flaw)
                  return (
                    <motion.button
                      key={flaw}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleFlaw(flaw)}
                      className={cn(
                        'px-4 py-2 rounded-full text-sm font-medium transition-all',
                        isSelected
                          ? 'bg-neon-pink text-white'
                          : 'bg-white/5 text-white/70 hover:bg-white/10'
                      )}
                    >
                      {flaw}
                    </motion.button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Voice Step */}
          {step === 'voice' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                Message vocal (optionnel)
              </h2>
              <p className="text-white/50 text-sm mb-6">
                Enregistre un message sympa pour le/la présenter
              </p>

              <VoiceRecorder
                onRecordingComplete={(blob, duration) => {
                  setAudioBlob(blob)
                  setAudioDuration(duration)
                }}
              />

              {audioBlob && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 rounded-xl bg-neon-green/10 border border-neon-green/30 flex items-center gap-2"
                >
                  <Check className="w-5 h-5 text-neon-green" />
                  <span className="text-neon-green text-sm">
                    Message enregistré ({Math.round(audioDuration)}s)
                  </span>
                </motion.div>
              )}
            </div>
          )}

          {/* Testimonial Step */}
          {step === 'testimonial' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                Dis quelque chose de sympa
              </h2>
              <p className="text-white/50 text-sm mb-6">
                Cette phrase apparaîtra sur son profil
              </p>

              <textarea
                value={testimonial}
                onChange={(e) => setTestimonial(e.target.value)}
                placeholder="Ex: La personne la plus drôle que je connaisse, toujours là quand on a besoin..."
                rows={4}
                maxLength={200}
                className="w-full px-4 py-3 rounded-2xl bg-surface-card border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-neon-cyan/50 transition-colors resize-none"
              />
              <div className="flex justify-end mt-2">
                <span className="text-white/40 text-sm">{testimonial.length}/200</span>
              </div>
            </div>
          )}

          {/* Relationship Step */}
          {step === 'relationship' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                Votre relation
              </h2>
              <p className="text-white/50 text-sm mb-6">
                Comment vous connaissez-vous ?
              </p>

              <div className="space-y-3 mb-6">
                {[
                  { value: 'bestfriend', label: 'Meilleur(e) ami(e)' },
                  { value: 'friend', label: 'Ami(e)' },
                  { value: 'family', label: 'Famille' },
                  { value: 'colleague', label: 'Collègue' },
                  { value: 'other', label: 'Autre' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setRelationship(option.value as WingmanPayload['relationship'])}
                    className={cn(
                      'w-full p-4 rounded-2xl text-left transition-all flex items-center justify-between',
                      relationship === option.value
                        ? 'bg-neon-purple/20 border border-neon-purple'
                        : 'bg-surface-card border border-white/10 hover:border-white/20'
                    )}
                  >
                    <span className="text-white">{option.label}</span>
                    {relationship === option.value && (
                      <Check className="w-5 h-5 text-neon-purple" />
                    )}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-2">
                  Depuis combien de temps ?
                </label>
                <input
                  type="text"
                  value={knowsSince}
                  onChange={(e) => setKnowsSince(e.target.value)}
                  placeholder="Ex: 5 ans, depuis le lycée..."
                  className="w-full h-14 px-4 rounded-2xl bg-surface-card border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-neon-cyan/50 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <div className="flex flex-col items-center text-center pt-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-24 h-24 rounded-full bg-neon-green/20 flex items-center justify-center mb-6"
              >
                <Sparkles className="w-12 h-12 text-neon-green" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-2xl font-bold text-white mb-2"
              >
                Merci Wingman ! 🎉
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-white/60 max-w-xs mb-8"
              >
                {user?.firstName} va recevoir une notification. Son profil est maintenant validé !
              </motion.p>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                onClick={() => window.close()}
                className="btn-primary"
              >
                Fermer
              </motion.button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Bottom navigation */}
      {step !== 'intro' && step !== 'success' && (
        <div className="fixed bottom-0 left-0 right-0 p-6 safe-bottom bg-gradient-to-t from-surface-dark to-transparent">
          <button
            onClick={nextStep}
            disabled={!canProceed() || isLoading}
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
            ) : (
              <>
                <span>{step === 'relationship' ? 'Valider' : 'Continuer'}</span>
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
