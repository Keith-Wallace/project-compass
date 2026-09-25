import { type FormValidation } from '../../../shared/components/form/Form';

export interface SignupFormValues {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  employer: string;
  tosAccepted: boolean;
  privacyAccepted: boolean;
}

export const signupFormValidation: FormValidation<SignupFormValues> = {
  email: (value) => (value.trim().length === 0 ? 'Email is required' : null),
  password: (value) => (value.length === 0 ? 'Password is required' : null),
  confirmPassword: (value, values) =>
    value !== values.password ? 'Passwords do not match' : null,
  firstName: (value) => (value.trim().length === 0 ? 'First name is required' : null),
  lastName: (value) => (value.trim().length === 0 ? 'Last name is required' : null),
  tosAccepted: (value) => (value ? null : 'You must accept the Terms of Service'),
  privacyAccepted: (value) => (value ? null : 'You must accept the Privacy Policy'),
};
