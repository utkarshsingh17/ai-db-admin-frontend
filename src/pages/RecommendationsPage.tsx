import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useRecommendations } from '../api/recommendations'
import type { RecommendationStatus } from '../api/types'
import { PageHeader } from '../components/PageHeader'
import { StatusChip, riskTone, statusLabel, statusTone } from '../components/StatusChip'
import tableStyles from '../components/DataTable.module.css'
import styles from './RecommendationsPage.module.css'

const STATUSES: RecommendationStatus[] = [
  'PENDING_APPROVAL',
  'APPROVED',
  'APPLIED',
  'ALREADY_EXISTS',
  'REJECTED',
  'FAILED',
]

export function RecommendationsPage() {
  const [status, setStatus] = useState<RecommendationStatus>('PENDING_APPROVAL')
  const recommendations = useRecommendations(status)

  return (
    <div>
      <PageHeader title="Recommendations" />

      <div className={styles.filters}>
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            className={s === status ? styles.filterActive : styles.filter}
            onClick={() => setStatus(s)}
          >
            {statusLabel(s)}
          </button>
        ))}
      </div>

      <table className={tableStyles.table}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Type</th>
            <th>Risk</th>
            <th>Status</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {recommendations.data?.map((r) => (
            <tr key={r.id}>
              <td>
                <Link className={tableStyles.rowLink} to={`/recommendations/${r.id}`}>
                  {r.title}
                </Link>
              </td>
              <td className={tableStyles.muted}>{r.type}</td>
              <td>
                <StatusChip label={r.riskLevel} tone={riskTone(r.riskLevel)} />
              </td>
              <td>
                <StatusChip label={statusLabel(r.status)} tone={statusTone(r.status)} />
              </td>
              <td className={tableStyles.muted}>{new Date(r.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {recommendations.data?.length === 0 && (
        <div className={tableStyles.empty}>No recommendations with this status.</div>
      )}
    </div>
  )
}
