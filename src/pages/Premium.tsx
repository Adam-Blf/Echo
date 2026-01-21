import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Crown,
  Check,
  X,
  Infinity,
  Heart,
  Star,
  RotateCcw,
  Eye,
  EyeOff,
  Zap,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SubscriptionPlan } from '@/types/database'

// =============================================================================
// TYPES
// =============================================================================

interface PlanFeature {
  label: string
  free: string | boolean
  plus: string | boolean
  unlimited: string | boolean
}

interface PricingPlan {
  id: SubscriptionPlan
  name: string
  price: string
  period: string
  description: string
  popular?: boolean
  features: string[]
  cta: string
}

// =============================================================================
// DATA
// =============================================================================

const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Echo Free',
    price: 'Gratuit',
    period: '',
    description: 'Pour commencer',
    features: [
      '20 swipes par jour',
      '1 Super Like par jour',
      'Profil de base',
    ],
    cta: 'Plan actuel',
  },
  {
    id: 'echo_plus',
    name: 'Echo+',
    price: '9,99',
    period: '/mois',
    description: 'Le plus populaire',
    popular: true,
    features: [
      'Swipes illimites',
      '5 Super Likes par jour',
      'Voir qui t\'a like',
      'Mode invisible',
      '1 Boost par mois',
    ],
    cta: 'S\'abonner',
  },
  {
    id: 'echo_unlimited',
    name: 'Echo Unlimited',
    price: '19,99',
    period: '/mois',
    description: 'L\'experience complete',
    features: [
      'Tout Echo+',
      'Super Likes illimites',
      'Rewind illimite',
      '5 Boosts par mois',
      'Likes prioritaires',
      'Accuse de lecture',
    ],
    cta: 'S\'abonner',
  },
]

const FEATURES_COMPARISON: PlanFeature[] = [
  {
    label: 'Swipes par jour',
    free: '20',
    plus: 'Illimite',
    unlimited: 'Illimite',
  },
  {
    label: 'Super Likes',
    free: '1/jour',
    plus: '5/jour',
    unlimited: 'Illimite',
  },
  {
    label: 'Voir les likes recus',
    free: false,
    plus: true,
    unlimited: true,
  },
  {
    label: 'Rewind (revenir en arriere)',
    free: false,
    plus: false,
    unlimited: true,
  },
  {
    label: 'Mode invisible',
    free: false,
    plus: true,
    unlimited: true,
  },
  {
    label: 'Boost de profil',
    free: false,
    plus: '1/mois',
    unlimited: '5/mois',
  },
  {
    label: 'Likes prioritaires',
    free: false,
    plus: false,
    unlimited: true,
  },
  {
    label: 'Accuse de lecture',
    free: false,
    plus: false,
    unlimited: true,
  },
]

// =============================================================================
// ANIMATIONS
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
    },
  },
}

// =============================================================================
// COMPONENTS
// =============================================================================

interface PricingCardProps {
  plan: PricingPlan
  isCurrentPlan: boolean
  onSelect: (planId: SubscriptionPlan) => void
}

function PricingCard({ plan, isCurrentPlan, onSelect }: PricingCardProps) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: plan.popular ? 1.02 : 1.01, y: -4 }}
      className={cn(
        'relative flex flex-col rounded-3xl p-6 transition-all duration-300',
        plan.popular
          ? 'bg-gradient-to-br from-neon-cyan/20 via-surface-elevated to-neon-purple/20 border-2 border-neon-cyan/50 shadow-xl shadow-neon-cyan/20'
          : 'bg-surface-card border border-white/10 hover:border-white/20'
      )}
    >
      {/* Popular badge */}
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <div className="px-4 py-1 rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple text-xs font-bold text-white shadow-lg">
            Populaire
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-6">
        <div
          className={cn(
            'w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center',
            plan.popular
              ? 'bg-gradient-to-br from-neon-cyan to-neon-purple shadow-lg shadow-neon-cyan/30'
              : 'bg-white/10'
          )}
        >
          {plan.id === 'free' && <Star className="w-7 h-7 text-white" />}
          {plan.id === 'echo_plus' && <Crown className="w-7 h-7 text-white" />}
          {plan.id === 'echo_unlimited' && <Sparkles className="w-7 h-7 text-white" />}
        </div>

        <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
        <p className="text-sm text-white/50">{plan.description}</p>
      </div>

      {/* Price */}
      <div className="text-center mb-6">
        <div className="flex items-baseline justify-center gap-1">
          {plan.price !== 'Gratuit' && (
            <span className="text-lg text-white/50">EUR</span>
          )}
          <span
            className={cn(
              'text-4xl font-bold',
              plan.popular ? 'text-gradient' : 'text-white'
            )}
          >
            {plan.price}
          </span>
          {plan.period && (
            <span className="text-white/50">{plan.period}</span>
          )}
        </div>
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-6 flex-1">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-center gap-3">
            <div
              className={cn(
                'w-5 h-5 rounded-full flex items-center justify-center',
                plan.popular ? 'bg-neon-cyan/20' : 'bg-white/10'
              )}
            >
              <Check
                className={cn(
                  'w-3 h-3',
                  plan.popular ? 'text-neon-cyan' : 'text-white/70'
                )}
              />
            </div>
            <span className="text-sm text-white/80">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSelect(plan.id)}
        disabled={isCurrentPlan && plan.id === 'free'}
        className={cn(
          'w-full py-4 rounded-2xl font-semibold text-base transition-all',
          plan.popular
            ? 'bg-gradient-to-r from-neon-cyan to-neon-purple text-white shadow-lg shadow-neon-purple/30'
            : plan.id === 'free'
            ? 'bg-white/10 text-white/50 cursor-not-allowed'
            : 'bg-white/10 text-white hover:bg-white/20'
        )}
      >
        {isCurrentPlan && plan.id === 'free' ? 'Plan actuel' : plan.cta}
      </motion.button>
    </motion.div>
  )
}

function FeatureValue({ value }: { value: string | boolean }) {
  if (typeof value === 'boolean') {
    return value ? (
      <div className="w-6 h-6 rounded-full bg-neon-cyan/20 flex items-center justify-center">
        <Check className="w-4 h-4 text-neon-cyan" />
      </div>
    ) : (
      <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center">
        <X className="w-4 h-4 text-white/30" />
      </div>
    )
  }
  return <span className="text-sm font-medium text-white/80">{value}</span>
}

// =============================================================================
// MAIN PAGE
// =============================================================================

export function PremiumPage() {
  const navigate = useNavigate()
  const [currentPlan] = useState<SubscriptionPlan>('free')

  const handleSelectPlan = (planId: SubscriptionPlan) => {
    if (planId === 'free') return

    // TODO: Integrate with Stripe/payment flow
    console.log('Selected plan:', planId)
  }

  return (
    <div className="min-h-screen bg-surface-dark">
      {/* Animated background gradient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-radial from-neon-cyan/10 via-transparent to-transparent animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-radial from-neon-purple/10 via-transparent to-transparent animate-pulse" />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-10 bg-surface-dark/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-4 p-4 safe-top">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white/70" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">Premium</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-0 px-4 py-6 pb-24">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-neon-cyan via-neon-purple to-neon-pink p-[2px] shadow-xl shadow-neon-purple/30"
          >
            <div className="w-full h-full rounded-3xl bg-surface-dark flex items-center justify-center">
              <Crown className="w-10 h-10 text-neon-cyan" />
            </div>
          </motion.div>

          <h2 className="text-3xl font-bold text-white mb-3">
            Debloquez tout{' '}
            <span className="text-gradient">Echo</span>
          </h2>
          <p className="text-white/60 max-w-sm mx-auto">
            Maximisez vos chances de rencontre avec des fonctionnalites exclusives
          </p>

          {/* Feature icons row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center gap-6 mt-8"
          >
            {[
              { icon: Infinity, label: 'Swipes illimites' },
              { icon: Eye, label: 'Voir les likes' },
              { icon: RotateCcw, label: 'Rewind' },
              { icon: Zap, label: 'Boosts' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/10">
                  <Icon className="w-6 h-6 text-neon-cyan" />
                </div>
                <span className="text-xs text-white/50">{label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-4 md:grid-cols-3 mb-12"
        >
          {PRICING_PLANS.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              isCurrentPlan={currentPlan === plan.id}
              onSelect={handleSelectPlan}
            />
          ))}
        </motion.div>

        {/* Features Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-surface-card rounded-3xl border border-white/10 overflow-hidden"
        >
          {/* Table Header */}
          <div className="grid grid-cols-4 gap-2 p-4 bg-white/5 border-b border-white/10">
            <div className="text-sm font-semibold text-white/50">Fonctionnalites</div>
            <div className="text-center text-sm font-semibold text-white/70">Free</div>
            <div className="text-center text-sm font-semibold text-neon-cyan">Echo+</div>
            <div className="text-center text-sm font-semibold text-neon-purple">Unlimited</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-white/5">
            {FEATURES_COMPARISON.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.05 }}
                className="grid grid-cols-4 gap-2 p-4 items-center hover:bg-white/[0.02] transition-colors"
              >
                <div className="text-sm text-white/80">{feature.label}</div>
                <div className="flex justify-center">
                  <FeatureValue value={feature.free} />
                </div>
                <div className="flex justify-center">
                  <FeatureValue value={feature.plus} />
                </div>
                <div className="flex justify-center">
                  <FeatureValue value={feature.unlimited} />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex justify-center gap-8 mt-10"
        >
          {[
            { icon: EyeOff, label: 'Discret' },
            { icon: Heart, label: 'Sans engagement' },
            { icon: Zap, label: 'Instantane' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-white/40">
              <Icon className="w-4 h-4" />
              <span className="text-xs">{label}</span>
            </div>
          ))}
        </motion.div>

        {/* Legal mention */}
        <p className="text-center text-xs text-white/30 mt-8 max-w-md mx-auto">
          En vous abonnant, vous acceptez nos conditions d'utilisation.
          Abonnement renouvelable automatiquement. Annulation possible a tout moment.
        </p>
      </div>
    </div>
  )
}
