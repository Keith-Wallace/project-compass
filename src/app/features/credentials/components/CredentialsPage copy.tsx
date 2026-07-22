// src/features/credentials/CredentialsPage.tsx
// /credentials — shows all available credentials grouped by governing authority.
// Claimed credentials show a "Manage" badge; unclaimed show an "Add" button.

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  fetchAllCredentials,
  fetchUserCredentials
} from '../api/credentials.queries'
import type {
  CredentialWithOrg,
  UserCredentialWithDetails,
} from '../api/credentials.queries'
import styles from '../styles/CredentialPage.module.css'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function groupByOrg(
  credentials: CredentialWithOrg[]
): Record<string, CredentialWithOrg[]> {
  return credentials.reduce<Record<string, CredentialWithOrg[]>>((acc, cred) => {
    const orgName = cred.governing_authorities.governing_authority_name
    if (!acc[orgName]) acc[orgName] = []
    acc[orgName].push(cred)
    return acc
  }, {})
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CredentialsPage() {
  const navigate = useNavigate()

  const [allCredentials, setAllCredentials] = useState<CredentialWithOrg[]>([])
  const [userCredentials, setUserCredentials] = useState<UserCredentialWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [all, mine] = await Promise.all([
          fetchAllCredentials(),
          fetchUserCredentials(),
        ])
        setAllCredentials(all)
        setUserCredentials(mine)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load credentials.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Build a Set of claimed credential_ids for O(1) lookup
  const claimedIds = new Set(userCredentials.map((uc) => uc.credential_id))

  // Map credential_id → user_credential id for edit navigation
  const claimedMap = new Map(
    userCredentials.map((uc) => [uc.credential_id, uc.id])
  )

  const grouped = groupByOrg(allCredentials)
  const orgNames = Object.keys(grouped).sort()

  if (loading) {
    return (
      <div className={styles.stateContainer}>
        <div className={styles.spinner} />
        <p>Loading credentials…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.stateContainer}>
        <p className={styles.errorText}>{error}</p>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Credentials</h1>
          <p className={styles.subtitle}>
            Select a credential to track your CPE requirements.
          </p>
        </div>
        <div className={styles.meta}>
          <span className={styles.metaBadge}>
            {userCredentials.length} claimed
          </span>
        </div>
      </header>

      {/* Org groups */}
      <div className={styles.groups}>
        {orgNames.map((orgName) => {
          const creds = grouped[orgName]
          const org = creds[0].governing_authorities

          return (
            <section key={org.governing_authority_id} className={styles.orgSection}>
              <div className={styles.orgHeader}>
                <span className={styles.orgAbbr}>{org.abbreviation}</span>
                <span className={styles.orgName}>{org.governing_authority_name}</span>
              </div>

              <div className={styles.credGrid}>
                {creds.map((cred) => {
                  const isClaimed = claimedIds.has(cred.credential_id)
                  const userCredId = claimedMap.get(cred.credential_id)

                  return (
                    <div
                      key={cred.credential_id}
                      className={`${styles.credCard} ${isClaimed ? styles.credCardClaimed : ''}`}
                    >
                      <div className={styles.credCardBody}>
                        <div className={styles.credAbbr}>{cred.abbreviation}</div>
                        <div className={styles.credName}>{cred.credential_name}</div>
                        {cred.status !== 'Active' && (
                          <span className={styles.legacyBadge}>{cred.status}</span>
                        )}
                      </div>

                      <div className={styles.credCardFooter}>
                        {isClaimed ? (
                          <button
                            className={styles.btnManage}
                            onClick={() =>
                              navigate(`/credentials/${userCredId}/edit`)
                            }
                          >
                            Manage
                          </button>
                        ) : (
                          <button
                            className={styles.btnAdd}
                            onClick={() =>
                              navigate(
                                `/credentials/new?credentialId=${cred.credential_id}`
                              )
                            }
                          >
                            + Add
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
