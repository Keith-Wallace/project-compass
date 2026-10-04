import { supabase } from '../../../supabase/supabase';

export interface CredentialOption {
  value: string; // credentials.credential_id
  label: string; // credentials.credential_name
}

type UserCredentialRow = {
  credential_id: string;
  credentials: { credential_name: string } | { credential_name: string }[] | null;
};

// Distinct credentials the signed-in user holds. RLS on user_credentials
// already scopes rows to auth.uid(). Deduped by credential_id because a user
// can hold several cycle rows for the same credential (uq_user_credential).
export async function getUserCredentialOptions(): Promise<CredentialOption[]> {
  const { data, error } = await supabase
    .from('user_credentials')
    .select('credential_id, credentials(credential_name)');

  if (error) throw error;

  const byId = new Map<string, string>();
  for (const row of (data ?? []) as UserCredentialRow[]) {
    const cred = Array.isArray(row.credentials) ? row.credentials[0] : row.credentials;
    if (cred && !byId.has(row.credential_id)) {
      byId.set(row.credential_id, cred.credential_name);
    }
  }

  return [...byId]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
}
