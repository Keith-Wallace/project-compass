import { type FormValidation } from '../../../shared/components/form/Form';
import type { CredentialStatusId } from '../api/credentials.queries';

export interface AddCredentialFormValues {
  credential_id: string;
  governing_authority_id: string;
  issued_date: string;       // 'YYYY-MM-DD'
  status_id: CredentialStatusId;
  cycle_start_date: string;  // 'YYYY-MM-DD'
  cycle_end_date: string;    // 'YYYY-MM-DD'
}

export const addCredentialValidation: FormValidation<AddCredentialFormValues> = {
  credential_id: (value) => (value ? null : 'Please select a credential from the list.'),
  governing_authority_id: (value) => (value ? null : 'Please select a governing authority.'),
  issued_date: (value) => (value ? null : 'Please enter the date this credential was issued.'),
  cycle_start_date: (value) => (value ? null : 'Please enter the reporting cycle start date.'),
  cycle_end_date: (value, values) => {
    if (!value) return 'Please enter the reporting cycle end date.';
    if (values.cycle_start_date && value < values.cycle_start_date) {
      return 'End date cannot be before the reporting cycle start date.';
    }
    return null;
  },
};
