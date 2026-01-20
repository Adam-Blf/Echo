import { useState, useRef, useCallback, useEffect } from 'react'

export type RecordingState = 'idle' | 'recording' | 'paused' | 'stopped'

interface UseAudioRecorderReturn {
  // State
  state: RecordingState
  duration: number
  audioUrl: string | null
  audioBlob: Blob | null
  error: string | null

  // Visualizer data
  analyserNode: AnalyserNode | null

  // Actions
  startRecording: () => Promise<void>
  stopRecording: () => void
  pauseRecording: () => void
  resumeRecording: () => void
  resetRecording: () => void
}

const MAX_DURATION = 60 // 60 seconds max

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [state, setState] = useState<RecordingState>('idle')
  const [duration, setDuration] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const timerRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)
  const pausedDurationRef = useRef<number>(0)

  // Update duration while recording
  const updateDuration = useCallback(() => {
    if (state === 'recording') {
      const elapsed = (Date.now() - startTimeRef.current) / 1000 + pausedDurationRef.current
      setDuration(elapsed)

      // Auto-stop at max duration
      if (elapsed >= MAX_DURATION) {
        stopRecording()
      }
    }
  }, [state])

  useEffect(() => {
    if (state === 'recording') {
      timerRef.current = window.setInterval(updateDuration, 100)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [state, updateDuration])

  const startRecording = async () => {
    setError(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Setup audio context for visualizer
      const audioContext = new AudioContext()
      audioContextRef.current = audioContext

      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      setAnalyserNode(analyser)

      // Setup media recorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      })
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
      }

      mediaRecorder.start(100) // Collect data every 100ms
      startTimeRef.current = Date.now()
      pausedDurationRef.current = 0
      setState('recording')
    } catch (err) {
      const error = err as Error
      if (error.name === 'NotAllowedError') {
        setError('Accès au microphone refusé. Active le micro dans les paramètres.')
      } else {
        setError('Impossible d\'accéder au microphone.')
      }
    }
  }

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state !== 'stopped') {
      mediaRecorderRef.current.stop()
      streamRef.current?.getTracks().forEach(track => track.stop())
      audioContextRef.current?.close()
      setAnalyserNode(null)
      setState('stopped')
    }
  }, [state])

  const pauseRecording = () => {
    if (mediaRecorderRef.current && state === 'recording') {
      mediaRecorderRef.current.pause()
      pausedDurationRef.current += (Date.now() - startTimeRef.current) / 1000
      setState('paused')
    }
  }

  const resumeRecording = () => {
    if (mediaRecorderRef.current && state === 'paused') {
      mediaRecorderRef.current.resume()
      startTimeRef.current = Date.now()
      setState('recording')
    }
  }

  const resetRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    setAudioUrl(null)
    setAudioBlob(null)
    setDuration(0)
    setState('idle')
    audioChunksRef.current = []
    pausedDurationRef.current = 0
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
      streamRef.current?.getTracks().forEach(track => track.stop())
      audioContextRef.current?.close()
    }
  }, [])

  return {
    state,
    duration,
    audioUrl,
    audioBlob,
    error,
    analyserNode,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
  }
}
