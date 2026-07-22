// src/features/credentials/components/CredentialForm.tsx
// Shared form used by AddCredentialPage and EditCredentialPage.
// Handles: Credential Name (read-only), Status, Credential Awarded date.

import { useState } from 'react'
import type { CredentialWithOrg, CredentialStatusId } from '../api/credentials.queries'
import styles from '../styles/CredentialForm.module.css'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_OPTIONS: { value: CredentialStatusId; label: string }[] = [
  { value: 'STATUS_ACTIVE',    label: 'Active' },
  { value: 'STATUS_INACTIVE',  label: 'Inactive' },
  { value: 'STATUS_GRACE',     label: 'Grace Period' },
  { value: 'STATUS_SUSPENDED', label: 'Suspended' },
  { value: 'STATUS_RETIRED',   label: 'Retired' },
  { value: 'STATUS_REVOKED',   label: 'Revoked' },
  { value: 'STATUS_EXPIRED',   label: 'Expired' },
]

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CredentialFormValues {
  status_id: CredentialStatusId
  cycle_start_date: string   // 'YYYY-MM-DD'
}

interface CredentialFormProps {
  credential: CredentialWithOrg
  initialValues?: Partial<CredentialFormValues>
  onSubmit: (values: CredentialFormValues) => Promise<void>
  onCancel: () => void
  onDelete?: () => Promise<void>   // only passed in edit mode
  submitLabel?: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CredentialForm({
  credential,
  initialValues,
  onSubmit,
  onCancel,
  onDelete,
  submitLabel = 'Save Credential',
}: CredentialFormProps) {
  const [status, setStatus] = useState<CredentialStatusId>(
    initialValues?.status_id ?? 'STATUS_ACTIVE'
  )
  const [awardedDate, setAwardedDate] = useState(
    initialValues?.cycle_start_date ?? ''
  )
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!awardedDate) {
      setError('Please enter the date this credential was awarded.')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({ status_id: status, cycle_start_date: awardedDate })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!onDelete) return
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setDeleting(true)
    try {
      await onDelete()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to remove credential.')
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>

      {/* Read-only credential info */}
      <div className={styles.credentialBanner}>
        <span className={styles.bannerAbbr}>{credential.abbreviation}</span>
        <div>
          <div className={styles.bannerName}>{credential.credential_name}</div>
          <div className={styles.bannerOrg}>
            {credential.governing_authorities.governing_authority_name}
          </div>
        </div>
      </div>

      {/* Status */}
      <div className={styles.field}>
        <label htmlFor="status" className={styles.label}>
          Status
        </label>
        <select
          id="status"
          className={styles.select}
          value={status}
          onChange={(e) => setStatus(e.target.value as CredentialStatusId)}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <p className={styles.hint}>
          Set to Active if you are actively maintaining this credential.
        </p>
      </div>

      {/* Credential Awarded date */}
      <div className={styles.field}>
        <label htmlFor="awardedDate" className={styles.label}>
          Credential Awarded
        </label>
        <input
          id="awardedDate"
          type="date"
          className={styles.input}
          value={awardedDate}
          onChange={(e) => setAwardedDate(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          required
        />
        <p className={styles.hint}>
          The date you received this credential. This sets the start of your
          first reporting cycle.
        </p>
      </div>

      {/* Error */}
      {error && <p className={styles.errorText}>{error}</p>}

      {/* Actions */}
      <div className={styles.actions}>
        <div className={styles.actionsLeft}>
          {onDelete && (
            <button
              type="button"
              className={
                confirmDelete ? styles.btnDeleteConfirm : styles.btnDelete
              }
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting
                ? 'Removing…'
                : confirmDelete
                ? 'Confirm remove'
                : 'Remove credential'}
            </button>
          )}
          {confirmDelete && !deleting && (
            <button
              type="button"
              className={styles.btnCancel}
              onClick={() => setConfirmDelete(false)}
            >
              Cancel
            </button>
          )}
        </div>

        <div className={styles.actionsRight}>
          <button
            type="button"
            className={styles.btnCancel}
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={styles.btnSubmit}
            disabled={submitting}
          >
            {submitting ? 'Saving…' : submitLabel}
          </button>
        </div>
      </div>
    </form>
  )
}
