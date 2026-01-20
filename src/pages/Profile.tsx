import { motion } from 'framer-motion'
import { Settings, Camera, Share2, LogOut, ChevronRight, Shield, Bell, Globe } from 'lucide-react'

export function ProfilePage() {
  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Profil</h1>
        <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
          <Settings className="w-5 h-5 text-white/70" />
        </button>
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-elevated mb-6"
      >
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple p-[2px]">
              <div className="w-full h-full rounded-full bg-surface-card flex items-center justify-center">
                <Camera className="w-8 h-8 text-white/30" />
              </div>
            </div>
            {/* Status indicator */}
            <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-neon-green border-2 border-surface-elevated" />
          </div>

          {/* Info */}
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-white">Utilisateur</h2>
            <p className="text-white/40 text-sm">Profil incomplet</p>
            <div className="mt-2 flex items-center gap-2">
              <div className="px-2 py-1 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20">
                <span className="text-xs text-neon-cyan">En attente Wingman</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-white/50">Progression du profil</span>
            <span className="text-neon-cyan">20%</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '20%' }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple rounded-full"
            />
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-2"
      >
        {[
          { icon: Camera, label: 'Prendre une photo', desc: 'Met à jour ton Echo' },
          { icon: Share2, label: 'Inviter un Wingman', desc: 'Fais valider ton profil' },
          { icon: Bell, label: 'Notifications', desc: 'Gérer les alertes' },
          { icon: Globe, label: 'Langue', desc: 'Français' },
          { icon: Shield, label: 'Confidentialité', desc: 'Paramètres de sécurité' },
        ].map((item, i) => (
          <button
            key={i}
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
          </button>
        ))}
      </motion.div>

      {/* Logout */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="w-full mt-6 flex items-center justify-center gap-2 p-4 rounded-2xl
                   text-red-400 hover:bg-red-500/10 transition-colors"
      >
        <LogOut className="w-5 h-5" />
        <span>Déconnexion</span>
      </motion.button>
    </div>
  )
}
