import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { login as loginRequest, register as registerRequest } from '../api/auth'
import { getStoredAuthToken, setAuthTokens, setTokensRefreshedHandler, setUnauthorizedHandler } from '../api/client'
import { decodeJwt } from './jwt'

interface AuthState {
  token: string | null
  email: string | null
  isAdmin: boolean
  sessionExpired: boolean
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
  dismissSessionExpired: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function stateFromToken(token: string | null): AuthState {
  if (!token) {
    return { token: null, email: null, isAdmin: false, sessionExpired: false }
  }
  const decoded = decodeJwt(token)
  return {
    token,
    email: decoded?.sub ?? null,
    isAdmin: decoded?.role === 'ROLE_DB_ADMIN',
    sessionExpired: false,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => stateFromToken(getStoredAuthToken()))

  const logout = useCallback(() => {
    setAuthTokens(null, null)
    setState((prev) => ({ token: null, email: null, isAdmin: false, sessionExpired: prev.sessionExpired }))
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setAuthTokens(null, null)
      setState({ token: null, email: null, isAdmin: false, sessionExpired: true })
    })
    setTokensRefreshedHandler((accessToken) => {
      setState(stateFromToken(accessToken))
    })
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const response = await loginRequest(email, password)
    setAuthTokens(response.accessToken, response.refreshToken)
    setState(stateFromToken(response.accessToken))
  }, [])

  const register = useCallback(async (email: string, password: string) => {
    const response = await registerRequest(email, password)
    setAuthTokens(response.accessToken, response.refreshToken)
    setState(stateFromToken(response.accessToken))
  }, [])

  const dismissSessionExpired = useCallback(() => {
    setState((prev) => ({ ...prev, sessionExpired: false }))
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, login, register, logout, dismissSessionExpired }),
    [state, login, register, logout, dismissSessionExpired],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
