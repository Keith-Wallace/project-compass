import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import {
  getUserInfo,
  updateUserInfo,
  toFriendlyUserInfoError,
  type UserInfo as UserInfoRow,
  type UserInfoUpdate,
} from '../api/userInfoAPI'

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
  const navigate = useNavigate();
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
      <div className="flex min-h-screen items-center justify-center bg-[#F5F7FA] text-gray-500">
        Loading...
      </div>
    );
  }

  const inputClass =
    'w-full rounded-md border border-gray-300 px-3 py-2 text-[#0D1B4B] disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400';

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <button
          onClick={() => navigate('/settings')}
          className="mb-4 text-sm text-[#0D1B4B] hover:text-[#1DC8A8]"
        >
          &larr; Back to Settings
        </button>

        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-[#0D1B4B]">User Info</h1>

          {!isEditing ? (
            <button
              onClick={handleEditClick}
              className="rounded-md bg-[#0D1B4B] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="rounded-md bg-[#1DC8A8] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
          <div className="grid grid-cols-2 gap-4">
            <Field label="First Name">
              <input
                className={inputClass}
                disabled={!isEditing}
                value={form.first_name}
                onChange={(e) => handleChange('first_name', e.target.value)}
              />
            </Field>
            <Field label="Last Name">
              <input
                className={inputClass}
                disabled={!isEditing}
                value={form.last_name}
                onChange={(e) => handleChange('last_name', e.target.value)}
              />
            </Field>
          </div>

          <Field label="Company Name">
            <input
              className={inputClass}
              disabled={!isEditing}
              value={form.employer ?? ''}
              onChange={(e) => handleChange('employer', e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Company Size">
              <select
                className={inputClass}
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
                className={inputClass}
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
              className={inputClass}
              disabled={!isEditing}
              value={form.job_title ?? ''}
              onChange={(e) => handleChange('job_title', e.target.value)}
            />
          </Field>

          <Field label="Email">
            <input className={inputClass} disabled value={form.email} />
            <p className="mt-1 text-xs text-gray-400">
              To change your email, visit Security Settings.
            </p>
          </Field>

          <Field label="Secondary Email">
            <input
              type="email"
              className={inputClass}
              disabled={!isEditing}
              value={form.secondary_email ?? ''}
              onChange={(e) => handleChange('secondary_email', e.target.value)}
              placeholder="For account recovery"
            />
          </Field>

          <Field label="Phone Number">
            <input
              className={inputClass}
              disabled={!isEditing}
              value={form.phone_number ?? ''}
              onChange={(e) => handleChange('phone_number', e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Time Zone">
              <select
                className={inputClass}
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
                className={inputClass}
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
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-600">{label}</label>
      {children}
    </div>
  );
}
