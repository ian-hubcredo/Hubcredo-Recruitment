/*
# Revoke direct RPC access to security helper functions

## Overview
The three SECURITY DEFINER helper functions (is_admin, current_partner_id, handle_new_user)
are used internally by RLS policies and triggers. They should not be callable directly
via the PostgREST API by anon or authenticated users.

## Changes
1. Revoke EXECUTE on is_admin() from anon and authenticated
2. Revoke EXECUTE on current_partner_id() from anon and authenticated
3. Revoke EXECUTE on handle_new_user() from anon and authenticated

## Notes
- These functions are still called internally by RLS policies (which run with the
  caller's privileges but invoke SECURITY DEFINER functions in policy context)
- handle_new_user is only called by a trigger on auth.users, not via API
- This closes the security advisor warnings about public RPC access
*/

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.current_partner_id() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
