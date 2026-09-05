import type { ApiResponse } from './types'

const ACCESS_TOKEN_KEY = 'db-admin-token'
const REFRESH_TOKEN_KEY = 'db-admin-refresh-token'

// This app runs as its own standalone service now, calling the backend as a remote API (the backend
// has CORS configured for this origin) rather than being bundled and served from the backend's own
// origin — so every request needs an absolute base URL instead of a same-origin relative path.
// Strip any trailing slash — a URL like ".../onrender.com/" concatenated with a "/api/..." path
// produces a double slash that doesn't match the backend's route patterns and gets rejected before
// CORS headers are even added, which the browser then misreports as a CORS failure.
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '')

// Read synchronously at module load — before React renders anything — so the token is already in
// place for the very first API call a mounting component might fire. Relying on a useEffect to push
// this in after mount is a real race: React commits child effects before parent effects, so a page
// refresh could fire a child's data fetch before AuthProvider's effect ever runs, sending that
// request with no Authorization header and triggering a spurious "session expired" logout.
let authToken: string | null = sessionStorage.getItem(ACCESS_TOKEN_KEY)
let refreshToken: string | null = sessionStorage.getItem(REFRESH_TOKEN_KEY)
let onUnauthorized: (() => void) | null = null
// AuthContext's React state is only ever set explicitly (login/register/logout/onUnauthorized) — a
// silent refresh happening deep inside apiRequest has no other way to tell it the access token (and
// therefore the decoded role/email) changed, so without this the UI can keep showing a stale role
// after a refresh even though every actual API call is using the fresh token correctly.
let onTokensRefreshed: ((accessToken: string) => void) | null = null

// Shared by concurrent requests that all 401 around the same time, so a burst of calls triggers
// exactly one /auth/refresh instead of one per request.
let refreshInFlight: Promise<boolean> | null = null

export function getStoredAuthToken(): string | null {
  return authToken
}

export function setAuthTokens(accessToken: string | null, newRefreshToken: string | null): void {
  authToken = accessToken
  refreshToken = newRefreshToken
  if (accessToken) {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  } else {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY)
  }
  if (newRefreshToken) {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken)
  } else {
    sessionStorage.removeItem(REFRESH_TOKEN_KEY)
  }
}

export function setUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler
}

export function setTokensRefreshedHandler(handler: (accessToken: string) => void): void {
  onTokensRefreshed = handler
}

export class ApiClientError extends Error {
  code: string
  status: number

  constructor(message: string, code: string, status: number) {
    super(message)
    this.code = code
    this.status = status
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'DELETE'
  body?: unknown
}

// Plain fetch, not apiRequest — this must never itself trigger the 401-retry-via-refresh logic
// below (that would recurse forever if the refresh token has also expired).
async function tryRefreshAccessToken(): Promise<boolean> {
  if (!refreshToken) {
    return false
  }
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    if (!response.ok) {
      return false
    }
    const envelope = (await response.json()) as ApiResponse<{ accessToken: string; refreshToken: string }>
    if (!envelope.success || !envelope.data) {
      return false
    }
    setAuthTokens(envelope.data.accessToken, envelope.data.refreshToken)
    onTokensRefreshed?.(envelope.data.accessToken)
    return true
  } catch {
    return false
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}, isRetry = false): Promise<T> {
  const headers: Record<string, string> = {}
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`
  }
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  })

  if (response.status === 401) {
    if (!isRetry) {
      refreshInFlight ??= tryRefreshAccessToken().finally(() => {
        refreshInFlight = null
      })
      const refreshed = await refreshInFlight
      if (refreshed) {
        return apiRequest<T>(path, options, true)
      }
    }
    onUnauthorized?.()
    throw new ApiClientError('Session expired, log in again.', 'UNAUTHORIZED', 401)
  }

  const envelope = (await response.json()) as ApiResponse<T>

  if (!envelope.success || envelope.error) {
    throw new ApiClientError(
      envelope.error?.message ?? 'Request failed',
      envelope.error?.code ?? 'UNKNOWN_ERROR',
      response.status,
    )
  }

  return envelope.data as T
}
