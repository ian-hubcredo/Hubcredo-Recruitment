/*
# Seed Data for MFD Dashboard

## Overview
Populates the schema with realistic test data so the dashboard has content.

## Data Created
1. Three partner firms
2. Relationship managers for each partner
3. ~30 customers across partners with varied statuses and dates
4. Orders and financial transactions for recent activity feed

## Notes
- This is test/seed data only, safe to re-run (idempotent via NOT EXISTS checks)
- RLS policies apply, so this data is only visible to admins or matching partners
*/

DO $$ BEGIN
  -- Only seed if partners table is empty
  IF NOT EXISTS (SELECT 1 FROM public.partners) THEN

    -- Partners
    INSERT INTO public.partners (name, code) VALUES
      ('Apex Capital Partners', 'APEX'),
      ('Meridian Wealth Group', 'MERI'),
      ('Sterling Investment Advisors', 'STRL');

    -- RMs for each partner
    INSERT INTO public.relationship_managers (partner_id, name, email) VALUES
      ((SELECT id FROM public.partners WHERE code = 'APEX'), 'Rajesh Kumar', 'rajesh.kumar@apexcapital.com'),
      ((SELECT id FROM public.partners WHERE code = 'APEX'), 'Priya Sharma', 'priya.sharma@apexcapital.com'),
      ((SELECT id FROM public.partners WHERE code = 'MERI'), 'Arjun Mehta', 'arjun.mehta@meridianwealth.com'),
      ((SELECT id FROM public.partners WHERE code = 'MERI'), 'Sneha Patel', 'sneha.patel@meridianwealth.com'),
      ((SELECT id FROM public.partners WHERE code = 'STRL'), 'Vikram Nair', 'vikram.nair@sterlingadvisors.com');

    -- Customers for APEX
    INSERT INTO public.customers (partner_id, rm_id, name, email, phone, account_number, status, created_at) VALUES
      ((SELECT id FROM public.partners WHERE code = 'APEX'), (SELECT id FROM public.relationship_managers WHERE email = 'rajesh.kumar@apexcapital.com'), 'Aarav Gupta', 'aarav.gupta@email.com', '+91 98765 43210', 'APEX-001', 'approved', now() - interval '5 days'),
      ((SELECT id FROM public.partners WHERE code = 'APEX'), (SELECT id FROM public.relationship_managers WHERE email = 'rajesh.kumar@apexcapital.com'), 'Diya Reddy', 'diya.reddy@email.com', '+91 98765 43211', 'APEX-002', 'approved', now() - interval '120 days'),
      ((SELECT id FROM public.partners WHERE code = 'APEX'), (SELECT id FROM public.relationship_managers WHERE email = 'rajesh.kumar@apexcapital.com'), 'Kabir Singh', 'kabir.singh@email.com', '+91 98765 43212', 'APEX-003', 'pending', now() - interval '2 days'),
      ((SELECT id FROM public.partners WHERE code = 'APEX'), (SELECT id FROM public.relationship_managers WHERE email = 'priya.sharma@apexcapital.com'), 'Ananya Iyer', 'ananya.iyer@email.com', '+91 98765 43213', 'APEX-004', 'approved', now() - interval '200 days'),
      ((SELECT id FROM public.partners WHERE code = 'APEX'), (SELECT id FROM public.relationship_managers WHERE email = 'priya.sharma@apexcapital.com'), 'Reyansh Joshi', 'reyansh.joshi@email.com', '+91 98765 43214', 'APEX-005', 'closed', now() - interval '300 days'),
      ((SELECT id FROM public.partners WHERE code = 'APEX'), NULL, 'Ishaan Verma', 'ishaan.verma@email.com', '+91 98765 43215', 'APEX-006', 'unlinked', now() - interval '45 days'),
      ((SELECT id FROM public.partners WHERE code = 'APEX'), (SELECT id FROM public.relationship_managers WHERE email = 'rajesh.kumar@apexcapital.com'), 'Saanvi Desai', 'saanvi.desai@email.com', '+91 98765 43216', 'APEX-007', 'approved', now() - interval '15 days'),
      ((SELECT id FROM public.partners WHERE code = 'APEX'), (SELECT id FROM public.relationship_managers WHERE email = 'priya.sharma@apexcapital.com'), 'Aryan Chopra', 'aryan.chopra@email.com', '+91 98765 43217', 'APEX-008', 'approved', now() - interval '60 days'),
      ((SELECT id FROM public.partners WHERE code = 'APEX'), NULL, 'Myra Khanna', 'myra.khanna@email.com', '+91 98765 43218', 'APEX-009', 'pending', now() - interval '1 days'),
      ((SELECT id FROM public.partners WHERE code = 'APEX'), (SELECT id FROM public.relationship_managers WHERE email = 'rajesh.kumar@apexcapital.com'), 'Vihaan Agarwal', 'vihaan.agarwal@email.com', '+91 98765 43219', 'APEX-010', 'approved', now() - interval '90 days');

    -- Customers for MERI
    INSERT INTO public.customers (partner_id, rm_id, name, email, phone, account_number, status, created_at) VALUES
      ((SELECT id FROM public.partners WHERE code = 'MERI'), (SELECT id FROM public.relationship_managers WHERE email = 'arjun.mehta@meridianwealth.com'), 'Advika Rao', 'advika.rao@email.com', '+91 99876 54321', 'MERI-001', 'approved', now() - interval '20 days'),
      ((SELECT id FROM public.partners WHERE code = 'MERI'), (SELECT id FROM public.relationship_managers WHERE email = 'arjun.mehta@meridianwealth.com'), 'Aradhya Menon', 'aradhya.menon@email.com', '+91 99876 54322', 'MERI-002', 'approved', now() - interval '75 days'),
      ((SELECT id FROM public.partners WHERE code = 'MERI'), (SELECT id FROM public.relationship_managers WHERE email = 'sneha.patel@meridianwealth.com'), 'Dhruv Bansal', 'dhruv.bansal@email.com', '+91 99876 54323', 'MERI-003', 'pending', now() - interval '3 days'),
      ((SELECT id FROM public.partners WHERE code = 'MERI'), (SELECT id FROM public.relationship_managers WHERE email = 'sneha.patel@meridianwealth.com'), 'Kiara Malhotra', 'kiara.malhotra@email.com', '+91 99876 54324', 'MERI-004', 'approved', now() - interval '180 days'),
      ((SELECT id FROM public.partners WHERE code = 'MERI'), NULL, 'Riya Saxena', 'riya.saxena@email.com', '+91 99876 54325', 'MERI-005', 'unlinked', now() - interval '10 days'),
      ((SELECT id FROM public.partners WHERE code = 'MERI'), (SELECT id FROM public.relationship_managers WHERE email = 'arjun.mehta@meridianwealth.com'), 'Ayaan Gupta', 'ayaan.gupta@email.com', '+91 99876 54326', 'MERI-006', 'approved', now() - interval '250 days'),
      ((SELECT id FROM public.partners WHERE code = 'MERI'), (SELECT id FROM public.relationship_managers WHERE email = 'sneha.patel@meridianwealth.com'), 'Navya Bhat', 'navya.bhat@email.com', '+91 99876 54327', 'MERI-007', 'approved', now() - interval '12 days'),
      ((SELECT id FROM public.partners WHERE code = 'MERI'), (SELECT id FROM public.relationship_managers WHERE email = 'arjun.mehta@meridianwealth.com'), 'Ved Bhardwaj', 'ved.bhardwaj@email.com', '+91 99876 54328', 'MERI-008', 'closed', now() - interval '400 days');

    -- Customers for STRL
    INSERT INTO public.customers (partner_id, rm_id, name, email, phone, account_number, status, created_at) VALUES
      ((SELECT id FROM public.partners WHERE code = 'STRL'), (SELECT id FROM public.relationship_managers WHERE email = 'vikram.nair@sterlingadvisors.com'), 'Trisha Pillai', 'trisha.pillai@email.com', '+91 90876 12345', 'STRL-001', 'approved', now() - interval '50 days'),
      ((SELECT id FROM public.partners WHERE code = 'STRL'), (SELECT id FROM public.relationship_managers WHERE email = 'vikram.nair@sterlingadvisors.com'), 'Aditya Nair', 'aditya.nair@email.com', '+91 90876 12346', 'STRL-002', 'approved', now() - interval '100 days'),
      ((SELECT id FROM public.partners WHERE code = 'STRL'), NULL, 'Sara Thomas', 'sara.thomas@email.com', '+91 90876 12347', 'STRL-003', 'pending', now() - interval '4 days'),
      ((SELECT id FROM public.partners WHERE code = 'STRL'), (SELECT id FROM public.relationship_managers WHERE email = 'vikram.nair@sterlingadvisors.com'), 'Ira Kurian', 'ira.kurian@email.com', '+91 90876 12348', 'STRL-004', 'approved', now() - interval '140 days'),
      ((SELECT id FROM public.partners WHERE code = 'STRL'), (SELECT id FROM public.relationship_managers WHERE email = 'vikram.nair@sterlingadvisors.com'), 'Kiaan Fernandez', 'kiaan.fernandez@email.com', '+91 90876 12349', 'STRL-005', 'approved', now() - interval '210 days');

    -- Orders
    INSERT INTO public.orders (customer_id, symbol, status, amount, created_at)
    SELECT c.id, sym, st, amt, ts
    FROM public.customers c
    JOIN (VALUES
      ('APEX-001', 'NIFTYBEES', 'executed', 50000.00),
      ('APEX-001', 'HDFCBANK', 'executed', 25000.00),
      ('APEX-002', 'RELIANCE', 'executed', 75000.00),
      ('APEX-003', 'TATAMOTORS', 'pending', 30000.00),
      ('APEX-004', 'INFY', 'executed', 45000.00),
      ('APEX-005', 'SBIN', 'cancelled', 20000.00),
      ('APEX-007', 'ICICIBANK', 'executed', 60000.00),
      ('APEX-008', 'BAJFINANCE', 'executed', 35000.00),
      ('APEX-010', 'HINDUNILVR', 'executed', 40000.00),
      ('MERI-001', 'NIFTYBEES', 'executed', 80000.00),
      ('MERI-002', 'AXISBANK', 'executed', 55000.00),
      ('MERI-003', 'WIPRO', 'pending', 22000.00),
      ('MERI-004', 'MARUTI', 'executed', 95000.00),
      ('MERI-006', 'TCS', 'executed', 120000.00),
      ('MERI-007', 'BHARTIARTL', 'executed', 65000.00),
      ('STRL-001', 'SUNPHARMA', 'executed', 48000.00),
      ('STRL-002', 'LT', 'executed', 88000.00),
      ('STRL-003', 'ADANIENT', 'pending', 15000.00),
      ('STRL-004', 'KOTAKBANK', 'executed', 70000.00),
      ('STRL-005', 'ULTRACEMCO', 'executed', 52000.00)
    ) AS v(acc, sym, st, amt)
    ON c.account_number = v.acc
    CROSS JOIN LATERAL (
      VALUES (now() - interval '1 hour'), (now() - interval '5 hours'), (now() - interval '1 day'),
             (now() - interval '2 days'), (now() - interval '3 days')
    ) AS t(ts)
    WHERE random() < 0.4
    ORDER BY c.id, ts DESC;

    -- Financial Transactions
    INSERT INTO public.fin_transactions (customer_id, type, amount, created_at)
    SELECT c.id, tx_type, amt, ts
    FROM public.customers c
    JOIN (VALUES
      ('APEX-001', 'DIV', 1250.00),
      ('APEX-001', 'DIVTAX', 187.50),
      ('APEX-002', 'DIV', 3200.00),
      ('APEX-002', 'DIVTAX', 480.00),
      ('APEX-004', 'DIV', 980.00),
      ('APEX-007', 'DIV', 1850.00),
      ('APEX-007', 'DIVTAX', 277.50),
      ('APEX-008', 'DIV', 1100.00),
      ('APEX-010', 'DIV', 1450.00),
      ('APEX-010', 'DIVTAX', 217.50),
      ('MERI-001', 'DIV', 2500.00),
      ('MERI-001', 'DIVTAX', 375.00),
      ('MERI-002', 'DIV', 1800.00),
      ('MERI-004', 'DIV', 3200.00),
      ('MERI-004', 'DIVTAX', 480.00),
      ('MERI-006', 'DIV', 4200.00),
      ('MERI-006', 'DIVTAX', 630.00),
      ('MERI-007', 'DIV', 950.00),
      ('STRL-001', 'DIV', 1450.00),
      ('STRL-001', 'DIVTAX', 217.50),
      ('STRL-002', 'DIV', 2100.00),
      ('STRL-002', 'DIVTAX', 315.00),
      ('STRL-004', 'DIV', 1750.00),
      ('STRL-005', 'DIV', 2800.00)
    ) AS v(acc, tx_type, amt)
    ON c.account_number = v.acc
    CROSS JOIN LATERAL (
      VALUES (now() - interval '6 hours'), (now() - interval '12 hours'),
             (now() - interval '2 days'), (now() - interval '4 days')
    ) AS t(ts)
    WHERE random() < 0.5
    ORDER BY c.id, ts DESC;

  END IF;
END $$;
