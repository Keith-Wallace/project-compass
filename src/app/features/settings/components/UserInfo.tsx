import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import {
  getUserInfo,
  updateUserInfo,
  toFriendlyUserInfoError,
  type UserInfo as UserInfoRow,
  type UserInfoUpdate,
} from '../api/userInfoAPI'
import { Button } from '../../../shared/components/buttons/Buttons';


import '../styles/user-info.css';

// ------------------------------------------------------------
// Select field option lists — must stay in sync with the CHECK
// constraints in 0005_user_info_settings_fields.sql.
// ------------------------------------------------------------
const COMPANY_SIZE_OPTIONS = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  '1000+',
  'Self-employed',
];

const INDUSTRY_OPTIONS = [
  'Accounting / Finance',
  'Information Technology / Cybersecurity',
  'Healthcare',
  'Legal',
  'Insurance',
  'Government / Public Sector',
  'Education',
  'Other',
];

const DATE_FORMAT_OPTIONS = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'];

// IANA timezone list, validated client-side per the architecture
// doc rather than a DB CHECK constraint.
const TIME_ZONE_OPTIONS: string[] =
  typeof Intl.supportedValuesOf === 'function'
    ? Intl.supportedValuesOf('timeZone')
    : ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles'];

const EMPTY_FORM: UserInfoRow = {
  first_name: '',
  last_name: '',
  employer: '',
  company_size: '',
  industry: '',
  job_title: '',
  email: '',
  secondary_email: '',
  phone_number: '',
  time_zone: '',
  date_format: 'MM/DD/YYYY',
};

export default function UserInfo() {
  const { user } = useAuth();

  const [form, setForm] = useState<UserInfoRow>(EMPTY_FORM);
  const [savedForm, setSavedForm] = useState<UserInfoRow>(EMPTY_FORM);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    (async () => {
      try {
        const data = await getUserInfo(user.id);
        setForm(data);
        setSavedForm(data);
      } catch (err) {
        setError(toFriendlyUserInfoError(err));
      } finally {
        setIsLoading(false);
      }
    })();
  }, [user?.id]);

  function handleChange<K extends keyof UserInfoRow>(field: K, value: UserInfoRow[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleEditClick() {
    setError(null);
    setIsEditing(true);
  }

  function handleCancel() {
    setForm(savedForm);
    setError(null);
    setIsEditing(false);
  }

  async function handleSave() {
    if (!user?.id) return;
    setIsSaving(true);
    setError(null);

    // email is excluded — read-only on this page
    const { email, ...updates } = form;
    const payload: UserInfoUpdate = updates;

    try {
      await updateUserInfo(user.id, payload);
      setSavedForm(form);
      setIsEditing(false);
    } catch (err) {
      setError(toFriendlyUserInfoError(err));
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="main-content-area">
        <div className="settings-form-wrap">Loading...</div>
      </div>
    );
  }

  return (
    <div className="main-content-area">
      <div className="main-content-header">
        <div>
          <h1>User Info</h1>
          <p className="main-content-header-subtitle">
            Subtitle copy text TBA
          </p>
        </div>
        <div className="header-actions">
          {!isEditing ? (
            <Button
              onClick={handleEditClick}
              variant="primary"
            >
              Edit
            </Button>
          ) : (
            <>
              <Button
                onClick={handleCancel}
                disabled={isSaving}
                variant="cancel"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                variant="primary"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="settings-form-wrap">

        {error && <div className="error-banner">{error}</div>}

        <div className="settings-card">
          <div className="field-row">
            <Field label="First Name">
              <input
                className="field-input"
                disabled={!isEditing}
                value={form.first_name}
                onChange={(e) => handleChange('first_name', e.target.value)}
              />
            </Field>
            <Field label="Last Name">
              <input
                className="field-input"
                disabled={!isEditing}
                value={form.last_name}
                onChange={(e) => handleChange('last_name', e.target.value)}
              />
            </Field>
          </div>

          <Field label="Company Name">
            <input
              className="field-input"
              disabled={!isEditing}
              value={form.employer ?? ''}
              onChange={(e) => handleChange('employer', e.target.value)}
            />
          </Field>

          <div className="field-row">
            <Field label="Company Size">
              <select
                className="field-select"
                disabled={!isEditing}
                value={form.company_size ?? ''}
                onChange={(e) => handleChange('company_size', e.target.value)}
              >
                <option value="">Select...</option>
                {COMPANY_SIZE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Industry">
              <select
                className="field-select"
                disabled={!isEditing}
                value={form.industry ?? ''}
                onChange={(e) => handleChange('industry', e.target.value)}
              >
                <option value="">Select...</option>
                {INDUSTRY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Job Title">
            <input
              className="field-input"
              disabled={!isEditing}
              value={form.job_title ?? ''}
              onChange={(e) => handleChange('job_title', e.target.value)}
            />
          </Field>

          <Field label="Email">
            <input className="field-input" disabled value={form.email} />
            <p className="field-hint">
              To change your email, visit Security Settings.
            </p>
          </Field>

          <Field label="Secondary Email">
            <input
              type="email"
              className="field-input"
              disabled={!isEditing}
              value={form.secondary_email ?? ''}
              onChange={(e) => handleChange('secondary_email', e.target.value)}
              placeholder="For account recovery"
            />
          </Field>

          <Field label="Phone Number">
            <input
              className="field-input"
              disabled={!isEditing}
              value={form.phone_number ?? ''}
              onChange={(e) => handleChange('phone_number', e.target.value)}
            />
          </Field>

          <hr className="form-divider" />

          <div className="field-row">
            <Field label="Time Zone">
              <select
                className="field-select"
                disabled={!isEditing}
                value={form.time_zone ?? ''}
                onChange={(e) => handleChange('time_zone', e.target.value)}
              >
                <option value="">Select...</option>
                {TIME_ZONE_OPTIONS.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Date Format">
              <select
                className="field-select"
                disabled={!isEditing}
                value={form.date_format}
                onChange={(e) => handleChange('date_format', e.target.value)}
              >
                {DATE_FORMAT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="field-group">
      <label className="field-label">{label}</label>
      {children}
    </div>
  );
}
