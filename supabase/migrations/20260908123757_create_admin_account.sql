/*
# Create admin account for admin@shiftaltcap.com

## Overview
Creates an auth user with email admin@shiftaltcap.com and password Test@2026,
then sets their profile role to admin.

## Notes
- Uses crypt() for bcrypt password hashing
- The handle_new_user trigger will auto-create a 'partner' profile,
  which we then override to 'admin'
*/

-- Insert the user into auth.users (skip if already exists)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  confirmation_token,
  email_change_token_current,
  email_change
)
SELECT
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@shiftaltcap.com',
  crypt('Test@2026', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  '',
  '',
  ''
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@shiftaltcap.com');

-- Set profile to admin (trigger may have created it as 'partner', or it may not exist yet)
INSERT INTO public.profiles (id, role, partner_id)
SELECT id, 'admin', NULL FROM auth.users WHERE email = 'admin@shiftaltcap.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
