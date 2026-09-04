import { apiRequest } from './client'
import type { AuthResponseDto } from './types'

export function login(email: string, password: string): Promise<AuthResponseDto> {
  return apiRequest<AuthResponseDto>('/api/v1/auth/login', {
    method: 'POST',
    body: { email, password },
  })
}

export function register(email: string, password: string): Promise<AuthResponseDto> {
  return apiRequest<AuthResponseDto>('/api/v1/auth/register', {
    method: 'POST',
    body: { email, password },
  })
}
