// src/app/features/credentials/api/credentialsAPI.ts

import { supabase } from '../../../supabase/supabase'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GoverningAuthority {
  governing_authority_id: string
  governing_authority_name: string
  abbreviation: string
}

export interface Credential {
  credential_id: string
  governing_authority_id: string
  credential_name: string
  abbreviation: string
  status: string
  credential_type: string
}

export interface CredentialWithOrg extends Credential {
  governing_authorities: GoverningAuthority
}

export interface RequirementRule {
  rule_id: string
  credential_id: string
  annual_cpe_hours: number | null
  ethics_hours: number | null
  specialty_hours: number | null
  specialty_description: string | null
  rolling_period_hours: number | null
  rolling_period_years: number | null
  carryforward_hours: number | null
  renewal_cycle: string
  renewal_cycle_types: { renewal_cycle_name: string }
}

export interface UserCredential {
  id: string
  user_id: string
  credential_id: string
  status_id: string
  cycle_start_date: string
  cycle_end_date: string | null
  override_cycle_end_date: boolean
  custom_cycle_end_date: string | null
  auto_rollover: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export interface UserCredentialWithDetails extends UserCredential {
  credentials: CredentialWithOrg
  credential_status_types: { status_name: string }
}

export type CredentialStatusId =
  | 'STATUS_ACTIVE'
  | 'STATUS_INACTIVE'
  | 'STATUS_GRACE'
  | 'STATUS_SUSPENDED'
  | 'STATUS_RETIRED'
  | 'STATUS_REVOKED'
  | 'STATUS_EXPIRED'

export interface AddCredentialInput {
  credential_id: string
  status_id: CredentialStatusId
  cycle_start_date: string
  cycle_end_date: string
}

export interface UpdateCredentialInput extends AddCredentialInput {
  id: string
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export async function fetchAllCredentials(): Promise<CredentialWithOrg[]> {
  const { data, error } = await supabase
    .from('credentials')
    .select(`
      credential_id, governing_authority_id, credential_name,
      abbreviation, status, credential_type,
      governing_authorities ( governing_authority_id, governing_authority_name, abbreviation )
    `)
    .order('governing_authority_id')
    .order('credential_name')

  if (error) throw error
  return data as CredentialWithOrg[]
}

export async function fetchCredentialById(
  credentialId: string
): Promise<CredentialWithOrg> {
  const { data, error } = await supabase
    .from('credentials')
    .select(`
      credential_id, governing_authority_id, credential_name,
      abbreviation, status, credential_type,
      governing_authorities ( governing_authority_id, governing_authority_name, abbreviation )
    `)
    .eq('credential_id', credentialId)
    .single()

  if (error) throw error
  return data as CredentialWithOrg
}

export async function fetchRequirementRule(
  credentialId: string
): Promise<RequirementRule | null> {
  const { data, error } = await supabase
    .from('cpe_requirement_rules')
    .select(`
      rule_id, credential_id, annual_cpe_hours, ethics_hours,
      specialty_hours, specialty_description, rolling_period_hours,
      rolling_period_years, carryforward_hours, renewal_cycle,
      renewal_cycle_types ( renewal_cycle_name )
    `)
    .eq('credential_id', credentialId)
    .maybeSingle()

  if (error) throw error
  return data as RequirementRule | null
}

export async function fetchUserCredentials(): Promise<UserCredentialWithDetails[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('user_credentials')
    .select(`
      *,
      credentials (
        credential_id, governing_authority_id, credential_name, abbreviation,
        status, credential_type,
        governing_authorities ( governing_authority_id, governing_authority_name, abbreviation )
      ),
      credential_status_types ( status_name )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as UserCredentialWithDetails[]
}

export async function fetchUserCredentialById(
  id: string
): Promise<UserCredentialWithDetails> {
  const { data, error } = await supabase
    .from('user_credentials')
    .select(`
      *,
      credentials (
        credential_id, governing_authority_id, credential_name, abbreviation,
        status, credential_type,
        governing_authorities ( governing_authority_id, governing_authority_name, abbreviation )
      ),
      credential_status_types ( status_name )
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data as UserCredentialWithDetails
}

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

export async function addUserCredential(input: AddCredentialInput): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('user_credentials')
    .insert({
      user_id: user.id,
      credential_id: input.credential_id,
      status_id: input.status_id,
      cycle_start_date: input.cycle_start_date,
      cycle_end_date: input.cycle_end_date,
    })

  if (error) throw error
}

export async function updateUserCredential(input: UpdateCredentialInput): Promise<void> {
  const { error } = await supabase
    .from('user_credentials')
    .update({
      status_id: input.status_id,
      cycle_start_date: input.cycle_start_date,
    })
    .eq('id', input.id)

  if (error) throw error
}

export async function deleteUserCredential(id: string): Promise<void> {
  const { error } = await supabase
    .from('user_credentials')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function fetchAllGoverningAuthoritys(): Promise<GoverningAuthority[]> {
  const { data, error } = await supabase
    .from('governing_authorities')
    .select('governing_authority_id, governing_authority_name, abbreviation')
    .order('governing_authority_name')

  if (error) throw error
  return data as GoverningAuthority[]
}
