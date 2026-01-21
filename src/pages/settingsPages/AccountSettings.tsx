import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Mail,
  Phone,
  Lock,
  Trash2,
  Download,
  ChevronRight,
  Eye,
  EyeOff,
  X,
  AlertTriangle,
  Check,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

export function AccountSettingsPage() {
  const navigate = useNavigate()
  const { user, profile, signOut } = useAuth()

  // Modal states
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showPhoneModal, setShowPhoneModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Form states
  const [newEmail, setNewEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  // Loading and error states
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleUpdateEmail = async () => {
    if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      setError('Email invalide')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        email: newEmail,
      })

      if (updateError) throw updateError

      setSuccess('Un email de confirmation a ete envoye')
      setTimeout(() => {
        setShowEmailModal(false)
        setSuccess('')
        setNewEmail('')
      }, 2000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise a jour')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdatePhone = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Numero invalide')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        phone: phoneNumber,
      })

      if (updateError) throw updateError

      setSuccess('Numero mis a jour')
      setTimeout(() => {
        setShowPhoneModal(false)
        setSuccess('')
        setPhoneNumber('')
      }, 2000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise a jour')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caracteres')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) throw updateError

      setSuccess('Mot de passe mis a jour')
      setTimeout(() => {
        setShowPasswordModal(false)
        setSuccess('')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      }, 2000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise a jour')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'SUPPRIMER') {
      setError('Tape "SUPPRIMER" pour confirmer')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Delete user profile data first
      if (user) {
        await supabase.from('profiles').delete().eq('id', user.id)
        await supabase.from('matches').delete().or(`user_id.eq.${user.id},matched_user_id.eq.${user.id}`)
        await supabase.from('messages').delete().eq('sender_id', user.id)
      }

      // Sign out the user (account deletion requires admin API in Supabase)
      await signOut()
      navigate('/')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression')
      setIsLoading(false)
    }
  }

  const handleExportData = async () => {
    setIsLoading(true)
    setError('')

    try {
      // Fetch all user data
      const userData = {
        profile: profile,
        email: user?.email,
        exportDate: new Date().toISOString(),
      }

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(userData, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `echo-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setSuccess('Donnees exportees avec succes')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'export")
    } finally {
      setIsLoading(false)
    }
  }

  const menuItems = [
    {
      icon: Mail,
      label: 'Email',
      value: user?.email || 'Non defini',
      action: () => setShowEmailModal(true),
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Phone,
      label: 'Telephone',
      value: user?.phone || 'Ajouter',
      action: () => setShowPhoneModal(true),
      color: 'from-emerald-500 to-teal-500',
    },
    {
      icon: Lock,
      label: 'Mot de passe',
      value: '********',
      action: () => setShowPasswordModal(true),
      color: 'from-violet-500 to-purple-500',
    },
  ]

  const dangerItems = [
    {
      icon: Download,
      label: 'Exporter mes donnees',
      description: 'Telecharge une copie de tes donnees (RGPD)',
      action: handleExportData,
      color: 'from-amber-500 to-orange-500',
    },
    {
      icon: Trash2,
      label: 'Supprimer mon compte',
      description: 'Action irreversible',
      action: () => setShowDeleteModal(true),
      color: 'from-red-500 to-rose-500',
      danger: true,
    },
  ]

  return (
    <div className="min-h-screen bg-surface-dark">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-surface-dark/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-4 p-4 safe-top">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white/70" />
          </button>
          <h1 className="text-xl font-bold text-white">Compte</h1>
        </div>
      </div>

      <div className="p-4 pb-24 space-y-6">
        {/* Success Message */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3"
            >
              <Check className="w-5 h-5 text-emerald-400" />
              <p className="text-emerald-400 text-sm">{success}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Account Info */}
        <div>
          <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-3 px-1">
            Informations du compte
          </p>
          <div className="space-y-2">
            {menuItems.map((item, i) => (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={item.action}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-surface-card border border-white/5
                         hover:bg-surface-elevated hover:border-white/10 transition-all group"
              >
                <div
                  className={cn(
                    'w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-lg',
                    item.color
                  )}
                >
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-white font-medium">{item.label}</p>
                  <p className="text-white/40 text-sm truncate max-w-[200px]">{item.value}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/50 transition-colors" />
              </motion.button>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div>
          <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-3 px-1">
            Zone dangereuse
          </p>
          <div className="space-y-2">
            {dangerItems.map((item, i) => (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (i + menuItems.length) * 0.05 }}
                onClick={item.action}
                disabled={isLoading}
                className={cn(
                  'w-full flex items-center gap-4 p-4 rounded-2xl border transition-all group',
                  item.danger
                    ? 'bg-red-500/5 border-red-500/10 hover:bg-red-500/10 hover:border-red-500/20'
                    : 'bg-surface-card border-white/5 hover:bg-surface-elevated hover:border-white/10'
                )}
              >
                <div
                  className={cn(
                    'w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-lg',
                    item.color
                  )}
                >
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className={cn('font-medium', item.danger ? 'text-red-400' : 'text-white')}>
                    {item.label}
                  </p>
                  <p className="text-white/40 text-sm">{item.description}</p>
                </div>
                <ChevronRight
                  className={cn(
                    'w-5 h-5 transition-colors',
                    item.danger
                      ? 'text-red-400/30 group-hover:text-red-400/50'
                      : 'text-white/30 group-hover:text-white/50'
                  )}
                />
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Email Modal */}
      <AnimatePresence>
        {showEmailModal && (
          <Modal onClose={() => setShowEmailModal(false)} title="Modifier l'email">
            <div className="space-y-4">
              <div>
                <label className="text-white/50 text-sm mb-2 block">Nouvel email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="exemple@email.com"
                  className="w-full h-14 px-4 rounded-2xl bg-black/30 border border-white/10 text-white
                           placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 transition-all"
                />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              {success && <p className="text-emerald-400 text-sm">{success}</p>}
              <button
                onClick={handleUpdateEmail}
                disabled={isLoading}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold
                         shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Mettre a jour'}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Phone Modal */}
      <AnimatePresence>
        {showPhoneModal && (
          <Modal onClose={() => setShowPhoneModal(false)} title="Modifier le telephone">
            <div className="space-y-4">
              <div>
                <label className="text-white/50 text-sm mb-2 block">Numero de telephone</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+33 6 12 34 56 78"
                  className="w-full h-14 px-4 rounded-2xl bg-black/30 border border-white/10 text-white
                           placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 transition-all"
                />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              {success && <p className="text-emerald-400 text-sm">{success}</p>}
              <button
                onClick={handleUpdatePhone}
                disabled={isLoading}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold
                         shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Mettre a jour'}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <Modal onClose={() => setShowPasswordModal(false)} title="Changer le mot de passe">
            <div className="space-y-4">
              <div>
                <label className="text-white/50 text-sm mb-2 block">Mot de passe actuel</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-14 px-4 pr-12 rounded-2xl bg-black/30 border border-white/10 text-white
                             placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-white/50 text-sm mb-2 block">Nouveau mot de passe</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 caracteres"
                    className="w-full h-14 px-4 pr-12 rounded-2xl bg-black/30 border border-white/10 text-white
                             placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-white/50 text-sm mb-2 block">Confirmer le mot de passe</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-14 px-4 rounded-2xl bg-black/30 border border-white/10 text-white
                           placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 transition-all"
                />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              {success && <p className="text-emerald-400 text-sm">{success}</p>}
              <button
                onClick={handleResetPassword}
                disabled={isLoading}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold
                         shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Changer le mot de passe'}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-surface-elevated rounded-3xl p-6 border border-white/10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/20">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-2">
                Supprimer ton compte ?
              </h3>
              <p className="text-white/50 text-center text-sm mb-6">
                Cette action est <strong className="text-red-400">irreversible</strong>. Toutes tes donnees,
                matches et conversations seront definitivement supprimees.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="text-white/50 text-sm mb-2 block">
                    Tape <strong className="text-red-400">SUPPRIMER</strong> pour confirmer
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="SUPPRIMER"
                    className="w-full h-14 px-4 rounded-2xl bg-black/30 border border-red-500/20 text-white
                             placeholder:text-white/30 focus:outline-none focus:border-red-500/50 transition-all"
                  />
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button
                  onClick={handleDeleteAccount}
                  disabled={isLoading || deleteConfirmation !== 'SUPPRIMER'}
                  className="w-full h-12 rounded-xl bg-red-500 text-white font-semibold
                           hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Supprimer definitivement'}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setDeleteConfirmation('')
                    setError('')
                  }}
                  className="w-full h-12 rounded-xl bg-white/5 text-white/70 font-medium
                           hover:bg-white/10 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Reusable Modal Component
function Modal({
  onClose,
  title,
  children,
}: {
  onClose: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full sm:max-w-md bg-surface-elevated rounded-t-3xl sm:rounded-3xl border-t sm:border border-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white/70" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </motion.div>
  )
}
