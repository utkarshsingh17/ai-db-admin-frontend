import { NavLink } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import styles from './NavRail.module.css'

const LINKS = [
  { to: '/databases', label: 'Databases' },
  { to: '/sql-editor', label: 'SQL Editor' },
  { to: '/recommendations', label: 'Recommendations' },
  { to: '/audit-log', label: 'Audit Log' },
]

const ADMIN_LINKS = [{ to: '/users', label: 'Users' }]

export function NavRail() {
  const { email, isAdmin, logout } = useAuth()
  const links = isAdmin ? [...LINKS, ...ADMIN_LINKS] : LINKS

  return (
    <nav className={styles.rail}>
      <div className={styles.brand}>DB Admin Assistant</div>
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) => (isActive ? styles.linkActive : styles.link)}
        >
          {link.label}
        </NavLink>
      ))}
      <div className={styles.footer}>
        <div className={styles.identity}>
          <span className={styles.email}>{email}</span>
          <span className={styles.role}>{isAdmin ? 'Admin' : 'Viewer'}</span>
        </div>
        <button type="button" className={styles.logout} onClick={logout}>
          Log out
        </button>
      </div>
    </nav>
  )
}
