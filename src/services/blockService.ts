import { supabase } from '@/lib/supabase'
import type { ReportReason, Block, Report } from '@/types/database'
import { checkRateLimit } from '@/lib/security'

// =============================================================================
// ERROR HANDLING
// =============================================================================

export interface BlockServiceResult<T = void> {
  data?: T
  error?: string
}

// =============================================================================
// BLOCK OPERATIONS
// =============================================================================

/**
 * Block a user
 * Automatically removes any existing matches/swipes
 * Rate limit: 20 blocks per hour
 */
export const blockUser = async (userId: string): Promise<BlockServiceResult> => {
  try {
    // Rate limit check (20 blocks/hour)
    if (!checkRateLimit('block-user', 20, 60 * 60 * 1000)) {
      return { error: 'Limite atteinte. Vous ne pouvez bloquer que 20 utilisateurs par heure.' }
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'Non authentifié' }
    }

    const { error } = await supabase
      .from('blocks')
      .insert({
        blocker_id: user.id,
        blocked_id: userId,
      })

    if (error) {
      // Handle unique constraint violation
      if (error.code === '23505') {
        return { error: 'Cet utilisateur est déjà bloqué' }
      }
      console.error('Error blocking user:', error)
      return { error: 'Erreur lors du blocage' }
    }

    return {}
  } catch (err) {
    console.error('Block user exception:', err)
    return { error: 'Erreur inattendue' }
  }
}

/**
 * Unblock a user
 */
export const unblockUser = async (userId: string): Promise<BlockServiceResult> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'Non authentifié' }
    }

    const { error } = await supabase
      .from('blocks')
      .delete()
      .eq('blocker_id', user.id)
      .eq('blocked_id', userId)

    if (error) {
      console.error('Error unblocking user:', error)
      return { error: 'Erreur lors du déblocage' }
    }

    return {}
  } catch (err) {
    console.error('Unblock user exception:', err)
    return { error: 'Erreur inattendue' }
  }
}

/**
 * Get list of blocked user IDs
 */
export const getBlockedUsers = async (): Promise<BlockServiceResult<string[]>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: [] }
    }

    const { data, error } = await supabase
      .rpc('get_blocked_user_ids', { p_user_id: user.id })

    if (error) {
      console.error('Error fetching blocked users:', error)
      return { error: 'Erreur lors de la récupération' }
    }

    return { data: data || [] }
  } catch (err) {
    console.error('Get blocked users exception:', err)
    return { error: 'Erreur inattendue' }
  }
}

/**
 * Check if a specific user is blocked
 */
export const isUserBlocked = async (userId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data, error } = await supabase
      .rpc('is_blocked', { user_a: user.id, user_b: userId })

    if (error) {
      console.error('Error checking block status:', error)
      return false
    }

    return data || false
  } catch (err) {
    console.error('Is user blocked exception:', err)
    return false
  }
}

/**
 * Check if there's a mutual block (either direction)
 */
export const isMutuallyBlocked = async (userId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data, error } = await supabase
      .rpc('is_mutually_blocked', { user_a: user.id, user_b: userId })

    if (error) {
      console.error('Error checking mutual block:', error)
      return false
    }

    return data || false
  } catch (err) {
    console.error('Is mutually blocked exception:', err)
    return false
  }
}

/**
 * Get all blocks with user details
 */
export const getBlockedUsersWithDetails = async (): Promise<BlockServiceResult<Block[]>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: [] }
    }

    const { data, error } = await supabase
      .from('blocks')
      .select('*')
      .eq('blocker_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching blocks with details:', error)
      return { error: 'Erreur lors de la récupération' }
    }

    return { data: data || [] }
  } catch (err) {
    console.error('Get blocks with details exception:', err)
    return { error: 'Erreur inattendue' }
  }
}

// =============================================================================
// REPORT OPERATIONS
// =============================================================================

export interface ReportUserParams {
  userId: string
  reason: ReportReason
  description?: string
  screenshotUrl?: string
}

/**
 * Report a user for moderation
 * Automatically blocks the user
 * Rate limit: 5 reports per 24 hours
 */
export const reportUser = async ({
  userId,
  reason,
  description,
  screenshotUrl,
}: ReportUserParams): Promise<BlockServiceResult> => {
  try {
    // Rate limit enforced by database trigger (5 reports/24h)
    // But we also check client-side for better UX
    if (!checkRateLimit('report-user', 5, 24 * 60 * 60 * 1000)) {
      return { error: 'Limite atteinte. Vous ne pouvez signaler que 5 utilisateurs par 24 heures.' }
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'Non authentifié' }
    }

    const { error } = await supabase
      .from('reports')
      .insert({
        reporter_id: user.id,
        reported_id: userId,
        reason,
        description: description?.trim() || null,
        screenshot_url: screenshotUrl || null,
      })

    if (error) {
      console.error('Error reporting user:', error)

      // Check for rate limit error from database
      if (error.message?.includes('Rate limit exceeded')) {
        return { error: 'Vous avez atteint la limite de signalements (5 par 24h)' }
      }

      return { error: 'Erreur lors du signalement' }
    }

    // User is automatically blocked by database trigger
    return {}
  } catch (err) {
    console.error('Report user exception:', err)
    return { error: 'Erreur inattendue' }
  }
}

/**
 * Get user's own reports
 */
export const getMyReports = async (): Promise<BlockServiceResult<Report[]>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: [] }
    }

    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('reporter_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching reports:', error)
      return { error: 'Erreur lors de la récupération' }
    }

    return { data: data || [] }
  } catch (err) {
    console.error('Get reports exception:', err)
    return { error: 'Erreur inattendue' }
  }
}

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Get user-friendly report reason labels
 */
export const getReportReasonLabel = (reason: ReportReason): string => {
  const labels: Record<ReportReason, string> = {
    fake_profile: 'Profil frauduleux',
    inappropriate: 'Contenu inapproprié',
    harassment: 'Harcèlement',
    spam: 'Spam ou publicité',
    underage: 'Utilisateur mineur',
    scam: 'Arnaque',
    other: 'Autre',
  }
  return labels[reason]
}

/**
 * Get all report reasons for UI
 */
export const getReportReasons = (): Array<{ value: ReportReason; label: string }> => {
  return [
    { value: 'fake_profile', label: 'Profil frauduleux' },
    { value: 'inappropriate', label: 'Contenu inapproprié' },
    { value: 'harassment', label: 'Harcèlement' },
    { value: 'spam', label: 'Spam ou publicité' },
    { value: 'underage', label: 'Utilisateur mineur' },
    { value: 'scam', label: 'Arnaque' },
    { value: 'other', label: 'Autre' },
  ]
}
