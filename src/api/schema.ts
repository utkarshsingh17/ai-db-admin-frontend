import { useQuery } from '@tanstack/react-query'
import { apiRequest } from './client'
import type { DatabaseSchemaDto } from './types'

export function useDatabaseSchema(databaseId: string | undefined) {
  return useQuery({
    queryKey: ['schema', databaseId] as const,
    queryFn: () => apiRequest<DatabaseSchemaDto>(`/api/v1/databases/${databaseId}/schema`),
    enabled: Boolean(databaseId),
  })
}
