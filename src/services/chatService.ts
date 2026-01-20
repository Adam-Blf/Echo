import { supabase, subscribeToMessages, subscribeToTyping, broadcastTyping } from '@/lib/supabase'
import type { Message } from '@/types/database'
import { sanitizeText, isValidMessageLength, checkRateLimit } from '@/lib/security'

export interface ChatMessage {
  id: string
  matchId: string
  senderId: string
  content: string
  createdAt: Date
  readAt: Date | null
  messageType: 'text' | 'image' | 'audio'
  mediaUrl: string | null
}

// Transform database message to ChatMessage
const transformMessage = (msg: Message): ChatMessage => ({
  id: msg.id,
  matchId: msg.match_id,
  senderId: msg.sender_id,
  content: msg.content,
  createdAt: new Date(msg.created_at),
  readAt: msg.read_at ? new Date(msg.read_at) : null,
  messageType: msg.message_type,
  mediaUrl: msg.media_url,
})

// Fetch messages for a match
export const fetchMessages = async (matchId: string, limit = 50, offset = 0): Promise<ChatMessage[]> => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('match_id', matchId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching messages:', error)
    return []
  }

  return (data as Message[]).map(transformMessage).reverse()
}

// Send a text message
export const sendMessage = async (
  matchId: string,
  senderId: string,
  content: string
): Promise<{ message: ChatMessage | null; error: string | null }> => {
  // Rate limiting
  if (!checkRateLimit(`chat-${matchId}`, 20, 60000)) {
    return { message: null, error: 'Trop de messages envoyés. Attendez un moment.' }
  }

  // Validate message
  if (!isValidMessageLength(content, 500)) {
    return { message: null, error: 'Message trop long (max 500 caractères)' }
  }

  // Sanitize content
  const sanitizedContent = sanitizeText(content.trim())

  const { data, error } = await supabase
    .from('messages')
    .insert({
      match_id: matchId,
      sender_id: senderId,
      content: sanitizedContent,
      message_type: 'text',
    } as never)
    .select()
    .single()

  if (error) {
    console.error('Error sending message:', error)
    return { message: null, error: 'Erreur lors de l\'envoi du message' }
  }

  // Update last_message_at in match
  await supabase
    .from('matches')
    .update({ last_message_at: new Date().toISOString() } as never)
    .eq('id', matchId)

  return { message: transformMessage(data as Message), error: null }
}

// Send an image message
export const sendImageMessage = async (
  matchId: string,
  senderId: string,
  imageBlob: Blob
): Promise<{ message: ChatMessage | null; error: string | null }> => {
  // Validate file size (max 5MB)
  if (imageBlob.size > 5 * 1024 * 1024) {
    return { message: null, error: 'Image trop volumineuse (max 5MB)' }
  }

  // Upload image to storage
  const fileName = `${matchId}/${senderId}/${Date.now()}.jpg`
  const { error: uploadError } = await supabase.storage
    .from('photos')
    .upload(fileName, imageBlob, {
      contentType: 'image/jpeg',
      upsert: false,
    })

  if (uploadError) {
    console.error('Error uploading image:', uploadError)
    return { message: null, error: 'Erreur lors de l\'envoi de l\'image' }
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('photos')
    .getPublicUrl(fileName)

  // Create message
  const { data, error } = await supabase
    .from('messages')
    .insert({
      match_id: matchId,
      sender_id: senderId,
      content: '📷 Photo',
      message_type: 'image',
      media_url: publicUrl,
    } as never)
    .select()
    .single()

  if (error) {
    console.error('Error sending image message:', error)
    return { message: null, error: 'Erreur lors de l\'envoi' }
  }

  return { message: transformMessage(data as Message), error: null }
}

// Mark messages as read
export const markMessagesAsRead = async (matchId: string, userId: string): Promise<void> => {
  await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() } as never)
    .eq('match_id', matchId)
    .neq('sender_id', userId)
    .is('read_at', null)
}

// Subscribe to new messages
export const subscribeToNewMessages = (
  matchId: string,
  onMessage: (message: ChatMessage) => void
) => {
  return subscribeToMessages(matchId, (payload) => {
    if (payload.new) {
      onMessage(transformMessage(payload.new as Message))
    }
  })
}

// Typing indicator
export const sendTypingIndicator = async (matchId: string, userId: string, isTyping: boolean) => {
  await broadcastTyping(matchId, userId, isTyping)
}

export const subscribeToTypingIndicator = (
  matchId: string,
  onTyping: (userId: string, isTyping: boolean) => void
) => {
  return subscribeToTyping(matchId, (payload) => {
    const { userId, isTyping } = payload.payload
    onTyping(userId, isTyping)
  })
}

// Get unread message count
export const getUnreadCount = async (matchId: string, userId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('match_id', matchId)
    .neq('sender_id', userId)
    .is('read_at', null)

  return error ? 0 : (count ?? 0)
}
