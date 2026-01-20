import { useState, useRef, useCallback, useEffect } from 'react'

export type CameraFacing = 'user' | 'environment'
export type CameraPermission = 'prompt' | 'granted' | 'denied'

interface UseCameraOptions {
  facing?: CameraFacing
  width?: number
  height?: number
}

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>
  stream: MediaStream | null
  permission: CameraPermission
  error: string | null
  isLoading: boolean
  facing: CameraFacing
  startCamera: () => Promise<void>
  stopCamera: () => void
  switchCamera: () => Promise<void>
  takePhoto: () => Promise<Blob | null>
}

export function useCamera(options: UseCameraOptions = {}): UseCameraReturn {
  const {
    facing: initialFacing = 'user',
    width = 1080,
    height = 1920,
  } = options

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [permission, setPermission] = useState<CameraPermission>('prompt')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [facing, setFacing] = useState<CameraFacing>(initialFacing)

  // Start camera stream
  const startCamera = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Stop existing stream if any
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facing,
          width: { ideal: width },
          height: { ideal: height },
        },
        audio: false,
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(mediaStream)
      setPermission('granted')

      // Attach stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        await videoRef.current.play()
      }
    } catch (err) {
      const error = err as Error
      console.error('Camera error:', error)

      if (error.name === 'NotAllowedError') {
        setPermission('denied')
        setError('Accès à la caméra refusé. Active la caméra dans les paramètres.')
      } else if (error.name === 'NotFoundError') {
        setError('Aucune caméra trouvée sur cet appareil.')
      } else if (error.name === 'NotReadableError') {
        setError('La caméra est déjà utilisée par une autre application.')
      } else {
        setError('Impossible d\'accéder à la caméra.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [facing, width, height, stream])

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [stream])

  // Switch between front and back camera
  const switchCamera = useCallback(async () => {
    const newFacing = facing === 'user' ? 'environment' : 'user'
    setFacing(newFacing)

    if (stream) {
      stopCamera()
      // Small delay to ensure camera is fully stopped
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }, [facing, stream, stopCamera])

  // Restart camera when facing changes
  useEffect(() => {
    if (permission === 'granted' && !stream) {
      startCamera()
    }
  }, [facing, permission])

  // Take photo from video stream
  const takePhoto = useCallback(async (): Promise<Blob | null> => {
    if (!videoRef.current || !stream) return null

    const video = videoRef.current
    const canvas = document.createElement('canvas')

    // Use actual video dimensions
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    // Mirror if front camera
    if (facing === 'user') {
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
    }

    ctx.drawImage(video, 0, 0)

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob),
        'image/webp',
        0.85
      )
    })
  }, [stream, facing])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

  return {
    videoRef,
    stream,
    permission,
    error,
    isLoading,
    facing,
    startCamera,
    stopCamera,
    switchCamera,
    takePhoto,
  }
}
