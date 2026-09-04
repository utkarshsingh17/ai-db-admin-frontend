import { useAuditLog } from '../api/auditLog'
import { PageHeader } from '../components/PageHeader'
import tableStyles from '../components/DataTable.module.css'

export function AuditLogPage() {
  const auditLog = useAuditLog()

  return (
    <div>
      <PageHeader title="Audit Log" />

      <table className={tableStyles.table}>
        <thead>
          <tr>
            <th>Actor</th>
            <th>Action</th>
            <th>Entity</th>
            <th>Payload</th>
            <th>Occurred</th>
          </tr>
        </thead>
        <tbody>
          {auditLog.data?.map((entry) => (
            <tr key={entry.id}>
              <td>{entry.actor}</td>
              <td className={tableStyles.muted}>{entry.action}</td>
              <td className={tableStyles.mono}>
                {entry.entityType}/{entry.entityId}
              </td>
              <td className={tableStyles.mono}>{entry.payload ?? '—'}</td>
              <td className={tableStyles.muted}>{new Date(entry.occurredAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {auditLog.data?.length === 0 && <div className={tableStyles.empty}>No audit entries yet.</div>}
    </div>
  )
}
