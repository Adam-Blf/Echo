// Supabase Database Types
// Generated based on the Echo app schema
// Updated: 2026-01-21 - Added blocks, reports, subscriptions, geolocation

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// =============================================================================
// ENUMS
// =============================================================================

export type EchoStatus = 'ACTIVE' | 'EXPIRING' | 'SILENCE'
export type MatchStatus = 'pending' | 'matched' | 'expired' | 'resonance'
export type SwipeAction = 'like' | 'nope' | 'superlike'
export type MessageType = 'text' | 'image' | 'audio'

// New enums from migrations
export type ReportReason =
  | 'fake_profile'
  | 'inappropriate'
  | 'harassment'
  | 'spam'
  | 'underage'
  | 'scam'
  | 'other'

export type ReportStatus =
  | 'pending'
  | 'reviewing'
  | 'resolved_warning'
  | 'resolved_ban'
  | 'dismissed'

export type SubscriptionPlan = 'free' | 'echo_plus' | 'echo_unlimited'

export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'incomplete'
  | 'incomplete_expired'

// Profile fields (Migration 005)
export type GenderType = 'male' | 'female' | 'non-binary'
export type PreferenceType = 'men' | 'women' | 'everyone'

// =============================================================================
// SEARCH PREFERENCES
// =============================================================================

export interface SearchPreferences {
  min_age: number
  max_age: number
  max_distance_km: number
  show_verified_only: boolean
}

// =============================================================================
// DATABASE INTERFACE
// =============================================================================

export interface Database {
  public: {
    Tables: {
      // -----------------------------------------------------------------
      // PROFILES
      // -----------------------------------------------------------------
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
          location: string | null // PostGIS geography stored as WKT
          search_preferences: SearchPreferences | null
          notifications_enabled: boolean
          language: 'fr' | 'en'
          is_premium: boolean
          premium_expires_at: string | null
          // Migration 005 fields
          gender: GenderType | null
          preference: PreferenceType | null
          phone_number: string | null
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
          search_preferences?: SearchPreferences | null
          notifications_enabled?: boolean
          language?: 'fr' | 'en'
          is_premium?: boolean
          premium_expires_at?: string | null
          // Migration 005 fields
          gender?: GenderType | null
          preference?: PreferenceType | null
          phone_number?: string | null
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
          search_preferences?: SearchPreferences | null
          notifications_enabled?: boolean
          language?: 'fr' | 'en'
          is_premium?: boolean
          premium_expires_at?: string | null
          // Migration 005 fields
          gender?: GenderType | null
          preference?: PreferenceType | null
          phone_number?: string | null
        }
      }

      // -----------------------------------------------------------------
      // WINGMAN TOKENS
      // -----------------------------------------------------------------
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

      // -----------------------------------------------------------------
      // SWIPES
      // -----------------------------------------------------------------
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

      // -----------------------------------------------------------------
      // MATCHES
      // -----------------------------------------------------------------
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

      // -----------------------------------------------------------------
      // MESSAGES
      // -----------------------------------------------------------------
      messages: {
        Row: {
          id: string
          created_at: string
          match_id: string
          sender_id: string
          content: string
          read_at: string | null
          message_type: MessageType
          media_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          match_id: string
          sender_id: string
          content: string
          read_at?: string | null
          message_type?: MessageType
          media_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          match_id?: string
          sender_id?: string
          content?: string
          read_at?: string | null
          message_type?: MessageType
          media_url?: string | null
        }
      }

      // -----------------------------------------------------------------
      // SWIPE LIMITS
      // -----------------------------------------------------------------
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

      // -----------------------------------------------------------------
      // BLOCKS (Migration 001)
      // -----------------------------------------------------------------
      blocks: {
        Row: {
          id: string
          created_at: string
          blocker_id: string
          blocked_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          blocker_id: string
          blocked_id: string
        }
        Update: {
          id?: string
          created_at?: string
          blocker_id?: string
          blocked_id?: string
        }
      }

      // -----------------------------------------------------------------
      // REPORTS (Migration 001)
      // -----------------------------------------------------------------
      reports: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          reporter_id: string
          reported_id: string
          reason: ReportReason
          description: string | null
          screenshot_url: string | null
          status: ReportStatus
          moderator_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          reporter_id: string
          reported_id: string
          reason: ReportReason
          description?: string | null
          screenshot_url?: string | null
          status?: ReportStatus
          moderator_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          reporter_id?: string
          reported_id?: string
          reason?: ReportReason
          description?: string | null
          screenshot_url?: string | null
          status?: ReportStatus
          moderator_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
        }
      }

      // -----------------------------------------------------------------
      // PREMIUM FEATURES (Migration 002)
      // -----------------------------------------------------------------
      premium_features: {
        Row: {
          id: string
          plan: SubscriptionPlan
          daily_swipes: number
          weekly_super_likes: number
          see_who_likes_you: boolean
          rewind_swipes: boolean
          invisible_mode: boolean
          read_receipts: boolean
          priority_likes: boolean
          weekly_boosts: number
          monthly_price_cents: number | null
          yearly_price_cents: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          plan: SubscriptionPlan
          daily_swipes: number
          weekly_super_likes: number
          see_who_likes_you?: boolean
          rewind_swipes?: boolean
          invisible_mode?: boolean
          read_receipts?: boolean
          priority_likes?: boolean
          weekly_boosts?: number
          monthly_price_cents?: number | null
          yearly_price_cents?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          plan?: SubscriptionPlan
          daily_swipes?: number
          weekly_super_likes?: number
          see_who_likes_you?: boolean
          rewind_swipes?: boolean
          invisible_mode?: boolean
          read_receipts?: boolean
          priority_likes?: boolean
          weekly_boosts?: number
          monthly_price_cents?: number | null
          yearly_price_cents?: number | null
          created_at?: string
          updated_at?: string
        }
      }

      // -----------------------------------------------------------------
      // SUBSCRIPTIONS (Migration 002)
      // -----------------------------------------------------------------
      subscriptions: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          plan: SubscriptionPlan
          status: SubscriptionStatus
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          stripe_price_id: string | null
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          canceled_at: string | null
          trial_start: string | null
          trial_end: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          plan?: SubscriptionPlan
          status?: SubscriptionStatus
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_price_id?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          trial_start?: string | null
          trial_end?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          plan?: SubscriptionPlan
          status?: SubscriptionStatus
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_price_id?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          trial_start?: string | null
          trial_end?: string | null
        }
      }

      // -----------------------------------------------------------------
      // SUBSCRIPTION EVENTS (Migration 002)
      // -----------------------------------------------------------------
      subscription_events: {
        Row: {
          id: string
          created_at: string
          subscription_id: string | null
          user_id: string
          event_type: string
          stripe_event_id: string | null
          event_data: Json | null
          previous_plan: SubscriptionPlan | null
          new_plan: SubscriptionPlan | null
          previous_status: SubscriptionStatus | null
          new_status: SubscriptionStatus | null
        }
        Insert: {
          id?: string
          created_at?: string
          subscription_id?: string | null
          user_id: string
          event_type: string
          stripe_event_id?: string | null
          event_data?: Json | null
          previous_plan?: SubscriptionPlan | null
          new_plan?: SubscriptionPlan | null
          previous_status?: SubscriptionStatus | null
          new_status?: SubscriptionStatus | null
        }
        Update: {
          id?: string
          created_at?: string
          subscription_id?: string | null
          user_id?: string
          event_type?: string
          stripe_event_id?: string | null
          event_data?: Json | null
          previous_plan?: SubscriptionPlan | null
          new_plan?: SubscriptionPlan | null
          previous_status?: SubscriptionStatus | null
          new_status?: SubscriptionStatus | null
        }
      }

      // -----------------------------------------------------------------
      // PURCHASES (Migration 002)
      // -----------------------------------------------------------------
      purchases: {
        Row: {
          id: string
          created_at: string
          user_id: string
          product_type: string
          quantity: number
          price_cents: number
          stripe_payment_intent_id: string | null
          stripe_charge_id: string | null
          consumed: number
          expires_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          product_type: string
          quantity?: number
          price_cents: number
          stripe_payment_intent_id?: string | null
          stripe_charge_id?: string | null
          consumed?: number
          expires_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          product_type?: string
          quantity?: number
          price_cents?: number
          stripe_payment_intent_id?: string | null
          stripe_charge_id?: string | null
          consumed?: number
          expires_at?: string | null
        }
      }

      // -----------------------------------------------------------------
      // USER PREMIUM STATE (Migration 002)
      // -----------------------------------------------------------------
      user_premium_state: {
        Row: {
          user_id: string
          updated_at: string
          current_plan: SubscriptionPlan
          is_premium: boolean
          boosts_available: number
          super_likes_available: number
          daily_swipes: number
          can_see_likes: boolean
          can_rewind: boolean
          has_invisible_mode: boolean
          has_read_receipts: boolean
          has_priority_likes: boolean
        }
        Insert: {
          user_id: string
          updated_at?: string
          current_plan?: SubscriptionPlan
          is_premium?: boolean
          boosts_available?: number
          super_likes_available?: number
          daily_swipes?: number
          can_see_likes?: boolean
          can_rewind?: boolean
          has_invisible_mode?: boolean
          has_read_receipts?: boolean
          has_priority_likes?: boolean
        }
        Update: {
          user_id?: string
          updated_at?: string
          current_plan?: SubscriptionPlan
          is_premium?: boolean
          boosts_available?: number
          super_likes_available?: number
          daily_swipes?: number
          can_see_likes?: boolean
          can_rewind?: boolean
          has_invisible_mode?: boolean
          has_read_receipts?: boolean
          has_priority_likes?: boolean
        }
      }
    }

    Views: {
      // -----------------------------------------------------------------
      // RECEIVED LIKES VIEW (Migration 002)
      // -----------------------------------------------------------------
      received_likes: {
        Row: {
          user_id: string
          liker_id: string
          action: SwipeAction
          created_at: string
          liker_first_name: string
          liker_age: number
          liker_photo_url: string | null
          liker_bio: string | null
          liker_interests: string[]
          liker_echo_status: EchoStatus
        }
      }
    }

    Functions: {
      // Original functions
      check_match: {
        Args: { swiper_id: string; swiped_id: string }
        Returns: boolean
      }
      get_discovery_profiles: {
        Args: { p_user_id: string; p_limit?: number }
        Returns: Database['public']['Tables']['profiles']['Row'][]
      }
      calculate_distance: {
        Args: { lat1: number; lon1: number; lat2: number; lon2: number }
        Returns: number
      }

      // Block functions (Migration 001)
      is_blocked: {
        Args: { user_a: string; user_b: string }
        Returns: boolean
      }
      is_mutually_blocked: {
        Args: { user_a: string; user_b: string }
        Returns: boolean
      }
      get_blocked_user_ids: {
        Args: { p_user_id: string }
        Returns: string[]
      }

      // Premium functions (Migration 002)
      get_user_plan: {
        Args: { p_user_id: string }
        Returns: SubscriptionPlan
      }
      is_user_premium: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      can_use_feature: {
        Args: { p_user_id: string; p_feature: string }
        Returns: boolean
      }
      get_received_likes: {
        Args: { p_user_id: string; p_limit?: number; p_offset?: number }
        Returns: {
          liker_id: string
          action: SwipeAction
          created_at: string
          first_name: string | null
          age: number | null
          photo_url: string | null
          bio: string | null
          interests: string[] | null
          echo_status: EchoStatus | null
          is_blurred: boolean
        }[]
      }
      count_received_likes: {
        Args: { p_user_id: string }
        Returns: number
      }

      // Geolocation functions (Migration 003)
      distance_between_users: {
        Args: { user_a: string; user_b: string }
        Returns: number | null
      }
      get_profiles_within_distance: {
        Args: { p_user_id: string; p_max_distance_km?: number; p_limit?: number }
        Returns: {
          profile_id: string
          first_name: string
          age: number
          bio: string | null
          interests: string[]
          photo_url: string | null
          echo_status: EchoStatus
          last_photo_at: string
          wingman_quote: string | null
          distance_km: number
        }[]
      }
      get_discovery_profiles_advanced: {
        Args: {
          p_user_id: string
          p_min_age?: number
          p_max_age?: number
          p_max_distance_km?: number
          p_verified_only?: boolean
          p_limit?: number
          p_offset?: number
        }
        Returns: {
          profile_id: string
          first_name: string
          age: number
          bio: string | null
          interests: string[]
          photo_url: string | null
          echo_status: EchoStatus
          last_photo_at: string
          is_validated: boolean
          wingman_quote: string | null
          wingman_qualities: string[] | null
          wingman_flaws: string[] | null
          distance_km: number | null
          gender: GenderType | null
          preference: PreferenceType | null
        }[]
      }
      count_nearby_users: {
        Args: { p_user_id: string; p_radius_km?: number }
        Returns: number
      }
      update_search_preferences: {
        Args: { p_user_id: string; p_preferences: Json }
        Returns: void
      }
      get_search_preferences: {
        Args: { p_user_id: string }
        Returns: Json
      }
    }

    Enums: {
      echo_status: EchoStatus
      match_status: MatchStatus
      swipe_action: SwipeAction
      message_type: MessageType
      report_reason: ReportReason
      report_status: ReportStatus
      subscription_plan: SubscriptionPlan
      subscription_status: SubscriptionStatus
      // Migration 005 enums
      gender_type: GenderType
      preference_type: PreferenceType
    }
  }
}

// =============================================================================
// HELPER TYPES
// =============================================================================

// Profiles
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

// Matches
export type Match = Database['public']['Tables']['matches']['Row']
export type MatchInsert = Database['public']['Tables']['matches']['Insert']
export type MatchUpdate = Database['public']['Tables']['matches']['Update']

// Messages
export type Message = Database['public']['Tables']['messages']['Row']
export type MessageInsert = Database['public']['Tables']['messages']['Insert']

// Swipes
export type Swipe = Database['public']['Tables']['swipes']['Row']
export type SwipeInsert = Database['public']['Tables']['swipes']['Insert']

// Wingman Tokens
export type WingmanToken = Database['public']['Tables']['wingman_tokens']['Row']

// Blocks & Reports (Migration 001)
export type Block = Database['public']['Tables']['blocks']['Row']
export type BlockInsert = Database['public']['Tables']['blocks']['Insert']

export type Report = Database['public']['Tables']['reports']['Row']
export type ReportInsert = Database['public']['Tables']['reports']['Insert']

// Subscriptions (Migration 002)
export type Subscription = Database['public']['Tables']['subscriptions']['Row']
export type SubscriptionInsert = Database['public']['Tables']['subscriptions']['Insert']
export type SubscriptionUpdate = Database['public']['Tables']['subscriptions']['Update']

export type PremiumFeatures = Database['public']['Tables']['premium_features']['Row']
export type UserPremiumState = Database['public']['Tables']['user_premium_state']['Row']

export type Purchase = Database['public']['Tables']['purchases']['Row']
export type PurchaseInsert = Database['public']['Tables']['purchases']['Insert']

// Received Likes View
export type ReceivedLike = Database['public']['Views']['received_likes']['Row']
