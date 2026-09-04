import { useQuery } from '@tanstack/react-query'
import { apiRequest } from './client'
import type { SlowQueryEventDto } from './types'

export function useSlowQueries(databaseId: string | undefined, limit = 20) {
  return useQuery({
    queryKey: ['slow-queries', databaseId, limit] as const,
    queryFn: () =>
      apiRequest<SlowQueryEventDto[]>(`/api/v1/slow-queries?databaseId=${databaseId}&limit=${limit}`),
    enabled: Boolean(databaseId),
  })
}
