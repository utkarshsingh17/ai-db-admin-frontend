import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import styles from './ResultChart.module.css'

function isChartable(columns: string[], rows: (string | null)[][]): boolean {
  if (columns.length !== 2 || rows.length === 0) return false
  return rows.every((row) => row[1] !== null && row[1] !== '' && !Number.isNaN(Number(row[1])))
}

export function ResultChart({ columns, rows }: { columns: string[]; rows: (string | null)[][] }) {
  if (!isChartable(columns, rows)) {
    return null
  }

  const data = rows.map((row) => ({ name: row[0] ?? '', value: Number(row[1]) }))

  return (
    <div className={styles.wrap}>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--ink-muted)' }} />
          <YAxis tick={{ fontSize: 12, fill: 'var(--ink-muted)' }} />
          <Tooltip contentStyle={{ fontSize: 12 }} />
          <Bar dataKey="value" name={columns[1]} fill="var(--accent)" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
