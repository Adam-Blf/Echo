import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { MessageCircle, Heart, Infinity, Clock, Sparkles } from 'lucide-react'
import { useSwipeStore } from '@/stores'
import { CountdownTimer, EchoTimerWave } from '@/components/ui'
import { cn } from '@/lib/utils'

type TabType = 'active' | 'resonance' | 'expired'

// Mock profile data for matches (in real app, this would come from a store)
const MOCK_MATCH_PROFILES: Record<string, { firstName: string; photoUrl: string }> = {
  '1': { firstName: 'Sophie', photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400' },
  '2': { firstName: 'Emma', photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400' },
  '3': { firstName: 'Léa', photoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400' },
  '4': { firstName: 'Chloé', photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400' },
}

export function MatchesPage() {
  const { matches } = useSwipeStore()
  const [activeTab, setActiveTab] = useState<TabType>('active')

  // Filter matches by status
  const filteredMatches = useMemo(() => {
    const now = new Date()
    return matches.filter(match => {
      const isExpired = new Date(match.expiresAt) < now
      const isResonance = match.status === 'resonance'

      switch (activeTab) {
        case 'active':
          return !isExpired && !isResonance
        case 'resonance':
          return isResonance
        case 'expired':
          return isExpired && !isResonance
        default:
          return false
      }
    })
  }, [matches, activeTab])

  // Calculate hours left for a match
  const getHoursLeft = (expiresAt: Date) => {
    const now = new Date()
    const diff = new Date(expiresAt).getTime() - now.getTime()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60)))
  }

  const tabs: { id: TabType; label: string; count: number }[] = [
    { id: 'active', label: 'Actifs', count: matches.filter(m => m.status === 'matched' && new Date(m.expiresAt) > new Date()).length },
    { id: 'resonance', label: 'Résonance', count: matches.filter(m => m.status === 'resonance').length },
    { id: 'expired', label: 'Expirés', count: matches.filter(m => new Date(m.expiresAt) < new Date() && m.status !== 'resonance').length },
  ]

  return (
    <div className="p-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Matchs</h1>
        <div className="flex items-center gap-2 text-white/50 text-sm">
          <Heart className="w-4 h-4 text-neon-pink" />
          <span>{matches.length}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2',
              activeTab === tab.id
                ? 'bg-gradient-to-r from-neon-cyan to-neon-purple text-white'
                : 'bg-white/5 text-white/50 hover:bg-white/10'
            )}
          >
            {tab.id === 'resonance' && <Infinity className="w-3 h-3" />}
            {tab.label}
            {tab.count > 0 && (
              <span className={cn(
                'px-1.5 py-0.5 rounded-full text-[10px]',
                activeTab === tab.id ? 'bg-white/20' : 'bg-white/10'
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Match list */}
      <AnimatePresence mode="wait">
        {filteredMatches.length > 0 ? (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            {filteredMatches.map((match) => {
              const profile = MOCK_MATCH_PROFILES[match.oderId] || { firstName: 'Utilisateur', photoUrl: '' }
              const hoursLeft = getHoursLeft(match.expiresAt)
              const isResonance = match.status === 'resonance'

              return (
                <Link
                  key={match.id}
                  to={`/chat/${match.id}`}
                  className="block"
                >
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      'p-4 rounded-2xl border transition-all',
                      isResonance
                        ? 'bg-gradient-to-r from-neon-purple/10 to-neon-cyan/10 border-neon-purple/30'
                        : 'bg-surface-card border-white/5 hover:border-white/10'
                    )}
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="relative">
                        <div className={cn(
                          'w-14 h-14 rounded-full overflow-hidden',
                          isResonance && 'ring-2 ring-neon-purple'
                        )}>
                          <img
                            src={profile.photoUrl}
                            alt={profile.firstName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {match.isSuperLike && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-neon-cyan flex items-center justify-center">
                            <Sparkles className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white">{profile.firstName}</h3>
                          {isResonance && (
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-neon-purple/20 text-neon-purple text-[10px]">
                              <Infinity className="w-3 h-3" />
                              <span>Résonance</span>
                            </div>
                          )}
                        </div>
                        <p className="text-white/40 text-sm truncate">
                          {match.lastMessageAt
                            ? 'Dernier message récent'
                            : 'Commencez à discuter !'}
                        </p>
                      </div>

                      {/* Timer */}
                      {!isResonance && activeTab === 'active' && (
                        <div className="flex flex-col items-end gap-1">
                          <CountdownTimer
                            expiresAt={new Date(match.expiresAt)}
                            size="sm"
                            showIcon={false}
                          />
                        </div>
                      )}
                    </div>

                    {/* Waveform timer for active matches */}
                    {!isResonance && activeTab === 'active' && (
                      <div className="mt-3">
                        <EchoTimerWave hoursLeft={hoursLeft} maxHours={48} />
                      </div>
                    )}
                  </motion.div>
                </Link>
              )
            })}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center h-[50vh] text-center"
          >
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
              {activeTab === 'resonance' ? (
                <Infinity className="w-8 h-8 text-white/20" />
              ) : activeTab === 'expired' ? (
                <Clock className="w-8 h-8 text-white/20" />
              ) : (
                <MessageCircle className="w-8 h-8 text-white/20" />
              )}
            </div>
            <h2 className="text-lg font-semibold text-white/80 mb-2">
              {activeTab === 'resonance'
                ? 'Pas encore de Résonance'
                : activeTab === 'expired'
                  ? 'Aucun match expiré'
                  : 'Pas encore de matchs'}
            </h2>
            <p className="text-white/40 text-sm max-w-xs">
              {activeTab === 'resonance'
                ? 'Rencontrez-vous à moins de 200m pour créer une Résonance permanente !'
                : activeTab === 'expired'
                  ? "Les matchs expirés après 48h sans message s'affichent ici."
                  : 'Commence à swiper pour trouver des matchs. Chaque match expire en 48h !'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
