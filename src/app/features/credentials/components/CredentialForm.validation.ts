import { type FormValidation } from '../../../shared/components/form/Form';
import type { CredentialStatusId } from '../api/credentials.queries';

export interface CredentialFormValues {
  status_id: CredentialStatusId;
  cycle_start_date: string; // 'YYYY-MM-DD'
  // TODO(CPE-TRACK): `user_credentials` has no column for this yet — it is
  // collected and validated on the client but NOT sent to Supabase. See the
  // "Add issued_date column" follow-up ticket. Remove this comment once the
  // column exists and this value is wired into addUserCredential /
  // updateUserCredential.
  issued_date: string; // 'YYYY-MM-DD'
}

export const credentialFormValidation: FormValidation<CredentialFormValues> = {
  cycle_start_date: (value) =>
    value ? null : 'Please enter the date this credential was awarded.',
  issued_date: (value) =>
    value ? null : 'Please enter the date this credential was issued.',
  // status_id always holds a value (the Select disallows deselecting), so it
  // needs no rule.
};
