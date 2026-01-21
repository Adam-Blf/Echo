import { supabase } from '@/lib/supabase'
import type {
  SubscriptionPlan,
  PremiumFeatures,
  UserPremiumState,
  SwipeAction,
  EchoStatus,
} from '@/types/database'

// =============================================================================
// TYPES
// =============================================================================

export interface PremiumStatus {
  isPremium: boolean
  currentPlan: SubscriptionPlan
  expiresAt: string | null
  features: PremiumFeatures | null
}

export interface ReceivedLike {
  likerId: string
  action: SwipeAction
  createdAt: string
  // Premium users see full details
  firstName: string | null
  age: number | null
  photoUrl: string | null
  bio: string | null
  interests: string[] | null
  echoStatus: EchoStatus | null
  isBlurred: boolean
}

export interface PremiumFeatureCheck {
  hasAccess: boolean
  requiresPremium: boolean
  currentPlan: SubscriptionPlan
}

// =============================================================================
// ERROR HANDLING
// =============================================================================

export interface PremiumServiceResult<T = void> {
  data?: T
  error?: string
}

// =============================================================================
// PREMIUM STATUS
// =============================================================================

/**
 * Get user's premium status
 */
export const getPremiumStatus = async (): Promise<PremiumServiceResult<PremiumStatus>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'Non authentifié' }
    }

    // Get user's subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('plan, status, current_period_end')
      .eq('user_id', user.id)
      .single()

    if (subError && subError.code !== 'PGRST116') {
      // PGRST116 = no rows returned (new user)
      console.error('Error fetching subscription:', subError)
      return { error: 'Erreur lors de la récupération du statut' }
    }

    const plan = subscription?.plan || 'free'
    const isPremium = plan !== 'free' && subscription?.status === 'active'

    // Get features for this plan
    const { data: features, error: featuresError } = await supabase
      .from('premium_features')
      .select('*')
      .eq('plan', plan)
      .single()

    if (featuresError) {
      console.error('Error fetching features:', featuresError)
    }

    return {
      data: {
        isPremium,
        currentPlan: plan,
        expiresAt: subscription?.current_period_end || null,
        features: features || null,
      },
    }
  } catch (err) {
    console.error('Get premium status exception:', err)
    return { error: 'Erreur inattendue' }
  }
}

/**
 * Get user's premium state (cached, optimized)
 */
export const getUserPremiumState = async (): Promise<
  PremiumServiceResult<UserPremiumState>
> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'Non authentifié' }
    }

    const { data, error } = await supabase
      .from('user_premium_state')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Error fetching premium state:', error)
      return { error: 'Erreur lors de la récupération' }
    }

    return { data }
  } catch (err) {
    console.error('Get premium state exception:', err)
    return { error: 'Erreur inattendue' }
  }
}

/**
 * Check if user is premium
 */
export const isUserPremium = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data, error } = await supabase.rpc('is_user_premium', {
      p_user_id: user.id,
    })

    if (error) {
      console.error('Error checking premium status:', error)
      return false
    }

    return data || false
  } catch (err) {
    console.error('Is premium exception:', err)
    return false
  }
}

/**
 * Get user's current plan
 */
export const getUserPlan = async (): Promise<SubscriptionPlan> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return 'free'

    const { data, error } = await supabase.rpc('get_user_plan', {
      p_user_id: user.id,
    })

    if (error) {
      console.error('Error fetching user plan:', error)
      return 'free'
    }

    return (data as SubscriptionPlan) || 'free'
  } catch (err) {
    console.error('Get user plan exception:', err)
    return 'free'
  }
}

// =============================================================================
// PREMIUM FEATURES
// =============================================================================

/**
 * Check if user can use a specific feature
 */
export const checkPremiumFeature = async (
  featureName: string
): Promise<PremiumFeatureCheck> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return {
        hasAccess: false,
        requiresPremium: true,
        currentPlan: 'free',
      }
    }

    const { data: hasAccess, error } = await supabase.rpc('can_use_feature', {
      p_user_id: user.id,
      p_feature: featureName,
    })

    if (error) {
      console.error('Error checking feature:', error)
      return {
        hasAccess: false,
        requiresPremium: true,
        currentPlan: 'free',
      }
    }

    const plan = await getUserPlan()

    return {
      hasAccess: hasAccess || false,
      requiresPremium: !hasAccess,
      currentPlan: plan,
    }
  } catch (err) {
    console.error('Check feature exception:', err)
    return {
      hasAccess: false,
      requiresPremium: true,
      currentPlan: 'free',
    }
  }
}

/**
 * Get all premium features for all plans
 */
export const getAllPremiumFeatures = async (): Promise<
  PremiumServiceResult<PremiumFeatures[]>
> => {
  try {
    const { data, error } = await supabase
      .from('premium_features')
      .select('*')
      .order('monthly_price_cents', { ascending: true })

    if (error) {
      console.error('Error fetching all features:', error)
      return { error: 'Erreur lors de la récupération' }
    }

    return { data: data || [] }
  } catch (err) {
    console.error('Get all features exception:', err)
    return { error: 'Erreur inattendue' }
  }
}

// =============================================================================
// RECEIVED LIKES (PREMIUM FEATURE)
// =============================================================================

/**
 * Get likes received from other users
 * Premium users see full details, free users see blurred count
 */
export const getReceivedLikes = async (
  limit: number = 20,
  offset: number = 0
): Promise<PremiumServiceResult<ReceivedLike[]>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'Non authentifié' }
    }

    const { data, error } = await supabase.rpc('get_received_likes', {
      p_user_id: user.id,
      p_limit: limit,
      p_offset: offset,
    })

    if (error) {
      console.error('Error fetching received likes:', error)
      return { error: 'Erreur lors de la récupération' }
    }

    return { data: data || [] }
  } catch (err) {
    console.error('Get received likes exception:', err)
    return { error: 'Erreur inattendue' }
  }
}

/**
 * Count received likes
 */
export const countReceivedLikes = async (): Promise<number> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return 0

    const { data, error } = await supabase.rpc('count_received_likes', {
      p_user_id: user.id,
    })

    if (error) {
      console.error('Error counting received likes:', error)
      return 0
    }

    return data || 0
  } catch (err) {
    console.error('Count received likes exception:', err)
    return 0
  }
}

// =============================================================================
// SUBSCRIPTIONS
// =============================================================================

/**
 * Subscribe to premium plan changes in realtime
 */
export const subscribeToPremiumChanges = async (
  callback: (premiumState: UserPremiumState) => void
) => {
  const { data: { user } } = await supabase.auth.getUser()

  return supabase
    .channel('premium-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_premium_state',
        filter: user ? `user_id=eq.${user}` : undefined,
      },
      (payload) => {
        if (payload.new) {
          callback(payload.new as UserPremiumState)
        }
      }
    )
    .subscribe()
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Get plan display name
 */
export const getPlanDisplayName = (plan: SubscriptionPlan): string => {
  const names: Record<SubscriptionPlan, string> = {
    free: 'Gratuit',
    echo_plus: 'Echo Plus',
    echo_unlimited: 'Echo Unlimited',
  }
  return names[plan]
}

/**
 * Get plan price display
 */
export const getPlanPrice = (
  features: PremiumFeatures | null,
  period: 'monthly' | 'yearly'
): string => {
  if (!features) return '—'

  const cents = period === 'monthly' ? features.monthly_price_cents : features.yearly_price_cents

  if (!cents) return 'Gratuit'

  const euros = cents / 100
  return `${euros.toFixed(2)} €`
}

/**
 * Get feature availability by plan
 */
export const getFeatureAvailability = (
  featureName: keyof PremiumFeatures,
  plan: SubscriptionPlan
): boolean => {
  // This is a client-side check, should be validated by backend
  const featureMap: Record<SubscriptionPlan, Partial<Record<keyof PremiumFeatures, boolean>>> = {
    free: {
      see_who_likes_you: false,
      rewind_swipes: false,
      invisible_mode: false,
      read_receipts: false,
      priority_likes: false,
    },
    echo_plus: {
      see_who_likes_you: true,
      rewind_swipes: true,
      invisible_mode: false,
      read_receipts: false,
      priority_likes: false,
    },
    echo_unlimited: {
      see_who_likes_you: true,
      rewind_swipes: true,
      invisible_mode: true,
      read_receipts: true,
      priority_likes: true,
    },
  }

  return featureMap[plan][featureName] || false
}

/**
 * Format swipe limit display
 */
export const formatSwipeLimit = (limit: number): string => {
  if (limit === -1) return 'Illimité'
  if (limit === 0) return 'Aucun'
  return `${limit} par jour`
}

/**
 * Format super like limit display
 */
export const formatSuperLikeLimit = (limit: number): string => {
  if (limit === 0) return 'Aucun'
  return `${limit} par semaine`
}
