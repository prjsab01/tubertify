'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createSupabaseClient } from '@/lib/supabase'
import { hashEmail } from '@/lib/utils'

interface AuthContextType {
  user: User | null
  profile: any | null
  loading: boolean
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseClient()

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await loadProfile(session.user)
      }
      setLoading(false)
    }

    getSession()

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
  }, [])

  const loadProfile = async (user: User) => {
    try {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (existingProfile) {
        // Check if user should be admin
        const { data: adminConfig } = await supabase
          .from('app_config')
          .select('value')
          .eq('key', 'admin_email_hash')
          .single()

        const userEmailHash = hashEmail(user.email!)
        const isAdmin = adminConfig?.value === userEmailHash

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
  }

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    })
  }

  const signOut = async () => {
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