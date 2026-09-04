import tableStyles from './DataTable.module.css'

export function QueryResultsTable({ columns, rows }: { columns: string[]; rows: (string | null)[][] }) {
  return (
    <div>
      <table className={tableStyles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((value, j) => (
                <td key={j} className={tableStyles.mono}>
                  {value === null ? <span className={tableStyles.muted}>NULL</span> : value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
