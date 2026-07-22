/**
 * saveCategoryCreditCredentials
 *
 * Persists the credential assignment for a single course_category_credits
 * row by diffing the desired selection against what's currently stored in
 * course_category_credit_credentials, then inserting/deleting only the
 * difference (rather than delete-all-then-reinsert).
 *
 * Per BRR-XXX: an empty selectedCredentialIds array is valid — it clears
 * all assignments for the row and is NOT treated as "unchanged"/skip.
 */

import { SupabaseClient } from '@supabase/supabase-js';

export async function saveCategoryCreditCredentials(
  supabase: SupabaseClient,
  courseCategoryCreditId: string,
  selectedCredentialIds: string[]
): Promise<void> {
  const { data: existingRows, error: fetchError } = await supabase
    .from('course_category_credit_credentials')
    .select('id, user_credential_id')
    .eq('course_category_credit_id', courseCategoryCreditId);

  if (fetchError) {
    throw new Error(
      `Failed to fetch existing credential assignments: ${fetchError.message}`
    );
  }

  const existingIds = new Set(
    (existingRows ?? []).map((row) => row.user_credential_id)
  );
  const desiredIds = new Set(selectedCredentialIds);

  const toInsert = selectedCredentialIds.filter((id) => !existingIds.has(id));
  const toDeleteRowIds = (existingRows ?? [])
    .filter((row) => !desiredIds.has(row.user_credential_id))
    .map((row) => row.id);

  if (toInsert.length > 0) {
    const { error: insertError } = await supabase
      .from('course_category_credit_credentials')
      .insert(
        toInsert.map((userCredentialId) => ({
          course_category_credit_id: courseCategoryCreditId,
          user_credential_id: userCredentialId,
        }))
      );

    if (insertError) {
      throw new Error(
        `Failed to insert credential assignments: ${insertError.message}`
      );
    }
  }

  if (toDeleteRowIds.length > 0) {
    const { error: deleteError } = await supabase
      .from('course_category_credit_credentials')
      .delete()
      .in('id', toDeleteRowIds);

    if (deleteError) {
      throw new Error(
        `Failed to remove credential assignments: ${deleteError.message}`
      );
    }
  }
}

/**
 * fetchCategoryCreditCredentials
 *
 * Loads the current credential assignment ids for an existing
 * course_category_credits row, for populating CredentialFocusSelect on edit.
 * Returns an empty array (not null) for unassigned rows — null is reserved
 * for "not yet loaded" in the component's local state.
 */
export async function fetchCategoryCreditCredentials(
  supabase: SupabaseClient,
  courseCategoryCreditId: string
): Promise<string[]> {
  const { data, error } = await supabase
    .from('course_category_credit_credentials')
    .select('user_credential_id')
    .eq('course_category_credit_id', courseCategoryCreditId);

  if (error) {
    throw new Error(`Failed to fetch credential assignments: ${error.message}`);
  }

  return (data ?? []).map((row) => row.user_credential_id);
}
