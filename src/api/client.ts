import type { ApiResponse } from './types'

const STORAGE_KEY = 'db-admin-token'

// This app runs as its own standalone service now, calling the backend as a remote API (the backend
// has CORS configured for this origin) rather than being bundled and served from the backend's own
// origin — so every request needs an absolute base URL instead of a same-origin relative path.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

// Read synchronously at module load — before React renders anything — so the token is already in
// place for the very first API call a mounting component might fire. Relying on a useEffect to push
// this in after mount is a real race: React commits child effects before parent effects, so a page
// refresh could fire a child's data fetch before AuthProvider's effect ever runs, sending that
// request with no Authorization header and triggering a spurious "session expired" logout.
let authToken: string | null = sessionStorage.getItem(STORAGE_KEY)
let onUnauthorized: (() => void) | null = null

export function getStoredAuthToken(): string | null {
  return authToken
}

export function setAuthToken(token: string | null): void {
  authToken = token
  if (token) {
    sessionStorage.setItem(STORAGE_KEY, token)
  } else {
    sessionStorage.removeItem(STORAGE_KEY)
  }
}

export function setUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler
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

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
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
