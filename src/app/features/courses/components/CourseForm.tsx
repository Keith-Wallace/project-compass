import { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { getCategories } from '../../../shared/api/courseCategoriesAPI';
import type { CourseCategory } from '../../../shared/api/courseCategoriesAPI';
import { getUserCredentialOptions, type CredentialOption } from '../api/userCredentialsAPI';
import { supabase } from '../../../supabase/supabase';
import { TbFileUpload } from "react-icons/tb";
import { Button } from '../../../shared/components/button/Button';
import { Form } from '../../../shared/components/form/Form';
import { Input } from '../../../shared/components/form/Input';
import { Select } from '../../../shared/components/form/Select';
import { MultiSelect } from '../../../shared/components/form/MultiSelect';
import { TextArea } from '../../../shared/components/form/TextArea';
import { FormDropZone } from '../../../shared/components/form/FormDropZone';
import { ProviderAutocomplete, type Provider } from './ProviderAutocomplete';
import {
  courseFormValidation,
  blankCreditRow,
  type CourseFormValues,
  type CreditRow,
} from './CourseForm.validation';

import '../styles/course-form.css'

const ACCEPTED_TYPES = ['application/pdf']
const MAX_FILE_MB    = 10

type ExistingCredit = {
  id: string
  category_id: string | null
  credits_earned: number | string
  course_category_credit_credentials: { credential_id: string }[] | null
}

type ExistingCourse = {
  id: string
  course_title?: string
  start_date?: string | null
  completion_date?: string | null
  notes?: string | null
  certificate_url?: string | null
  other_documents?: string[]
  provider_id?: string | null
}

function buildCreditRows(existingCredits?: ExistingCredit[]): CreditRow[] {
  if (!existingCredits?.length) return [blankCreditRow()]
  return existingCredits.map((c) => ({
    id:            c.id,
    category_id:   c.category_id ?? '',
    total_credits: String(c.credits_earned),  // DB column is credits_earned
    credential_ids: (c.course_category_credit_credentials ?? []).map((cc) => cc.credential_id),
  }))
}

export default function CourseForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id }   = useParams()

  const existingCourse = (location.state as { course?: ExistingCourse } | null)?.course || null
  const isEditing      = !!id

  const [categories, setCategories]           = useState<CourseCategory[]>([])
  const [credentialOptions, setCredentialOptions] = useState<CredentialOption[]>([])
  const [initialCredits, setInitialCredits]   = useState<CreditRow[]>([blankCreditRow()])
  const [initialProvider, setInitialProvider] = useState<Provider | null>(null)
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(true)

  // Already-uploaded files (server-side paths) are kept separate from the
  // form's own values — the form only ever holds newly staged File objects.
  const [existingCert, setExistingCert]         = useState<string | null>(existingCourse?.certificate_url || null)
  const [existingOtherDocs, setExistingOtherDocs] = useState<string[]>(existingCourse?.other_documents || [])

  const [submitting,  setSubmitting]  = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [fileError,   setFileError]   = useState('')
  const [docsError,   setDocsError]   = useState('')
  const [success,     setSuccess]     = useState(false)

  // ── load categories + (if editing) existing credits/provider ──
  useEffect(() => {
    (async () => {
      try {
        const [cats, credOptions] = await Promise.all([
          getCategories(),
          getUserCredentialOptions(),
        ])
        setCategories(cats)
        setCredentialOptions(credOptions)

        if (existingCourse) {
          const [creditsResult, providerResult] = await Promise.all([
            supabase
              .from('course_category_credits')
              .select('id, category_id, credits_earned, course_category_credit_credentials(credential_id)')
              .eq('course_id', existingCourse.id),
            existingCourse.provider_id
              ? supabase.from('providers').select('*').eq('id', existingCourse.provider_id).single()
              : Promise.resolve({ data: null }),
          ])

          if (creditsResult.data?.length) {
            setInitialCredits(buildCreditRows(creditsResult.data as ExistingCredit[]))
          }
          if (providerResult.data) {
            setInitialProvider(providerResult.data as Provider)
          }
        }
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : 'Failed to load form data.')
      } finally {
        setIsLoadingInitialData(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── upload certificate ────────────────────────────────────
  const uploadCertificate = async (courseId: string, certFile: File | null) => {
    if (!certFile) return existingCert ?? null

    const ext  = certFile.name.split('.').pop()
    const path = `${courseId}/${Date.now()}.${ext}`

    const { error } = await supabase.storage
      .from('cpe-certificates')
      .upload(path, certFile, { upsert: true, contentType: 'application/pdf' })

    if (error) throw new Error(`Certificate upload failed: ${error.message}`)
    return path
  }

  // ── upload additional/supporting documents ──────────────────
  const uploadOtherDocuments = async (courseId: string, otherDocs: File[]) => {
    const paths = [...existingOtherDocs]

    for (const file of otherDocs) {
      const ext  = file.name.split('.').pop()
      const path = `${courseId}/other/${Date.now()}-${crypto.randomUUID()}.${ext}`

      const { error } = await supabase.storage
        .from('cpe-certificates')
        .upload(path, file, { upsert: true, contentType: 'application/pdf' })

      if (error) throw new Error(`Document upload failed (${file.name}): ${error.message}`)
      paths.push(path)
    }

    return paths
  }

  // ── submit ────────────────────────────────────────────────
  const handleSubmit = async (values: CourseFormValues) => {
    setSubmitError(null)
    setSubmitting(true)
    setSuccess(false)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('You must be signed in to log a course.')

      // Saves the course, its credit lines, and their credential selections
      // in one transaction. Returns the course id (new or existing).
      // See migration 0010.
      const { data: courseId, error: saveErr } = await supabase.rpc('save_course', {
        p_course: {
          course_title:    values.title.trim(),
          provider_id:     values.provider_id,
          start_date:      values.startDate || null,
          completion_date: values.endDate,
          notes:           values.notes.trim() || null,
        },
        p_credits: values.credits.map((r) => ({
          id:             r.id,
          category_id:    r.category_id,
          credits_earned: parseFloat(r.total_credits),
          credential_ids: r.credential_ids,
        })),
        // Left out for new courses, so the database creates one.
        p_course_id: isEditing ? id : undefined,
      })
      if (saveErr) throw saveErr
      if (!courseId) throw new Error('Course ID is missing after save.')

      // Files upload after the database save (storage can't be part of the
      // transaction). If an upload fails, the course is already saved and
      // the user can re-attach the file by editing it.
      const certUrl = await uploadCertificate(courseId, values.certFile)
      if (certUrl !== (existingCourse?.certificate_url ?? null)) {
        const { error } = await supabase
          .from('cpe_courses')
          .update({ certificate_url: certUrl })
          .eq('id', courseId)
        if (error) throw error
      }

      const otherDocPaths = await uploadOtherDocuments(courseId, values.otherDocs)
      const priorOtherDocs = existingCourse?.other_documents ?? []
      if (JSON.stringify(otherDocPaths) !== JSON.stringify(priorOtherDocs)) {
        const { error } = await supabase
          .from('cpe_courses')
          .update({ other_documents: otherDocPaths })
          .eq('id', courseId)
        if (error) throw error
      }

      setSuccess(true)
      setTimeout(() => navigate('/'), 1200)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setSubmitError(message)
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoadingInitialData) {
    return (
      <div className="main-content-area">
        <main className="form-body">Loading...</main>
      </div>
    )
  }

  const initialValues: CourseFormValues = {
    title:      existingCourse?.course_title || '',
    provider_id: initialProvider?.id || '',
    startDate:  existingCourse?.start_date?.split('T')[0] || '',
    endDate:    existingCourse?.completion_date?.split('T')[0] || '',
    notes:      existingCourse?.notes || '',
    certFile:   null,
    otherDocs:  [],
    credits:    initialCredits,
  }

  return (
    <>
      <div className="main-content-area">
        <div className="main-content-header">
          <div>
            <h1>My Courses & Activities</h1>
            <p className="courses-page-subtitle">
              All of your logged continuing education courses.
            </p>
          </div>
          <div className="header-actions">
            <Button onClick={() => navigate('/courses/new')}>
              Add Course
            </Button>
          </div>
        </div>

        <main className="form-body">
          <h1 className="form-title">
            {isEditing ? 'Update Course' : 'Add New Course'}
          </h1>

          {submitError && (
            <div className="error-banner">Error: {submitError}</div>
          )}
          {success && (
            <div className="success-banner">
              {isEditing ? 'Course updated.' : 'Course logged.'} Redirecting...
            </div>
          )}

          <Form<CourseFormValues>
            initialValues={initialValues}
            validation={courseFormValidation}
            onSubmit={handleSubmit}
            className='courses-form'
          >
            {(form) => (
              <>
                {/* Course Title */}
                <div className="field-group">
                  <Input
                    form={form}
                    name="title"
                    label="Course Title"
                    placeholder="e.g. Advanced Tax Planning Strategies"
                    withAsterisk
                  />
                </div>

                {/* Provider */}
                <div className="field-group">
                  <ProviderAutocomplete
                    form={form}
                    name="provider_id"
                    initialProvider={initialProvider}
                    label="Provider / Sponsor"
                  />
                </div>

                {/* Dates */}
                <div className="field-row">
                  <div className="field-group">
                    <Input form={form} name="startDate" type="date" label="Start Date" />
                  </div>
                  <div className="field-group">
                    <Input form={form} name="endDate" type="date" label="Completion Date" withAsterisk />
                  </div>
                </div>

                {/* CPE Credits — fields are bound by array path
                    (e.g. credits.0.category_id), which is why Input/Select's
                    `name` accepts FormFieldName<T> instead of just keyof T */}
                <div className="field-group">
                  <label className="field-label">
                    CPE Credits <span className="field-required">*</span>
                  </label>
                  <div className="credits-list">
                    {form.values.credits.map((row, i) => (
                      <div key={row.id} className="credit-row">
                        <div className="credit-col">
                          <Select
                            form={form}
                            name={`credits.${i}.category_id`}
                            placeholder="Subject / Field of Study"
                            aria-label="Subject / Field of Study"
                            data={categories.map((cat) => ({ value: cat.id, label: cat.name }))}
                          />
                        </div>

                        <div className="credit-col">
                          <Input
                            form={form}
                            name={`credits.${i}.total_credits`}
                            type="number"
                            placeholder="Credits"
                            min="0.1"
                            step="0.1"
                            aria-label="Total CPE credits"
                          />
                        </div>

                        <MultiSelect
                          form={form}
                          name={`credits.${i}.credential_ids`}
                          data={credentialOptions}
                          placeholder={
                            credentialOptions.length === 0
                              ? 'No credentials on file'
                              : row.credential_ids.length === 0
                                ? 'Credential Focus'
                                : undefined  // hide once anything is selected
                          }
                          aria-label="Credential Focus"
                          disabled={credentialOptions.length === 0}
                          searchable
                          clearable
                          hidePickedOptions
                        />

                        <Button
                          type="button"
                          variant="cancel"
                          onClick={() => form.removeListItem('credits', i)}
                          disabled={form.values.credits.length === 1}
                          aria-label="Remove this credit row"
                        >
                          −
                        </Button>
                      </div>
                    ))}
                  </div>

                  <Button type="button" onClick={() => form.insertListItem('credits', blankCreditRow())}>
                    Add Another Subject
                  </Button>
                </div>

                <hr className="form-divider" />

                {/* Certificate Upload */}
                <div className="field-group">
                  <label className="field-label">Certificate Attachment</label>

                  {existingCert && !form.values.certFile && (
                    <div className="cert-file-row">
                      <span className="cert-file-name">📄 Current certificate on file</span>
                      <Button type="button" onClick={() => setExistingCert(null)} variant="cancel">
                        Remove
                      </Button>
                    </div>
                  )}

                  {!existingCert && !form.values.certFile && (
                    <FormDropZone
                      form={form}
                      name="certFile"
                      accept={ACCEPTED_TYPES}
                      maxSize={MAX_FILE_MB * 1024 * 1024}
                      onReject={setFileError}
                      className="cert-upload-zone"
                    >
                      <span className="cert-upload-icon"><TbFileUpload className="icon" aria-hidden="true" /></span>
                      <span className="cert-upload-label">Click or drag &amp; drop PDF certificate</span>
                      <span className="cert-upload-hint">PDF only · max {MAX_FILE_MB} MB</span>
                    </FormDropZone>
                  )}

                  {form.values.certFile && (
                    <div className="cert-file-row">
                      <span className="cert-file-name">📄 {form.values.certFile.name}</span>
                      <Button type="button" variant="cancel" onClick={() => form.setFieldValue('certFile', null)}>
                        Remove
                      </Button>
                    </div>
                  )}

                  {fileError && <span className="field-error-msg">{fileError}</span>}
                </div>

                {/* Additional / Supporting Documents (optional, multiple) */}
                <div className="field-group">
                  <label className="field-label">
                    Additional Documents <span className="field-optional">(optional)</span>
                  </label>

                  <FormDropZone
                    form={form}
                    name="otherDocs"
                    multiple
                    accept={ACCEPTED_TYPES}
                    maxSize={MAX_FILE_MB * 1024 * 1024}
                    onReject={setDocsError}
                    className="cert-upload-zone"
                  >
                    <span className="cert-upload-icon"><TbFileUpload className="icon" aria-hidden="true" /></span>
                    <span className="cert-upload-label">Click or drag &amp; drop supporting documents</span>
                    <span className="cert-upload-hint">
                      PDF only · max {MAX_FILE_MB} MB each · multiple files allowed
                    </span>
                  </FormDropZone>

                  {(existingOtherDocs.length > 0 || form.values.otherDocs.length > 0) && (
                    <div className="cert-file-list">
                      {existingOtherDocs.map((_path, i) => (
                        <div className="cert-file-row" key={`existing-doc-${i}`}>
                          <span className="cert-file-name">📄 Document {i + 1} on file</span>
                          <Button
                            type="button"
                            onClick={() => setExistingOtherDocs((prev) => prev.filter((_, idx) => idx !== i))}
                            variant="cancel"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                      {form.values.otherDocs.map((file, i) => (
                        <div className="cert-file-row" key={`new-doc-${i}`}>
                          <span className="cert-file-name">📄 {file.name}</span>
                          <Button
                            type="button"
                            onClick={() =>
                              form.setFieldValue(
                                'otherDocs',
                                form.values.otherDocs.filter((_, idx) => idx !== i),
                              )
                            }
                            variant="cancel"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {docsError && <span className="field-error-msg">{docsError}</span>}
                </div>

                {/* Notes */}
                <div className="field-group">
                  <TextArea
                    form={form}
                    name="notes"
                    label="Notes"
                    placeholder="Any additional notes about this course..."
                  />
                </div>

                {/* Actions */}
                <div className="form-actions">
                  <Button
                    type="button"
                    onClick={() => navigate('/')}
                    disabled={submitting}
                    variant="cancel"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting
                      ? (isEditing ? 'Saving...' : 'Logging...')
                      : (isEditing ? 'Save Changes' : 'Add Course')
                    }
                  </Button>
                </div>
              </>
            )}
          </Form>
        </main>
      </div>
    </>
  )
}
