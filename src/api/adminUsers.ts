import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiRequest } from './client'
import type { AdminRole, AdminUserDto } from './types'

const KEY = ['admin-users'] as const

export function useAdminUsers() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => apiRequest<AdminUserDto[]>('/api/v1/admin-users'),
  })
}

export interface CreateAdminUserInput {
  email: string
  password: string
  role: AdminRole
}

export function useCreateAdminUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateAdminUserInput) =>
      apiRequest<AdminUserDto>('/api/v1/admin-users', { method: 'POST', body: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  })
}

export function useChangeAdminUserRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: AdminRole }) =>
      apiRequest<AdminUserDto>(`/api/v1/admin-users/${id}/role`, { method: 'POST', body: { role } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  })
}

export function useSetAdminUserEnabled() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      apiRequest<AdminUserDto>(`/api/v1/admin-users/${id}/${enabled ? 'enable' : 'disable'}`, {
        method: 'POST',
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  })
}
