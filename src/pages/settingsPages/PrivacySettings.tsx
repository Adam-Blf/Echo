import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Eye,
  EyeOff,
  MapPin,
  Circle,
  Users,
  UserX,
  Shield,
  ChevronRight,
  X,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSettingsStore, type PrivacySettings, type BlockedUser } from '@/stores/settingsStore'

interface ToggleItemProps {
  icon: React.ElementType
  label: string
  description: string
  color: string
  checked: boolean
  onChange: (checked: boolean) => void
  delay?: number
}

function ToggleItem({
  icon: Icon,
  label,
  description,
  color,
  checked,
  onChange,
  delay = 0,
}: ToggleItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-center gap-4 p-4 rounded-2xl bg-surface-card border border-white/5"
    >
      <div
        className={cn(
          'w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-lg',
          color
        )}
      >
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1">
        <p className="text-white font-medium">{label}</p>
        <p className="text-white/40 text-sm">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          'relative w-14 h-8 rounded-full transition-colors duration-300',
          checked ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-white/10'
        )}
      >
        <motion.div
          animate={{ x: checked ? 26 : 4 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={cn(
            'absolute top-1 w-6 h-6 rounded-full shadow-lg',
            checked ? 'bg-white' : 'bg-white/60'
          )}
        />
      </button>
    </motion.div>
  )
}

export function PrivacySettingsPage() {
  const navigate = useNavigate()
  const { privacy, updatePrivacy, blockedUsers, unblockUser } = useSettingsStore()
  const [showBlockedUsersModal, setShowBlockedUsersModal] = useState(false)
  const [showVisibilityModal, setShowVisibilityModal] = useState(false)

  const privacyItems: Array<{
    key: keyof Omit<PrivacySettings, 'whoCanSeeMe'>
    icon: React.ElementType
    label: string
    description: string
    color: string
  }> = [
    {
      key: 'invisibleMode',
      icon: EyeOff,
      label: 'Mode invisible',
      description: "Tu n'apparaitras pas dans le feed des autres",
      color: 'from-slate-500 to-gray-600',
    },
    {
      key: 'showDistance',
      icon: MapPin,
      label: 'Afficher ma distance',
      description: 'Les autres verront a quelle distance tu es',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      key: 'showOnlineStatus',
      icon: Circle,
      label: 'Afficher mon statut en ligne',
      description: 'Les autres sauront quand tu es connecte',
      color: 'from-emerald-500 to-green-500',
    },
  ]

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date))
  }

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
          <h1 className="text-xl font-bold text-white">Confidentialite</h1>
        </div>
      </div>

      <div className="p-4 pb-24 space-y-6">
        {/* Invisible Mode Warning */}
        <AnimatePresence>
          {privacy.invisibleMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                  <EyeOff className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-amber-400 font-medium mb-1">Mode invisible actif</p>
                  <p className="text-white/50 text-sm">
                    Tu n'apparais plus dans le feed. Desactive ce mode pour etre visible a nouveau.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Privacy toggles */}
        <div>
          <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-3 px-1">
            Visibilite
          </p>
          <div className="space-y-2">
            {privacyItems.map((item, i) => (
              <ToggleItem
                key={item.key}
                icon={item.icon}
                label={item.label}
                description={item.description}
                color={item.color}
                checked={privacy[item.key]}
                onChange={(checked) => updatePrivacy(item.key, checked)}
                delay={i * 0.05}
              />
            ))}
          </div>
        </div>

        {/* Who can see me */}
        <div>
          <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-3 px-1">
            Qui peut me voir
          </p>
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            onClick={() => setShowVisibilityModal(true)}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-surface-card border border-white/5
                     hover:bg-surface-elevated hover:border-white/10 transition-all group"
          >
            <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-500 shadow-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-white font-medium">Audience</p>
              <p className="text-white/40 text-sm">
                {privacy.whoCanSeeMe === 'everyone' ? 'Tout le monde' : 'Seulement mes preferences'}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/50 transition-colors" />
          </motion.button>
        </div>

        {/* Blocked users */}
        <div>
          <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-3 px-1">
            Blocages
          </p>
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => setShowBlockedUsersModal(true)}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-surface-card border border-white/5
                     hover:bg-surface-elevated hover:border-white/10 transition-all group"
          >
            <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br from-red-500 to-rose-500 shadow-lg">
              <UserX className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-white font-medium">Personnes bloquees</p>
              <p className="text-white/40 text-sm">
                {blockedUsers.length === 0
                  ? 'Aucune personne bloquee'
                  : `${blockedUsers.length} personne${blockedUsers.length > 1 ? 's' : ''} bloquee${blockedUsers.length > 1 ? 's' : ''}`}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/50 transition-colors" />
          </motion.button>
        </div>

        {/* Privacy tip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-medium mb-1">Ta vie privee compte</p>
              <p className="text-white/50 text-sm">
                Tu as le controle total sur qui peut voir ton profil et tes informations.
                N'hesite pas a ajuster ces parametres selon ton confort.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Visibility Modal */}
      <AnimatePresence>
        {showVisibilityModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowVisibilityModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full bg-surface-elevated rounded-t-3xl border-t border-white/10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <h3 className="text-lg font-bold text-white">Qui peut me voir</h3>
                <button
                  onClick={() => setShowVisibilityModal(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white/70" />
                </button>
              </div>
              <div className="p-4 space-y-3">
                <button
                  onClick={() => {
                    updatePrivacy('whoCanSeeMe', 'everyone')
                    setShowVisibilityModal(false)
                  }}
                  className={cn(
                    'w-full p-4 rounded-2xl border transition-all flex items-center gap-4',
                    privacy.whoCanSeeMe === 'everyone'
                      ? 'bg-gradient-to-r from-violet-500/20 to-purple-500/20 border-violet-500/50'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  )}
                >
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-white font-medium">Tout le monde</p>
                    <p className="text-white/40 text-sm">Tous les utilisateurs peuvent voir ton profil</p>
                  </div>
                  {privacy.whoCanSeeMe === 'everyone' && (
                    <div className="w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  )}
                </button>

                <button
                  onClick={() => {
                    updatePrivacy('whoCanSeeMe', 'preferences_only')
                    setShowVisibilityModal(false)
                  }}
                  className={cn(
                    'w-full p-4 rounded-2xl border transition-all flex items-center gap-4',
                    privacy.whoCanSeeMe === 'preferences_only'
                      ? 'bg-gradient-to-r from-violet-500/20 to-purple-500/20 border-violet-500/50'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  )}
                >
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-white font-medium">Seulement mes preferences</p>
                    <p className="text-white/40 text-sm">Seules les personnes correspondant a tes criteres</p>
                  </div>
                  {privacy.whoCanSeeMe === 'preferences_only' && (
                    <div className="w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  )}
                </button>
              </div>
              <div className="p-4 safe-bottom" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Blocked Users Modal */}
      <AnimatePresence>
        {showBlockedUsersModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowBlockedUsersModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-h-[80vh] bg-surface-elevated rounded-t-3xl border-t border-white/10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <h3 className="text-lg font-bold text-white">Personnes bloquees</h3>
                <button
                  onClick={() => setShowBlockedUsersModal(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white/70" />
                </button>
              </div>
              <div className="overflow-y-auto max-h-[calc(80vh-80px)]">
                {blockedUsers.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
                      <UserX className="w-8 h-8 text-white/30" />
                    </div>
                    <p className="text-white/50 mb-2">Aucune personne bloquee</p>
                    <p className="text-white/30 text-sm">
                      Les personnes que tu bloques apparaitront ici
                    </p>
                  </div>
                ) : (
                  <div className="p-4 space-y-2">
                    {blockedUsers.map((user: BlockedUser) => (
                      <motion.div
                        key={user.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center gap-4 p-4 rounded-2xl bg-surface-card border border-white/5"
                      >
                        <div className="w-12 h-12 rounded-full bg-white/10 overflow-hidden">
                          {user.photoUrl ? (
                            <img
                              src={user.photoUrl}
                              alt={user.firstName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/30 font-medium text-lg">
                              {user.firstName[0]}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">{user.firstName}</p>
                          <p className="text-white/40 text-sm">
                            Bloque le {formatDate(user.blockedAt)}
                          </p>
                        </div>
                        <button
                          onClick={() => unblockUser(user.id)}
                          className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 transition-colors"
                        >
                          <Trash2 className="w-5 h-5 text-red-400" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-4 safe-bottom" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
