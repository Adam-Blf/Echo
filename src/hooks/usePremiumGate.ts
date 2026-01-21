import { useState, useCallback, useMemo } from 'react'
import type { SubscriptionPlan } from '@/types/database'
import type { PremiumFeatureName } from '@/components/ui/PaywallModal'

// =============================================================================
// TYPES
// =============================================================================

interface PremiumGateOptions {
  /** Current user's subscription plan */
  currentPlan?: SubscriptionPlan
}

interface PremiumGateResult {
  /** Whether the user can access this feature */
  canAccess: boolean
  /** The minimum plan required for this feature */
  requiredPlan: SubscriptionPlan
  /** Show the paywall modal */
  showPaywall: () => void
  /** Hide the paywall modal */
  hidePaywall: () => void
  /** Whether the paywall modal is currently visible */
  isPaywallVisible: boolean
  /** The feature name for the PaywallModal */
  featureName: PremiumFeatureName
}

// =============================================================================
// FEATURE ACCESS MAP
// =============================================================================

/**
 * Maps features to the minimum plan required to access them
 */
const FEATURE_ACCESS_MAP: Record<PremiumFeatureName, SubscriptionPlan> = {
  see_likes: 'echo_plus',
  unlimited_swipes: 'echo_plus',
  super_likes: 'echo_plus',
  invisible_mode: 'echo_plus',
  boost: 'echo_plus',
  rewind: 'echo_unlimited',
  read_receipts: 'echo_unlimited',
  priority_likes: 'echo_unlimited',
}

/**
 * Plan hierarchy for comparison
 */
const PLAN_HIERARCHY: Record<SubscriptionPlan, number> = {
  free: 0,
  echo_plus: 1,
  echo_unlimited: 2,
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Check if a plan meets or exceeds the required plan level
 */
function planMeetsRequirement(
  currentPlan: SubscriptionPlan,
  requiredPlan: SubscriptionPlan
): boolean {
  return PLAN_HIERARCHY[currentPlan] >= PLAN_HIERARCHY[requiredPlan]
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook to gate premium features and show paywall when needed
 *
 * @example
 * ```tsx
 * const { canAccess, showPaywall, isPaywallVisible, featureName, hidePaywall } = usePremiumGate('see_likes')
 *
 * const handleClick = () => {
 *   if (!canAccess) {
 *     showPaywall()
 *     return
 *   }
 *   // Proceed with premium action
 * }
 *
 * return (
 *   <>
 *     <button onClick={handleClick}>See who liked you</button>
 *     <PaywallModal
 *       isOpen={isPaywallVisible}
 *       onClose={hidePaywall}
 *       feature={featureName}
 *     />
 *   </>
 * )
 * ```
 */
export function usePremiumGate(
  feature: PremiumFeatureName,
  options: PremiumGateOptions = {}
): PremiumGateResult {
  const { currentPlan = 'free' } = options
  const [isPaywallVisible, setIsPaywallVisible] = useState(false)

  const requiredPlan = FEATURE_ACCESS_MAP[feature]

  const canAccess = useMemo(
    () => planMeetsRequirement(currentPlan, requiredPlan),
    [currentPlan, requiredPlan]
  )

  const showPaywall = useCallback(() => {
    setIsPaywallVisible(true)
  }, [])

  const hidePaywall = useCallback(() => {
    setIsPaywallVisible(false)
  }, [])

  return {
    canAccess,
    requiredPlan,
    showPaywall,
    hidePaywall,
    isPaywallVisible,
    featureName: feature,
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Check if user has access to a feature (pure function, no state)
 */
export function checkFeatureAccess(
  feature: PremiumFeatureName,
  currentPlan: SubscriptionPlan
): boolean {
  const requiredPlan = FEATURE_ACCESS_MAP[feature]
  return planMeetsRequirement(currentPlan, requiredPlan)
}

/**
 * Get the required plan for a feature
 */
export function getRequiredPlan(feature: PremiumFeatureName): SubscriptionPlan {
  return FEATURE_ACCESS_MAP[feature]
}

/**
 * Get all features available for a plan
 */
export function getFeaturesForPlan(plan: SubscriptionPlan): PremiumFeatureName[] {
  return (Object.entries(FEATURE_ACCESS_MAP) as [PremiumFeatureName, SubscriptionPlan][])
    .filter(([, required]) => planMeetsRequirement(plan, required))
    .map(([feature]) => feature)
}

/**
 * Get all features locked for a plan
 */
export function getLockedFeaturesForPlan(plan: SubscriptionPlan): PremiumFeatureName[] {
  return (Object.entries(FEATURE_ACCESS_MAP) as [PremiumFeatureName, SubscriptionPlan][])
    .filter(([, required]) => !planMeetsRequirement(plan, required))
    .map(([feature]) => feature)
}
