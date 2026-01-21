import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

// Google icon component
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

export function AuthPage() {
  const navigate = useNavigate()
  const { signIn, signInWithGoogle } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<'google' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const { error } = await signIn(email, password)

    if (error) {
      setError(error.message)
      setIsLoading(false)
      return
    }

    // Navigate will happen automatically via auth state change
    setIsLoading(false)
  }

  const handleGoogleSignIn = async () => {
    setOauthLoading('google')
    setError(null)
    const { error } = await signInWithGoogle()
    if (error) {
      setError(error.message)
      setOauthLoading(null)
    }
    // Redirect will happen via OAuth flow
  }

  const goToSignup = () => {
    navigate('/onboarding')
  }

  return (
    <div className="min-h-screen bg-surface-dark flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="relative mb-8"
      >
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-violet-500/30">
          <Sparkles className="w-12 h-12 text-white" />
        </div>
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-500 blur-2xl opacity-40 -z-10" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-3xl font-bold text-white mb-2 tracking-tight"
      >
        Bienvenue sur <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">ECHO</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-white/50 mb-8 text-center"
      >
        Connecte-toi pour continuer
      </motion.p>

      {/* Auth card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-sm bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl"
      >
        {/* OAuth buttons */}
        <div className="space-y-3 mb-6">
          {/* Google */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleSignIn}
            disabled={oauthLoading !== null}
            className="w-full h-14 rounded-2xl bg-white text-gray-800 font-semibold flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {oauthLoading === 'google' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <GoogleIcon className="w-5 h-5" />
                Continuer avec Google
              </>
            )}
          </motion.button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-white/30 text-xs uppercase">ou</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Email/Password form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          {/* Email */}
          <div className={cn(
            'flex items-center gap-3 h-14 px-4 rounded-2xl bg-black/30 border transition-all',
            'border-white/10 focus-within:border-violet-500/50'
          )}>
            <Mail className="w-5 h-5 text-white/40" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="flex-1 bg-transparent text-white placeholder:text-white/30 focus:outline-none"
            />
          </div>

          {/* Password */}
          <div className={cn(
            'flex items-center gap-3 h-14 px-4 rounded-2xl bg-black/30 border transition-all',
            'border-white/10 focus-within:border-violet-500/50'
          )}>
            <Lock className="w-5 h-5 text-white/40" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              required
              className="flex-1 bg-transparent text-white placeholder:text-white/30 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-white/40 hover:text-white/60 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Error */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm text-center"
            >
              {error}
            </motion.p>
          )}

          {/* Submit */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-shadow disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Connexion...
              </>
            ) : (
              'Se connecter'
            )}
          </motion.button>
        </form>
      </motion.div>

      {/* Create account link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-6 text-center"
      >
        <p className="text-white/50">
          Pas encore de compte ?{' '}
          <button
            onClick={goToSignup}
            className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
          >
            Créer un compte
          </button>
        </p>
      </motion.div>
    </div>
  )
}
