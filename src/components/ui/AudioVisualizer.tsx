import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface AudioVisualizerProps {
  analyserNode: AnalyserNode | null
  isRecording: boolean
  className?: string
}

export function AudioVisualizer({ analyserNode, isRecording, className }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !analyserNode || !isRecording) {
      // Draw idle state
      if (canvas) {
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          drawIdleBars(ctx, canvas.width, canvas.height)
        }
      }
      return
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const bufferLength = analyserNode.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw)

      analyserNode.getByteFrequencyData(dataArray)

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const barCount = 32
      const barWidth = canvas.width / barCount - 2
      const barSpacing = 2

      for (let i = 0; i < barCount; i++) {
        // Sample from frequency data
        const index = Math.floor((i / barCount) * bufferLength)
        const value = dataArray[index]
        const barHeight = (value / 255) * canvas.height * 0.9

        const x = i * (barWidth + barSpacing)
        const y = (canvas.height - barHeight) / 2

        // Gradient from cyan to purple
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight)
        gradient.addColorStop(0, '#00f5ff')
        gradient.addColorStop(1, '#bf00ff')

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.roundRect(x, y, barWidth, barHeight, 4)
        ctx.fill()
      }
    }

    draw()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [analyserNode, isRecording])

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={80}
      className={cn('w-full h-20', className)}
    />
  )
}

function drawIdleBars(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const barCount = 32
  const barWidth = width / barCount - 2
  const barSpacing = 2

  for (let i = 0; i < barCount; i++) {
    const barHeight = 4
    const x = i * (barWidth + barSpacing)
    const y = (height - barHeight) / 2

    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
    ctx.beginPath()
    ctx.roundRect(x, y, barWidth, barHeight, 2)
    ctx.fill()
  }
}
