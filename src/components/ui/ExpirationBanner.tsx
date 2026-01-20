import { motion } from 'framer-motion'
import { Camera, Clock, AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { EchoStatus } from '@/types/user'
import { cn } from '@/lib/utils'

interface ExpirationBannerProps {
  status: EchoStatus
  daysLeft: number
  onRefresh?: () => void
}

export function ExpirationBanner({ status, daysLeft, onRefresh }: ExpirationBannerProps) {
  if (status === 'ACTIVE' && daysLeft > 2) return null

  const isExpiring = status === 'EXPIRING'
  const isSilence = status === 'SILENCE'

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'mx-4 mb-4 p-4 rounded-2xl border',
        isSilence
          ? 'bg-red-500/10 border-red-500/30'
          : 'bg-yellow-500/10 border-yellow-500/30'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
            isSilence ? 'bg-red-500/20' : 'bg-yellow-500/20'
          )}
        >
          {isSilence ? (
            <AlertTriangle className="w-5 h-5 text-red-400" />
          ) : (
            <Clock className="w-5 h-5 text-yellow-500" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              'font-semibold mb-1',
              isSilence ? 'text-red-400' : 'text-yellow-500'
            )}
          >
            {isSilence ? 'Ton Echo est en silence' : `Ton Echo expire dans ${daysLeft}j`}
          </h3>
          <p className="text-white/60 text-sm mb-3">
            {isSilence
              ? 'Ton profil n\'est plus visible. Prends une nouvelle photo pour réactiver ton Echo !'
              : 'Prends une nouvelle photo pour rester visible dans les découvertes.'}
          </p>

          {/* CTA */}
          <Link
            to="/camera"
            onClick={onRefresh}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all',
              isSilence
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-yellow-500 text-black hover:bg-yellow-400'
            )}
          >
            <Camera className="w-4 h-4" />
            {isSilence ? 'Réactiver mon Echo' : 'Nouvelle photo'}
          </Link>
        </div>
      </div>

      {/* Progress bar for expiring status */}
      {isExpiring && (
        <div className="mt-4">
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: `${(daysLeft / 7) * 100}%` }}
              className="h-full bg-gradient-to-r from-yellow-500 to-red-500 rounded-full"
            />
          </div>
        </div>
      )}
    </motion.div>
  )
}
