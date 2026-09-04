import { useQuery } from '@tanstack/react-query'
import { apiRequest } from './client'
import type { MetricSnapshotDto } from './types'

export function useMetricSnapshots(databaseId: string | undefined, limit = 20) {
  return useQuery({
    queryKey: ['metrics', databaseId, limit] as const,
    queryFn: () => apiRequest<MetricSnapshotDto[]>(`/api/v1/metrics/${databaseId}?limit=${limit}`),
    enabled: Boolean(databaseId),
  })
}
