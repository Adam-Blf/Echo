import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mic, Square, Play, Pause, RotateCcw, Check } from 'lucide-react'
import { useAudioRecorder } from '@/hooks/useAudioRecorder'
import { AudioVisualizer } from './AudioVisualizer'
import { cn } from '@/lib/utils'

interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob, duration: number) => void
  maxDuration?: number
}

export function VoiceRecorder({ onRecordingComplete, maxDuration = 60 }: VoiceRecorderProps) {
  const {
    state,
    duration,
    audioUrl,
    audioBlob,
    error,
    analyserNode,
    startRecording,
    stopRecording,
    resetRecording,
  } = useAudioRecorder()

  const [isPlaying, setIsPlaying] = useState(false)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handlePlayPause = () => {
    if (!audioUrl) return

    if (isPlaying && audioElement) {
      audioElement.pause()
      setIsPlaying(false)
    } else {
      const audio = new Audio(audioUrl)
      audio.onended = () => setIsPlaying(false)
      audio.play()
      setAudioElement(audio)
      setIsPlaying(true)
    }
  }

  const handleConfirm = () => {
    if (audioBlob) {
      onRecordingComplete(audioBlob, duration)
    }
  }

  if (error) {
    return (
      <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-center">
        <p className="text-red-400 text-sm">{error}</p>
        <button
          onClick={() => startRecording()}
          className="mt-3 text-white/70 text-sm underline"
        >
          Réessayer
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Visualizer */}
      <div className="bg-surface-card rounded-2xl p-4 border border-white/10">
        <AudioVisualizer
          analyserNode={analyserNode}
          isRecording={state === 'recording'}
        />

        {/* Duration display */}
        <div className="flex items-center justify-center gap-2 mt-3">
          {state === 'recording' && (
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="w-3 h-3 rounded-full bg-red-500"
            />
          )}
          <span className={cn(
            'font-mono text-lg',
            state === 'recording' ? 'text-red-400' : 'text-white/70'
          )}>
            {formatDuration(duration)} / {formatDuration(maxDuration)}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        {state === 'idle' && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={startRecording}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center hover:opacity-90 transition-opacity"
          >
            <Mic className="w-7 h-7 text-white" />
          </motion.button>
        )}

        {state === 'recording' && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={stopRecording}
            className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <Square className="w-7 h-7 text-white" fill="currentColor" />
          </motion.button>
        )}

        {state === 'stopped' && audioUrl && (
          <>
            {/* Reset */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={resetRecording}
              className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <RotateCcw className="w-5 h-5 text-white/70" />
            </motion.button>

            {/* Play/Pause */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handlePlayPause}
              className="w-16 h-16 rounded-full bg-surface-elevated border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-7 h-7 text-white" />
              ) : (
                <Play className="w-7 h-7 text-white ml-1" />
              )}
            </motion.button>

            {/* Confirm */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleConfirm}
              className="w-12 h-12 rounded-full bg-neon-green flex items-center justify-center hover:opacity-90 transition-opacity"
            >
              <Check className="w-5 h-5 text-white" />
            </motion.button>
          </>
        )}
      </div>

      {/* Help text */}
      <p className="text-center text-white/40 text-sm">
        {state === 'idle' && 'Appuie pour enregistrer un message vocal (60s max)'}
        {state === 'recording' && 'Appuie sur stop quand tu as fini'}
        {state === 'stopped' && 'Écoute ton enregistrement ou recommence'}
      </p>
    </div>
  )
}
