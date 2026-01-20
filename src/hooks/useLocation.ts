import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface Location {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: number
}

interface UseLocationReturn {
  location: Location | null
  error: string | null
  loading: boolean
  permissionStatus: PermissionState | null
  requestPermission: () => Promise<boolean>
  updateLocation: () => Promise<void>
  calculateDistance: (lat: number, lon: number) => number | null
  isWithinRange: (lat: number, lon: number, rangeKm: number) => boolean
}

// Haversine formula to calculate distance between two coordinates
export function calculateDistanceHaversine(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth's radius in km
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  return Math.round(distance * 100) / 100 // Round to 2 decimal places
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

export function useLocation(): UseLocationReturn {
  const [location, setLocation] = useState<Location | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [permissionStatus, setPermissionStatus] = useState<PermissionState | null>(null)

  // Check permission status
  const checkPermission = useCallback(async () => {
    if (!navigator.permissions) {
      return 'prompt' as PermissionState
    }

    try {
      const result = await navigator.permissions.query({ name: 'geolocation' })
      setPermissionStatus(result.state)

      result.addEventListener('change', () => {
        setPermissionStatus(result.state)
      })

      return result.state
    } catch {
      return 'prompt' as PermissionState
    }
  }, [])

  // Request location permission and get initial location
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!navigator.geolocation) {
      setError('La géolocalisation n\'est pas supportée par ce navigateur')
      return false
    }

    setLoading(true)
    setError(null)

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          }
          setLocation(newLocation)
          setPermissionStatus('granted')
          setLoading(false)
          resolve(true)
        },
        (err) => {
          let errorMessage: string

          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMessage = 'Permission de localisation refusée'
              setPermissionStatus('denied')
              break
            case err.POSITION_UNAVAILABLE:
              errorMessage = 'Position non disponible'
              break
            case err.TIMEOUT:
              errorMessage = 'Délai d\'attente dépassé'
              break
            default:
              errorMessage = 'Erreur de géolocalisation'
          }

          setError(errorMessage)
          setLoading(false)
          resolve(false)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000, // Cache for 1 minute
        }
      )
    })
  }, [])

  // Update location
  const updateLocation = useCallback(async (): Promise<void> => {
    if (permissionStatus !== 'granted') {
      const granted = await requestPermission()
      if (!granted) return
    }

    setLoading(true)

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          }
          setLocation(newLocation)
          setLoading(false)
          resolve()
        },
        () => {
          setError('Impossible de mettre à jour la position')
          setLoading(false)
          resolve()
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0, // Force fresh location
        }
      )
    })
  }, [permissionStatus, requestPermission])

  // Calculate distance from current location to a point
  const calculateDistance = useCallback(
    (lat: number, lon: number): number | null => {
      if (!location) return null
      return calculateDistanceHaversine(
        location.latitude,
        location.longitude,
        lat,
        lon
      )
    },
    [location]
  )

  // Check if a point is within range
  const isWithinRange = useCallback(
    (lat: number, lon: number, rangeKm: number): boolean => {
      const distance = calculateDistance(lat, lon)
      return distance !== null && distance <= rangeKm
    },
    [calculateDistance]
  )

  // Check permission on mount
  useEffect(() => {
    checkPermission()
  }, [checkPermission])

  return {
    location,
    error,
    loading,
    permissionStatus,
    requestPermission,
    updateLocation,
    calculateDistance,
    isWithinRange,
  }
}

// Hook for Résonance check-in (within 200m)
export function useResonanceCheckIn(
  matchId: string,
  otherUserLocation: { latitude: number; longitude: number } | null
) {
  const { location, updateLocation, loading, error } = useLocation()

  const [checkInStatus, setCheckInStatus] = useState<'idle' | 'checking' | 'success' | 'too_far'>('idle')
  const [distanceToUser, setDistanceToUser] = useState<number | null>(null)

  const RESONANCE_RANGE_KM = 0.2 // 200 meters

  // Update distance when locations change
  useEffect(() => {
    if (location && otherUserLocation) {
      const distance = calculateDistanceHaversine(
        location.latitude,
        location.longitude,
        otherUserLocation.latitude,
        otherUserLocation.longitude
      )
      setDistanceToUser(distance)
    }
  }, [location, otherUserLocation])

  // Perform check-in
  const performCheckIn = async (): Promise<boolean> => {
    setCheckInStatus('checking')

    // Get fresh location
    await updateLocation()

    if (!location || !otherUserLocation) {
      setCheckInStatus('idle')
      return false
    }

    const distance = calculateDistanceHaversine(
      location.latitude,
      location.longitude,
      otherUserLocation.latitude,
      otherUserLocation.longitude
    )

    setDistanceToUser(distance)

    if (distance <= RESONANCE_RANGE_KM) {
      // Update match to Résonance status
      const { error: updateError } = await supabase
        .from('matches')
        .update({
          status: 'resonance',
          resonance_at: new Date().toISOString(),
        } as never)
        .eq('id', matchId)

      if (updateError) {
        console.error('Error creating resonance:', updateError)
        setCheckInStatus('idle')
        return false
      }

      setCheckInStatus('success')
      return true
    } else {
      setCheckInStatus('too_far')
      return false
    }
  }

  return {
    location,
    distanceToUser,
    checkInStatus,
    loading,
    error,
    performCheckIn,
    isCloseEnough: distanceToUser !== null && distanceToUser <= RESONANCE_RANGE_KM,
  }
}
