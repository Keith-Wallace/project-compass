import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TextInput, type ComboboxItem, type OptionsFilter, type SelectProps } from '@mantine/core'
import { type UseFormReturnType } from '@mantine/form'
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
// Component
// ---------------------------------------------------------------------------

export default function AddCredentialPage() {
  const navigate = useNavigate()

  // Remote data
  const [allCredentials, setAllCredentials] = useState<CredentialWithOrg[]>([])
  const [allGoverningAuthoritys, setAllGoverningAuthoritys] = useState<GoverningAuthority[]>([])
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

    // Governing Body is always derived from the selected credential.
    const credential = allCredentials.find((c) => c.credential_id === values.credential_id)
    const authorityName = allGoverningAuthoritys.find(
      (o) => o.governing_authority_id === credential?.governing_authority_id
    )?.governing_authority_name
    if (!credential || !authorityName) {
      form.setFieldError(
        'credential_id',
        'Governing body could not be determined. Please re-select the credential.'
      )
      return
    }

    setLoadingRule(true)
    try {
      const fetchedRule = await fetchRequirementRule(values.credential_id)
      setRule(fetchedRule)
      setReviewedValues(values)
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
            issued_date: '',
            status_id: 'STATUS_ACTIVE',
            cycle_start_date: '',
            cycle_end_date: '',
          }}
          validation={addCredentialValidation}
          onSubmit={handleReview}
          onValuesChange={resetReview}
        >
          {(form) => {
            const selectedCredential = allCredentials.find(
              (c) => c.credential_id === form.values.credential_id
            )
            const selectedOrgName =
              allGoverningAuthoritys.find(
                (o) => o.governing_authority_id === selectedCredential?.governing_authority_id
              )?.governing_authority_name ?? ''

            return (
              <>
                {/* 1. Credential Name (searchable; must pick from the list)
                    and 2. Governing Body (derived, read-only) */}
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
                    <TextInput
                      label="Governing Body"
                      withAsterisk
                      value={selectedOrgName}
                      disabled
                      readOnly
                      placeholder="Determined by credential selection"
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
            />
          </>
        )}

      </main>
    </div>
  )
}
