import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: any | null
  signUp: (email: string, password: string, metaData?: any) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const fetchProfile = async (userId: string) => {
      try {
        const { data, error } = await supabase.from('users').select('*').eq('id', userId).single()
        if (error) {
          console.warn('Error fetching profile:', error.message)
        }
        if (mounted) {
          setProfile(data)
          setLoading(false)
        }
      } catch (err: any) {
        console.warn('Exception fetching profile:', err.message)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        setSession(null)
        setUser(null)
        setProfile(null)
        setLoading(false)
        return
      }

      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        // We DO NOT set loading to true here to prevent remounting components (like forms)
        // when the user switches tabs and triggers a token refresh or auth event.
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          if (error.message.includes('Refresh Token') || error.message.includes('AuthApiError')) {
            try {
              let cleaned = false
              const keysToRemove: string[] = []
              for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i)
                if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
                  keysToRemove.push(key)
                }
              }
              keysToRemove.forEach((k) => {
                localStorage.removeItem(k)
                cleaned = true
              })
              if (cleaned && window.location.pathname !== '/login') {
                window.location.href = '/login'
              }
            } catch (err) {
              // ignore
            }
            supabase.auth.signOut({ scope: 'local' }).catch(() => {})
          } else {
            console.warn('Supabase auth warning:', error.message)
          }
        }
        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
          if (session?.user) {
            fetchProfile(session.user.id)
          } else {
            setLoading(false)
          }
        }
      })
      .catch((err: any) => {
        console.warn('Supabase auth promise warning:', err.message)
        if (mounted) {
          setSession(null)
          setUser(null)
          setProfile(null)
          setLoading(false)
        }
      })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, metaData?: any) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metaData,
        emailRedirectTo: `${window.location.origin}/auth-success`,
      },
    })
    return { error }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signOut = async () => {
    try {
      // Use local scope to prevent 403 errors if the session is already invalid on the server
      const { error } = await supabase.auth.signOut({ scope: 'local' })

      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k))

      setSession(null)
      setUser(null)
      setProfile(null)

      return { error }
    } catch (err: any) {
      return { error: err }
    }
  }

  return (
    <AuthContext.Provider value={{ user, session, profile, signUp, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
