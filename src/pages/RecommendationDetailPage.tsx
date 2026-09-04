import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import {
  useApplyRecommendation,
  useApproveRecommendation,
  useRecommendation,
  useRejectRecommendation,
} from '../api/recommendations'
import { ApiClientError } from '../api/client'
import type { QueryResultDto } from '../api/types'
import { StatusChip, riskTone, statusLabel, statusTone } from '../components/StatusChip'
import { SqlBlock } from '../components/SqlBlock'
import { QueryResultsTable } from '../components/QueryResultsTable'
import { ResultChart } from '../components/ResultChart'
import styles from './RecommendationDetailPage.module.css'

export function RecommendationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { isAdmin } = useAuth()
  const recommendation = useRecommendation(id)
  const approve = useApproveRecommendation()
  const reject = useRejectRecommendation()
  const apply = useApplyRecommendation()
  const [actionError, setActionError] = useState<string | null>(null)
  const [queryResult, setQueryResult] = useState<QueryResultDto | null>(null)
  const [optimizationId, setOptimizationId] = useState<string | null>(null)

  const rec = recommendation.data
  if (!rec) {
    return null
  }

  async function runAction(action: typeof approve | typeof reject) {
    if (!id) return
    setActionError(null)
    try {
      await action.mutateAsync({ id })
    } catch (err) {
      setActionError(err instanceof ApiClientError ? err.message : 'Action failed')
    }
  }

  async function handleApply() {
    if (!id) return
    setActionError(null)
    try {
      const data = await apply.mutateAsync({ id })
      setQueryResult(data.queryResult)
      setOptimizationId(data.optimizationRecommendationId)
    } catch (err) {
      setActionError(err instanceof ApiClientError ? err.message : 'Action failed')
    }
  }

  const pending = approve.isPending || reject.isPending || apply.isPending

  return (
    <div>
      <Link className={styles.back} to="/recommendations">
        ← Recommendations
      </Link>

      <div className={styles.titleRow}>
        <h1>{rec.title}</h1>
        <StatusChip label={rec.riskLevel} tone={riskTone(rec.riskLevel)} />
        <StatusChip label={statusLabel(rec.status)} tone={statusTone(rec.status)} />
      </div>

      <div className={styles.meta}>
        <span>
          Type <span className={styles.metaValue}>{rec.type}</span>
        </span>
        <span>
          Created <span className={styles.metaValue}>{new Date(rec.createdAt).toLocaleString()}</span>
        </span>
        {rec.appliedAt && (
          <span>
            Applied <span className={styles.metaValue}>{new Date(rec.appliedAt).toLocaleString()}</span>
          </span>
        )}
      </div>

      <h2 className={styles.sectionTitle}>Explanation</h2>
      <p className={styles.explanation}>{rec.explanation}</p>

      <div className={styles.sqlSection}>
        <h2 className={styles.sectionTitle}>Proposed SQL</h2>
        {rec.targetObject && <div className={styles.targetObject}>target: {rec.targetObject}</div>}
        <SqlBlock sql={rec.proposedSql} />
      </div>

      {rec.failureReason && <div className={styles.failure}>Failed: {rec.failureReason}</div>}

      {isAdmin && (
        <div className={styles.actions}>
          {rec.status === 'PENDING_APPROVAL' && (
            <>
              <button className={styles.approve} disabled={pending} onClick={() => runAction(approve)}>
                Approve
              </button>
              <button className={styles.reject} disabled={pending} onClick={() => runAction(reject)}>
                Reject
              </button>
            </>
          )}
          {rec.status === 'APPROVED' && (
            <button className={styles.apply} disabled={pending} onClick={handleApply}>
              {rec.type === 'AI_QUERY' ? 'Run query' : 'Apply to database'}
            </button>
          )}
        </div>
      )}
      {actionError && <div className={styles.actionError}>{actionError}</div>}

      {optimizationId && (
        <div className={styles.optimizationCallout}>
          This query looks slow —{' '}
          <Link to={`/recommendations/${optimizationId}`}>view a suggested optimization</Link>
        </div>
      )}

      {queryResult && (
        <>
          <h2 className={styles.sectionTitle}>Results</h2>
          <div className={styles.meta}>
            {queryResult.rowCount} row{queryResult.rowCount === 1 ? '' : 's'}
            {queryResult.truncated ? ' (truncated)' : ''} in {queryResult.executionTimeMs}ms
          </div>
          <ResultChart columns={queryResult.columns} rows={queryResult.rows} />
          <QueryResultsTable columns={queryResult.columns} rows={queryResult.rows} />
        </>
      )}
    </div>
  )
}
