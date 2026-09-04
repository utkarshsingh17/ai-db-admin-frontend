import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useDatabase } from '../api/databases'
import { useMetricSnapshots } from '../api/metrics'
import { useSlowQueries } from '../api/slowQueries'
import { useDatabaseSchema } from '../api/schema'
import { useMarkSensitiveColumn, useSensitiveColumns, useUnmarkSensitiveColumn } from '../api/sensitiveColumns'
import { ApiClientError } from '../api/client'
import { PageHeader } from '../components/PageHeader'
import { StatusChip } from '../components/StatusChip'
import { SchemaDiagram } from '../components/SchemaDiagram'
import tableStyles from '../components/DataTable.module.css'
import pageStyles from '../components/PageHeader.module.css'
import styles from './DatabaseDetailPage.module.css'

function formatMs(value: number): string {
  return `${value.toFixed(1)} ms`
}

function formatPercent(value: number | null): string {
  return value === null ? '—' : `${(value * 100).toFixed(1)}%`
}

export function DatabaseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { isAdmin } = useAuth()
  const database = useDatabase(id)
  const metrics = useMetricSnapshots(id)
  const slowQueries = useSlowQueries(id)
  const schema = useDatabaseSchema(id)
  const sensitiveColumns = useSensitiveColumns(id)
  const markSensitiveColumn = useMarkSensitiveColumn(id)
  const unmarkSensitiveColumn = useUnmarkSensitiveColumn(id)
  const latest = metrics.data?.[0]

  const [markTable, setMarkTable] = useState('')
  const [markColumn, setMarkColumn] = useState('')
  const [markError, setMarkError] = useState<string | null>(null)

  const availableColumns = schema.data?.tables.find((t) => t.name === markTable)?.columns ?? []

  async function handleMark() {
    if (!markTable || !markColumn) return
    setMarkError(null)
    try {
      await markSensitiveColumn.mutateAsync({ tableName: markTable, columnName: markColumn })
      setMarkColumn('')
    } catch (err) {
      setMarkError(err instanceof ApiClientError ? err.message : 'Failed to mark column sensitive')
    }
  }

  return (
    <div>
      <Link className={styles.back} to="/databases">
        ← Databases
      </Link>

      <PageHeader
        title={database.data?.name ?? 'Database'}
        actions={
          database.data && (
            <StatusChip
              label={database.data.enabled ? 'Enabled' : 'Disabled'}
              tone={database.data.enabled ? 'low' : 'neutral'}
            />
          )
        }
      />

      {database.data && (
        <div className={styles.meta}>
          <span>
            Engine <span className={styles.metaValue}>{database.data.engine}</span>
          </span>
          <span>
            JDBC URL <span className={styles.metaValue}>{database.data.jdbcUrl}</span>
          </span>
        </div>
      )}

      <h2 className={styles.sectionTitle}>Latest metrics</h2>
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Active connections</div>
          <div className={styles.metricValue}>{latest?.activeConnections ?? '—'}</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Max connections</div>
          <div className={styles.metricValue}>{latest?.maxConnections ?? '—'}</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Cache hit ratio</div>
          <div className={styles.metricValue}>{formatPercent(latest?.cacheHitRatio ?? null)}</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Lock waits</div>
          <div className={styles.metricValue}>{latest?.lockWaitCount ?? '—'}</div>
        </div>
      </div>

      <h2 className={styles.sectionTitle}>Recent slow queries</h2>
      <table className={tableStyles.table}>
        <thead>
          <tr>
            <th>Query</th>
            <th>Calls</th>
            <th>Mean time</th>
            <th>Total time</th>
            <th>Captured</th>
          </tr>
        </thead>
        <tbody>
          {slowQueries.data?.map((q) => (
            <tr key={q.id}>
              <td className={tableStyles.mono}>{q.normalizedQuery}</td>
              <td>{q.calls}</td>
              <td>{formatMs(q.meanExecTimeMs)}</td>
              <td>{formatMs(q.totalExecTimeMs)}</td>
              <td className={tableStyles.muted}>{new Date(q.capturedAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {slowQueries.data?.length === 0 && <div className={tableStyles.empty}>No slow queries recorded.</div>}

      <h2 className={styles.sectionTitle}>Schema</h2>
      {schema.data && <SchemaDiagram schema={schema.data} />}

      {isAdmin && (
        <>
          <h2 className={styles.sectionTitle}>Sensitive columns</h2>
          <div className={styles.markForm}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="sensitive-table">
                Table
              </label>
              <select
                id="sensitive-table"
                className={styles.select}
                value={markTable}
                onChange={(e) => {
                  setMarkTable(e.target.value)
                  setMarkColumn('')
                }}
              >
                <option value="">Select table…</option>
                {schema.data?.tables.map((table) => (
                  <option key={table.name} value={table.name}>
                    {table.name}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="sensitive-column">
                Column
              </label>
              <select
                id="sensitive-column"
                className={styles.select}
                value={markColumn}
                onChange={(e) => setMarkColumn(e.target.value)}
                disabled={!markTable}
              >
                <option value="">Select column…</option>
                {availableColumns.map((column) => (
                  <option key={column.name} value={column.name}>
                    {column.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              className={pageStyles.primaryButton}
              disabled={!markTable || !markColumn || markSensitiveColumn.isPending}
              onClick={handleMark}
            >
              {markSensitiveColumn.isPending ? 'Marking…' : 'Mark sensitive'}
            </button>
          </div>
          {markError && <div className={tableStyles.empty}>{markError}</div>}

          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>Table</th>
                <th>Column</th>
                <th>Marked</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sensitiveColumns.data?.map((column) => (
                <tr key={column.id}>
                  <td className={tableStyles.mono}>{column.tableName}</td>
                  <td className={tableStyles.mono}>{column.columnName}</td>
                  <td className={tableStyles.muted}>{new Date(column.createdAt).toLocaleString()}</td>
                  <td>
                    <button
                      type="button"
                      className={pageStyles.secondaryButton}
                      disabled={unmarkSensitiveColumn.isPending}
                      onClick={() => unmarkSensitiveColumn.mutate(column.id)}
                    >
                      Unmark
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sensitiveColumns.data?.length === 0 && (
            <div className={tableStyles.empty}>No sensitive columns marked — query results show real values.</div>
          )}
        </>
      )}
    </div>
  )
}
