import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../auth/AuthContext'
import {
  useAdminUsers,
  useChangeAdminUserRole,
  useCreateAdminUser,
  useSetAdminUserEnabled,
} from '../api/adminUsers'
import type { AdminRole } from '../api/types'
import { ApiClientError } from '../api/client'
import { PageHeader } from '../components/PageHeader'
import { StatusChip } from '../components/StatusChip'
import pageStyles from '../components/PageHeader.module.css'
import tableStyles from '../components/DataTable.module.css'
import styles from './UsersPage.module.css'

const EMPTY_FORM = { email: '', password: '', role: 'DB_VIEWER' as AdminRole }

export function UsersPage() {
  const { email: currentEmail } = useAuth()
  const users = useAdminUsers()
  const createUser = useCreateAdminUser()
  const changeRole = useChangeAdminUserRole()
  const setEnabled = useSetAdminUserEnabled()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState<string | null>(null)
  const [rowError, setRowError] = useState<string | null>(null)

  async function handleCreate(event: FormEvent) {
    event.preventDefault()
    setFormError(null)
    try {
      await createUser.mutateAsync(form)
      setForm(EMPTY_FORM)
      setShowForm(false)
    } catch (err) {
      setFormError(err instanceof ApiClientError ? err.message : 'Failed to create user')
    }
  }

  async function handleRoleChange(id: string, role: AdminRole) {
    setRowError(null)
    try {
      await changeRole.mutateAsync({ id, role })
    } catch (err) {
      setRowError(err instanceof ApiClientError ? err.message : 'Failed to change role')
    }
  }

  async function handleToggleEnabled(id: string, enabled: boolean) {
    setRowError(null)
    try {
      await setEnabled.mutateAsync({ id, enabled })
    } catch (err) {
      setRowError(err instanceof ApiClientError ? err.message : 'Failed to update user')
    }
  }

  return (
    <div>
      <PageHeader
        title="Users"
        actions={
          <button type="button" className={pageStyles.primaryButton} onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Cancel' : '+ Add user'}
          </button>
        }
      />

      {showForm && (
        <form className={styles.form} onSubmit={handleCreate}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="user-email">
              Email
            </label>
            <input
              id="user-email"
              type="email"
              className={styles.input}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="user-password">
              Password
            </label>
            <input
              id="user-password"
              type="password"
              className={styles.input}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="user-role">
              Role
            </label>
            <select
              id="user-role"
              className={styles.select}
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as AdminRole })}
            >
              <option value="DB_VIEWER">Viewer</option>
              <option value="DB_ADMIN">Admin</option>
            </select>
          </div>
          {formError && <div className={styles.formError}>{formError}</div>}
          <div className={styles.formActions}>
            <button type="submit" className={pageStyles.primaryButton} disabled={createUser.isPending}>
              {createUser.isPending ? 'Creating…' : 'Create user'}
            </button>
          </div>
        </form>
      )}

      {rowError && <div className={styles.formError}>{rowError}</div>}

      <table className={tableStyles.table}>
        <thead>
          <tr>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.data?.map((user) => (
            <tr key={user.id}>
              <td>{user.email}</td>
              <td>
                <select
                  className={styles.select}
                  value={user.role}
                  disabled={changeRole.isPending || user.email === currentEmail}
                  onChange={(e) => handleRoleChange(user.id, e.target.value as AdminRole)}
                >
                  <option value="DB_VIEWER">Viewer</option>
                  <option value="DB_ADMIN">Admin</option>
                </select>
              </td>
              <td>
                <StatusChip label={user.enabled ? 'Enabled' : 'Disabled'} tone={user.enabled ? 'low' : 'neutral'} />
              </td>
              <td className={tableStyles.muted}>{new Date(user.createdAt).toLocaleString()}</td>
              <td>
                <div className={styles.rowActions}>
                  <button
                    type="button"
                    className={pageStyles.secondaryButton}
                    disabled={setEnabled.isPending || user.email === currentEmail}
                    onClick={() => handleToggleEnabled(user.id, !user.enabled)}
                  >
                    {user.enabled ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.data?.length === 0 && <div className={tableStyles.empty}>No users yet.</div>}
    </div>
  )
}
