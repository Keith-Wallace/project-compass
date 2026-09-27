import { useEffect, useState } from 'react';
import { TextInput } from '@mantine/core';
import { type UseFormReturnType } from '@mantine/form';
import { useAuth } from '../../auth/hooks/useAuth';
import {
  getUserInfo,
  updateUserInfo,
  toFriendlyUserInfoError,
  type UserInfo as UserInfoRow,
  type UserInfoUpdate,
} from '../api/userInfoAPI'
import { Button } from "../../../shared/components/button/Button";
import { Form } from '../../../shared/components/form/Form';
import { Input } from '../../../shared/components/form/Input';
import { Select } from '../../../shared/components/form/Select';
import { userInfoFormValidation, type UserInfoFormValues } from './UserInfo.validation';

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

const EMPTY_FORM_VALUES: UserInfoFormValues = {
  first_name: '',
  last_name: '',
  employer: '',
  company_size: '',
  industry: '',
  job_title: '',
  secondary_email: '',
  phone_number: '',
  time_zone: '',
  date_format: 'MM/DD/YYYY',
};

function toFormValues(row: UserInfoRow): UserInfoFormValues {
  return {
    first_name: row.first_name,
    last_name: row.last_name,
    employer: row.employer ?? '',
    company_size: row.company_size ?? '',
    industry: row.industry ?? '',
    job_title: row.job_title ?? '',
    secondary_email: row.secondary_email ?? '',
    phone_number: row.phone_number ?? '',
    time_zone: row.time_zone ?? '',
    date_format: row.date_format,
  };
}

export default function UserInfo() {
  const { user } = useAuth();

  // The fetched row is kept separately from the form's own values —
  // it's the source for the read-only Email field and for rebuilding
  // initialValues, but it's never itself bound to a form input.
  const [userInfoRow, setUserInfoRow] = useState<UserInfoRow | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    (async () => {
      try {
        const data = await getUserInfo(user.id);
        setUserInfoRow(data);
      } catch (err) {
        setError(toFriendlyUserInfoError(err));
      } finally {
        setIsLoading(false);
      }
    })();
  }, [user?.id]);

  async function handleSave(
    values: UserInfoFormValues,
    form: UseFormReturnType<UserInfoFormValues>,
  ) {
    if (!user?.id) return;
    setIsSaving(true);
    setError(null);

    const payload: UserInfoUpdate = values;

    try {
      await updateUserInfo(user.id, payload);
      setUserInfoRow((prev) => (prev ? { ...prev, ...values } : prev));
      // Moves the form's "reset to" baseline forward to what was just
      // saved, so a later Cancel reverts here instead of all the way
      // back to whatever was loaded when the page first mounted.
      form.setInitialValues(values);
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
      <Form<UserInfoFormValues>
        initialValues={userInfoRow ? toFormValues(userInfoRow) : EMPTY_FORM_VALUES}
        validation={userInfoFormValidation}
        onSubmit={handleSave}
      >
        {(form) => (
          <>
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
                    type="button"
                    onClick={() => {
                      setError(null);
                      setIsEditing(true);
                    }}
                  >
                    Edit
                  </Button>
                ) : (
                  <>
                    <Button
                      type="button"
                      onClick={() => {
                        form.reset();
                        setError(null);
                        setIsEditing(false);
                      }}
                      disabled={isSaving}
                      variant="cancel"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSaving}
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
                  <Input form={form} name="first_name" label="First Name" disabled={!isEditing} />
                  <Input form={form} name="last_name" label="Last Name" disabled={!isEditing} />
                </div>

                <Input form={form} name="employer" label="Company Name" disabled={!isEditing} />

                <div className="field-row">
                  <Select
                    form={form}
                    name="company_size"
                    label="Company Size"
                    placeholder="Select..."
                    data={COMPANY_SIZE_OPTIONS}
                    disabled={!isEditing}
                  />
                  <Select
                    form={form}
                    name="industry"
                    label="Industry"
                    placeholder="Select..."
                    data={INDUSTRY_OPTIONS}
                    disabled={!isEditing}
                  />
                </div>

                <Input form={form} name="job_title" label="Job Title" disabled={!isEditing} />

                <div className="field-group">
                  <TextInput
                    label="Email"
                    disabled
                    value={userInfoRow?.email ?? ''}
                  />
                  <p className="field-hint">
                    To change your email, visit Security Settings.
                  </p>
                </div>

                <Input
                  form={form}
                  name="secondary_email"
                  type="email"
                  label="Secondary Email"
                  placeholder="For account recovery"
                  disabled={!isEditing}
                />

                <Input form={form} name="phone_number" label="Phone Number" disabled={!isEditing} />

                <hr className="form-divider" />

                <div className="field-row">
                  <Select
                    form={form}
                    name="time_zone"
                    label="Time Zone"
                    placeholder="Select..."
                    data={TIME_ZONE_OPTIONS}
                    disabled={!isEditing}
                  />
                  <Select
                    form={form}
                    name="date_format"
                    label="Date Format"
                    data={DATE_FORMAT_OPTIONS}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </Form>
    </div>
  );
}
