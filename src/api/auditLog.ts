import { useQuery } from '@tanstack/react-query'
import { apiRequest } from './client'
import type { AuditLogEntryDto } from './types'

export function useAuditLog(entityType?: string, entityId?: string, limit = 50) {
  return useQuery({
    queryKey: ['audit-log', entityType, entityId, limit] as const,
    queryFn: () => {
      const params = new URLSearchParams({ limit: String(limit) })
      if (entityType && entityId) {
        params.set('entityType', entityType)
        params.set('entityId', entityId)
      }
      return apiRequest<AuditLogEntryDto[]>(`/api/v1/audit-log?${params.toString()}`)
    },
  })
}
