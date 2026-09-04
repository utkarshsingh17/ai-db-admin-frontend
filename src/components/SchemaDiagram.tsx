import { useEffect, useId, useState } from 'react'
import mermaid from 'mermaid'
import type { DatabaseSchemaDto } from '../api/types'
import styles from './SchemaDiagram.module.css'

mermaid.initialize({ startOnLoad: false, theme: 'neutral', securityLevel: 'strict' })

function sanitize(identifier: string): string {
  return identifier.replace(/[^a-zA-Z0-9_]/g, '_')
}

function buildErDiagram(schema: DatabaseSchemaDto): string {
  const lines = ['erDiagram']

  for (const table of schema.tables) {
    const entity = sanitize(table.name)
    lines.push(`  ${entity} {`)
    for (const column of table.columns) {
      const type = sanitize(column.dataType) || 'unknown'
      const key = column.primaryKey ? ' PK' : ''
      lines.push(`    ${type} ${sanitize(column.name)}${key}`)
    }
    lines.push('  }')
  }

  for (const fk of schema.foreignKeys) {
    const from = sanitize(fk.toTable)
    const to = sanitize(fk.fromTable)
    lines.push(`  ${from} ||--o{ ${to} : "${sanitize(fk.fromColumn)}"`)
  }

  return lines.join('\n')
}

export function SchemaDiagram({ schema }: { schema: DatabaseSchemaDto }) {
  const rawId = useId()
  const diagramId = `erd-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`
  const [svg, setSvg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (schema.tables.length === 0) {
      setSvg(null)
      return
    }
    let cancelled = false
    mermaid
      .render(diagramId, buildErDiagram(schema))
      .then(({ svg: rendered }) => {
        if (!cancelled) setSvg(rendered)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to render diagram')
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(schema)])

  if (schema.tables.length === 0) {
    return <div className={styles.empty}>No tables found.</div>
  }
  if (error) {
    return <div className={styles.error}>{error}</div>
  }
  if (!svg) {
    return null
  }
  return <div className={styles.wrap} dangerouslySetInnerHTML={{ __html: svg }} />
}
