import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, X, Check, AlertCircle, Loader2 } from 'lucide-react'
import { useCamera } from '@/hooks/useCamera'
import { cn } from '@/lib/utils'

interface CameraViewProps {
  onCapture: (blob: Blob) => void
  onCancel: () => void
}

export function CameraView({ onCapture, onCancel }: CameraViewProps) {
  const {
    videoRef,
    permission,
    error,
    isLoading,
    facing,
    startCamera,
    stopCamera,
    switchCamera,
    takePhoto,
  } = useCamera({ facing: 'user' })

  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [showFlash, setShowFlash] = useState(false)

  // Start camera on mount
  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [])

  // Handle photo capture
  const handleCapture = async () => {
    setIsCapturing(true)
    setShowFlash(true)

    // Vibration feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }

    const blob = await takePhoto()

    if (blob) {
      const url = URL.createObjectURL(blob)
      setCapturedPhoto(url)
      setCapturedBlob(blob)
      stopCamera()
    }

    setIsCapturing(false)
    setTimeout(() => setShowFlash(false), 100)
  }

  // Retry photo
  const handleRetry = () => {
    if (capturedPhoto) {
      URL.revokeObjectURL(capturedPhoto)
    }
    setCapturedPhoto(null)
    setCapturedBlob(null)
    startCamera()
  }

  // Confirm photo
  const handleConfirm = () => {
    if (capturedBlob) {
      onCapture(capturedBlob)
    }
  }

  // Permission denied state
  if (permission === 'denied' || error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
          <AlertCircle className="w-10 h-10 text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Caméra inaccessible
        </h3>
        <p className="text-white/60 text-sm mb-6 max-w-xs">
          {error || 'Active l\'accès à la caméra dans les paramètres de ton navigateur.'}
        </p>
        <button
          onClick={() => startCamera()}
          className="btn-ghost"
        >
          Réessayer
        </button>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full bg-black overflow-hidden">
      {/* Camera stream or captured photo */}
      <AnimatePresence mode="wait">
        {capturedPhoto ? (
          <motion.img
            key="photo"
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            src={capturedPhoto}
            alt="Captured"
            className={cn(
              'absolute inset-0 w-full h-full object-cover',
              facing === 'user' && 'scale-x-[-1]'
            )}
          />
        ) : (
          <motion.video
            key="video"
            ref={videoRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            autoPlay
            playsInline
            muted
            className={cn(
              'absolute inset-0 w-full h-full object-cover',
              facing === 'user' && 'scale-x-[-1]'
            )}
          />
        )}
      </AnimatePresence>

      {/* Flash effect */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-white z-50"
          />
        )}
      </AnimatePresence>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
      )}

      {/* Face guide overlay */}
      {!capturedPhoto && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-80 border-2 border-white/30 rounded-[40%] relative">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-white/60 text-sm whitespace-nowrap">
              Place ton visage ici
            </div>
          </div>
        </div>
      )}

      {/* Top controls */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between safe-top">
        <button
          onClick={onCancel}
          className="p-3 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {!capturedPhoto && (
          <button
            onClick={switchCamera}
            className="p-3 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors"
          >
            <RefreshCw className="w-6 h-6 text-white" />
          </button>
        )}
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 p-6 safe-bottom">
        {capturedPhoto ? (
          <div className="flex items-center justify-center gap-8">
            {/* Retry button */}
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={handleRetry}
              className="p-4 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
            >
              <RefreshCw className="w-8 h-8 text-white" />
            </motion.button>

            {/* Confirm button */}
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
              onClick={handleConfirm}
              className="p-5 rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple hover:opacity-90 transition-opacity"
            >
              <Check className="w-10 h-10 text-white" />
            </motion.button>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            {/* Capture button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleCapture}
              disabled={isLoading || isCapturing}
              className="relative w-20 h-20 rounded-full bg-white disabled:opacity-50"
            >
              <div className="absolute inset-2 rounded-full border-4 border-black/10" />
              {isCapturing && (
                <Loader2 className="absolute inset-0 m-auto w-8 h-8 text-black/50 animate-spin" />
              )}
            </motion.button>
          </div>
        )}

        {/* Helper text */}
        <p className="text-center text-white/50 text-sm mt-4">
          {capturedPhoto ? 'Confirme ou reprends la photo' : 'Prends une photo en temps réel'}
        </p>
      </div>
    </div>
  )
}
