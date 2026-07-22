import { supabase } from '../../supabase/supabase';

export interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
}

export interface UpdateUserProfile {
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface SignUpParams {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface SignInParams {
  email: string;
  password: string;
}

/**
 * Get the profile of the currently logged-in user.
 */
export async function getCurrentUser(): Promise<UserProfile> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw authError;
  if (!user) throw new Error('No authenticated user found.');

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) throw error;

  return data as UserProfile;
}

/**
 * Update the current user's profile.
 */
export async function updateUserProfile(
  updates: UpdateUserProfile
): Promise<UserProfile> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw authError;
  if (!user) throw new Error('No authenticated user found.');

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single();

  if (error) throw error;

  return data as UserProfile;
}

/**
 * Sign up a new user with email and password.
 */
export async function signUp({
  email,
  password,
  firstName,
  lastName,
}: SignUpParams) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;
  if (!data.user) throw new Error('User creation failed.');

  const { error: profileError } = await supabase.from('users').insert([
    {
      id: data.user.id,
      email,
      first_name: firstName,
      last_name: lastName,
    },
  ]);

  if (profileError) throw profileError;

  return data.user;
}

/**
 * Sign in with email and password.
 */
export async function signIn({
  email,
  password,
}: SignInParams) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  return data.user;
}

/**
 * Sign out the current user.
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();

  if (error) throw error;
}
