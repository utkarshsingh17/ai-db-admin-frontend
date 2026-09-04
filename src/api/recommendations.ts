import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiRequest } from './client'
import type { RecommendationApplyResponseDto, RecommendationDto, RecommendationStatus, RiskLevel } from './types'

export function useRecommendations(status: RecommendationStatus, limit = 50) {
  return useQuery({
    queryKey: ['recommendations', status, limit] as const,
    queryFn: () =>
      apiRequest<RecommendationDto[]>(`/api/v1/recommendations?status=${status}&limit=${limit}`),
  })
}

export function useRecommendation(id: string | undefined) {
  return useQuery({
    queryKey: ['recommendation', id] as const,
    queryFn: () => apiRequest<RecommendationDto>(`/api/v1/recommendations/${id}`),
    enabled: Boolean(id),
  })
}

function useRecommendationAction(action: 'approve' | 'reject') {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body?: Record<string, string | undefined> }) =>
      apiRequest<RecommendationDto>(`/api/v1/recommendations/${id}/${action}`, {
        method: 'POST',
        body,
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] })
      queryClient.invalidateQueries({ queryKey: ['recommendation', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['audit-log'] })
    },
  })
}

export const useApproveRecommendation = () => useRecommendationAction('approve')
export const useRejectRecommendation = () => useRecommendationAction('reject')

export function useApplyRecommendation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id }: { id: string }) =>
      apiRequest<RecommendationApplyResponseDto>(`/api/v1/recommendations/${id}/apply`, { method: 'POST' }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] })
      queryClient.invalidateQueries({ queryKey: ['recommendation', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['audit-log'] })
    },
  })
}

export interface SubmitManualSqlInput {
  databaseId: string
  title: string
  explanation: string
  proposedSql: string
  riskLevel: RiskLevel
  targetObject?: string
}

export function useSubmitManualSql() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: SubmitManualSqlInput) =>
      apiRequest<RecommendationDto>('/api/v1/recommendations/manual', { method: 'POST', body: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] })
      queryClient.invalidateQueries({ queryKey: ['audit-log'] })
    },
  })
}
