import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { API_BASE_URL } from '../api/client'
import styles from './BackendReadinessGate.module.css'

const POLL_INTERVAL_MS = 2500
const SLOW_HINT_AFTER_MS = 12000

/**
 * The backend runs on Render's free tier, which spins the instance down after inactivity — the
 * first request after a while wakes it back up, and that cold start can take up to about a minute.
 * Rather than let the first real API call sit there (or fail) while that happens, this pings
 * /actuator/health before rendering the app at all, showing a clear "waking up" screen and polling
 * until it succeeds. /actuator/health is permitAll on the backend, so this needs no auth token.
 */
export function BackendReadinessGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [slow, setSlow] = useState(false)
  const cancelled = useRef(false)

  useEffect(() => {
    // Reset explicitly on every effect run, not just via useRef's initial value — StrictMode
    // double-invokes this effect in dev (setup -> cleanup -> setup again), and without this the
    // first setup's cleanup would permanently flip the ref to true, so the second (real, lasting)
    // setup's poll() would see it already cancelled and never poll at all.
    cancelled.current = false
    const slowHintTimer = setTimeout(() => setSlow(true), SLOW_HINT_AFTER_MS)

    async function poll() {
      if (cancelled.current) {
        return
      }
      try {
        const response = await fetch(`${API_BASE_URL}/actuator/health`)
        if (response.ok) {
          setReady(true)
          return
        }
      } catch {
        // Network error (connection refused during cold start, etc.) — keep polling below.
      }
      setTimeout(poll, POLL_INTERVAL_MS)
    }

    poll()

    return () => {
      cancelled.current = true
      clearTimeout(slowHintTimer)
    }
  }, [])

  if (ready) {
    return <>{children}</>
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.spinner} aria-hidden="true" />
        <h1 className={styles.title}>Starting up…</h1>
        <p className={styles.message}>
          {slow
            ? "Still waking up the server — free-tier instances go to sleep after inactivity and can take up to a minute to start."
            : 'Connecting to the server…'}
        </p>
      </div>
    </div>
  )
}
