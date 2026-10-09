/*
# Fix admin@shiftaltcap.com auth login

## Problem
The user admin@shiftaltcap.com was created by directly inserting into auth.users.
Supabase Auth requires a matching row in auth.identities for password login to work.
The manually inserted user is missing this identity row, causing "Invalid login credentials"
errors during signInWithPassword.

## Fix
1. Insert the missing identity row into auth.identities
2. Fix recovery_token (null -> empty string) to match the working user's format

## Notes
- This mirrors exactly what Supabase Auth creates internally on signup
- The identity_data JSON matches the format of the existing working user
*/

-- Fix recovery_token to match expected format
UPDATE auth.users
SET recovery_token = ''
WHERE email = 'admin@shiftaltcap.com' AND recovery_token IS NULL;

-- Insert the missing identity row
INSERT INTO auth.identities (
  id,
  user_id,
  provider,
  provider_id,
  identity_data,
  last_sign_in_at,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  u.id,
  'email',
  u.id,
  jsonb_build_object(
    'sub', u.id::text,
    'email', u.email,
    'email_verified', true,
    'phone_verified', false
  ),
  now(),
  now(),
  now()
FROM auth.users u
WHERE u.email = 'admin@shiftaltcap.com'
  AND NOT EXISTS (
    SELECT 1 FROM auth.identities i WHERE i.user_id = u.id
  );
