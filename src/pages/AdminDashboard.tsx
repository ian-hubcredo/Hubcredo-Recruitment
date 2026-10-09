import { useState, useEffect, useCallback, useMemo } from 'react';
import { TrendingUp, Users, UserPlus, UserCog, Wallet, PieChart, BarChart3, Target, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { Partner, Customer, RelationshipManager, Order, FinTransaction, ActivityItem, DashboardSummary } from '@/types/database';
import { PartnerSelector } from '@/components/PartnerSelector';
import { MetricCard } from '@/components/MetricCard';
import { CustomerTable } from '@/components/CustomerTable';
import { ActivityFeed } from '@/components/ActivityFeed';
import { RMBreakdownModal } from '@/components/RMBreakdownModal';

type NewInvestorWindow = 7 | 30 | 90;

type CustomerSourceRow = Record<string, unknown>;

export function AdminDashboard() {
  const { signOut } = useAuth();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [newInvestorWindow, setNewInvestorWindow] = useState<NewInvestorWindow>(30);

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(true);

  const [rms, setRms] = useState<RelationshipManager[]>([]);
  const [rmCounts, setRmCounts] = useState<Array<{ rm: RelationshipManager; customer_count: number }>>([]);
  const [rmModalOpen, setRmModalOpen] = useState(false);
  const [rmLoading, setRmLoading] = useState(false);

  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);

  // Load partners list
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from('partners').select('*').order('name');
      if (error) { console.error('partners:', error.message); return; }
      setPartners(data as Partner[]);
    })();
  }, []);

  // Load dashboard summary
  useEffect(() => {
    setSummaryLoading(true);
    (async () => {
      let query = supabase.from('vw_dashboard_summary').select('*');
      if (selectedPartnerId) {
        query = query.eq('partner_id', selectedPartnerId);
      }
      const { data, error } = await query;
      if (error) {
        console.error('summary:', error.message);
        setSummary(null);
        setSummaryLoading(false);
        return;
      }
      if (!selectedPartnerId) {
        // Aggregate across all partners
        const rows = data as DashboardSummary[];
        if (rows.length === 0) {
          setSummary(null);
        } else {
          setSummary({
            partner_id: 'all',
            total_investors: rows.reduce((s, r) => s + Number(r.total_investors), 0),
            active_investors: rows.reduce((s, r) => s + Number(r.active_investors), 0),
            new_investors_7d: rows.reduce((s, r) => s + Number(r.new_investors_7d), 0),
            new_investors_30d: rows.reduce((s, r) => s + Number(r.new_investors_30d), 0),
            new_investors_90d: rows.reduce((s, r) => s + Number(r.new_investors_90d), 0),
          });
        }
      } else {
        setSummary((data as DashboardSummary[])[0] ?? null);
      }
      setSummaryLoading(false);
    })();
  }, [selectedPartnerId]);

  // Load customer records from Supabase.
  useEffect(() => {
    setCustomersLoading(true);
    (async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*');

      if (error) {
        console.error('customers:', error.message);
        setCustomers([]);
        setCustomersLoading(false);
        return;
      }

      const mappedCustomers: Customer[] = ((data ?? []) as CustomerSourceRow[]).map((row) => {
        const name = stringValue(row.name) ?? stringValue(row.full_name);
        const email = stringValue(row.email) ?? stringValue(row.email_address) ?? stringValue(row.user_name);
        const createdAt = stringValue(row.created_at) ?? new Date(0).toISOString();

        return {
          id: stringValue(row.id) ?? stringValue(row.cust_id) ?? crypto.randomUUID(),
          partner_id: stringValue(row.partner_id) ?? '',
          rm_id: stringValue(row.rm_id) ?? null,
          name: name && name !== '--' ? name : stringValue(row.user_name) ?? 'Unknown customer',
          email,
          phone: stringValue(row.phone) ?? stringValue(row.phone_num),
          account_number: stringValue(row.account_number) ?? stringValue(row.account_num) ?? '—',
          status: normalizeCustomerStatus(stringValue(row.status)),
          created_at: createdAt,
          relationship_managers: null,
        };
      });

      const visibleCustomers = selectedPartnerId
        ? mappedCustomers.filter((customer) => customer.partner_id === selectedPartnerId)
        : mappedCustomers;
      visibleCustomers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setCustomers(visibleCustomers);
      setCustomersLoading(false);
    })();
  }, [selectedPartnerId]);

  // Load RMs (for count + breakdown)
  useEffect(() => {
    setRmLoading(true);
    (async () => {
      let query = supabase.from('relationship_managers').select('*');
      if (selectedPartnerId) {
        query = query.eq('partner_id', selectedPartnerId);
      }
      const { data, error } = await query;
      if (error) {
        console.error('rms:', error.message);
        setRms([]);
        setRmLoading(false);
        return;
      }
      setRms(data as RelationshipManager[]);
      setRmLoading(false);
    })();
  }, [selectedPartnerId]);

  // Compute RM counts from loaded customers
  const rmBreakdown = useMemo(() => {
    return rms
      .map((rm) => ({
        rm,
        customer_count: customers.filter((c) => c.rm_id === rm.id).length,
      }))
      .filter((entry) => entry.customer_count > 0)
      .sort((a, b) => b.customer_count - a.customer_count);
  }, [rms, customers]);

  useEffect(() => {
    setRmCounts(rmBreakdown);
  }, [rmBreakdown]);

  const rmWithCustomersCount = rmBreakdown.length;

  // Load activity feed (orders + fin_transactions)
  const loadActivity = useCallback(async () => {
    setActivityLoading(true);
    const limit = 20;

    let orderQuery = supabase
      .from('orders')
      .select('id, customer_id, symbol, status, amount, created_at, customers(name)')
      .order('created_at', { ascending: false })
      .limit(limit);

    let finQuery = supabase
      .from('fin_transactions')
      .select('id, customer_id, type, amount, created_at, customers(name)')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (selectedPartnerId) {
      // Filter via customer join - we need to get customer IDs first
      const { data: custIds } = await supabase
        .from('customers')
        .select('id')
        .eq('partner_id', selectedPartnerId);
      const ids = (custIds ?? []).map((c: { id: string }) => c.id);
      if (ids.length === 0) {
        setActivity([]);
        setActivityLoading(false);
        return;
      }
      orderQuery = orderQuery.in('customer_id', ids);
      finQuery = finQuery.in('customer_id', ids);
    }

    const [ordersRes, finRes] = await Promise.all([orderQuery, finQuery]);

    const orderItems: ActivityItem[] = ((ordersRes.data as Order[] | null) ?? []).map((o) => ({
      id: `order-${o.id}`,
      customer_name: o.customers?.name ?? 'Unknown',
      type: `Order: ${o.symbol}`,
      detail: `${o.status} · ${formatCurrency(o.amount)}`,
      timestamp: o.created_at,
      category: 'order' as const,
    }));

    const finItems: ActivityItem[] = ((finRes.data as FinTransaction[] | null) ?? []).map((t) => ({
      id: `fin-${t.id}`,
      customer_name: t.customers?.name ?? 'Unknown',
      type: t.type === 'DIV' ? 'Dividend' : 'Dividend Tax',
      detail: formatCurrency(t.amount),
      timestamp: t.created_at,
      category: 'transaction' as const,
    }));

    const merged = [...orderItems, ...finItems]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);

    setActivity(merged);
    setActivityLoading(false);
  }, [selectedPartnerId]);

  useEffect(() => {
    loadActivity();
  }, [loadActivity]);

  const newInvestorValue = summary
    ? newInvestorWindow === 7
      ? summary.new_investors_7d
      : newInvestorWindow === 30
        ? summary.new_investors_30d
        : summary.new_investors_90d
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-gray-900 hidden sm:inline">MFD Dashboard</span>
            <span className="ml-1 px-2 py-0.5 text-xs font-medium bg-teal-50 text-teal-700 rounded-full">
              Admin
            </span>
          </div>

          <div className="flex items-center gap-3">
            <PartnerSelector
              partners={partners}
              selectedId={selectedPartnerId}
              onChange={setSelectedPartnerId}
            />
            <button
              onClick={() => signOut()}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Metric Cards */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Investors */}
            <MetricCard
              label="Total Investors"
              value={summary ? Number(summary.total_investors) : 0}
              icon={Users}
              loading={summaryLoading}
            />

            {/* Active Investors */}
            <MetricCard
              label="Active Investors"
              value={summary ? Number(summary.active_investors) : 0}
              icon={UserPlus}
              loading={summaryLoading}
            />

            {/* New Investors with toggle */}
            <MetricCard
              label="New Investors"
              value={newInvestorValue}
              icon={TrendingUp}
              loading={summaryLoading}
              toggle={
                <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
                  {([7, 30, 90] as const).map((d) => (
                    <button
                      key={d}
                      onClick={(e) => { e.stopPropagation(); setNewInvestorWindow(d); }}
                      className={[
                        'px-2 py-0.5 text-xs font-medium rounded transition-colors',
                        newInvestorWindow === d
                          ? 'bg-white text-teal-700 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700',
                      ].join(' ')}
                    >
                      {d}d
                    </button>
                  ))}
                </div>
              }
            />

            {/* Relationship Managers */}
            <MetricCard
              label="Relationship Managers"
              value={rmWithCustomersCount}
              icon={UserCog}
              loading={rmLoading}
              clickable
              onClick={() => setRmModalOpen(true)}
            />
          </div>

          {/* Pending metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <MetricCard
              label="Total Investment"
              value={null}
              icon={Wallet}
              pending
              pendingTooltip="This metric requires a connected investment data source. Values will appear here once configured."
            />
            <MetricCard
              label="Current Portfolio"
              value={null}
              icon={PieChart}
              pending
              pendingTooltip="Portfolio valuation data is not yet connected. This will show total current portfolio value."
            />
            <MetricCard
              label="Monthly Growth"
              value={null}
              icon={BarChart3}
              pending
              pendingTooltip="Growth trend data source not connected. This will display month-over-month growth percentage."
            />
            <MetricCard
              label="Portfolio Allocation"
              value={null}
              icon={Target}
              pending
              pendingTooltip="Allocation breakdown requires a connected portfolio data feed. This will show asset allocation distribution."
            />
          </div>
        </div>

        {/* Customer Table */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Investors</h2>
          <CustomerTable customers={customers} loading={customersLoading} />
        </div>

        {/* Activity Feed */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Activity</h2>
          <ActivityFeed items={activity} loading={activityLoading} />
        </div>
      </main>

      <RMBreakdownModal
        open={rmModalOpen}
        onClose={() => setRmModalOpen(false)}
        data={rmCounts}
        loading={rmLoading}
      />
    </div>
  );
}

function stringValue(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function normalizeCustomerStatus(status: string | null): Customer['status'] {
  switch (status?.toLowerCase()) {
    case 'approved':
      return 'approved';
    case 'closed':
      return 'closed';
    case 'unlinked':
      return 'unlinked';
    default:
      return 'pending';
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
