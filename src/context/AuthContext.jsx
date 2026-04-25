import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { getMe } from '../api/users'
import { logout as logoutApi } from '../api/auth'
import { tokenStore } from '../api/tokenStore'
import { clearSubjectCache } from '../hooks/useSubjects'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Handle OAuth2 success redirect: backend sends /dashboard#at=<accessToken>
    // Fragment is browser-only — never sent to servers, not visible in logs
    const hash = window.location.hash
    if (hash.startsWith('#at=')) {
      tokenStore.set(hash.slice(4))
      // Remove the fragment from the URL immediately — token must not sit in the address bar
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
    }

    // On page refresh the memory token is gone.
    // getMe() will 401 → axios interceptor refreshes via the Strict cookie → retries getMe()
    getMe()
      .then((data) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false))
  }, [])

  // Call after a successful login or 2FA verify API response
  const onLoginSuccess = (accessToken, userData) => {
    tokenStore.set(accessToken)
    setUser(userData)
  }

  const logout = async () => {
    try {
      await logoutApi()
    } catch {
      // proceed regardless
    }
    clearSubjectCache()
    tokenStore.clear()
    setUser(null)
    window.location.href = '/login'
  }

  const refreshUser = useCallback((data) => setUser(data), [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: user !== null,
        refreshUser,
        onLoginSuccess,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
