import type { CustomerStatus } from '@/types/database';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, Users, UserPlus, UserCog, Wallet, PieChart, BarChart3, Target } from 'lucide-react';
import { Info } from 'lucide-react';

export const STATUS_COLORS: Record<CustomerStatus, string> = {
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  closed: 'bg-gray-100 text-gray-600 border-gray-200',
  unlinked: 'bg-red-50 text-red-700 border-red-200',
};

export const STATUS_LABELS: Record<CustomerStatus, string> = {
  approved: 'Approved',
  pending: 'Pending',
  closed: 'Closed',
  unlinked: 'Unlinked',
};

export const METRIC_ICONS: Record<string, LucideIcon> = {
  total_investors: Users,
  active_investors: UserPlus,
  new_investors: TrendingUp,
  rm_count: UserCog,
  total_investment: Wallet,
  current_portfolio: PieChart,
  monthly_growth: BarChart3,
  portfolio_allocation: Target,
};

export { Info };
