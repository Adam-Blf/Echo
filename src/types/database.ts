// Supabase Database Types
// Generated based on the Echo app schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type EchoStatus = 'ACTIVE' | 'EXPIRING' | 'SILENCE'
export type MatchStatus = 'pending' | 'matched' | 'expired' | 'resonance'
export type SwipeAction = 'like' | 'nope' | 'superlike'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string
          first_name: string
          age: number
          bio: string | null
          interests: string[]
          photo_url: string | null
          last_photo_at: string
          echo_status: EchoStatus
          is_validated: boolean
          wingman_quote: string | null
          wingman_qualities: string[] | null
          wingman_flaws: string[] | null
          latitude: number | null
          longitude: number | null
          notifications_enabled: boolean
          language: 'fr' | 'en'
          is_premium: boolean
          premium_expires_at: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          email: string
          first_name: string
          age: number
          bio?: string | null
          interests?: string[]
          photo_url?: string | null
          last_photo_at?: string
          echo_status?: EchoStatus
          is_validated?: boolean
          wingman_quote?: string | null
          wingman_qualities?: string[] | null
          wingman_flaws?: string[] | null
          latitude?: number | null
          longitude?: number | null
          notifications_enabled?: boolean
          language?: 'fr' | 'en'
          is_premium?: boolean
          premium_expires_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string
          first_name?: string
          age?: number
          bio?: string | null
          interests?: string[]
          photo_url?: string | null
          last_photo_at?: string
          echo_status?: EchoStatus
          is_validated?: boolean
          wingman_quote?: string | null
          wingman_qualities?: string[] | null
          wingman_flaws?: string[] | null
          latitude?: number | null
          longitude?: number | null
          notifications_enabled?: boolean
          language?: 'fr' | 'en'
          is_premium?: boolean
          premium_expires_at?: string | null
        }
      }
      wingman_tokens: {
        Row: {
          id: string
          created_at: string
          user_id: string
          token: string
          expires_at: string
          used_at: string | null
          used_by_name: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          token: string
          expires_at: string
          used_at?: string | null
          used_by_name?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          token?: string
          expires_at?: string
          used_at?: string | null
          used_by_name?: string | null
        }
      }
      swipes: {
        Row: {
          id: string
          created_at: string
          swiper_id: string
          swiped_id: string
          action: SwipeAction
        }
        Insert: {
          id?: string
          created_at?: string
          swiper_id: string
          swiped_id: string
          action: SwipeAction
        }
        Update: {
          id?: string
          created_at?: string
          swiper_id?: string
          swiped_id?: string
          action?: SwipeAction
        }
      }
      matches: {
        Row: {
          id: string
          created_at: string
          user1_id: string
          user2_id: string
          status: MatchStatus
          expires_at: string
          is_super_like: boolean
          last_message_at: string | null
          resonance_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user1_id: string
          user2_id: string
          status?: MatchStatus
          expires_at: string
          is_super_like?: boolean
          last_message_at?: string | null
          resonance_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user1_id?: string
          user2_id?: string
          status?: MatchStatus
          expires_at?: string
          is_super_like?: boolean
          last_message_at?: string | null
          resonance_at?: string | null
        }
      }
      messages: {
        Row: {
          id: string
          created_at: string
          match_id: string
          sender_id: string
          content: string
          read_at: string | null
          message_type: 'text' | 'image' | 'audio'
          media_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          match_id: string
          sender_id: string
          content: string
          read_at?: string | null
          message_type?: 'text' | 'image' | 'audio'
          media_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          match_id?: string
          sender_id?: string
          content?: string
          read_at?: string | null
          message_type?: 'text' | 'image' | 'audio'
          media_url?: string | null
        }
      }
      swipe_limits: {
        Row: {
          id: string
          user_id: string
          date: string
          swipes_used: number
          super_likes_used: number
          week_start: string
        }
        Insert: {
          id?: string
          user_id: string
          date?: string
          swipes_used?: number
          super_likes_used?: number
          week_start?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          swipes_used?: number
          super_likes_used?: number
          week_start?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_match: {
        Args: { swiper_id: string; swiped_id: string }
        Returns: boolean
      }
      get_discovery_profiles: {
        Args: { user_id: string; limit_count: number }
        Returns: Database['public']['Tables']['profiles']['Row'][]
      }
      calculate_distance: {
        Args: { lat1: number; lon1: number; lat2: number; lon2: number }
        Returns: number
      }
    }
    Enums: {
      echo_status: EchoStatus
      match_status: MatchStatus
      swipe_action: SwipeAction
    }
  }
}

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type Match = Database['public']['Tables']['matches']['Row']
export type MatchInsert = Database['public']['Tables']['matches']['Insert']
export type MatchUpdate = Database['public']['Tables']['matches']['Update']

export type Message = Database['public']['Tables']['messages']['Row']
export type MessageInsert = Database['public']['Tables']['messages']['Insert']

export type Swipe = Database['public']['Tables']['swipes']['Row']
export type SwipeInsert = Database['public']['Tables']['swipes']['Insert']

export type WingmanToken = Database['public']['Tables']['wingman_tokens']['Row']
