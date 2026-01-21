import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  User,
  Bell,
  Shield,
  HelpCircle,
  FileText,
  Lock,
  LogOut,
  ChevronRight,
  ExternalLink,
  X,
  AlertTriangle,
  Sparkles,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react'
import { CardSection, Toggle, PremiumBanner } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { useUserStore, useSettingsStore, useSwipeStore } from '@/stores'

// Animation variants for staggered list
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
    },
  },
}

interface MenuItem {
  icon: React.ElementType
  label: string
  description?: string
  to?: string
  action?: () => void
  external?: boolean
  iconColor?: string
}

export function SettingsPage() {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const { logout: storeLogout, profile } = useUserStore()
  const { privacy, updatePrivacy, notifications, updateNotification } = useSettingsStore()
  const { isPremium } = useSwipeStore()

  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showPrivacyPolicyModal, setShowPrivacyPolicyModal] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await signOut()
      storeLogout()
      navigate('/auth')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoggingOut(false)
      setShowLogoutModal(false)
    }
  }

  const handleDeleteAccount = () => {
    // TODO: Implement account deletion
    console.log('Delete account')
    setShowDeleteModal(false)
  }

  const settingsItems: MenuItem[] = [
    {
      icon: User,
      label: 'Mon compte',
      description: 'Email, mot de passe',
      to: '/settings/account',
      iconColor: 'text-neon-cyan',
    },
    {
      icon: Bell,
      label: 'Notifications',
      description: 'Alertes et rappels',
      to: '/settings/notifications',
      iconColor: 'text-amber-400',
    },
    {
      icon: Shield,
      label: 'Confidentialite',
      description: 'Visibilite, blocages',
      to: '/settings/privacy',
      iconColor: 'text-emerald-400',
    },
  ]

  const supportItems: MenuItem[] = [
    {
      icon: HelpCircle,
      label: 'Aide & Support',
      description: 'FAQ et contact',
      action: () => window.open('mailto:support@echo-app.com', '_blank'),
      external: true,
      iconColor: 'text-violet-400',
    },
    {
      icon: FileText,
      label: "Conditions d'utilisation",
      action: () => setShowTermsModal(true),
      iconColor: 'text-slate-400',
    },
    {
      icon: Lock,
      label: 'Politique de confidentialite',
      action: () => setShowPrivacyPolicyModal(true),
      iconColor: 'text-slate-400',
    },
  ]

  const renderMenuItem = (item: MenuItem) => {
    const content = (
      <div
        className="flex items-center gap-4 p-4 rounded-xl bg-surface-card/50 border border-white/5
                   hover:bg-surface-elevated hover:border-white/10 transition-all cursor-pointer group"
        onClick={item.action || (item.to ? () => navigate(item.to!) : undefined)}
      >
        <div className={cn(
          'w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center',
          'group-hover:scale-110 transition-transform'
        )}>
          <item.icon className={cn('w-5 h-5', item.iconColor || 'text-white/70')} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium">{item.label}</p>
          {item.description && (
            <p className="text-white/40 text-sm truncate">{item.description}</p>
          )}
        </div>
        {item.external ? (
          <ExternalLink className="w-4 h-4 text-white/30 group-hover:text-white/50 transition-colors" />
        ) : (
          <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/50 group-hover:translate-x-1 transition-all" />
        )}
      </div>
    )

    return <motion.div key={item.label} variants={itemVariants}>{content}</motion.div>
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
          <h1 className="text-xl font-bold text-white">Parametres</h1>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="p-4 pb-24 space-y-6"
      >
        {/* Profile Card */}
        <motion.div variants={itemVariants}>
          <CardSection variant="elevated" interactive onClick={() => navigate('/profile/edit')}>
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={profile?.photoUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'}
                  alt="Profile"
                  className="w-16 h-16 rounded-2xl object-cover"
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-neon-cyan flex items-center justify-center">
                  <User className="w-3 h-3 text-black" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-white">{profile?.firstName || 'Utilisateur'}</h3>
                <p className="text-sm text-white/50 truncate">Modifier mon profil</p>
              </div>
              <ChevronRight className="w-5 h-5 text-white/30" />
            </div>
          </CardSection>
        </motion.div>

        {/* Premium Banner */}
        {!isPremium && (
          <motion.div variants={itemVariants}>
            <PremiumBanner
              heading="Passe a Echo+"
              description="Likes illimites, voir qui t'a like, et bien plus encore"
              ctaText="Decouvrir"
              onCTA={() => console.log('Go to premium')}
              closeable={false}
              variant="exclusive"
            />
          </motion.div>
        )}

        {/* Quick Toggles Card */}
        <motion.div variants={itemVariants}>
          <CardSection title="Raccourcis" icon={Sparkles}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {privacy.invisibleMode ? (
                    <EyeOff className="w-5 h-5 text-neon-purple" />
                  ) : (
                    <Eye className="w-5 h-5 text-neon-cyan" />
                  )}
                  <div>
                    <p className="text-white font-medium">Mode invisible</p>
                    <p className="text-white/40 text-xs">Navigue sans etre vu</p>
                  </div>
                </div>
                <Toggle
                  checked={privacy.invisibleMode}
                  onChange={(checked) => updatePrivacy('invisibleMode', checked)}
                  size="md"
                />
              </div>
              <div className="h-px bg-white/5" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className={cn('w-5 h-5', notifications.pushNotifications ? 'text-neon-cyan' : 'text-white/40')} />
                  <div>
                    <p className="text-white font-medium">Notifications push</p>
                    <p className="text-white/40 text-xs">Rester informe en temps reel</p>
                  </div>
                </div>
                <Toggle
                  checked={notifications.pushNotifications}
                  onChange={(checked) => updateNotification('pushNotifications', checked)}
                  size="md"
                />
              </div>
            </div>
          </CardSection>
        </motion.div>

        {/* Settings Section */}
        <div>
          <motion.p
            variants={itemVariants}
            className="text-white/40 text-xs font-medium uppercase tracking-wider mb-3 px-1"
          >
            Parametres
          </motion.p>
          <div className="space-y-2">
            {settingsItems.map(renderMenuItem)}
          </div>
        </div>

        {/* Support Section */}
        <div>
          <motion.p
            variants={itemVariants}
            className="text-white/40 text-xs font-medium uppercase tracking-wider mb-3 px-1"
          >
            Support & Legal
          </motion.p>
          <div className="space-y-2">
            {supportItems.map(renderMenuItem)}
          </div>
        </div>

        {/* Danger Zone */}
        <motion.div variants={itemVariants}>
          <CardSection title="Zone de danger" icon={AlertTriangle} variant="danger">
            <div className="space-y-3">
              <button
                onClick={() => setShowLogoutModal(true)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-red-500/10 transition-colors group"
              >
                <LogOut className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform" />
                <span className="text-red-400 font-medium">Se deconnecter</span>
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-red-500/10 transition-colors group"
              >
                <Trash2 className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform" />
                <span className="text-red-400 font-medium">Supprimer mon compte</span>
              </button>
            </div>
          </CardSection>
        </motion.div>

        {/* Version */}
        <motion.div
          variants={itemVariants}
          className="text-center pt-4"
        >
          <p className="text-white/20 text-sm">ECHO v1.0.0</p>
          <p className="text-white/10 text-xs mt-1">Made with love in Paris</p>
        </motion.div>
      </motion.div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowLogoutModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-surface-elevated rounded-3xl p-6 border border-white/10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/20">
                <LogOut className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-2">
                Se deconnecter ?
              </h3>
              <p className="text-white/50 text-center mb-6">
                Tu devras te reconnecter pour acceder a ton compte.
              </p>
              <div className="space-y-3">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full h-12 rounded-xl bg-red-500 text-white font-semibold
                           hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {isLoggingOut ? 'Deconnexion...' : 'Oui, me deconnecter'}
                </motion.button>
                <button
                  onClick={() => setShowLogoutModal(false)}
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
                <Trash2 className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-2">
                Supprimer ton compte ?
              </h3>
              <p className="text-white/50 text-center mb-6">
                Cette action est irreversible. Toutes tes donnees seront supprimees definitivement.
              </p>
              <div className="space-y-3">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDeleteAccount}
                  className="w-full h-12 rounded-xl bg-red-500 text-white font-semibold
                           hover:bg-red-600 transition-colors"
                >
                  Oui, supprimer mon compte
                </motion.button>
                <button
                  onClick={() => setShowDeleteModal(false)}
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

      {/* Terms Modal */}
      <AnimatePresence>
        {showTermsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowTermsModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-h-[85vh] bg-surface-elevated rounded-t-3xl border-t border-white/10 shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-surface-elevated/90 backdrop-blur-xl border-b border-white/5 p-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Conditions d'utilisation</h3>
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white/70" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
                <div className="prose prose-invert prose-sm max-w-none space-y-4">
                  <div className="p-4 rounded-xl bg-surface-card border border-white/5">
                    <h4 className="text-white font-semibold mb-2">1. Acceptation des conditions</h4>
                    <p className="text-white/60 text-sm leading-relaxed">
                      En utilisant ECHO, vous acceptez les presentes conditions d'utilisation.
                      Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser l'application.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-card border border-white/5">
                    <h4 className="text-white font-semibold mb-2">2. Utilisation du service</h4>
                    <p className="text-white/60 text-sm leading-relaxed">
                      ECHO est une application de rencontres destinee aux personnes majeures (18 ans et plus).
                      Vous vous engagez a utiliser le service de maniere respectueuse et conforme aux lois en vigueur.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-card border border-white/5">
                    <h4 className="text-white font-semibold mb-2">3. Compte utilisateur</h4>
                    <p className="text-white/60 text-sm leading-relaxed">
                      Vous etes responsable de la confidentialite de vos identifiants de connexion.
                      Toute activite effectuee depuis votre compte est de votre responsabilite.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-card border border-white/5">
                    <h4 className="text-white font-semibold mb-2">4. Contenu</h4>
                    <p className="text-white/60 text-sm leading-relaxed">
                      Vous conservez les droits sur le contenu que vous publiez. En publiant du contenu,
                      vous accordez a ECHO une licence pour l'afficher dans l'application.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-card border border-white/5">
                    <h4 className="text-white font-semibold mb-2">5. Comportement interdit</h4>
                    <p className="text-white/60 text-sm leading-relaxed">
                      Il est interdit de publier du contenu illegal, offensant ou inapproprie.
                      Tout comportement abusif entrainera la suspension de votre compte.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Privacy Policy Modal */}
      <AnimatePresence>
        {showPrivacyPolicyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowPrivacyPolicyModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-h-[85vh] bg-surface-elevated rounded-t-3xl border-t border-white/10 shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-surface-elevated/90 backdrop-blur-xl border-b border-white/5 p-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Politique de confidentialite</h3>
                <button
                  onClick={() => setShowPrivacyPolicyModal(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white/70" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
                <div className="prose prose-invert prose-sm max-w-none space-y-4">
                  <div className="p-4 rounded-xl bg-surface-card border border-white/5">
                    <h4 className="text-white font-semibold mb-2">1. Collecte des donnees</h4>
                    <p className="text-white/60 text-sm leading-relaxed">
                      Nous collectons les informations que vous fournissez lors de votre inscription
                      (email, nom, date de naissance, photos) ainsi que les donnees d'utilisation.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-card border border-white/5">
                    <h4 className="text-white font-semibold mb-2">2. Utilisation des donnees</h4>
                    <p className="text-white/60 text-sm leading-relaxed">
                      Vos donnees sont utilisees pour fournir le service, ameliorer l'experience
                      utilisateur et vous mettre en relation avec d'autres utilisateurs.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-card border border-white/5">
                    <h4 className="text-white font-semibold mb-2">3. Protection des donnees</h4>
                    <p className="text-white/60 text-sm leading-relaxed">
                      Nous mettons en oeuvre des mesures de securite pour proteger vos donnees
                      personnelles contre tout acces non autorise.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-card border border-white/5">
                    <h4 className="text-white font-semibold mb-2">4. Vos droits (RGPD)</h4>
                    <p className="text-white/60 text-sm leading-relaxed">
                      Vous disposez d'un droit d'acces, de rectification, de suppression et de
                      portabilite de vos donnees. Contactez-nous pour exercer ces droits.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-card border border-white/5">
                    <h4 className="text-white font-semibold mb-2">5. Cookies</h4>
                    <p className="text-white/60 text-sm leading-relaxed">
                      Nous utilisons des cookies pour ameliorer votre experience. Vous pouvez
                      gerer vos preferences dans les parametres de votre navigateur.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
