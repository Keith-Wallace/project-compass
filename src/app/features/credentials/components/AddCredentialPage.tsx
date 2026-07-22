// src/app/features/credentials/components/AddCredentialPage.tsx
// /credentials/new
//
// Step 1: User fills three fields (credential, issued date, status) → clicks Review
// Step 2: CPE requirements panel appears alongside the form
// Step 3: User clicks Save Credential → writes to DB → /credentials

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  fetchAllCredentials,
  fetchRequirementRule,
  addUserCredential,
  fetchAllGoverningAuthoritys
} from '../api/credentials.queries'
import type {
  CredentialWithOrg,
  GoverningAuthority,
  RequirementRule,
  CredentialStatusId
} from '../api/credentials.queries'
import CredentialRequirementsPanel from './CredentialRequirementsPanel'
import RollingThreeLogo from '../../../../assets/rolling-three-whitebg-logo.png'

import Autocomplete from '../../../shared/components/form/Autocomplete'

// NOTE: reusing the same stylesheet as the "Log a Course" page (course-form.css)
// so both forms share the .form-root / .form-header / .form-body / .field-group
// HTML structure. Adjust this relative path if the courses feature folder lives
// somewhere else in your tree.
import '../../courses/styles/course-form.css'

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
// Component
// ---------------------------------------------------------------------------

export default function AddCredentialPage() {
  const navigate = useNavigate()

  // Remote data
  const [allCredentials, setAllCredentials] = useState<CredentialWithOrg[]>([])
  const [allGoverningAuthoritys, setAllGoverningAuthoritys] = useState<GoverningAuthority[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  // --- Field: Credential Name (autocomplete) ---
  const [credentialInput, setCredentialInput] = useState('')       // raw text in the input
  const [selectedCredentialId, setSelectedCredentialId] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const autocompleteRef = useRef<HTMLDivElement>(null)

  // --- Field: Governing Body (derived from Credential Name — read-only) ---
  const [selectedAuthorityId, setSelectedAuthorityId] = useState('')

  // --- Field: Credential Issued Date ---
  const [issuedDate, setIssuedDate] = useState('')

  // --- Field: Status ---
  const [statusId, setStatusId] = useState<CredentialStatusId>('STATUS_ACTIVE')

  // --- Field: Reporting Cycle Start Date ---
  const [cycleStartDate, setCycleStartDate] = useState('')

  // --- Field: Reporting Cycle End Date ---
  const [cycleEndDate, setCycleEndDate] = useState('')

  // Validation
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Review / save state
  const [reviewed, setReviewed] = useState(false)
  const [rule, setRule] = useState<RequirementRule | null>(null)
  const [loadingRule, setLoadingRule] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // ---------------------------------------------------------------------------
  // Load data on mount
  // ---------------------------------------------------------------------------

  useEffect(() => {
    Promise.all([fetchAllCredentials(), fetchAllGoverningAuthoritys()])
      .then(([creds, orgs]) => {
        setAllCredentials(creds)
        setAllGoverningAuthoritys(orgs)
      })
      .catch(() => setLoadError('Could not load data. Please try again.'))
      .finally(() => setLoadingData(false))
  }, [])

  // Close autocomplete when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        autocompleteRef.current &&
        !autocompleteRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // ---------------------------------------------------------------------------
  // Autocomplete helpers
  // ---------------------------------------------------------------------------

  // Filter credentials by input text
  const suggestions = allCredentials.filter((cred) => {
    return (
      credentialInput.trim() === '' ||
      cred.credential_name.toLowerCase().includes(credentialInput.toLowerCase()) ||
      cred.abbreviation.toLowerCase().includes(credentialInput.toLowerCase())
    )
  })

  function handleCredentialInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCredentialInput(e.target.value)
    setSelectedCredentialId('')   // clear confirmed selection when user types
    setShowSuggestions(true)
    resetReview()
  }

  // Whenever focus returns to the Credential Name field, clear the derived
  // Governing Body value so it can't go stale against whatever gets selected next.
  function handleCredentialInputFocus() {
    setShowSuggestions(true)
    setSelectedAuthorityId('')
  }

  function handleSelectSuggestion(cred: CredentialWithOrg) {
    setCredentialInput(cred.credential_name)
    setSelectedCredentialId(cred.credential_id)
    // Governing Body is always derived from the selected credential.
    setSelectedAuthorityId(cred.governing_authority_id)
    setShowSuggestions(false)
    resetReview()
  }

  // ---------------------------------------------------------------------------
  // Reset review when any field changes
  // ---------------------------------------------------------------------------

  function resetReview() {
    if (reviewed) {
      setReviewed(false)
      setRule(null)
      setSaveError(null)
    }
  }

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------

  function validate(): boolean {
    const errors: Record<string, string> = {}

    if (!selectedCredentialId)
      errors.credential = 'Please select a credential from the list.'
    if (!selectedAuthorityId)
      errors.org = 'Governing body could not be determined. Please re-select the credential.'
    if (!issuedDate)
      errors.issuedDate = 'Please enter the date this credential was issued.'
    if (!cycleStartDate)
      errors.cycleStartDate = 'Please enter the reporting cycle start date.'
    if (!cycleEndDate)
      errors.cycleEndDate = 'Please enter the reporting cycle end date.'
    if (cycleStartDate && cycleEndDate && cycleEndDate < cycleStartDate)
      errors.cycleEndDate = 'End date cannot be before the reporting cycle start date.'

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  // ---------------------------------------------------------------------------
  // Step 1 — Review
  // ---------------------------------------------------------------------------

  async function handleReview() {
    if (!validate()) return
    setLoadingRule(true)
    try {
      const fetchedRule = await fetchRequirementRule(selectedCredentialId)
      setRule(fetchedRule)
      setReviewed(true)
    } catch {
      setFieldErrors({ form: 'Could not load CPE requirements. Please try again.' })
    } finally {
      setLoadingRule(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Step 2 — Save
  // ---------------------------------------------------------------------------

  async function handleSave() {
    setSaveError(null)
    setSaving(true)
    try {
      await addUserCredential({
        credential_id: selectedCredentialId,
        status_id: statusId,
        cycle_start_date: cycleStartDate,
        cycle_end_date: cycleEndDate,
      })
      navigate('/credentials')
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Derived
  // ---------------------------------------------------------------------------

  const selectedCredential =
    allCredentials.find((c) => c.credential_id === selectedCredentialId) ?? null

  const selectedOrgName =
    allGoverningAuthoritys.find((o) => o.governing_authority_id === selectedAuthorityId)?.governing_authority_name ?? ''

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (loadingData) {
    return (
      <div className="form-root">
        <div className="form-body">Loading…</div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="form-root">
        <div className="form-body">
          <p className="field-error-msg">{loadError}</p>
          <button className="back-btn" onClick={() => navigate('/credentials')}>
            ← Back to Credentials
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="form-root">

      <header className="form-header">
        <div className="form-header-left">
          <button className="back-btn" onClick={() => navigate('/credentials')}>
            ← Back
          </button>
          <div className="form-logo">
            <img src={RollingThreeLogo} alt="Rolling Three" height="100" />
          </div>
        </div>
      </header>

      <main className="form-body">
        <h1 className="form-title">Add New Credential</h1>

        {fieldErrors.form && (
          <div className="error-banner">{fieldErrors.form}</div>
        )}

        <form onSubmit={(e) => e.preventDefault()}>

          {/* 1. Credential Name — autocomplete */}
          <div class="field-row">
            <div className="field-group provider-autocomplete" ref={autocompleteRef}>
              <label className="field-label" htmlFor="credentialInput">
                Credential Name <span className="field-required">*</span>
              </label>
              <div className="pac-input-wrap">
                <input
                  id="credentialInput"
                  type="text"
                  autoComplete="off"
                  aria-label="Credential name"
                  aria-expanded={showSuggestions}
                  aria-haspopup="listbox"
                  role="combobox"
                  placeholder="Search credentials…"
                  className={`form-input field-input${fieldErrors.credential ? ' field-input--error' : ''}`}
                  value={credentialInput}
                  onChange={handleCredentialInputChange}
                  onFocus={handleCredentialInputFocus}
                />
              </div>
              {showSuggestions && suggestions.length > 0 && (
                <ul className="pac-dropdown">
                  {suggestions.map((cred) => (
                    <li
                      key={cred.credential_id}
                      className="pac-option"
                      onMouseDown={() => handleSelectSuggestion(cred)}
                    >
                      <span className="pac-option-name">{cred.credential_name}</span>
                      <span className="pac-option-address">{cred.abbreviation}</span>
                    </li>
                  ))}
                </ul>
              )}
              {showSuggestions && credentialInput.length > 0 && suggestions.length === 0 && (
                <ul className="pac-dropdown">
                  <li className="pac-option pac-option--meta">No credentials found.</li>
                </ul>
              )}
              {fieldErrors.credential && (
                <span className="field-error-msg">{fieldErrors.credential}</span>
              )}
            </div>

            {/* 2. Governing Body — derived, read-only */}
            <div className="field-group field-gov-body">
              <label className="field-label" htmlFor="org">
                Governing Body <span className="field-required">*</span>
              </label>
              <input
                id="org"
                type="text"
                className={`field-input${fieldErrors.org ? ' field-input--error' : ''}`}
                value={selectedOrgName}
                disabled
                readOnly
                placeholder="Determined by credential selection"
              />
              {fieldErrors.org && (
                <span className="field-error-msg">{fieldErrors.org}</span>
              )}
            </div>
          </div>

          {/* 3. Credential Issued Date */}
          <div className="field-row">
            <div className="field-group">
              <label className="field-label" htmlFor="issuedDate">
                Credential Issued Date <span className="field-required">*</span>
              </label>
              <input
                id="issuedDate"
                type="date"
                className={`field-input${fieldErrors.issuedDate ? ' field-input--error' : ''}`}
                value={issuedDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => { setIssuedDate(e.target.value); resetReview() }}
              />
              {fieldErrors.issuedDate && (
                <span className="field-error-msg">{fieldErrors.issuedDate}</span>
              )}
            </div>

            {/* 4. Status */}
            <div className="field-group">
              <label className="field-label" htmlFor="status">
                Status <span className="field-required">*</span>
              </label>
              <select
                id="status"
                className={`field-select${fieldErrors.statusId ? ' field-select--error' : ''}`}
                value={statusId}
                onChange={(e) => { setStatusId(e.target.value as CredentialStatusId); resetReview() }}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {fieldErrors.statusId && (
                <span className="field-error-msg">{fieldErrors.statusId}</span>
              )}
            </div>
          </div>

          {/* <hr className="form-divider" /> */}

          {/* 5 & 6. Reporting Cycle Start / End Date */}
          <div className="field-row">
            <div className="field-group">
              <label className="field-label" htmlFor="cycleStartDate">
                Reporting Cycle Start Date <span className="field-required">*</span>
              </label>
              <input
                id="cycleStartDate"
                type="date"
                className={`field-input${fieldErrors.cycleStartDate ? ' field-input--error' : ''}`}
                value={cycleStartDate}
                onChange={(e) => { setCycleStartDate(e.target.value); resetReview() }}
              />
              {fieldErrors.cycleStartDate && (
                <span className="field-error-msg">{fieldErrors.cycleStartDate}</span>
              )}
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="cycleEndDate">
                Reporting Cycle End Date <span className="field-required">*</span>
              </label>
              <input
                id="cycleEndDate"
                type="date"
                className={`field-input${fieldErrors.cycleEndDate ? ' field-input--error' : ''}`}
                value={cycleEndDate}
                min={cycleStartDate || undefined}
                onChange={(e) => { setCycleEndDate(e.target.value); resetReview() }}
              />
              {fieldErrors.cycleEndDate && (
                <span className="field-error-msg">{fieldErrors.cycleEndDate}</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate('/credentials')}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-submit"
              onClick={handleReview}
              disabled={loadingRule}
            >
              {loadingRule ? 'Loading…' : reviewed ? 'Update & Review' : 'Review Requirements'}
            </button>
          </div>

        </form>

        {/* ------------------------------------------------------------------ */}
        {/* Requirements panel                                                  */}
        {/* ------------------------------------------------------------------ */}
        {reviewed && selectedCredential && (
          <>
            <hr className="form-divider" />
            <CredentialRequirementsPanel
              credential={selectedCredential}
              rule={rule}
              saveError={saveError}
              saving={saving}
              onSave={handleSave}
            />
          </>
        )}

      </main>
    </div>
  )
}
