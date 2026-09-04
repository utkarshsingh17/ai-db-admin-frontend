import styles from './StatusChip.module.css'
import type { RecommendationStatus, RiskLevel } from '../api/types'

type Tone = 'low' | 'medium' | 'high' | 'neutral'

export function StatusChip({ label, tone }: { label: string; tone: Tone }) {
  return (
    <span className={`${styles.chip} ${styles[tone]}`}>
      <span className={styles.dot} />
      {label}
    </span>
  )
}

export function riskTone(risk: RiskLevel): Tone {
  if (risk === 'LOW') return 'low'
  if (risk === 'MEDIUM') return 'medium'
  return 'high'
}

export function statusTone(status: RecommendationStatus): Tone {
  switch (status) {
    case 'APPLIED':
    case 'ALREADY_EXISTS':
      return 'low'
    case 'PENDING_APPROVAL':
    case 'APPROVED':
      return 'medium'
    case 'REJECTED':
    case 'FAILED':
      return 'high'
    default:
      return 'neutral'
  }
}

export function statusLabel(status: RecommendationStatus): string {
  return status
    .toLowerCase()
    .split('_')
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(' ')
}
