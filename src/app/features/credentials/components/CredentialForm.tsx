import { useState } from 'react'
import type { CredentialWithOrg } from '../api/credentials.queries'
import { Button } from "../../../shared/components/button/Button";
import { Form } from '../../../shared/components/form/Form';
import { Input } from '../../../shared/components/form/Input';
import { Select } from '../../../shared/components/form/Select';
import {
  credentialFormValidation,
  type CredentialFormValues,
} from './CredentialForm.validation';
import { STATUS_OPTIONS } from '../api/credentials-status-options'

import styles from '../styles/CredentialForm.module.css'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  // Runs only after the shared Form has validated the values.
  async function handleSubmit(values: CredentialFormValues) {
    setError(null)
    setSubmitting(true)
    try {
      await onSubmit(values)
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

  return (
    <Form<CredentialFormValues>
      initialValues={{
        status_id: initialValues?.status_id ?? 'STATUS_ACTIVE',
        cycle_start_date: initialValues?.cycle_start_date ?? '',
        // Always starts blank in edit mode: there's no stored value to load
        // yet (see the TODO on CredentialFormValues.issued_date).
        issued_date: initialValues?.issued_date ?? '',
      }}
      validation={credentialFormValidation}
      onSubmit={handleSubmit}
    >
      {(form) => (
        // The <form> element itself now comes from the shared Form, so the
        // old `styles.form` class moves to this wrapper div.
        <div className={styles.form}>

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
            <Select
              form={form}
              name="status_id"
              label="Status"
              data={STATUS_OPTIONS}
              allowDeselect={false}
            />
            <p className={styles.hint}>
              Set to Active if you are actively maintaining this credential.
            </p>
          </div>

          {/* Credential Issued Date — not yet persisted; see the TODO on
              CredentialFormValues.issued_date */}
          <div className={styles.field}>
            <Input
              form={form}
              name="issued_date"
              type="date"
              label="Credential Issued Date"
              max={new Date().toISOString().split('T')[0]}
              withAsterisk
            />
            <p className={styles.hint}>
              The date this credential was formally issued by the governing body.
            </p>
          </div>

          {/* Credential Awarded date */}
          <div className={styles.field}>
            <Input
              form={form}
              name="cycle_start_date"
              type="date"
              label="Credential Awarded"
              max={new Date().toISOString().split('T')[0]}
              withAsterisk
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
                <Button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  variant="cancel"
                >
                  {deleting
                    ? 'Removing…'
                    : confirmDelete
                    ? 'Confirm remove'
                    : 'Remove credential'}
                </Button>
              )}
              {confirmDelete && !deleting && (
                <Button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  variant="cancel"
                >
                  Cancel
                </Button>
              )}
            </div>

            <div className={styles.actionsRight}>
              <Button
                type="button"
                onClick={onCancel}
                disabled={submitting}
                variant="cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : submitLabel}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Form>
  )
}
