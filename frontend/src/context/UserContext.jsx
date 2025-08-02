// src/context/UserContext.jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAutoLogout } from '../hooks/useAutoLogout'

const UserContext = createContext()

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [error, setError] = useState(null)
  const [sessionExpired, setSessionExpired] = useState(false)

  const fetchProfile = async (userId) => {
    try {
      setLoadingProfile(true)

      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          name,
          phone,
          avatar_path,
          role,
          active,
          email,
          company:companies (
            id,
            name,
            phone,
            email,
            logo_path,
            owner_id,
            active
          )
        `)
        .eq('id', userId)
        .single()

      if (error) {
        console.error('[UserContext] fetchProfile error:', error.message)
        setError(error.message)
        setProfile(null)
      } else {
        const isOwner = data.id === data.company?.owner_id
        setProfile({ ...data, isOwner })
      }
    } finally {
      setLoadingProfile(false)
    }
  }

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id)
    }
  }

  useEffect(() => {
    let mounted = true

    const syncSession = async (session) => {
      if (!mounted) return

      if (session?.user) {
        setUser(session.user)

        // 🔒 Solo intentar cargar perfil si NO hay ya uno cargado
        if (!profile) {
          await fetchProfile(session.user.id)
        }
      } else {
        setUser(null)
        setProfile(null)
      }

      setLoadingUser(false)
    }

    // Carga inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      syncSession(session)
    })

    // Escuchar cambios de sesión
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      syncSession(session)
    })

    return () => {
      mounted = false
      authListener.subscription.unsubscribe()
    }
  }, []) // NO meter `profile` en deps para evitar loop

  const logout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('kueskilink.auth.token')
    setUser(null)
    setProfile(null)
  }

  useAutoLogout(logout, () => setSessionExpired(true))

  const loading = loadingUser || loadingProfile

  useEffect(() => {
  }, [user, profile, loadingUser, loadingProfile])

  return (
    <UserContext.Provider value={{
      user,
      profile,
      loading,
      error,
      logout,
      sessionExpired,
      refreshProfile,
    }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
