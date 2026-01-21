/**
 * Security utilities for Echo PWA
 * These are client-side protections. Real security requires a backend.
 *
 * IMPORTANT: Client-side sanitization is defense-in-depth.
 * The database RLS policies are the primary security layer.
 */

// Comprehensive XSS sanitization for user inputs
// Covers all OWASP recommended character escapes
export function sanitizeText(input: string): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  return input
    // HTML special characters
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    // Additional XSS vectors
    .replace(/`/g, '&#x60;')
    .replace(/\\/g, '&#x5C;')
    // Remove null bytes (can bypass filters)
    .replace(/\0/g, '')
    // Remove potential script injection patterns
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/on\w+=/gi, '')
}

// Strict sanitization for sensitive fields (bio, messages)
export function sanitizeUserContent(input: string): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  // First apply basic sanitization
  let sanitized = sanitizeText(input)

  // Remove any remaining HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '')

  // Normalize whitespace (prevent UI manipulation)
  sanitized = sanitized
    .replace(/\s+/g, ' ')
    .trim()

  return sanitized
}

// URL sanitization for user-provided links
export function sanitizeUrl(url: string): string | null {
  if (!url || typeof url !== 'string') {
    return null
  }

  try {
    const parsed = new URL(url)

    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null
    }

    // Block suspicious patterns
    if (parsed.href.includes('javascript:') ||
        parsed.href.includes('data:') ||
        parsed.href.includes('vbscript:')) {
      return null
    }

    return parsed.href
  } catch {
    return null
  }
}

// Validate message length
export function isValidMessageLength(text: string, maxLength = 500): boolean {
  return text.length > 0 && text.length <= maxLength
}

// Rate limiter for actions
interface RateLimitState {
  count: number
  firstAttempt: number
}

const rateLimitStore: Map<string, RateLimitState> = new Map()

export function checkRateLimit(
  action: string,
  maxAttempts: number = 5,
  windowMs: number = 60000
): boolean {
  const now = Date.now()
  const state = rateLimitStore.get(action)

  if (!state) {
    rateLimitStore.set(action, { count: 1, firstAttempt: now })
    return true
  }

  // Reset if window has passed
  if (now - state.firstAttempt > windowMs) {
    rateLimitStore.set(action, { count: 1, firstAttempt: now })
    return true
  }

  // Check limit
  if (state.count >= maxAttempts) {
    return false
  }

  // Increment
  state.count++
  return true
}

// Generate cryptographically secure token
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

// Generate UUID with fallback
export function generateUUID(): string {
  if (crypto?.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (crypto.getRandomValues(new Uint8Array(1))[0] % 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// Validate file type using magic numbers
export async function validateFileType(
  blob: Blob,
  allowedTypes: string[]
): Promise<boolean> {
  // Check declared type first
  if (!allowedTypes.includes(blob.type)) {
    return false
  }

  // For images, check magic numbers
  if (blob.type.startsWith('image/')) {
    const buffer = await blob.slice(0, 8).arrayBuffer()
    const bytes = new Uint8Array(buffer)

    // PNG magic number: 89 50 4E 47 0D 0A 1A 0A
    const isPNG =
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47

    // JPEG magic number: FF D8 FF
    const isJPEG =
      bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff

    // WebP magic number: 52 49 46 46 ... 57 45 42 50
    const isWebP =
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46

    if (blob.type === 'image/png' && !isPNG) return false
    if (blob.type === 'image/jpeg' && !isJPEG) return false
    if (blob.type === 'image/webp' && !isWebP) return false
  }

  return true
}

// Validate file size
export function validateFileSize(blob: Blob, maxSizeBytes: number): boolean {
  return blob.size <= maxSizeBytes
}

// Session timeout manager
const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes
let sessionTimer: ReturnType<typeof setTimeout> | null = null
let lastActivity = Date.now()

export function updateSessionActivity(): void {
  lastActivity = Date.now()
}

export function isSessionExpired(): boolean {
  return Date.now() - lastActivity > SESSION_TIMEOUT
}

export function startSessionTimer(onExpire: () => void): void {
  if (sessionTimer) {
    clearInterval(sessionTimer)
  }

  sessionTimer = setInterval(() => {
    if (isSessionExpired()) {
      onExpire()
      if (sessionTimer) {
        clearInterval(sessionTimer)
      }
    }
  }, 60000) // Check every minute
}

export function stopSessionTimer(): void {
  if (sessionTimer) {
    clearInterval(sessionTimer)
    sessionTimer = null
  }
}

// Memory cleanup utilities
const objectUrls: Set<string> = new Set()

export function createTrackedObjectURL(blob: Blob): string {
  const url = URL.createObjectURL(blob)
  objectUrls.add(url)
  return url
}

export function revokeTrackedObjectURL(url: string): void {
  if (objectUrls.has(url)) {
    URL.revokeObjectURL(url)
    objectUrls.delete(url)
  }
}

export function revokeAllObjectURLs(): void {
  objectUrls.forEach((url) => URL.revokeObjectURL(url))
  objectUrls.clear()
}

// Clean up when page unloads
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', revokeAllObjectURLs)
}
