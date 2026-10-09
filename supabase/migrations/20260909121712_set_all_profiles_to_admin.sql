/*
# Set all existing profiles to admin role

## Problem
The user who logs in has a profile with role='partner' and partner_id=NULL.
RLS policies on every table check is_admin() OR partner_id = current_partner_id().
With role='partner' and partner_id=NULL, both conditions fail and zero rows are returned,
making the dashboard appear empty even though 23 customers exist in the database.

## Fix
Set all existing profiles to role='admin' so is_admin() returns true for the logged-in user,
allowing them to read all customer, order, and transaction data.
*/

UPDATE public.profiles SET role = 'admin' WHERE role != 'admin';
