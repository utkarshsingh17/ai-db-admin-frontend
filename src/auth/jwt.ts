interface DecodedToken {
  sub: string
  role: string
  exp: number
}

/**
 * Decodes the JWT payload only, for UI convenience (nav labels, hiding admin-only buttons).
 * This is NOT a trust boundary — the server independently enforces RBAC on every request.
 */
export function decodeJwt(token: string): DecodedToken | null {
  try {
    const payload = token.split('.')[1]
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(''),
    )
    return JSON.parse(json) as DecodedToken
  } catch {
    return null
  }
}
