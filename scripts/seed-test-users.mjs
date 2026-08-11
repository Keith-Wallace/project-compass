// scripts/seed-test-users.mjs
//
// Creates test users via the Supabase Admin API (auth.users) and inserts a
// matching row into public.users. Safe to run against local dev OR a hosted
// Supabase project — it only uses the public Admin API, no raw SQL.
//
// Usage:
//   1. npm install @supabase/supabase-js dotenv
//   2. Fill in SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / TEST_USER_PASSWORD
//      in your project's .env file (see .env.example).
//   3. node scripts/seed-test-users.mjs
//
// IMPORTANT: SUPABASE_SERVICE_ROLE_KEY bypasses RLS. Never expose it
// client-side or commit it. Make sure .env is in your .gitignore.

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || 'ChangeMe123!';

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars. Aborting.'
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Test user data (from new-users-data.csv)
const testUsers = [
  { first_name: 'Jennie', last_name: 'Wallace', email: 'jennie@rollingthree.com', role: 'admin' },
  { first_name: 'Joe', last_name: 'Tarshish', email: 'joe@rollingthree.com', role: 'admin' },
  { first_name: 'Mani', last_name: 'Mohabbatizadeh', email: 'mani@rollingthree.com', role: 'admin' },
  { first_name: 'Keith', last_name: 'Wallace', email: 'keith@rollingthree.com', role: 'admin' },
];

async function seedUser({ first_name, last_name, email, role }) {
  // 1. Create the auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password: TEST_PASSWORD,
    email_confirm: true, // skip email verification for test accounts
    user_metadata: { first_name, last_name },
  });

  if (authError) {
    console.error(`✗ Failed to create auth user for ${email}: ${authError.message}`);
    return;
  }

  const userId = authData.user.id;

  // 2. Insert/update matching row into public.users.
  // Using upsert (not insert) because a database trigger on auth.users may
  // already have created this row automatically before this call runs.
  const { error: profileError } = await supabase
    .from('users')
    .upsert(
      { id: userId, first_name, last_name, email, role },
      { onConflict: 'id' }
    );

  if (profileError) {
    console.error(`✗ Auth user created but public.users upsert failed for ${email}: ${profileError.message}`);
    return;
  }

  console.log(`✓ Created ${first_name} ${last_name} <${email}> (id: ${userId})`);
}

async function main() {
  console.log(`Seeding ${testUsers.length} test users...\n`);
  for (const user of testUsers) {
    await seedUser(user);
  }
  console.log(`\nDone. All test users share the password: ${TEST_PASSWORD}`);
}

main();
