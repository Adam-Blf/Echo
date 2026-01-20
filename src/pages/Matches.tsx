import { motion } from 'framer-motion'
import { MessageCircle, Heart } from 'lucide-react'

export function MatchesPage() {
  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Matchs</h1>
        <div className="flex items-center gap-2 text-white/50 text-sm">
          <Heart className="w-4 h-4" />
          <span>0</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {['Actifs', 'Résonance', 'Expirés'].map((tab, i) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              i === 0
                ? 'bg-gradient-to-r from-neon-cyan to-neon-purple text-white'
                : 'bg-white/5 text-white/50 hover:bg-white/10'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Empty state */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center h-[50vh] text-center"
      >
        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <MessageCircle className="w-8 h-8 text-white/20" />
        </div>
        <h2 className="text-lg font-semibold text-white/80 mb-2">
          Pas encore de matchs
        </h2>
        <p className="text-white/40 text-sm max-w-xs">
          Commence à swiper pour trouver des matchs. Chaque match expire en 48h !
        </p>
      </motion.div>
    </div>
  )
}
