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
    if (!id) {
      setError('Invalid credential ID.')
      setLoading(false)
      return
    }

    fetchUserCredentialById(id)
      .then(setUserCredential)
      .catch(() => setError('Could not load your credential.'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleSubmit(values: CredentialFormValues) {
    if (!id) return
    await updateUserCredential({ id, ...values })
    navigate('/credentials')
  }

  async function handleDelete() {
    if (!id) return
    await deleteUserCredential(id)
    navigate('/credentials')
  }

  if (loading) {
    return (
      <div className={styles.stateContainer}>
        <div className={styles.spinner} />
      </div>
    )
  }

  if (error || !userCredential) {
    return (
      <div className={styles.stateContainer}>
        <p className={styles.errorText}>{error ?? 'Credential not found.'}</p>
        <button className={styles.btnBack} onClick={() => navigate('/credentials')}>
          ← Back to Credentials
        </button>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <button className={styles.backLink} onClick={() => navigate('/credentials')}>
        ← Credentials
      </button>
      <h1 className={styles.title}>Edit Credential</h1>
      <p className={styles.subtitle}>
        Update the details for your {userCredential.credentials.abbreviation}.
      </p>

      <div className={styles.formCard}>
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
