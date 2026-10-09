/*
# Revoke direct RPC access to security helper functions (retry)

The previous REVOKE may not have taken effect because Supabase auto-grants
EXECUTE on public schema functions. We need to explicitly revoke and also
alter the default privileges.

## Changes
- Revoke EXECUTE from anon and authenticated on all three helper functions
- Also revoke from PUBLIC (which covers all roles) as a belt-and-suspenders measure
*/

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin() FROM anon;
REVOKE ALL ON FUNCTION public.is_admin() FROM authenticated;

REVOKE ALL ON FUNCTION public.current_partner_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.current_partner_id() FROM anon;
REVOKE ALL ON FUNCTION public.current_partner_id() FROM authenticated;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM authenticated;
