'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { createSupabaseClient } from '../lib/supabase'
import { hashEmail } from '../lib/utils'

interface UserProfile {
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

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseClient()
  const adminEmailHash = process.env.ADMIN_EMAIL_HASH

  const loadProfile = useCallback(async (user: User) => {
    try {
      if (!supabase) return

      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (existingProfile) {
        const userEmailHash = hashEmail(user.email!)
        const isAdmin = adminEmailHash === userEmailHash

        if (existingProfile.role !== (isAdmin ? 'admin' : 'learner')) {
          await supabase
            .from('profiles')
            .update({ role: isAdmin ? 'admin' : 'learner' })
            .eq('id', user.id)
          
          existingProfile.role = isAdmin ? 'admin' : 'learner'
        }

        setProfile(existingProfile)
      } else {
        // Create new profile
        const { data: adminConfig } = await supabase
          .from('app_config')
          .select('value')
          .eq('key', 'admin_email_hash')
          .single()

        const userEmailHash = hashEmail(user.email!)
        const isAdmin = adminConfig?.value === userEmailHash

        const newProfile = {
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || null,
          display_name: user.user_metadata?.name || null,
          avatar_url: user.user_metadata?.avatar_url || null,
          role: isAdmin ? 'admin' : 'learner'
        }

        const { data } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single()

        setProfile(data)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }, [supabase, adminEmailHash])

  useEffect(() => {
    const getSession = async () => {
      if (!supabase) {
        setLoading(false)
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await loadProfile(session.user)
      }
      setLoading(false)
    }

    getSession()

    if (!supabase) return

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await loadProfile(session.user)
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase, loadProfile])

  const signInWithGoogle = async () => {
    if (!supabase) return
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    })
  }

  const signOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signOut,
      signInWithGoogle
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}