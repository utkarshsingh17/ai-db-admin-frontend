import type { ReactNode } from 'react'
import styles from './PageHeader.module.css'

export function PageHeader({ title, actions }: { title: string; actions?: ReactNode }) {
  return (
    <div className={styles.header}>
      <h1>{title}</h1>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  )
}
