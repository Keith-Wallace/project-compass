import { type FormValidation } from '../../../shared/components/form/Form';

export interface VerifyEmailPinFormValues {
  code: string;
}

export const verifyEmailPinFormValidation: FormValidation<VerifyEmailPinFormValues> = {
  code: (value) => (value.length === 6 ? null : 'Enter the 6-digit code'),
};
