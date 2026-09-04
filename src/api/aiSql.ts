import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiRequest } from './client'
import type { AiQuerySubmissionDto } from './types'

export function useAskAiSql() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ databaseId, question }: { databaseId: string; question: string }) =>
      apiRequest<AiQuerySubmissionDto>(`/api/v1/databases/${databaseId}/ai-query`, {
        method: 'POST',
        body: { question },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] })
      queryClient.invalidateQueries({ queryKey: ['audit-log'] })
    },
  })
}
