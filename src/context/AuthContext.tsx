'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'

type AuthContextType = {
    user: User | null
    session: Session | null
    loading: boolean
    signInWithGoogle: () => Promise<void>
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    // MOCK USER FOR TESTING
    const mockUser: User = {
        id: 'mock-user-123',
        app_metadata: {},
        user_metadata: { full_name: 'Test User' },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
    } as User;

    const mockSession: Session = {
        access_token: 'mock-token',
        refresh_token: 'mock-refresh',
        expires_in: 3600,
        token_type: 'bearer',
        user: mockUser,
    } as Session;

    // Start with mock user logged in by default for easier testing
    const [user, setUser] = useState<User | null>(mockUser)
    const [session, setSession] = useState<Session | null>(mockSession)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        /* Supabase Auth temporarily disabled for local testing
        const supabase = createClient()

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setUser(session?.user ?? null)
            setLoading(false)
        })

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session)
                setUser(session?.user ?? null)
                setLoading(false)
            }
        )

        return () => subscription.unsubscribe()
        */
    }, [])

    const signInWithGoogle = async () => {
        /*
        const supabase = createClient()
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            }
        })
        */
        
        // Mock sign in
        setUser(mockUser)
        setSession(mockSession)
    }

    const signOut = async () => {
        /*
        const supabase = createClient()
        await supabase.auth.signOut()
        */
        setUser(null)
        setSession(null)
    }

    return (
        <AuthContext.Provider value={{ user, session, loading, signInWithGoogle, signOut }}>
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
