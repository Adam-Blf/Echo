import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Sparkles,
  Clock,
  Mail,
  Bell,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSettingsStore, type NotificationSettings } from '@/stores/settingsStore'

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
          checked ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500' : 'bg-white/10'
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

export function NotificationSettingsPage() {
  const navigate = useNavigate()
  const { notifications, updateNotification } = useSettingsStore()

  const notificationItems: Array<{
    key: keyof NotificationSettings
    icon: React.ElementType
    label: string
    description: string
    color: string
  }> = [
    {
      key: 'newMatches',
      icon: Heart,
      label: 'Nouveaux matchs',
      description: "Quand quelqu'un matche avec toi",
      color: 'from-pink-500 to-rose-500',
    },
    {
      key: 'newMessages',
      icon: MessageCircle,
      label: 'Nouveaux messages',
      description: 'Quand tu recois un message',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      key: 'likesReceived',
      icon: Sparkles,
      label: 'Likes recus',
      description: "Quand quelqu'un aime ton profil",
      color: 'from-amber-500 to-orange-500',
    },
    {
      key: 'activityReminders',
      icon: Clock,
      label: "Rappels d'activite",
      description: 'Pour te rappeler de mettre a jour ton Echo',
      color: 'from-violet-500 to-purple-500',
    },
    {
      key: 'marketingEmails',
      icon: Mail,
      label: 'Emails marketing',
      description: 'Offres speciales et nouveautes',
      color: 'from-slate-500 to-gray-500',
    },
    {
      key: 'pushNotifications',
      icon: Bell,
      label: 'Notifications push',
      description: 'Activer les notifications sur cet appareil',
      color: 'from-emerald-500 to-teal-500',
    },
  ]

  const handleRequestPushPermission = async () => {
    if (!('Notification' in window)) {
      return
    }

    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      updateNotification('pushNotifications', true)
    } else {
      updateNotification('pushNotifications', false)
    }
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
          <h1 className="text-xl font-bold text-white">Notifications</h1>
        </div>
      </div>

      <div className="p-4 pb-24 space-y-6">
        {/* Info banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-medium mb-1">Reste connecte</p>
              <p className="text-white/50 text-sm">
                Active les notifications pour ne jamais rater un match ou un message important.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Notification toggles */}
        <div>
          <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-3 px-1">
            Types de notifications
          </p>
          <div className="space-y-2">
            {notificationItems.map((item, i) => (
              <ToggleItem
                key={item.key}
                icon={item.icon}
                label={item.label}
                description={item.description}
                color={item.color}
                checked={notifications[item.key]}
                onChange={(checked) => {
                  if (item.key === 'pushNotifications' && checked) {
                    handleRequestPushPermission()
                  } else {
                    updateNotification(item.key, checked)
                  }
                }}
                delay={i * 0.05}
              />
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-3 px-1">
            Actions rapides
          </p>
          <div className="flex gap-3">
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={() => {
                Object.keys(notifications).forEach((key) => {
                  updateNotification(key as keyof NotificationSettings, true)
                })
              }}
              className="flex-1 p-4 rounded-2xl bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10
                       border border-violet-500/20 hover:border-violet-500/40 transition-all"
            >
              <p className="text-violet-400 font-medium">Tout activer</p>
            </motion.button>
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              onClick={() => {
                Object.keys(notifications).forEach((key) => {
                  updateNotification(key as keyof NotificationSettings, false)
                })
              }}
              className="flex-1 p-4 rounded-2xl bg-white/5 border border-white/10
                       hover:border-white/20 transition-all"
            >
              <p className="text-white/70 font-medium">Tout desactiver</p>
            </motion.button>
          </div>
        </div>

        {/* Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-white/30 text-xs text-center px-4"
        >
          Tu peux modifier ces preferences a tout moment. Les notifications essentielles
          (securite du compte) ne peuvent pas etre desactivees.
        </motion.p>
      </div>
    </div>
  )
}
