import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const createSupabaseClient = () => {
  if (typeof window === 'undefined') return null
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.startsWith('your_') || supabaseAnonKey.startsWith('your_')) return null
  return createClient(supabaseUrl, supabaseAnonKey)
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          display_name: string | null
          avatar_url: string | null
          role: 'learner' | 'admin'
          learning_goals: string[] | null
          preferred_topics: string[] | null
          time_commitment: string | null
          total_points: number
          current_streak: number
          longest_streak: number
          last_login_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          display_name?: string | null
          avatar_url?: string | null
          role?: 'learner' | 'admin'
          learning_goals?: string[] | null
          preferred_topics?: string[] | null
          time_commitment?: string | null
          total_points?: number
          current_streak?: number
          longest_streak?: number
          last_login_date?: string | null
        }
        Update: {
          email?: string
          full_name?: string | null
          display_name?: string | null
          avatar_url?: string | null
          role?: 'learner' | 'admin'
          learning_goals?: string[] | null
          preferred_topics?: string[] | null
          time_commitment?: string | null
          total_points?: number
          current_streak?: number
          longest_streak?: number
          last_login_date?: string | null
        }
      }
      courses: {
        Row: {
          id: string
          title: string
          description: string | null
          youtube_url: string | null
          youtube_playlist_id: string | null
          thumbnail_url: string | null
          duration_minutes: number | null
          tags: string[] | null
          difficulty_level: 'beginner' | 'intermediate' | 'advanced'
          created_by: string | null
          is_featured: boolean
          is_admin_created: boolean
          unlock_points: number
          total_modules: number
          created_at: string
          updated_at: string
        }
        Insert: {
          title: string
          description?: string | null
          youtube_url?: string | null
          youtube_playlist_id?: string | null
          thumbnail_url?: string | null
          duration_minutes?: number | null
          tags?: string[] | null
          difficulty_level?: 'beginner' | 'intermediate' | 'advanced'
          created_by?: string | null
          is_featured?: boolean
          is_admin_created?: boolean
          unlock_points?: number
          total_modules?: number
        }
        Update: {
          title?: string
          description?: string | null
          youtube_url?: string | null
          youtube_playlist_id?: string | null
          thumbnail_url?: string | null
          duration_minutes?: number | null
          tags?: string[] | null
          difficulty_level?: 'beginner' | 'intermediate' | 'advanced'
          created_by?: string | null
          is_featured?: boolean
          is_admin_created?: boolean
          unlock_points?: number
          total_modules?: number
        }
      }
    }
  }
}