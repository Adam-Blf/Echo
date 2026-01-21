import { supabase } from '@/lib/supabase'
import type { Profile, SearchPreferences, EchoStatus } from '@/types/database'

// =============================================================================
// TYPES
// =============================================================================

export interface DiscoveryProfile {
  profileId: string
  firstName: string
  age: number
  bio: string | null
  interests: string[]
  photoUrl: string | null
  echoStatus: EchoStatus
  lastPhotoAt: string
  isValidated: boolean
  wingmanQuote: string | null
  wingmanQualities: string[] | null
  wingmanFlaws: string[] | null
  distanceKm: number | null
}

export interface DiscoveryFilters {
  minAge?: number
  maxAge?: number
  maxDistanceKm?: number
  verifiedOnly?: boolean
  limit?: number
  offset?: number
}

export interface LocationUpdate {
  latitude: number
  longitude: number
}

// =============================================================================
// ERROR HANDLING
// =============================================================================

export interface DiscoveryServiceResult<T = void> {
  data?: T
  error?: string
}

// =============================================================================
// DISCOVERY FUNCTIONS
// =============================================================================

/**
 * Get discovery profiles with advanced filters
 * Uses the RPC function get_discovery_profiles_advanced from migration 003
 */
export const getDiscoveryProfiles = async (
  filters?: DiscoveryFilters
): Promise<DiscoveryServiceResult<DiscoveryProfile[]>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'Non authentifié' }
    }

    const { data, error } = await supabase.rpc('get_discovery_profiles_advanced', {
      p_user_id: user.id,
      p_min_age: filters?.minAge || null,
      p_max_age: filters?.maxAge || null,
      p_max_distance_km: filters?.maxDistanceKm || null,
      p_verified_only: filters?.verifiedOnly || false,
      p_limit: filters?.limit || 20,
      p_offset: filters?.offset || 0,
    })

    if (error) {
      console.error('Error fetching discovery profiles:', error)
      return { error: 'Erreur lors de la récupération des profils' }
    }

    return { data: data || [] }
  } catch (err) {
    console.error('Get discovery profiles exception:', err)
    return { error: 'Erreur inattendue' }
  }
}

/**
 * Get profiles within a specific distance radius
 * Uses the RPC function get_profiles_within_distance from migration 003
 */
export const getProfilesNearby = async (
  radiusKm: number = 50,
  limit: number = 20
): Promise<DiscoveryServiceResult<DiscoveryProfile[]>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'Non authentifié' }
    }

    const { data, error } = await supabase.rpc('get_profiles_within_distance', {
      p_user_id: user.id,
      p_max_distance_km: radiusKm,
      p_limit: limit,
    })

    if (error) {
      console.error('Error fetching nearby profiles:', error)
      return { error: 'Erreur lors de la récupération' }
    }

    return { data: data || [] }
  } catch (err) {
    console.error('Get nearby profiles exception:', err)
    return { error: 'Erreur inattendue' }
  }
}

/**
 * Get basic discovery profiles (fallback without filters)
 * Uses the basic get_discovery_profiles function
 */
export const getBasicDiscoveryProfiles = async (
  limit: number = 20
): Promise<DiscoveryServiceResult<Profile[]>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'Non authentifié' }
    }

    const { data, error } = await supabase.rpc('get_discovery_profiles', {
      p_user_id: user.id,
      p_limit: limit,
    })

    if (error) {
      console.error('Error fetching basic profiles:', error)
      return { error: 'Erreur lors de la récupération' }
    }

    return { data: data || [] }
  } catch (err) {
    console.error('Get basic profiles exception:', err)
    return { error: 'Erreur inattendue' }
  }
}

// =============================================================================
// LOCATION FUNCTIONS
// =============================================================================

/**
 * Update user's location
 * Automatically updates the PostGIS geography column
 */
export const updateLocation = async (
  location: LocationUpdate
): Promise<DiscoveryServiceResult> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'Non authentifié' }
    }

    // Validate coordinates
    if (
      location.latitude < -90 ||
      location.latitude > 90 ||
      location.longitude < -180 ||
      location.longitude > 180
    ) {
      return { error: 'Coordonnées invalides' }
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        latitude: location.latitude,
        longitude: location.longitude,
        // The geography column is automatically updated by the trigger
      } as never)
      .eq('id', user.id)

    if (error) {
      console.error('Error updating location:', error)
      return { error: 'Erreur lors de la mise à jour de la position' }
    }

    return {}
  } catch (err) {
    console.error('Update location exception:', err)
    return { error: 'Erreur inattendue' }
  }
}

/**
 * Get current user's location
 */
export const getCurrentLocation = async (): Promise<
  DiscoveryServiceResult<{ latitude: number; longitude: number } | null>
> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'Non authentifié' }
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('latitude, longitude')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching location:', error)
      return { error: 'Erreur lors de la récupération' }
    }

    if (!data?.latitude || !data?.longitude) {
      return { data: null }
    }

    return {
      data: {
        latitude: data.latitude,
        longitude: data.longitude,
      },
    }
  } catch (err) {
    console.error('Get location exception:', err)
    return { error: 'Erreur inattendue' }
  }
}

/**
 * Request location from browser geolocation API and update
 */
export const requestAndUpdateLocation = async (): Promise<DiscoveryServiceResult> => {
  try {
    if (!navigator.geolocation) {
      return { error: 'Géolocalisation non supportée par ce navigateur' }
    }

    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 5 * 60 * 1000, // 5 minutes
      })
    })

    return await updateLocation({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    })
  } catch (err: any) {
    console.error('Geolocation error:', err)

    if (err.code === 1) {
      return { error: 'Permission de localisation refusée' }
    } else if (err.code === 2) {
      return { error: 'Position indisponible' }
    } else if (err.code === 3) {
      return { error: 'Délai de localisation dépassé' }
    }

    return { error: 'Erreur de géolocalisation' }
  }
}

/**
 * Count nearby users within a radius
 * Uses the RPC function count_nearby_users from migration 003
 */
export const countNearbyUsers = async (radiusKm: number = 10): Promise<number> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return 0

    const { data, error } = await supabase.rpc('count_nearby_users', {
      p_user_id: user.id,
      p_radius_km: radiusKm,
    })

    if (error) {
      console.error('Error counting nearby users:', error)
      return 0
    }

    return data || 0
  } catch (err) {
    console.error('Count nearby users exception:', err)
    return 0
  }
}

/**
 * Calculate distance between current user and another user
 */
export const getDistanceToUser = async (targetUserId: string): Promise<number | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase.rpc('distance_between_users', {
      user_a: user.id,
      user_b: targetUserId,
    })

    if (error) {
      console.error('Error calculating distance:', error)
      return null
    }

    return data
  } catch (err) {
    console.error('Get distance exception:', err)
    return null
  }
}

// =============================================================================
// SEARCH PREFERENCES
// =============================================================================

/**
 * Update user's search preferences
 */
export const updateSearchPreferences = async (
  preferences: Partial<SearchPreferences>
): Promise<DiscoveryServiceResult> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'Non authentifié' }
    }

    const { error } = await supabase.rpc('update_search_preferences', {
      p_user_id: user.id,
      p_preferences: preferences,
    })

    if (error) {
      console.error('Error updating search preferences:', error)
      return { error: 'Erreur lors de la mise à jour des préférences' }
    }

    return {}
  } catch (err) {
    console.error('Update search preferences exception:', err)
    return { error: 'Erreur inattendue' }
  }
}

/**
 * Get user's search preferences with defaults
 */
export const getSearchPreferences = async (): Promise<
  DiscoveryServiceResult<SearchPreferences>
> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'Non authentifié' }
    }

    const { data, error } = await supabase.rpc('get_search_preferences', {
      p_user_id: user.id,
    })

    if (error) {
      console.error('Error fetching search preferences:', error)
      return { error: 'Erreur lors de la récupération' }
    }

    return { data: data as SearchPreferences }
  } catch (err) {
    console.error('Get search preferences exception:', err)
    return { error: 'Erreur inattendue' }
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Format distance for display
 */
export const formatDistance = (km: number | null): string => {
  if (km === null) return 'Distance inconnue'
  if (km < 1) return 'À proximité'
  if (km < 10) return `${Math.round(km)} km`
  return `${Math.round(km)} km`
}

/**
 * Check if location permission is granted
 */
export const checkLocationPermission = async (): Promise<PermissionState> => {
  try {
    if (!navigator.permissions) {
      return 'prompt'
    }

    const result = await navigator.permissions.query({ name: 'geolocation' })
    return result.state
  } catch (err) {
    console.error('Error checking location permission:', err)
    return 'prompt'
  }
}
