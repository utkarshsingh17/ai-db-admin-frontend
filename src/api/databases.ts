import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiRequest } from './client'
import type { MonitoredDatabaseDto } from './types'

const KEY = ['databases'] as const

export function useDatabases() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => apiRequest<MonitoredDatabaseDto[]>('/api/v1/monitored-databases'),
  })
}

export function useDatabase(id: string | undefined) {
  const databases = useDatabases()
  return {
    ...databases,
    data: databases.data?.find((d) => d.id === id),
  }
}

export interface RegisterDatabaseInput {
  name: string
  jdbcUrl: string
  username: string
  password: string
}

export function useRegisterDatabase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: RegisterDatabaseInput) =>
      apiRequest<MonitoredDatabaseDto>('/api/v1/monitored-databases', { method: 'POST', body: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  })
}

export function useSetDatabaseEnabled() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      apiRequest<MonitoredDatabaseDto>(`/api/v1/monitored-databases/${id}/${enabled ? 'enable' : 'disable'}`, {
        method: 'POST',
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  })
}

export function useDeleteDatabase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiRequest<void>(`/api/v1/monitored-databases/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  })
}
