/*
# Re-grant EXECUTE on RLS helper functions

## Problem
The previous migrations revoked EXECUTE on is_admin() and current_partner_id()
from all roles (including authenticated and PUBLIC). These functions are
referenced inside RLS policies on every table. When an authenticated user
queries any table, the RLS policy tries to call is_admin() or
current_partner_id(), but the function call fails with permission denied
because EXECUTE was revoked. This causes all data queries to fail silently,
including the profile lookup after sign-in — so the user gets bounced back
to the login page instead of reaching the dashboard.

## Fix
Re-grant EXECUTE on is_admin() and current_partner_id() to authenticated.
These are SECURITY DEFINER, STABLE functions that only read data scoped to
auth.uid(), so granting EXECUTE is safe — they cannot leak cross-user data.

handle_new_user() is a trigger function (only called by the system trigger
on auth.users), so it does not need EXECUTE from authenticated/anon.
*/

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_partner_id() TO authenticated;
