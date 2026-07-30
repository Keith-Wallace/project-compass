import { useState, useEffect } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { getCategories } from '../../../shared/api/courseCategoriesAPI'
import type { CourseCategory } from '../../../shared/api/courseCategoriesAPI'
import { supabase } from '../../../supabase/supabase'
import SelectAutocomplete from '../../../shared/components/form/select-autocomplete'
import type { Provider } from '../../../shared/components/form/select-autocomplete'
import RollingThreeLogo from '../../../../assets/rolling-three-whitebg-logo.png'

import '../styles/course-form.css'

// ── helpers ───────────────────────────────────────────────────
const ACCEPTED_TYPES = ['application/pdf']
const MAX_FILE_MB    = 10

// ── local types ──────────────────────────────────────────────
type CreditRow = {
  id: string
  category_id: string
  total_credits: string
}

type ExistingCredit = {
  id: string
  category_id: string | null
  credits_earned: number | string
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

type FormErrors = Record<string, string>

const blankCredit = (): CreditRow => ({ id: crypto.randomUUID(), category_id: '', total_credits: '' })

function buildCreditRows(existingCredits?: ExistingCredit[]): CreditRow[] {
  if (!existingCredits?.length) return [blankCredit()]
  return existingCredits.map((c) => ({
    id:            c.id,
    category_id:   c.category_id ?? '',
    total_credits: String(c.credits_earned),  // DB column is credits_earned
  }))
}

export default function CourseForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id }   = useParams()

  const existingCourse = (location.state as { course?: ExistingCourse } | null)?.course || null
  const isEditing      = !!id

  // ── form state ────────────────────────────────────────────
  const [title,        setTitle]        = useState(existingCourse?.course_title || '')
  const [provider,     setProvider]     = useState<Provider | null>(null)          // full provider object
  const [startDate,    setStartDate]    = useState(existingCourse?.start_date?.split('T')[0] || '')
  const [endDate,      setEndDate]      = useState(existingCourse?.completion_date?.split('T')[0] || '')
  const [credits,      setCredits]      = useState<CreditRow[]>([blankCredit()])
  const [notes,        setNotes]        = useState(existingCourse?.notes || '')
  const [certFile,     setCertFile]     = useState<File | null>(null)
  const [existingCert, setExistingCert] = useState(existingCourse?.certificate_url || null)
  const [dragActiveCert, setDragActiveCert] = useState(false)

  // Additional / supporting documents (optional, multiple files)
  const [otherDocs,        setOtherDocs]        = useState<File[]>([])   // File[] staged for upload
  const [existingOtherDocs, setExistingOtherDocs] = useState<string[]>(existingCourse?.other_documents || [])
  const [dragActiveDocs,   setDragActiveDocs]   = useState(false)
  const [docsError,        setDocsError]        = useState('')

  const [categories,   setCategories]   = useState<CourseCategory[]>([])
  const [submitting,   setSubmitting]   = useState(false)
  const [errors,       setErrors]       = useState<FormErrors>({})
  const [fileError,    setFileError]    = useState('')
  const [success,      setSuccess]      = useState(false)

  // ── seed edit data ────────────────────────────────────────
  useEffect(() => {
    if (!existingCourse) return

    if (existingCourse.provider_id) {
      supabase
        .from('providers')
        .select('*')
        .eq('id', existingCourse.provider_id)
        .single()
        .then(({ data }: { data: Provider | null }) => { if (data) setProvider(data) })
    }

    supabase
      .from('course_category_credits')
      .select('*')
      .eq('course_id', existingCourse.id)
      .then(({ data }: { data: ExistingCredit[] | null }) => {
        if (data?.length) setCredits(buildCreditRows(data))
      })
  }, [existingCourse])

  // ── load categories ───────────────────────────────────────
  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(err => setErrors(prev => ({ ...prev, submit: err.message })))
  }, [])

  // ── credit row handlers ───────────────────────────────────
  const updateCredit = (rowId: string, field: keyof CreditRow, val: string) =>
    setCredits(prev => prev.map(r => r.id === rowId ? { ...r, [field]: val } : r))

  const addCreditRow = () =>
    setCredits(prev => [...prev, blankCredit()])

  const removeCreditRow = (rowId: string) =>
    setCredits(prev => prev.length === 1 ? prev : prev.filter(r => r.id !== rowId))

  // ── file handler ──────────────────────────────────────────
  const processCertFile = (file?: File | null) => {
    setFileError('')
    if (!file) return
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFileError('Only PDF files are accepted.')
      return
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setFileError(`File must be under ${MAX_FILE_MB} MB.`)
      return
    }
    setCertFile(file)
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    processCertFile(e.target.files?.[0])
    e.target.value = '' // allow re-selecting the same file later
  }

  const clearFile = () => {
    setCertFile(null)
    setExistingCert(null)
  }

  // Drag-and-drop is just an alternate way to feed processCertFile a file
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }
  const handleCertDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActiveCert(true)
  }
  const handleCertDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActiveCert(false)
  }
  const handleCertDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActiveCert(false)
    processCertFile(e.dataTransfer.files?.[0])
  }

  // ── additional documents handlers (optional, multiple) ─────
  const processOtherDocFiles = (fileList: FileList | null) => {
    const incoming = Array.from(fileList || [])
    if (!incoming.length) return
    setDocsError('')

    const accepted: File[] = []
    for (const file of incoming) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setDocsError('Only PDF files are accepted.')
        continue
      }
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        setDocsError(`Each file must be under ${MAX_FILE_MB} MB.`)
        continue
      }
      accepted.push(file)
    }
    if (accepted.length) setOtherDocs(prev => [...prev, ...accepted])
  }

  const handleOtherDocsInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    processOtherDocFiles(e.target.files)
    e.target.value = ''
  }

  const handleDocsDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActiveDocs(true)
  }
  const handleDocsDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActiveDocs(false)
  }
  const handleDocsDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActiveDocs(false)
    processOtherDocFiles(e.dataTransfer.files)
  }

  const removeOtherDoc = (idx: number) =>
    setOtherDocs(prev => prev.filter((_, i) => i !== idx))

  const removeExistingOtherDoc = (idx: number) =>
    setExistingOtherDocs(prev => prev.filter((_, i) => i !== idx))

  // ── validation ────────────────────────────────────────────
  const validate = (): FormErrors => {
    const e: FormErrors = {}
    if (!title.trim())  e.title    = 'Course title is required.'
    if (!provider)      e.provider = 'Please select a provider.'
    if (!endDate)       e.endDate  = 'Completion date is required.'
    if (startDate && endDate && startDate > endDate)
      e.endDate = 'Completion date must be on or after start date.'

    credits.forEach((row, i) => {
      if (!row.category_id)
        e[`credit_cat_${i}`] = 'Select a subject.'
      const val = parseFloat(row.total_credits)
      if (!row.total_credits || isNaN(val) || val <= 0 || Math.round(val * 10) / 10 !== val)
        e[`credit_hrs_${i}`] = 'Enter credits in 0.1 increments.'
    })

    return e
  }

  // ── upload certificate ────────────────────────────────────
  const uploadCertificate = async (courseId: string) => {
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
  const uploadOtherDocuments = async (courseId: string) => {
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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validation = validate()
    if (Object.keys(validation).length || !provider) {
      setErrors(validation)
      return
    }
    setErrors({})
    setSubmitting(true)
    setSuccess(false)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error('You must be signed in to log a course.')

      const coursePayload = {
        course_title:     title.trim(),
        provider_id:      provider.id,
        start_date:       startDate || null,
        completion_date:  endDate,
        notes:            notes.trim() || null,
        user_id:          user.id,
      }

      let courseId = existingCourse?.id

      if (isEditing) {
        const { error } = await supabase
          .from('cpe_courses')
          .update(coursePayload)
          .eq('id', courseId)
        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from('cpe_courses')
          .insert(coursePayload)
          .select('id')
          .single()
        if (error) throw error
        courseId = data.id
      }

      if (!courseId) throw new Error('Course ID is missing after save.')

      // Upload certificate and patch URL
      const certUrl = await uploadCertificate(courseId)
      if (certUrl !== (existingCourse?.certificate_url ?? null)) {
        await supabase
          .from('cpe_courses')
          .update({ certificate_url: certUrl })
          .eq('id', courseId)
      }

      // Upload additional/supporting documents and patch the list
      const otherDocPaths = await uploadOtherDocuments(courseId)
      const priorOtherDocs = existingCourse?.other_documents ?? []
      if (JSON.stringify(otherDocPaths) !== JSON.stringify(priorOtherDocs)) {
        await supabase
          .from('cpe_courses')
          .update({ other_documents: otherDocPaths })
          .eq('id', courseId)
      }

      // Replace credit rows: delete old, insert new
      if (isEditing) {
        await supabase.from('course_category_credits').delete().eq('course_id', courseId)
      }
      const creditInserts = credits.map(r => ({
        course_id:      courseId,
        category_id:    r.category_id,
        credits_earned: parseFloat(r.total_credits),
      }))
      const { error: creditErr } = await supabase
        .from('course_category_credits')
        .insert(creditInserts)
      if (creditErr) throw creditErr

      setSuccess(true)
      setTimeout(() => navigate('/'), 1200)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setErrors(prev => ({ ...prev, submit: message }))
    } finally {
      setSubmitting(false)
    }
  }

  // ── render ────────────────────────────────────────────────
  return (
    <>
      <div className="form-root">

        <header className="form-header">
          <div className="form-header-left">
            <button className="back-btn" onClick={() => navigate('/')}>
              ← Back
            </button>
            <div className="form-logo">
              <img src={RollingThreeLogo} alt="Rolling Three" height="100" />
            </div>
          </div>
        </header>

        <main className="form-body">
          {/* <div className="form-eyebrow">{isEditing ? 'Edit Record' : 'New Record'}</div> */}
          <h1 className="form-title">
            {isEditing ? 'Update Course' : 'Add New Course'}
          </h1>

          {errors.submit && (
            <div className="error-banner">Error: {errors.submit}</div>
          )}
          {success && (
            <div className="success-banner">
              {isEditing ? 'Course updated.' : 'Course logged.'} Redirecting...
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Course Title */}
            <div className="field-group">
              <label className="field-label">
                Course Title <span className="field-required">*</span>
              </label>
              <input
                className={`field-input${errors.title ? ' field-input--error' : ''}`}
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Advanced Tax Planning Strategies"
              />
              {errors.title && <span className="field-error-msg">{errors.title}</span>}
            </div>

            {/* Select Autocomplete */}
            <div className="field-group">
              <label className="field-label">
                Provider / Sponsor <span className="field-required">*</span>
              </label>
              <SelectAutocomplete value={provider} onChange={setProvider} />
              {errors.provider && <span className="field-error-msg">{errors.provider}</span>}
            </div>

            {/* Dates */}
            <div className="field-row">
              <div className="field-group">
                <label className="field-label">Start Date</label>
                <input
                  className="field-input"
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                />
              </div>
              <div className="field-group">
                <label className="field-label">
                  Completion Date <span className="field-required">*</span>
                </label>
                <input
                  className={`field-input${errors.endDate ? ' field-input--error' : ''}`}
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                />
                {errors.endDate && <span className="field-error-msg">{errors.endDate}</span>}
              </div>
            </div>

            {/* <hr className="form-divider" /> */}

            {/* CPE Credits */}
            <div className="field-group">
              <label className="field-label">
                CPE Credits <span className="field-required">*</span>
              </label>
              <div className="credits-list">
                {credits.map((row, i) => (
                  <div key={row.id} className="credit-row">

                    {/* Subject / Field of Study */}
                    <div className="credit-col">
                      <select
                        className={`field-select${errors[`credit_cat_${i}`] ? ' field-select--error' : ''}`}
                        value={row.category_id}
                        onChange={e => updateCredit(row.id, 'category_id', e.target.value)}
                        aria-label="Subject / Field of Study"
                      >
                        <option value="">Subject / Field of Study</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                      {errors[`credit_cat_${i}`] && (
                        <span className="field-error-msg">{errors[`credit_cat_${i}`]}</span>
                      )}
                    </div>

                    {/* Total Credits */}
                    <div className="credit-col">
                      <input
                        type="number"
                        className={`field-input${errors[`credit_hrs_${i}`] ? ' field-input--error' : ''}`}
                        value={row.total_credits}
                        onChange={e => updateCredit(row.id, 'total_credits', e.target.value)}
                        placeholder="Credits"
                        min="0.1"
                        step="0.1"
                        aria-label="Total CPE credits"
                      />
                      {errors[`credit_hrs_${i}`] && (
                        <span className="field-error-msg">{errors[`credit_hrs_${i}`]}</span>
                      )}
                    </div>
                    {/* <div className="credit-col">
                      <CredentialFocusSelect />
                    </div> */}
                    <select className="field-select">
                      <option value="">Credential Focus</option>
                    </select>

                    {/* Remove row */}
                    <button
                      type="button"
                      className="credit-remove-btn"
                      onClick={() => removeCreditRow(row.id)}
                      disabled={credits.length === 1}
                      aria-label="Remove this credit row"
                      title="Remove"
                    >
                      −
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="add-credit-btn"
                onClick={addCreditRow}
              >
                + Add Another Subject
              </button>
            </div>

            <hr className="form-divider" />

            {/* Certificate Upload */}
            <div className="field-group">
              <label className="field-label">Certificate Attachment</label>

              {/* Existing cert (edit mode, not replaced) */}
              {existingCert && !certFile && (
                <div className="cert-file-row">
                  <span className="cert-file-name">📄 Current certificate on file</span>
                  <button type="button" className="btn-ghost-sm" onClick={clearFile}>
                    Remove
                  </button>
                </div>
              )}

              {/* Upload zone (no file selected yet) */}
              {!existingCert && !certFile && (
                <label
                  className={`cert-upload-zone${dragActiveCert ? ' cert-upload-zone--active' : ''}`}
                  htmlFor="cert-upload"
                  onDragOver={handleDragOver}
                  onDragEnter={handleCertDragEnter}
                  onDragLeave={handleCertDragLeave}
                  onDrop={handleCertDrop}
                >
                  <span className="cert-upload-icon">📎</span>
                  <span className="cert-upload-label">
                    {dragActiveCert ? 'Drop PDF to upload' : 'Click or drag & drop PDF certificate'}
                  </span>
                  <span className="cert-upload-hint">PDF only · max {MAX_FILE_MB} MB</span>
                  <input
                    id="cert-upload"
                    type="file"
                    accept="application/pdf"
                    className="cert-upload-input"
                    onChange={handleFile}
                  />
                </label>
              )}

              {/* New file selected */}
              {certFile && (
                <div className="cert-file-row">
                  <span className="cert-file-name">📄 {certFile.name}</span>
                  <button type="button" className="btn-ghost-sm" onClick={clearFile}>
                    Remove
                  </button>
                </div>
              )}

              {fileError && <span className="field-error-msg">{fileError}</span>}
            </div>

            {/* Additional / Supporting Documents (optional, multiple) */}
            <div className="field-group">
              <label className="field-label">
                Additional Documents <span className="field-optional">(optional)</span>
              </label>

              <label
                className={`cert-upload-zone${dragActiveDocs ? ' cert-upload-zone--active' : ''}`}
                htmlFor="other-docs-upload"
                onDragOver={handleDragOver}
                onDragEnter={handleDocsDragEnter}
                onDragLeave={handleDocsDragLeave}
                onDrop={handleDocsDrop}
              >
                <span className="cert-upload-icon">📎</span>
                <span className="cert-upload-label">
                  {dragActiveDocs
                    ? 'Drop files to upload'
                    : 'Click or drag & drop supporting documents'}
                </span>
                <span className="cert-upload-hint">
                  PDF only · max {MAX_FILE_MB} MB each · multiple files allowed
                </span>
                <input
                  id="other-docs-upload"
                  type="file"
                  accept="application/pdf"
                  multiple
                  className="cert-upload-input"
                  onChange={handleOtherDocsInput}
                />
              </label>

              {(existingOtherDocs.length > 0 || otherDocs.length > 0) && (
                <div className="cert-file-list">
                  {existingOtherDocs.map((path, i) => (
                    <div className="cert-file-row" key={`existing-doc-${i}`}>
                      <span className="cert-file-name">📄 Document {i + 1} on file</span>
                      <button
                        type="button"
                        className="btn-ghost-sm"
                        onClick={() => removeExistingOtherDoc(i)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {otherDocs.map((file, i) => (
                    <div className="cert-file-row" key={`new-doc-${i}`}>
                      <span className="cert-file-name">📄 {file.name}</span>
                      <button
                        type="button"
                        className="btn-ghost-sm"
                        onClick={() => removeOtherDoc(i)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {docsError && <span className="field-error-msg">{docsError}</span>}
            </div>

            {/* Notes */}
            <div className="field-group">
              <label className="field-label">Notes</label>
              <textarea
                className="field-textarea"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Any additional notes about this course..."
              />
            </div>

            {/* Actions */}
            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => navigate('/')}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-submit"
                disabled={submitting}
              >
                {submitting
                  ? (isEditing ? 'Saving...' : 'Logging...')
                  : (isEditing ? 'Save Changes' : 'Add Course')
                }
              </button>
            </div>

          </form>
        </main>
      </div>
    </>
  )
}
