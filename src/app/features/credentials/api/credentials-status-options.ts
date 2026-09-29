import type { CredentialStatusId } from './credentials.queries';

// Shared by CredentialForm (edit) and AddCredentialPage so the two lists
// can't drift apart.
// TODO: Create API endpoint to request date from credential_status_types table
export const STATUS_OPTIONS: { value: CredentialStatusId; label: string }[] = [
  { value: 'STATUS_ACTIVE',    label: 'Active' },
  { value: 'STATUS_INACTIVE',  label: 'Inactive' },
  { value: 'STATUS_GRACE',     label: 'Grace Period' },
  { value: 'STATUS_SUSPENDED', label: 'Suspended' },
  { value: 'STATUS_RETIRED',   label: 'Retired' },
  { value: 'STATUS_REVOKED',   label: 'Revoked' },
  { value: 'STATUS_EXPIRED',   label: 'Expired' },
];
