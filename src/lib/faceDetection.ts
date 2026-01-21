// Face detection utility
// Uses browser's Face Detection API if available, otherwise uses a fallback

interface FaceDetectionResult {
  hasFace: boolean
  confidence: number
  error?: string
}

// Check if Face Detection API is available
const isFaceDetectionSupported = (): boolean => {
  return 'FaceDetector' in window
}

// Detect faces using browser API
async function detectWithBrowserAPI(imageBlob: Blob): Promise<FaceDetectionResult> {
  try {
    // @ts-expect-error - FaceDetector is not in TypeScript types yet
    const detector = new window.FaceDetector({
      fastMode: true,
      maxDetectedFaces: 1,
    })

    const imageBitmap = await createImageBitmap(imageBlob)
    const faces = await detector.detect(imageBitmap)
    imageBitmap.close()

    return {
      hasFace: faces.length > 0,
      confidence: faces.length > 0 ? 0.9 : 0,
    }
  } catch (error) {
    return {
      hasFace: false,
      confidence: 0,
      error: 'Face detection failed',
    }
  }
}

// Fallback: Simple skin tone detection using canvas
async function detectWithFallback(imageBlob: Blob): Promise<FaceDetectionResult> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        resolve({ hasFace: false, confidence: 0, error: 'Canvas not supported' })
        return
      }

      // Use smaller size for performance
      const maxSize = 200
      const scale = Math.min(maxSize / img.width, maxSize / img.height)
      canvas.width = img.width * scale
      canvas.height = img.height * scale

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      // Count skin-tone pixels
      let skinPixels = 0

      // Focus on center region (where face likely is)
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const radius = Math.min(canvas.width, canvas.height) * 0.35

      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          // Check if pixel is in center region
          const dx = x - centerX
          const dy = y - centerY
          if (dx * dx + dy * dy > radius * radius) continue

          const i = (y * canvas.width + x) * 4
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]

          // Simple skin tone detection
          // Works for various skin tones
          if (isSkinTone(r, g, b)) {
            skinPixels++
          }
        }
      }

      // Calculate percentage of skin pixels in center region
      const centerArea = Math.PI * radius * radius
      const skinPercentage = skinPixels / centerArea

      // If more than 15% of center region is skin-like, likely a face
      const hasFace = skinPercentage > 0.15
      const confidence = Math.min(skinPercentage * 3, 1)

      resolve({ hasFace, confidence })
    }

    img.onerror = () => {
      resolve({ hasFace: false, confidence: 0, error: 'Failed to load image' })
    }

    img.src = URL.createObjectURL(imageBlob)
  })
}

// Check if RGB values are skin-tone like
function isSkinTone(r: number, g: number, b: number): boolean {
  // Multiple skin tone ranges for inclusivity
  // YCbCr-based detection converted to RGB conditions

  // Basic range check
  if (r < 60 || g < 40 || b < 20) return false
  if (r < g || r < b) return false

  // Light skin tones
  const isLightSkin =
    r > 95 && g > 40 && b > 20 &&
    r - g > 15 && r > b &&
    Math.abs(r - g) < 100

  // Medium skin tones
  const isMediumSkin =
    r > 120 && g > 70 && b > 30 &&
    r > g && g > b &&
    r - b > 20

  // Dark skin tones
  const isDarkSkin =
    r > 60 && g > 40 && b > 20 &&
    r > g && r > b &&
    r - b > 10 && r - g > 5 &&
    r < 180

  return isLightSkin || isMediumSkin || isDarkSkin
}

// Main detection function
export async function detectFace(imageBlob: Blob): Promise<FaceDetectionResult> {
  // MVP: Be lenient with face detection
  // Browser Face Detection API is only available in Chrome/Edge
  // For other browsers, we allow the photo and rely on manual moderation

  if (isFaceDetectionSupported()) {
    const result = await detectWithBrowserAPI(imageBlob)
    // Even if browser API fails, allow the photo for MVP
    if (result.error) {
      return { hasFace: true, confidence: 0.5 }
    }
    return result
  }

  // Fallback: Try skin tone detection but be lenient
  const fallbackResult = await detectWithFallback(imageBlob)

  // For MVP, if confidence is above 5% (very low threshold), allow it
  // This prevents blocking users while still catching obvious non-face images
  if (fallbackResult.confidence > 0.05 || fallbackResult.error) {
    return { hasFace: true, confidence: fallbackResult.confidence }
  }

  return fallbackResult
}

// Export for testing
export { isFaceDetectionSupported, isSkinTone }
