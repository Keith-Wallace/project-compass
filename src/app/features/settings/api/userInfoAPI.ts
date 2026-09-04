import { supabase } from '../../../supabase/supabase';

export interface UserInfo {
  first_name: string;
  last_name: string;
  employer: string | null; // "Company Name" in the wireframe
  company_size: string | null;
  industry: string | null;
  job_title: string | null;
  email: string; // read-only, sourced from auth
  secondary_email: string | null;
  phone_number: string | null;
  time_zone: string | null;
  date_format: string;
}

// Fields the user is allowed to edit from this page. `email` is
// intentionally excluded — it's read-only here, editable only
// from Security Settings.
export type UserInfoUpdate = Partial<Omit<UserInfo, 'email'>>;

const USER_INFO_COLUMNS =
  'first_name, last_name, employer, company_size, industry, job_title, email, secondary_email, phone_number, time_zone, date_format';

export async function getUserInfo(userId: string): Promise<UserInfo> {
  const { data, error } = await supabase
    .from('users')
    .select(USER_INFO_COLUMNS)
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data as UserInfo;
}

export async function updateUserInfo(
  userId: string,
  updates: UserInfoUpdate
): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId);

  if (error) throw error;
}

// Maps raw Postgres/Supabase errors from the constraints added in
// 0005_user_info_settings_fields.sql to messages a user can act on.
export function toFriendlyUserInfoError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes('already in use as another user')) {
    return 'That secondary email is already associated with another account.';
  }
  if (message.includes('ux_users_secondary_email')) {
    return 'That secondary email is already in use as someone else\u2019s secondary email.';
  }
  if (message.includes('chk_users_secondary_email_not_self')) {
    return 'Your secondary email can\u2019t be the same as your primary email.';
  }
  if (message.includes('chk_users_secondary_email_format')) {
    return 'That doesn\u2019t look like a valid email address.';
  }
  if (
    message.includes('chk_users_company_size') ||
    message.includes('chk_users_industry') ||
    message.includes('chk_users_date_format')
  ) {
    return 'One of the selected values isn\u2019t valid. Please re-select and try again.';
  }

  return 'Something went wrong saving your changes. Please try again.';
}
