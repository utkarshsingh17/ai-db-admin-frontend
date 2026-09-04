import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useDatabases } from '../api/databases'
import { useRunQuery } from '../api/query'
import { useAskAiSql } from '../api/aiSql'
import { useSubmitManualSql } from '../api/recommendations'
import type { AiQuerySubmissionDto, QueryResultDto, RiskLevel } from '../api/types'
import { ApiClientError } from '../api/client'
import { PageHeader } from '../components/PageHeader'
import { SqlBlock } from '../components/SqlBlock'
import { QueryResultsTable } from '../components/QueryResultsTable'
import { ResultChart } from '../components/ResultChart'
import pageStyles from '../components/PageHeader.module.css'
import styles from './SqlEditorPage.module.css'

const EMPTY_SUBMIT_FORM = { title: '', explanation: '', riskLevel: 'MEDIUM' as RiskLevel, targetObject: '' }

export function SqlEditorPage() {
  const { isAdmin } = useAuth()
  const databases = useDatabases()
  const runQuery = useRunQuery()
  const submitManualSql = useSubmitManualSql()
  const askAiSql = useAskAiSql()

  const [tab, setTab] = useState<'write' | 'ai'>('write')
  const [databaseId, setDatabaseId] = useState('')
  const [sql, setSql] = useState('')
  const [result, setResult] = useState<QueryResultDto | null>(null)
  const [runError, setRunError] = useState<string | null>(null)

  const [question, setQuestion] = useState('')
  const [aiSubmission, setAiSubmission] = useState<AiQuerySubmissionDto | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)

  const [showSubmitForm, setShowSubmitForm] = useState(false)
  const [submitForm, setSubmitForm] = useState(EMPTY_SUBMIT_FORM)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submittedId, setSubmittedId] = useState<string | null>(null)

  const activeDatabaseId = databaseId || databases.data?.[0]?.id || ''

  async function handleRun() {
    if (!activeDatabaseId || !sql.trim()) return
    setRunError(null)
    setResult(null)
    try {
      const data = await runQuery.mutateAsync({ databaseId: activeDatabaseId, sql })
      setResult(data)
    } catch (err) {
      setRunError(err instanceof ApiClientError ? err.message : 'Query failed')
    }
  }

  async function handleAsk() {
    if (!activeDatabaseId || !question.trim()) return
    setAiError(null)
    setAiSubmission(null)
    try {
      const data = await askAiSql.mutateAsync({ databaseId: activeDatabaseId, question })
      setAiSubmission(data)
    } catch (err) {
      setAiError(err instanceof ApiClientError ? err.message : 'Could not draft a query for that question')
    }
  }

  async function handleSubmitForApproval(event: FormEvent) {
    event.preventDefault()
    if (!activeDatabaseId) return
    setSubmitError(null)
    try {
      const recommendation = await submitManualSql.mutateAsync({
        databaseId: activeDatabaseId,
        title: submitForm.title,
        explanation: submitForm.explanation,
        proposedSql: sql,
        riskLevel: submitForm.riskLevel,
        targetObject: submitForm.targetObject || undefined,
      })
      setSubmittedId(recommendation.id)
      setShowSubmitForm(false)
      setSubmitForm(EMPTY_SUBMIT_FORM)
    } catch (err) {
      setSubmitError(err instanceof ApiClientError ? err.message : 'Failed to submit for approval')
    }
  }

  return (
    <div>
      <PageHeader title="SQL Editor" />

      <div className={styles.tabs}>
        <button
          type="button"
          className={tab === 'write' ? styles.tabActive : styles.tab}
          onClick={() => setTab('write')}
        >
          Write SQL
        </button>
        <button type="button" className={tab === 'ai' ? styles.tabActive : styles.tab} onClick={() => setTab('ai')}>
          Ask AI
        </button>
      </div>

      <div className={styles.toolbar}>
        <select className={styles.select} value={activeDatabaseId} onChange={(e) => setDatabaseId(e.target.value)}>
          {databases.data?.map((db) => (
            <option key={db.id} value={db.id}>
              {db.name}
            </option>
          ))}
        </select>
      </div>

      {tab === 'write' && (
        <>
          <textarea
            className={styles.textarea}
            value={sql}
            onChange={(e) => setSql(e.target.value)}
            placeholder="SELECT * FROM demo_orders LIMIT 20"
            spellCheck={false}
          />

          <div className={styles.actions}>
            <button
              type="button"
              className={pageStyles.primaryButton}
              disabled={runQuery.isPending || !sql.trim()}
              onClick={handleRun}
            >
              {runQuery.isPending ? 'Running…' : 'Run Query'}
            </button>
            {isAdmin && (
              <button
                type="button"
                className={pageStyles.secondaryButton}
                disabled={!sql.trim()}
                onClick={() => setShowSubmitForm((v) => !v)}
              >
                {showSubmitForm ? 'Cancel' : 'Submit for Approval'}
              </button>
            )}
          </div>

          {showSubmitForm && (
            <form className={styles.submitForm} onSubmit={handleSubmitForApproval}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="submit-title">
                  Title
                </label>
                <input
                  id="submit-title"
                  className={styles.input}
                  value={submitForm.title}
                  onChange={(e) => setSubmitForm({ ...submitForm, title: e.target.value })}
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="submit-risk">
                  Risk level
                </label>
                <select
                  id="submit-risk"
                  className={styles.input}
                  value={submitForm.riskLevel}
                  onChange={(e) => setSubmitForm({ ...submitForm, riskLevel: e.target.value as RiskLevel })}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <div className={`${styles.field} ${styles.fullWidth}`}>
                <label className={styles.label} htmlFor="submit-explanation">
                  Reason for this change
                </label>
                <textarea
                  id="submit-explanation"
                  className={styles.textInput}
                  value={submitForm.explanation}
                  onChange={(e) => setSubmitForm({ ...submitForm, explanation: e.target.value })}
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="submit-target">
                  Target object (optional)
                </label>
                <input
                  id="submit-target"
                  className={styles.input}
                  value={submitForm.targetObject}
                  onChange={(e) => setSubmitForm({ ...submitForm, targetObject: e.target.value })}
                />
              </div>
              {submitError && <div className={`${styles.field} ${styles.fullWidth}`}>{submitError}</div>}
              <div className={`${styles.field} ${styles.fullWidth}`}>
                <button type="submit" className={pageStyles.primaryButton} disabled={submitManualSql.isPending}>
                  {submitManualSql.isPending ? 'Submitting…' : 'Submit for approval'}
                </button>
              </div>
            </form>
          )}

          {submittedId && (
            <div className={styles.success}>
              Submitted for approval — <Link to={`/recommendations/${submittedId}`}>view it in Recommendations</Link>
            </div>
          )}

          {runError && <div className={styles.error}>{runError}</div>}

          {result && (
            <>
              <div className={styles.meta}>
                {result.rowCount} row{result.rowCount === 1 ? '' : 's'}
                {result.truncated ? ' (truncated)' : ''} in {result.executionTimeMs}ms
              </div>
              <ResultChart columns={result.columns} rows={result.rows} />
              <div className={styles.resultsWrap}>
                <QueryResultsTable columns={result.columns} rows={result.rows} />
              </div>
            </>
          )}
        </>
      )}

      {tab === 'ai' && (
        <>
          <div className={styles.askRow}>
            <input
              className={styles.askInput}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
              placeholder="Show me customers who spent more than 500 this year"
            />
            <button
              type="button"
              className={pageStyles.primaryButton}
              disabled={askAiSql.isPending || !question.trim()}
              onClick={handleAsk}
            >
              {askAiSql.isPending ? 'Asking…' : 'Ask'}
            </button>
          </div>

          {aiError && <div className={styles.error}>{aiError}</div>}

          {aiSubmission && (
            <>
              {aiSubmission.explanation && <div className={styles.explanation}>{aiSubmission.explanation}</div>}

              {aiSubmission.sql && (
                <>
                  <div className={styles.generatedSqlLabel}>Generated SQL</div>
                  <div style={{ marginBottom: 'var(--space-6)' }}>
                    <SqlBlock sql={aiSubmission.sql} />
                  </div>
                </>
              )}

              {aiSubmission.recommendationId && (
                <div className={styles.success}>
                  Submitted for approval —{' '}
                  <Link to={`/recommendations/${aiSubmission.recommendationId}`}>view it in Recommendations</Link>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
