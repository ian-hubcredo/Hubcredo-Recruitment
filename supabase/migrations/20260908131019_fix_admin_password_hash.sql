/*
# Fix admin@shiftaltcap.com password hash

## Problem
The manually created user has a bcrypt cost factor of 6 (gen_salt('bf') default),
but Supabase Auth (GoTrue) expects cost 10. This causes "Database error querying
schema" during signInWithPassword.

## Fix
Update encrypted_password to use bcrypt cost 10, matching GoTrue's format.
confirmed_at is a generated column (derived from email_confirmed_at) so it
cannot be updated directly — it's already set correctly.

## Notes
- Password is "Test@2026"
- gen_salt('bf', 10) produces $2a$10$... format matching GoTrue
*/

UPDATE auth.users
SET
  encrypted_password = crypt('Test@2026', gen_salt('bf', 10)),
  updated_at = now()
WHERE email = 'admin@shiftaltcap.com';
