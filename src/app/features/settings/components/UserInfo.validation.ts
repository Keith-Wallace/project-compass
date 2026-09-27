import { type FormValidation } from '../../../shared/components/form/Form';

export interface UserInfoFormValues {
  first_name: string;
  last_name: string;
  employer: string;
  company_size: string;
  industry: string;
  job_title: string;
  secondary_email: string;
  phone_number: string;
  time_zone: string;
  date_format: string;
}

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

export const userInfoFormValidation: FormValidation<UserInfoFormValues> = {
  first_name: (value) => (value.trim().length === 0 ? 'First name is required' : null),
  last_name: (value) => (value.trim().length === 0 ? 'Last name is required' : null),
  // secondary_email is optional, so an empty value is fine — only
  // validate the format once something has been entered. This replaces
  // the native `type="email"` browser check the raw <input> used to get.
  secondary_email: (value) =>
    value.trim().length === 0 || EMAIL_PATTERN.test(value.trim())
      ? null
      : 'Enter a valid email address',
};
