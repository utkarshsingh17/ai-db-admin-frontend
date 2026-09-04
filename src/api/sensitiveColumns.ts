import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiRequest } from './client'
import type { SensitiveColumnDto } from './types'

const key = (databaseId: string | undefined) => ['sensitive-columns', databaseId] as const

export function useSensitiveColumns(databaseId: string | undefined) {
  return useQuery({
    queryKey: key(databaseId),
    queryFn: () => apiRequest<SensitiveColumnDto[]>(`/api/v1/databases/${databaseId}/sensitive-columns`),
    enabled: Boolean(databaseId),
  })
}

export function useMarkSensitiveColumn(databaseId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ tableName, columnName }: { tableName: string; columnName: string }) =>
      apiRequest<SensitiveColumnDto>(`/api/v1/databases/${databaseId}/sensitive-columns`, {
        method: 'POST',
        body: { tableName, columnName },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key(databaseId) }),
  })
}

export function useUnmarkSensitiveColumn(databaseId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (columnId: string) =>
      apiRequest<void>(`/api/v1/databases/${databaseId}/sensitive-columns/${columnId}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key(databaseId) }),
  })
}
