import { useMutation } from '@tanstack/react-query'
import { apiRequest } from './client'
import type { QueryResultDto } from './types'

export function useRunQuery() {
  return useMutation({
    mutationFn: ({ databaseId, sql }: { databaseId: string; sql: string }) =>
      apiRequest<QueryResultDto>(`/api/v1/databases/${databaseId}/query`, { method: 'POST', body: { sql } }),
  })
}
