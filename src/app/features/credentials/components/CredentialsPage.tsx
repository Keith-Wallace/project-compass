// src/features/credentials/CredentialsPage.tsx
// /credentials — shows all available credentials grouped by governing authority.
// Claimed credentials show a "Manage" badge; unclaimed show an "Add" button.

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchUserCredentials } from '../api/credentials.queries'
import type { UserCredentialWithDetails } from '../api/credentials.queries'
import CredentialList from './CredentialsList'
import RollingThreeLogo from '../../../../assets/rolling-three-whitebg-logo.png'
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

  useEffect(() => { fetchCredentials() }, [])

  const handleEdit = (credential: UserCredentialWithDetails) => {
    navigate(`/credentials/${credential.id}/edit`, { state: { credential } })
  }

  const handleDelete = async (id: string): Promise<void> => {
    try {
      await deleteUserCredential(id)
      setCredentials(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.')
    }
  }

  return (
    <>
      <header className="form-header">
        <div className="form-header-left">
          <button className="back-btn" onClick={() => navigate('/')}>
            ← Back
          </button>
          <div className="form-logo">
            <img src={RollingThreeLogo} alt="Rolling Three" height="100" />
          </div>
        </div>
        <div className="header-actions">
          <button
            className="btn-primary"
            onClick={() => navigate('/credentials/new')}
          >
            + Add Credential
          </button>
        </div>
      </header>

      <div className="credentials-page">
        {/* Page header */}
        <div className="credentials-page-header">
          <div>
            <h1 className="credentials-page-title">My Credentials</h1>
            <p className="credentials-page-subtitle">
              Manage your professional credentials.
            </p>
          </div>
        </div>

        {/* Error */}
        {error && <div className="error-msg">Error: {error}</div>}

        {/* Section header — mirrors Dashboard "Course History" section */}
        <div className="section-header">
          <span className="section-title">Credential History</span>
          <span className="section-count">{credentials.length} records</span>
        </div>

        {/* States */}
        {loading ? (
          <div className="loading-state">Loading credentials...</div>
        ) : credentials.length === 0 ? (
          <div className="empty-state">
            <p>No credentials added yet.</p>
            <span>Add a credential to start tracking your CPE requirements.</span>
            <button
              className="btn-primary"
              onClick={() => navigate('/credentials/new')}
            >
              Add Your First Credential
            </button>
          </div>
        ) : (
          <CredentialList
            credentials={credentials}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
        <button
          type="button"
          className="btn-cancel"
          onClick={() => navigate('/')}
          disabled={submitting}
        >
          Cancel
        </button>
      </div>
    </>
  )
}
