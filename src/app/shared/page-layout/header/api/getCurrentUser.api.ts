import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
// TODO: point this at wherever your Supabase client is created
import { supabase } from '../../../../supabase/supabase';

/**
 * Returns the signed-in Supabase user, or null when signed out
 * (or while the session is still loading).
 */
export function useCurrentUser(): User | null {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Fires once right away with the stored session (INITIAL_SESSION),
    // then again on sign in, sign out, token refresh, and user updates.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return user;
}