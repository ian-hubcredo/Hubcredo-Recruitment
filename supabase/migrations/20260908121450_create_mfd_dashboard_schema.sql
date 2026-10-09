/*
# MFD Dashboard — Full Schema Creation

## Overview
Creates the complete schema for the MFD Dashboard investor management app:
partners, relationship managers, customers, orders, financial transactions,
portfolio snapshots, user profiles, and a dashboard summary view.

## New Tables
1. `partners` — Investment partner firms (top-level org entity)
2. `profiles` — User profile linked to auth.users, stores role (admin/partner) and partner_id
3. `relationship_managers` — RMs assigned to partners, linked to customers
4. `customers` — Investors with status (approved/pending/closed/unlinked), assigned to partner + optional RM
5. `orders` — Customer orders with symbol, status, amount
6. `fin_transactions` — Financial transactions (DIV, DIVTAX) for customers
7. `portfolio_snapshots` — Periodic portfolio value snapshots per customer

## New View
- `vw_dashboard_summary` — Per-partner aggregate: total/active/new investors with 7/30/90 day windows

## Security
- RLS enabled on all tables
- Admins (profiles.role = 'admin') can read all data
- Partners can read only data scoped to their partner_id
- Profiles: users read their own; admins read all; self-update allowed
- All policies use auth.uid() — never current_user
- security_invoker view respects underlying table RLS
- Trigger auto-creates profile on signup; first user becomes admin

## Important Notes
1. The first user to sign up automatically gets role = 'admin'. All subsequent
   users get role = 'partner' and must be assigned a partner_id by an admin.
2. Partners without a partner_id will see empty data (no rows match).
3. The view uses security_invoker so it respects RLS on customers.
*/

-- ============ TABLES ============

CREATE TABLE IF NOT EXISTS public.partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'partner' CHECK (role IN ('admin', 'partner')),
  partner_id uuid REFERENCES public.partners(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.relationship_managers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  rm_id uuid REFERENCES public.relationship_managers(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text,
  phone text,
  account_number text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('approved', 'pending', 'closed', 'unlinked')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  symbol text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('executed', 'pending', 'cancelled')),
  amount numeric(14,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.fin_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('DIV', 'DIVTAX')),
  amount numeric(14,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.portfolio_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  value numeric(14,2) NOT NULL DEFAULT 0,
  snapshot_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============ INDEXES ============

CREATE INDEX IF NOT EXISTS idx_customers_partner_id ON public.customers(partner_id);
CREATE INDEX IF NOT EXISTS idx_customers_rm_id ON public.customers(rm_id);
CREATE INDEX IF NOT EXISTS idx_customers_status ON public.customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON public.customers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rm_partner_id ON public.relationship_managers(partner_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fin_transactions_customer_id ON public.fin_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_fin_transactions_created_at ON public.fin_transactions(created_at DESC);

-- ============ RLS ============

ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relationship_managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_snapshots ENABLE ROW LEVEL SECURITY;

-- Helper function: is current user an admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Helper function: get current user's partner_id
CREATE OR REPLACE FUNCTION public.current_partner_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT partner_id FROM public.profiles WHERE id = auth.uid();
$$;

-- ---- partners policies ----
DROP POLICY IF EXISTS "select_partners" ON public.partners;
CREATE POLICY "select_partners" ON public.partners FOR SELECT
  TO authenticated USING (
    public.is_admin() OR id = public.current_partner_id()
  );

-- ---- profiles policies ----
DROP POLICY IF EXISTS "select_profiles" ON public.profiles;
CREATE POLICY "select_profiles" ON public.profiles FOR SELECT
  TO authenticated USING (
    public.is_admin() OR id = auth.uid()
  );

DROP POLICY IF EXISTS "update_profiles" ON public.profiles;
CREATE POLICY "update_profiles" ON public.profiles FOR UPDATE
  TO authenticated USING (
    public.is_admin() OR id = auth.uid()
  ) WITH CHECK (
    public.is_admin() OR id = auth.uid()
  );

-- ---- relationship_managers policies ----
DROP POLICY IF EXISTS "select_rms" ON public.relationship_managers;
CREATE POLICY "select_rms" ON public.relationship_managers FOR SELECT
  TO authenticated USING (
    public.is_admin() OR partner_id = public.current_partner_id()
  );

-- ---- customers policies ----
DROP POLICY IF EXISTS "select_customers" ON public.customers;
CREATE POLICY "select_customers" ON public.customers FOR SELECT
  TO authenticated USING (
    public.is_admin() OR partner_id = public.current_partner_id()
  );

-- ---- orders policies ----
DROP POLICY IF EXISTS "select_orders" ON public.orders;
CREATE POLICY "select_orders" ON public.orders FOR SELECT
  TO authenticated USING (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = orders.customer_id
      AND c.partner_id = public.current_partner_id()
    )
  );

-- ---- fin_transactions policies ----
DROP POLICY IF EXISTS "select_fin_transactions" ON public.fin_transactions;
CREATE POLICY "select_fin_transactions" ON public.fin_transactions FOR SELECT
  TO authenticated USING (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = fin_transactions.customer_id
      AND c.partner_id = public.current_partner_id()
    )
  );

-- ---- portfolio_snapshots policies ----
DROP POLICY IF EXISTS "select_portfolio_snapshots" ON public.portfolio_snapshots;
CREATE POLICY "select_portfolio_snapshots" ON public.portfolio_snapshots FOR SELECT
  TO authenticated USING (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = portfolio_snapshots.customer_id
      AND c.partner_id = public.current_partner_id()
    )
  );

-- ============ VIEW ============

CREATE OR REPLACE VIEW public.vw_dashboard_summary
WITH (security_invoker = true) AS
SELECT
  partner_id,
  count(*)::bigint AS total_investors,
  count(*) FILTER (WHERE status = 'approved')::bigint AS active_investors,
  count(*) FILTER (WHERE created_at >= now() - interval '7 days')::bigint AS new_investors_7d,
  count(*) FILTER (WHERE created_at >= now() - interval '30 days')::bigint AS new_investors_30d,
  count(*) FILTER (WHERE created_at >= now() - interval '90 days')::bigint AS new_investors_90d
FROM public.customers
GROUP BY partner_id;

-- ============ TRIGGER: auto-create profile on signup ============

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, partner_id)
  VALUES (
    NEW.id,
    CASE WHEN NOT EXISTS (SELECT 1 FROM public.profiles) THEN 'admin' ELSE 'partner' END,
    NULL
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
