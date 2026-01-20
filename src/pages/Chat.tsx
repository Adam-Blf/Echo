import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Send, Camera, MapPin, Infinity, AlertTriangle } from 'lucide-react'
import { useSwipeStore } from '@/stores'
import { CountdownTimer, EchoTimerWave } from '@/components/ui'
import { cn } from '@/lib/utils'
import { sanitizeText, isValidMessageLength, checkRateLimit } from '@/lib/security'

interface Message {
  id: string
  text: string
  senderId: 'me' | 'them'
  timestamp: Date
}

// Mock profile data
const MOCK_PROFILES: Record<string, { firstName: string; photoUrl: string }> = {
  '1': { firstName: 'Sophie', photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400' },
  '2': { firstName: 'Emma', photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400' },
  '3': { firstName: 'Léa', photoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400' },
  '4': { firstName: 'Chloé', photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400' },
}

export function ChatPage() {
  const { matchId } = useParams<{ matchId: string }>()
  const navigate = useNavigate()
  const { matches } = useSwipeStore()

  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Find the match
  const match = matches.find(m => m.id === matchId)
  const profile = match ? MOCK_PROFILES[match.oderId] : null

  // Calculate time left
  const getHoursLeft = () => {
    if (!match) return 0
    const now = new Date()
    const diff = new Date(match.expiresAt).getTime() - now.getTime()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60)))
  }

  const hoursLeft = getHoursLeft()
  const isExpired = hoursLeft <= 0 && match?.status !== 'resonance'
  const isResonance = match?.status === 'resonance'

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Simulate typing indicator
  const simulateTyping = () => {
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      // Auto-reply simulation
      const replies = [
        'Salut ! Comment vas-tu ?',
        "J'adore ton profil !",
        'On se retrouve où ?',
        "C'est cool de matcher avec toi !",
      ]
      const reply: Message = {
        id: crypto.randomUUID(),
        text: replies[Math.floor(Math.random() * replies.length)],
        senderId: 'them',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, reply])
    }, 2000)
  }

  const handleSend = () => {
    if (!inputValue.trim() || isExpired) return

    // Security: Rate limiting
    if (!checkRateLimit('chat-message', 10, 60000)) {
      return // Too many messages
    }

    // Security: Validate message length
    const trimmedText = inputValue.trim()
    if (!isValidMessageLength(trimmedText, 500)) {
      return // Message too long
    }

    // Security: Sanitize text
    const sanitizedText = sanitizeText(trimmedText)

    const newMessage: Message = {
      id: crypto.randomUUID(),
      text: sanitizedText,
      senderId: 'me',
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, newMessage])
    setInputValue('')

    // Simulate reply
    if (Math.random() > 0.5) {
      setTimeout(simulateTyping, 1000)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!match || !profile) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface-dark">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-white mb-2">Match introuvable</h2>
          <button onClick={() => navigate('/matches')} className="btn-ghost">
            Retour aux matchs
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-surface-dark">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-white/10 safe-top bg-surface-elevated">
        <button
          onClick={() => navigate('/matches')}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        <div className="flex items-center gap-3 flex-1">
          <div className={cn(
            'w-10 h-10 rounded-full overflow-hidden',
            isResonance && 'ring-2 ring-neon-purple'
          )}>
            <img src={profile.photoUrl} alt={profile.firstName} className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-white">{profile.firstName}</h2>
              {isResonance && <Infinity className="w-4 h-4 text-neon-purple" />}
            </div>
            {!isResonance && !isExpired && (
              <CountdownTimer expiresAt={new Date(match.expiresAt)} size="sm" />
            )}
          </div>
        </div>

        {/* Check-in button for Resonance */}
        {!isResonance && !isExpired && (
          <button
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neon-purple/10 border border-neon-purple/30
                       text-neon-purple text-sm hover:bg-neon-purple/20 transition-colors"
          >
            <MapPin className="w-4 h-4" />
            <span>Check-in</span>
          </button>
        )}
      </div>

      {/* Timer waveform */}
      {!isResonance && !isExpired && (
        <div className="px-4 py-2 bg-surface-card border-b border-white/5">
          <EchoTimerWave hoursLeft={hoursLeft} maxHours={48} />
        </div>
      )}

      {/* Expired banner */}
      {isExpired && (
        <div className="mx-4 mt-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/30">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <div>
              <p className="font-medium text-red-400">Match expiré</p>
              <p className="text-white/50 text-sm">Vous ne pouvez plus envoyer de messages.</p>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-white/40 text-sm">
              Commencez la conversation avec {profile.firstName} !
            </p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={cn(
                'flex',
                message.senderId === 'me' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-[75%] px-4 py-2 rounded-2xl',
                  message.senderId === 'me'
                    ? 'bg-gradient-to-r from-neon-cyan to-neon-purple text-white rounded-br-md'
                    : 'bg-surface-elevated text-white rounded-bl-md'
                )}
              >
                <p>{message.text}</p>
                <p className={cn(
                  'text-[10px] mt-1',
                  message.senderId === 'me' ? 'text-white/70' : 'text-white/40'
                )}>
                  {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="px-4 py-3 rounded-2xl bg-surface-elevated rounded-bl-md">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, delay: i * 0.15 }}
                    className="w-2 h-2 rounded-full bg-white/40"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10 safe-bottom bg-surface-elevated">
        <div className="flex items-center gap-3">
          <button
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            disabled={isExpired}
          >
            <Camera className="w-5 h-5 text-white/70" />
          </button>

          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isExpired ? 'Match expiré' : 'Écris un message...'}
              disabled={isExpired}
              className={cn(
                'w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white',
                'placeholder:text-white/30 focus:outline-none focus:border-neon-cyan/50',
                'transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isExpired}
            className={cn(
              'p-3 rounded-xl transition-all',
              inputValue.trim() && !isExpired
                ? 'bg-gradient-to-r from-neon-cyan to-neon-purple text-white'
                : 'bg-white/5 text-white/30'
            )}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
