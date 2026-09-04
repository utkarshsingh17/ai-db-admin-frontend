import styles from './SqlBlock.module.css'

export function SqlBlock({ sql }: { sql: string }) {
  return (
    <pre className={styles.block}>
      <code>{sql}</code>
    </pre>
  )
}
