import { motion } from 'framer-motion'
import { Search, SlidersHorizontal } from 'lucide-react'

export function DiscoverPage() {
  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Explorer</h1>
        <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
          <SlidersHorizontal className="w-5 h-5 text-white/70" />
        </button>
      </div>

      {/* Search bar placeholder */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
        <input
          type="text"
          placeholder="Rechercher..."
          className="w-full h-12 pl-12 pr-4 rounded-2xl bg-surface-card border border-white/10
                     text-white placeholder:text-white/30 focus:outline-none focus:border-neon-cyan/50
                     transition-colors"
        />
      </div>

      {/* Empty state */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center h-[50vh] text-center"
      >
        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <Search className="w-8 h-8 text-white/20" />
        </div>
        <h2 className="text-lg font-semibold text-white/80 mb-2">
          Aucun profil disponible
        </h2>
        <p className="text-white/40 text-sm max-w-xs">
          Complete ton profil et fais valider par un Wingman pour découvrir des profils
        </p>
      </motion.div>
    </div>
  )
}
