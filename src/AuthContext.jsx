import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { api, loadSession, saveSession } from './api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const sessionRef = useRef(null)

  const updateSession = (next) => {
    saveSession(next)
    sessionRef.current = next
    setSession(next)
  }

  // Appelle l'API avec le jeton courant ; s'il a expiré, rafraîchit la session et réessaie une fois
  const withAuth = async (call) => {
    try {
      return await call(sessionRef.current.access_token)
    } catch (err) {
      if (err.status !== 401) throw err
      try {
        updateSession(await api.refresh(sessionRef.current.refresh_token))
      } catch {
        updateSession(null)
        throw err
      }
      return call(sessionRef.current.access_token)
    }
  }

  // Au chargement : on reprend la session enregistrée, en la rafraîchissant si elle a expiré
  useEffect(() => {
    const stored = loadSession()
    if (!stored) return setLoading(false)

    const isExpired = stored.expires_at * 1000 < Date.now() + 60_000
    const restore = isExpired ? api.refresh(stored.refresh_token) : Promise.resolve(stored)

    restore
      // Les droits admin peuvent avoir changé depuis la dernière connexion
      .then((session) =>
        api
          .me(session.access_token)
          .then((me) => ({ ...session, user: { ...session.user, is_admin: me.is_admin } }))
          .catch(() => session)
      )
      .then(updateSession)
      .catch(() => updateSession(null))
      .finally(() => setLoading(false))
  }, [])

  const value = {
    user: session?.user ?? null,
    loading,
    withAuth,
    signup: async (email, password) => updateSession(await api.signup(email, password)),
    login: async (email, password) => updateSession(await api.login(email, password)),
    logout: () => updateSession(null),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
