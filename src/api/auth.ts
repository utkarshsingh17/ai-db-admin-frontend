import { apiRequest } from './client'
import type { AuthResponseDto } from './types'

export function login(email: string, password: string): Promise<AuthResponseDto> {
  return apiRequest<AuthResponseDto>('/api/v1/auth/login', {
    method: 'POST',
    body: { email, password },
  })
}
