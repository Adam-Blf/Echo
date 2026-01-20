import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Environment variables for Supabase
// In production, these should be in .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

// Create Supabase client (typed as any to avoid type errors without real DB)
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  return supabaseUrl !== 'https://placeholder.supabase.co' && supabaseAnonKey !== 'placeholder-key'
}

// Auth helpers
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  return { session, error }
}

// Real-time subscription helpers
export const subscribeToMessages = (
  matchId: string,
  callback: (payload: { new: unknown }) => void
) => {
  return supabase
    .channel(`messages:${matchId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `match_id=eq.${matchId}`,
      },
      callback
    )
    .subscribe()
}

export const subscribeToMatches = (
  userId: string,
  callback: (payload: unknown) => void
) => {
  return supabase
    .channel(`matches:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'matches',
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe()
}

// Typing indicator channel
export const subscribeToTyping = (
  matchId: string,
  callback: (payload: { payload: { userId: string; isTyping: boolean } }) => void
) => {
  return supabase
    .channel(`typing:${matchId}`)
    .on('broadcast', { event: 'typing' }, callback)
    .subscribe()
}

export const broadcastTyping = async (matchId: string, userId: string, isTyping: boolean) => {
  const channel = supabase.channel(`typing:${matchId}`)
  await channel.send({
    type: 'broadcast',
    event: 'typing',
    payload: { userId, isTyping },
  })
}
