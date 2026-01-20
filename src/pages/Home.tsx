import { motion } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* Logo Animation */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 20,
          delay: 0.1
        }}
        className="relative mb-8"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-neon-cyan/30 to-neon-purple/30 rounded-full" />

        {/* Logo container */}
        <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple p-[2px]">
          <div className="w-full h-full rounded-full bg-surface-dark flex items-center justify-center">
            <span className="text-5xl font-bold text-gradient">E</span>
          </div>
        </div>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-4xl font-bold text-white mb-2"
      >
        ECHO
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-white/60 text-center max-w-xs mb-8"
      >
        Rencontres authentiques validées par tes amis
      </motion.p>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-3 mb-10"
      >
        {[
          'Photos en temps réel uniquement',
          'Validation par un Wingman',
          'Matchs qui expirent en 48h'
        ].map((feature, i) => (
          <div key={i} className="flex items-center gap-2 text-white/70">
            <Sparkles className="w-4 h-4 text-neon-cyan" />
            <span className="text-sm">{feature}</span>
          </div>
        ))}
      </motion.div>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Link
          to="/onboarding"
          className="btn-primary flex items-center gap-2 group"
        >
          <span>Commencer</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>

      {/* Version badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-24 text-white/20 text-xs"
      >
        v1.0.0 - Beta
      </motion.div>
    </div>
  )
}
