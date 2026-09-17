import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchUserCredentials, deleteUserCredential } from '../api/credentials.queries'
import type { UserCredentialWithDetails } from '../api/credentials.queries'
import CredentialList from './CredentialsList'
import { Button } from "../../../shared/components/buttons/Button";

import '../styles/credentials-page.css'


export default function CredentialsPage() {
  const navigate = useNavigate()
  const [credentials, setCredentials] = useState<UserCredentialWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting]  = useState(false)

  const fetchCredentials = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchUserCredentials()
      setCredentials(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
     // eslint-disable-next-line react-hooks/set-state-in-effect -- TODO: a legitimate mount-time data fetch with no derivable-state anti-pattern, same reasoning as the EditCredentialPage fetch effect.
    fetchCredentials()
  }, []) 

  const handleEdit = (credential: UserCredentialWithDetails) => {
    navigate(`/credentials/${credential.id}/edit`, { state: { credential } })
  }

  const handleDelete = async (id: string): Promise<void> => {
    setSubmitting(true)
    try {
      await deleteUserCredential(id)
      setCredentials(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="main-content-area">
      <div className="main-content-header">
        <div>
          <h1>My Credentials</h1>
          <p className="main-content-header-subtitle">
            Manage your professional credentials.
          </p>
        </div>
        <div className="header-actions">
          <Button
            onClick={() => navigate('/credentials/new')}
          >
            Add Credential
          </Button>
        </div>
      </div>

      {error && <div className="error-msg">Error: {error}</div>}

      <div className="main-content-body">
        <div className="section-header">
          <span className="section-title">Credential History</span>
          <span className="section-count">{credentials.length} records</span>
        </div>

        {loading ? (
          <div className="loading-state">Loading credentials...</div>
        ) : credentials.length === 0 ? (
          <div className="empty-state">
            <p>No credentials added yet.</p>
            <span>Add a credential to start tracking your CPE requirements.</span>
            <Button
              onClick={() => navigate('/credentials/new')}
            >
              Add Your First Credential
            </Button>
          </div>
        ) : (
          <CredentialList
            credentials={credentials}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSubmit={submitting}
          />
        )}
      </div>
    </div>
  )
}
