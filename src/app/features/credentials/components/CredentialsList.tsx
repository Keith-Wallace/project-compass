// src/app/features/credentials/components/CredentialList.tsx

import { useState } from 'react'
import type { UserCredentialWithDetails } from '../api/credentials.queries'
import '../styles/credentials-list.css'

interface Props {
  credentials: UserCredentialWithDetails[]
  onEdit: (credential: UserCredentialWithDetails) => void
  onDelete: (id: string) => Promise<void>
}

export default function CredentialList({ credentials, onEdit, onDelete }: Props) {
  console.log('credentials: ', credentials)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDeleteClick = (id: string) => setConfirmId(id)
  const handleCancel = () => setConfirmId(null)

  const handleConfirmDelete = async (id: string) => {
    setConfirmId(null)
    setDeletingId(id)
    await onDelete(id)
    setDeletingId(null)
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—'
    // Parse as local date to avoid UTC offset shifting the day
    const [year, month, day] = dateStr.split('-').map(Number)
    return new Date(year, month - 1, day).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    })
  }

  const getStatusLabel = (statusId: string) => {
    const map: Record<string, string> = {
      STATUS_ACTIVE:    'Active',
      STATUS_INACTIVE:  'Inactive',
      STATUS_GRACE:     'Grace Period',
      STATUS_SUSPENDED: 'Suspended',
      STATUS_RETIRED:   'Retired',
      STATUS_REVOKED:   'Revoked',
      STATUS_EXPIRED:   'Expired',
    }
    return map[statusId] ?? statusId
  }

  const getStatusClass = (statusId: string) => {
    const map: Record<string, string> = {
      STATUS_ACTIVE:    'status-active',
      STATUS_INACTIVE:  'status-inactive',
      STATUS_GRACE:     'status-grace',
      STATUS_SUSPENDED: 'status-suspended',
      STATUS_RETIRED:   'status-inactive',
      STATUS_REVOKED:   'status-suspended',
      STATUS_EXPIRED:   'status-suspended',
    }
    return map[statusId] ?? ''
  }

  return (
    <>
      {/* Header row */}
      <div className="credential-list-header">
        <span>Credential</span>
        <span>Governing Body</span>
        <span>Start Reporting Period Date</span>
        <span>End Reporting Period Date</span>
        <span className="col-center">Status</span>
        <span className="col-right">Actions</span>
      </div>

      <div className="credential-list">
        {credentials.map((uc) => (
          <div
            key={uc.id}
            className={`credential-row ${deletingId === uc.id ? 'deleting' : ''}`}
          >
            {/* Confirm delete overlay */}
            {confirmId === uc.id && (
              <div className="confirm-overlay">
                <span className="confirm-text">Remove this credential?</span>
                <button
                  className="btn-confirm-delete"
                  onClick={() => handleConfirmDelete(uc.id)}
                >
                  Remove
                </button>
                <button className="btn-cancel" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            )}

            {/* Credential name + abbreviation */}
            <div>
              <div className="credential-abbr">{uc.credentials.abbreviation}</div>
              <div className="credential-title">{uc.credentials.credential_name}</div>
            </div>

            {/* Governing body */}
            <div className="credential-org">
              <span className="org-abbr-badge">
                {uc.credentials.governing_authorities.abbreviation}
              </span>
              {/* <span className="org-name">
                {uc.credentials.governing_authorities.governing_authority_name}
              </span> */}
            </div>

            {/* Issued date */}
            <div className="credential-date">
              {formatDate(uc.cycle_start_date)}
            </div>

            {/* Issued date */}
            <div className="credential-date">
              {formatDate(uc.cycle_end_date)}
            </div>

            {/* Status */}
            <div className="col-center">
              <span className={`status-badge ${getStatusClass(uc.status_id)}`}>
                {getStatusLabel(uc.status_id)}
              </span>
            </div>

            {/* Actions */}
            <div className="credential-actions">
              <button className="btn-edit" onClick={() => onEdit(uc)}>Edit</button>
              <button className="btn-delete" onClick={() => handleDeleteClick(uc.id)}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
