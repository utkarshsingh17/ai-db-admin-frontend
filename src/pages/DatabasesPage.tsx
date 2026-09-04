import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useDatabases, useDeleteDatabase, useRegisterDatabase, useSetDatabaseEnabled } from '../api/databases'
import { ApiClientError } from '../api/client'
import { PageHeader } from '../components/PageHeader'
import { StatusChip } from '../components/StatusChip'
import pageStyles from '../components/PageHeader.module.css'
import tableStyles from '../components/DataTable.module.css'
import styles from './DatabasesPage.module.css'

const EMPTY_FORM = { name: '', jdbcUrl: '', username: '', password: '' }

export function DatabasesPage() {
  const { isAdmin } = useAuth()
  const databases = useDatabases()
  const registerDatabase = useRegisterDatabase()
  const setEnabled = useSetDatabaseEnabled()
  const deleteDatabase = useDeleteDatabase()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  async function handleRegister(event: FormEvent) {
    event.preventDefault()
    setFormError(null)
    try {
      await registerDatabase.mutateAsync(form)
      setForm(EMPTY_FORM)
      setShowForm(false)
    } catch (err) {
      setFormError(err instanceof ApiClientError ? err.message : 'Failed to register database')
    }
  }

  async function handleDelete(id: string) {
    setDeleteError(null)
    try {
      await deleteDatabase.mutateAsync(id)
      setConfirmDeleteId(null)
    } catch (err) {
      setDeleteError(err instanceof ApiClientError ? err.message : 'Failed to delete database')
    }
  }

  return (
    <div>
      <PageHeader
        title="Databases"
        actions={
          isAdmin && (
            <button
              type="button"
              className={pageStyles.primaryButton}
              onClick={() => setShowForm((v) => !v)}
            >
              {showForm ? 'Cancel' : '+ Register database'}
            </button>
          )
        }
      />

      {showForm && (
        <form className={styles.form} onSubmit={handleRegister}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="db-name">
              Name
            </label>
            <input
              id="db-name"
              className={styles.input}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="db-jdbc">
              JDBC URL
            </label>
            <input
              id="db-jdbc"
              className={styles.input}
              placeholder="jdbc:postgresql://host:5432/db"
              value={form.jdbcUrl}
              onChange={(e) => setForm({ ...form, jdbcUrl: e.target.value })}
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="db-username">
              Username
            </label>
            <input
              id="db-username"
              className={styles.input}
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="db-password">
              Password
            </label>
            <input
              id="db-password"
              type="password"
              className={styles.input}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          {formError && <div className={styles.formError}>{formError}</div>}
          <div className={styles.formActions}>
            <button type="submit" className={pageStyles.primaryButton} disabled={registerDatabase.isPending}>
              {registerDatabase.isPending ? 'Registering…' : 'Register'}
            </button>
          </div>
        </form>
      )}

      <table className={tableStyles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Engine</th>
            <th>JDBC URL</th>
            <th>Status</th>
            {isAdmin && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {databases.data?.map((db) => (
            <tr key={db.id}>
              <td>
                <Link className={tableStyles.rowLink} to={`/databases/${db.id}`}>
                  {db.name}
                </Link>
              </td>
              <td className={tableStyles.muted}>{db.engine}</td>
              <td className={tableStyles.mono}>{db.jdbcUrl}</td>
              <td>
                <StatusChip label={db.enabled ? 'Enabled' : 'Disabled'} tone={db.enabled ? 'low' : 'neutral'} />
              </td>
              {isAdmin && (
                <td>
                  <div className={styles.rowActions}>
                    <button
                      type="button"
                      className={pageStyles.secondaryButton}
                      disabled={setEnabled.isPending}
                      onClick={() => setEnabled.mutate({ id: db.id, enabled: !db.enabled })}
                    >
                      {db.enabled ? 'Disable' : 'Enable'}
                    </button>
                    {confirmDeleteId === db.id ? (
                      <>
                        <button
                          type="button"
                          className={styles.confirmDelete}
                          disabled={deleteDatabase.isPending}
                          onClick={() => handleDelete(db.id)}
                        >
                          {deleteDatabase.isPending ? 'Deleting…' : 'Confirm delete?'}
                        </button>
                        <button
                          type="button"
                          className={pageStyles.secondaryButton}
                          onClick={() => setConfirmDeleteId(null)}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className={pageStyles.secondaryButton}
                        onClick={() => setConfirmDeleteId(db.id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {deleteError && <div className={styles.formError}>{deleteError}</div>}

      {databases.data?.length === 0 && <div className={tableStyles.empty}>No databases registered yet.</div>}
    </div>
  )
}
