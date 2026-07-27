// src/features/credentials/EditCredentialPage.tsx
// /credentials/:id/edit
// Loads the user's specific user_credentials row, pre-fills the form,
// handles update and delete.

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  fetchUserCredentialById,
  updateUserCredential,
  deleteUserCredential
} from '../api/credentials.queries'
import type { UserCredentialWithDetails } from '../api/credentials.queries'
import CredentialForm from './CredentialForm'
import type { CredentialFormValues } from './CredentialForm'
import '../styles/credentials-page.css'

export default function EditCredentialPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const [userCredential, setUserCredential] =
    useState<UserCredentialWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    // eslint-disable-next-line react-hooks/set-state-in-effect -- TODO: revisit with request-cancellation (AbortController) cleanup; deferred for now
    setLoading(true)
    setError(null)

    fetchUserCredentialById(id)
      .then(setUserCredential)
      .catch(() => setError('Could not load your credential.'))
      .finally(() => setLoading(false))
  }, [id])

  // Derived synchronously during render — no network call needed, so no
  // effect is required for this branch (see note below).
  const idError = !id ? 'Invalid credential ID.' : null

  async function handleSubmit(values: CredentialFormValues) {
    if (!id || !userCredential) return

    // CredentialForm currently only edits status_id and cycle_start_date.
    // credential_id and cycle_end_date aren't exposed in the form yet, so
    // carry the existing values through for now.
    // TODO: revisit once CredentialForm supports editing these fields directly.
    if (!userCredential.cycle_end_date) {
      setError('This credential is missing a cycle end date and cannot be saved yet.')
      return
    }

    await updateUserCredential({
      id,
      credential_id: userCredential.credential_id,
      cycle_end_date: userCredential.cycle_end_date,
      ...values,
    })
    navigate('/credentials')
  }

  async function handleDelete() {
    if (!id) return
    await deleteUserCredential(id)
    navigate('/credentials')
  }

  if (idError) {
    return (
      <div className="state-container">
        <p className="error-text">{idError}</p>
        <button className="btn-back" onClick={() => navigate('/credentials')}>
          ← Back to Credentials
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="state-container">
        <div className="spinner" />
      </div>
    )
  }

  if (error || !userCredential) {
    return (
      <div className="state-container">
        <p className="error-text">{error ?? 'Credential not found.'}</p>
        <button className="btn-back" onClick={() => navigate('/credentials')}>
          ← Back to Credentials
        </button>
      </div>
    )
  }

  return (
    <div className="credential-edit-page">
      <button className="back-link" onClick={() => navigate('/credentials')}>
        ← Credentials
      </button>
      <h1 className="page-title">Edit Credential</h1>
      <p className="page-subtitle">
        Update the details for your {userCredential.credentials.abbreviation}.
      </p>

      <div className="form-card">
        <CredentialForm
          credential={userCredential.credentials}
          initialValues={{
            status_id: userCredential.status_id as CredentialFormValues['status_id'],
            cycle_start_date: userCredential.cycle_start_date,
          }}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/credentials')}
          onDelete={handleDelete}
          submitLabel="Save Changes"
        />
      </div>
    </div>
  )
}
