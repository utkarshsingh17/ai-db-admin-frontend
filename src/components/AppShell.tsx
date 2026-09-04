import type { ReactNode } from 'react'
import { NavRail } from './NavRail'
import styles from './AppShell.module.css'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <NavRail />
      <main className={styles.content}>{children}</main>
    </div>
  )
}
