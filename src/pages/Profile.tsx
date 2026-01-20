import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Settings, Camera, Share2, LogOut, ChevronRight, Shield, Bell, Globe, History } from 'lucide-react'
import { useUserStore, initializeDemoProfile } from '@/stores'
import { StatusBadge, ExpirationBanner } from '@/components/ui'
import { cn } from '@/lib/utils'

export function ProfilePage() {
  const { profile, echoStatus, daysUntilExpiration, isActive, refreshEchoStatus, logout } = useUserStore()

  // Initialize demo profile and refresh status on mount
  useEffect(() => {
    initializeDemoProfile()
    refreshEchoStatus()
  }, [refreshEchoStatus])

  // Calculate profile completion percentage
  const calculateProgress = () => {
    if (!profile) return 0
    let score = 0
    if (profile.firstName) score += 15
    if (profile.age) score += 10
    if (profile.photoUrl) score += 25
    if (profile.bio) score += 15
    if (profile.interests.length > 0) score += 15
    if (profile.isValidated) score += 20
    return Math.min(100, score)
  }

  const progress = calculateProgress()

  return (
    <div className="p-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-white">Profil</h1>
        <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
          <Settings className="w-5 h-5 text-white/70" />
        </button>
      </div>

      {/* Expiration Banner */}
      <ExpirationBanner status={echoStatus} daysLeft={daysUntilExpiration} />

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-elevated mb-6"
      >
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative">
            <div
              className={cn(
                'w-20 h-20 rounded-full p-[2px]',
                isActive
                  ? 'bg-gradient-to-br from-neon-cyan to-neon-purple'
                  : 'bg-gradient-to-br from-white/20 to-white/10'
              )}
            >
              <div
                className={cn(
                  'w-full h-full rounded-full bg-surface-card flex items-center justify-center overflow-hidden',
                  !isActive && 'grayscale'
                )}
              >
                {profile?.photoUrl ? (
                  <img
                    src={profile.photoUrl}
                    alt={profile.firstName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Camera className="w-8 h-8 text-white/30" />
                )}
              </div>
            </div>
            {/* Status indicator */}
            <div className="absolute -bottom-1 -right-1">
              <StatusBadge status={echoStatus} daysLeft={daysUntilExpiration} size="sm" showLabel={false} />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-white">
              {profile?.firstName || 'Utilisateur'}, {profile?.age || '?'}
            </h2>
            <p className="text-white/40 text-sm">
              {profile?.isValidated ? 'Profil validé ✓' : 'En attente Wingman'}
            </p>
            <div className="mt-2">
              <StatusBadge status={echoStatus} daysLeft={daysUntilExpiration} size="sm" />
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-white/50">Progression du profil</span>
            <span className="text-neon-cyan">{progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className={cn(
                'h-full rounded-full',
                progress === 100
                  ? 'bg-neon-green'
                  : 'bg-gradient-to-r from-neon-cyan to-neon-purple'
              )}
            />
          </div>
        </div>

        {/* TTL Info */}
        {isActive && (
          <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-sm">Prochaine expiration</span>
              <span className="text-white font-medium">
                {daysUntilExpiration > 0 ? `Dans ${daysUntilExpiration} jour${daysUntilExpiration > 1 ? 's' : ''}` : "Aujourd'hui"}
              </span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-2"
      >
        {/* Take Photo CTA */}
        <Link
          to="/camera"
          className={cn(
            'w-full flex items-center gap-4 p-4 rounded-2xl border transition-all group',
            !isActive
              ? 'bg-neon-cyan/10 border-neon-cyan/30 hover:bg-neon-cyan/20'
              : 'bg-surface-card border-white/5 hover:bg-surface-elevated hover:border-white/10'
          )}
        >
          <div
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center',
              !isActive ? 'bg-neon-cyan/20' : 'bg-white/5'
            )}
          >
            <Camera className={cn('w-5 h-5', !isActive ? 'text-neon-cyan' : 'text-white/70')} />
          </div>
          <div className="flex-1 text-left">
            <p className={cn('font-medium', !isActive ? 'text-neon-cyan' : 'text-white')}>
              {!isActive ? 'Réactiver mon Echo' : 'Prendre une photo'}
            </p>
            <p className="text-white/40 text-sm">
              {!isActive ? 'Ton profil est invisible' : 'Met à jour ton Echo'}
            </p>
          </div>
          <ChevronRight
            className={cn(
              'w-5 h-5 transition-colors',
              !isActive ? 'text-neon-cyan' : 'text-white/30 group-hover:text-white/50'
            )}
          />
        </Link>

        {/* Other actions */}
        {[
          { icon: Share2, label: 'Inviter un Wingman', desc: 'Fais valider ton profil', to: '/wingman/invite' },
          { icon: History, label: 'Historique photos', desc: 'Tes anciens Echos', to: '/history' },
          { icon: Bell, label: 'Notifications', desc: 'Gérer les alertes', to: '/settings/notifications' },
          { icon: Globe, label: 'Langue', desc: 'Français', to: '/settings/language' },
          { icon: Shield, label: 'Confidentialité', desc: 'Paramètres de sécurité', to: '/settings/privacy' },
        ].map((item, i) => (
          <Link
            key={i}
            to={item.to}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-surface-card border border-white/5
                       hover:bg-surface-elevated hover:border-white/10 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
              <item.icon className="w-5 h-5 text-white/70" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-white font-medium">{item.label}</p>
              <p className="text-white/40 text-sm">{item.desc}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/50 transition-colors" />
          </Link>
        ))}
      </motion.div>

      {/* Logout */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        onClick={logout}
        className="w-full mt-6 flex items-center justify-center gap-2 p-4 rounded-2xl
                   text-red-400 hover:bg-red-500/10 transition-colors"
      >
        <LogOut className="w-5 h-5" />
        <span>Déconnexion</span>
      </motion.button>
    </div>
  )
}
