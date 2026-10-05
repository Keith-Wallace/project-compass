import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { type ComboboxItem, type OptionsFilter, type SelectProps } from '@mantine/core'
import { type UseFormReturnType } from '@mantine/form'
import {
  fetchAllCredentials,
  fetchRequirementRule,
  addUserCredential,
  fetchAllGoverningAuthoritys,
  fetchCredentialGoverningAuthorities,
} from '../api/credentials.queries'
import type {
  CredentialGoverningAuthorityLink,
  CredentialWithOrg,
  GoverningAuthority,
  RequirementRule,
} from '../api/credentials.queries'
import CredentialRequirementsPanel from './CredentialRequirementsPanel'
import { Button } from "../../../shared/components/button/Button";
import { Form } from '../../../shared/components/form/Form';
import { Input } from '../../../shared/components/form/Input';
import { Select } from '../../../shared/components/form/Select';
import {
  addCredentialValidation,
  type AddCredentialFormValues,
} from './AddCredentials.validation';
import { STATUS_OPTIONS } from '../api/credentials-status-options';

import '../../courses/styles/course-form.css'

// ---------------------------------------------------------------------------
// Governing Authority helpers
// ---------------------------------------------------------------------------

type AuthorityOption = { value: string; label: string }

// Sort key that ignores leading titles, so "Commonwealth of Kentucky" sorts
// under K and "State of Alabama" under A, matching how users look for a state.
function authoritySortKey(name: string) {
  return name
    .replace(/^(State of|Commonwealth of the|Commonwealth of|Territory of|United States)\s+/i, '')
    .toLowerCase()
}

// Keeps governing_authority_id in step with the selected credential:
// - exactly one authority -> select it
// - credential changed -> clear the previous choice, so the user picks again
// - otherwise, clear a value that no longer belongs to the credential
// Rendered inside the Form so it can read and set form values.
function SyncGoverningAuthority({
  form,
  options,
}: {
  form: UseFormReturnType<AddCredentialFormValues>
  options: AuthorityOption[]
}) {
  const credentialId = form.values.credential_id
  const current = form.values.governing_authority_id
  const previousCredentialId = useRef(credentialId)

  useEffect(() => {
    const credentialChanged = previousCredentialId.current !== credentialId
    previousCredentialId.current = credentialId

    if (options.length === 1) {
      if (current !== options[0].value) {
        form.setFieldValue('governing_authority_id', options[0].value)
      }
    } else if (
      current &&
      (credentialChanged || !options.some((o) => o.value === current))
    ) {
      form.setFieldValue('governing_authority_id', '')
    }
  }, [credentialId, options, current, form])

  return null
}

const NO_AUTHORITIES: AuthorityOption[] = []

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AddCredentialPage() {
  const navigate = useNavigate()

  // Remote data
  const [allCredentials, setAllCredentials] = useState<CredentialWithOrg[]>([])
  const [allGoverningAuthoritys, setAllGoverningAuthoritys] = useState<GoverningAuthority[]>([])
  const [authorityLinks, setAuthorityLinks] = useState<CredentialGoverningAuthorityLink[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Review / save state.
  // `reviewedValues` is a snapshot of the form taken when Review succeeded.
  // It doubles as the "reviewed" flag: non-null means the panel is showing.
  const [reviewedValues, setReviewedValues] = useState<AddCredentialFormValues | null>(null)
  const [rule, setRule] = useState<RequirementRule | null>(null)
  const [loadingRule, setLoadingRule] = useState(false)
  const [reviewError, setReviewError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Focus management for the requirements panel.
  // `reviewCount` goes up on every successful review, so focus moves on the
  // first review and again on a repeat "Update & Review" (where the panel is
  // already mounted and nothing else would signal the change).
  const panelRef = useRef<HTMLDivElement>(null)
  const [reviewCount, setReviewCount] = useState(0)

  // ---------------------------------------------------------------------------
  // Load data on mount
  // ---------------------------------------------------------------------------

  useEffect(() => {
    Promise.all([
      fetchAllCredentials(),
      fetchAllGoverningAuthoritys(),
      fetchCredentialGoverningAuthorities(),
    ])
      .then(([creds, orgs, links]) => {
        setAllCredentials(creds)
        setAllGoverningAuthoritys(orgs)
        setAuthorityLinks(links)
      })
      .catch(() => setLoadError('Could not load data. Please try again.'))
      .finally(() => setLoadingData(false))
  }, [])

  // ---------------------------------------------------------------------------
  // Move focus to the requirements panel after each successful review
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (reviewCount === 0) return
    const panel = panelRef.current
    if (!panel) return

    // Scroll separately so it can animate (instant when reduced motion is on).
    panel.focus({ preventScroll: true })
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    panel.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' })
  }, [reviewCount])

  // ---------------------------------------------------------------------------
  // Credential Name select: options, search filter, and option rendering
  // ---------------------------------------------------------------------------

  const credentialOptions = useMemo(
    () =>
      allCredentials.map((cred) => ({
        value: cred.credential_id,
        label: cred.credential_name,
      })),
    [allCredentials]
  )

  const abbreviationById = useMemo(
    () => new Map(allCredentials.map((cred) => [cred.credential_id, cred.abbreviation])),
    [allCredentials]
  )

  // Match on the credential name OR its abbreviation, like the old autocomplete.
  const filterCredentials: OptionsFilter = ({ options, search }) => {
    const query = search.toLowerCase().trim()
    if (!query) return options
    return (options as ComboboxItem[]).filter((option) => {
      const abbreviation = abbreviationById.get(option.value) ?? ''
      return (
        option.label.toLowerCase().includes(query) ||
        abbreviation.toLowerCase().includes(query)
      )
    })
  }

  const renderCredentialOption: SelectProps['renderOption'] = ({ option }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, width: '100%' }}>
      <span>{option.label}</span>
      <span style={{ opacity: 0.6 }}>{abbreviationById.get(option.value)}</span>
    </div>
  )

  // ---------------------------------------------------------------------------
  // Governing Authority select: options per credential, search, rendering
  // ---------------------------------------------------------------------------

  // credential_id -> the authorities that can issue it, sorted for display.
  const authorityOptionsByCredential = useMemo(() => {
    const authorityById = new Map(
      allGoverningAuthoritys.map((a) => [a.governing_authority_id, a])
    )
    const byCredential = new Map<string, AuthorityOption[]>()
    for (const link of authorityLinks) {
      const authority = authorityById.get(link.governing_authority_id)
      if (!authority) continue
      const options = byCredential.get(link.credential_id) ?? []
      options.push({
        value: authority.governing_authority_id,
        label: authority.governing_authority_name,
      })
      byCredential.set(link.credential_id, options)
    }
    for (const options of byCredential.values()) {
      options.sort((a, b) =>
        authoritySortKey(a.label).localeCompare(authoritySortKey(b.label))
      )
    }
    return byCredential
  }, [allGoverningAuthoritys, authorityLinks])

  const authorityAbbreviationById = useMemo(
    () =>
      new Map(
        allGoverningAuthoritys.map((a) => [a.governing_authority_id, a.abbreviation])
      ),
    [allGoverningAuthoritys]
  )

  // Match on the authority name OR its abbreviation (e.g. "NY").
  const filterAuthorities: OptionsFilter = ({ options, search }) => {
    const query = search.toLowerCase().trim()
    if (!query) return options
    return (options as ComboboxItem[]).filter((option) => {
      const abbreviation = authorityAbbreviationById.get(option.value) ?? ''
      return (
        option.label.toLowerCase().includes(query) ||
        abbreviation.toLowerCase().includes(query)
      )
    })
  }

  const renderAuthorityOption: SelectProps['renderOption'] = ({ option }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, width: '100%' }}>
      <span>{option.label}</span>
      <span style={{ opacity: 0.6 }}>{authorityAbbreviationById.get(option.value)}</span>
    </div>
  )

  // ---------------------------------------------------------------------------
  // Reset review when any field changes
  // ---------------------------------------------------------------------------

  function resetReview() {
    setReviewedValues(null)
    setRule(null)
    setSaveError(null)
  }

  // ---------------------------------------------------------------------------
  // Step 1: Review (runs only after the shared Form has validated the values)
  // ---------------------------------------------------------------------------

  async function handleReview(
    values: AddCredentialFormValues,
    form: UseFormReturnType<AddCredentialFormValues>,
  ) {
    setReviewError(null)

    // The chosen authority must be one that issues the chosen credential.
    // (The database enforces this too; this gives a clearer message.)
    const credential = allCredentials.find((c) => c.credential_id === values.credential_id)
    const authorityOptions = authorityOptionsByCredential.get(values.credential_id) ?? []
    if (!credential) {
      form.setFieldError('credential_id', 'Please re-select the credential.')
      return
    }
    if (!authorityOptions.some((o) => o.value === values.governing_authority_id)) {
      form.setFieldError('governing_authority_id', 'Please select a governing authority.')
      return
    }

    setLoadingRule(true)
    try {
      const fetchedRule = await fetchRequirementRule(values.credential_id)
      setRule(fetchedRule)
      setReviewedValues(values)
      setReviewCount((count) => count + 1)
    } catch {
      setReviewError('Could not load CPE requirements. Please try again.')
    } finally {
      setLoadingRule(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Step 2: Save (uses the snapshot taken at review time)
  // ---------------------------------------------------------------------------

  async function handleSave() {
    if (!reviewedValues) return
    setSaveError(null)
    setSaving(true)
    try {
      // TODO(CPE-TRACK): issued_date is required and validated on the form,
      // but `user_credentials` has no column for it yet, and
      // AddCredentialInput doesn't accept it — so it's intentionally left
      // out of this payload. See the "Add issued_date column" follow-up
      // ticket; wire it in here once the column exists.
      await addUserCredential({
        credential_id: reviewedValues.credential_id,
        governing_authority_id: reviewedValues.governing_authority_id,
        status_id: reviewedValues.status_id,
        cycle_start_date: reviewedValues.cycle_start_date,
        cycle_end_date: reviewedValues.cycle_end_date,
      })
      navigate('/credentials')
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

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
          <Button
            type="button"
            onClick={() => navigate('/credentials')}
            variant="secondary"
          >
            Back to Credentials
          </Button>
        </div>
      </div>
    )
  }

  const reviewedCredential = reviewedValues
    ? allCredentials.find((c) => c.credential_id === reviewedValues.credential_id) ?? null
    : null

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="main-content-area">
      <div className="main-content-header">
        <div>
          <h1>Add New Credential</h1>
          <p className="main-content-header-subtitle">
            Manage your professional credentials.
          </p>
        </div>
        <div className="header-actions">
          <Button
            type="button"
            onClick={() => navigate('/credentials/new')}
          >
            Add Credential
          </Button>
        </div>
      </div>

      <main className="form-body">

        {reviewError && (
          <div className="error-banner">{reviewError}</div>
        )}

        <Form<AddCredentialFormValues>
          initialValues={{
            credential_id: '',
            governing_authority_id: '',
            issued_date: '',
            status_id: 'STATUS_ACTIVE',
            cycle_start_date: '',
            cycle_end_date: '',
          }}
          validation={addCredentialValidation}
          onSubmit={handleReview}
          onValuesChange={resetReview}
          className='credential-form'
        >
          {(form) => {
            const authorityOptions =
              authorityOptionsByCredential.get(form.values.credential_id) ?? NO_AUTHORITIES
            const hasCredential = !!form.values.credential_id
            const hasChoice = authorityOptions.length > 1

            return (
              <>
                <SyncGoverningAuthority form={form} options={authorityOptions} />

                {/* 1. Credential Name (searchable; must pick from the list)
                    and 2. Governing Body (selected automatically when the
                    credential has one authority; user picks when several) */}
                <div className="field-row">
                  <div className="field-group">
                    <Select
                      form={form}
                      name="credential_id"
                      label="Credential Name"
                      placeholder="Search credentials…"
                      withAsterisk
                      searchable
                      allowDeselect={false}
                      nothingFoundMessage="No credentials found."
                      data={credentialOptions}
                      filter={filterCredentials}
                      renderOption={renderCredentialOption}
                    />
                  </div>

                  <div className="field-group field-gov-body">
                    {/* key: remount when the credential changes. Mantine's Select
                        keeps its own copy of the displayed text, and clearing the
                        value to '' doesn't reset it, so the old label lingered. */}
                    <Select
                      key={form.values.credential_id || 'no-credential'}
                      form={form}
                      name="governing_authority_id"
                      label="Governing Body"
                      withAsterisk
                      searchable={hasChoice}
                      allowDeselect={false}
                      disabled={!hasChoice}
                      placeholder={
                        !hasCredential
                          ? 'Determined by credential selection'
                          : 'Search governing authorities…'
                      }
                      nothingFoundMessage="No governing authorities found."
                      data={authorityOptions}
                      filter={filterAuthorities}
                      renderOption={renderAuthorityOption}
                    />
                  </div>
                </div>

                {/* 3. Credential Issued Date and 4. Status */}
                <div className="field-row">
                  <div className="field-group">
                    <Input
                      form={form}
                      name="issued_date"
                      type="date"
                      label="Credential Issued Date"
                      max={today}
                      withAsterisk
                    />
                  </div>

                  <div className="field-group">
                    <Select
                      form={form}
                      name="status_id"
                      label="Status"
                      withAsterisk
                      allowDeselect={false}
                      data={STATUS_OPTIONS}
                    />
                  </div>
                </div>

                {/* 5 & 6. Reporting Cycle Start / End Date */}
                <div className="field-row">
                  <div className="field-group">
                    <Input
                      form={form}
                      name="cycle_start_date"
                      type="date"
                      label="Reporting Cycle Start Date"
                      withAsterisk
                    />
                  </div>

                  <div className="field-group">
                    <Input
                      form={form}
                      name="cycle_end_date"
                      type="date"
                      label="Reporting Cycle End Date"
                      min={form.values.cycle_start_date || undefined}
                      withAsterisk
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="form-actions">
                  <Button
                    type="button"
                    onClick={() => navigate('/credentials')}
                    variant="cancel"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loadingRule}
                  >
                    {loadingRule ? 'Loading…' : reviewedValues ? 'Update & Review' : 'Review Requirements'}
                  </Button>
                </div>
              </>
            )
          }}
        </Form>

        {reviewedValues && reviewedCredential && (
          <>
            <hr className="form-divider" />
            <CredentialRequirementsPanel
              credential={reviewedCredential}
              rule={rule}
              saveError={saveError}
              saving={saving}
              onSave={handleSave}
              panelRef={panelRef}
            />
          </>
        )}

      </main>
    </div>
  )
}
