export type UserRole = 'admin' | 'partner';

export interface Partner {
  id: string;
  name: string;
  code: string;
  created_at: string;
}

export interface Profile {
  id: string;
  role: UserRole;
  partner_id: string | null;
  created_at: string;
}

export interface RelationshipManager {
  id: string;
  partner_id: string;
  name: string;
  email: string | null;
  created_at: string;
}

export type CustomerStatus = 'approved' | 'pending' | 'closed' | 'unlinked';

export interface Customer {
  id: string;
  partner_id: string;
  rm_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  account_number: string;
  status: CustomerStatus;
  created_at: string;
  relationship_managers?: RelationshipManager | null;
}

export type OrderStatus = 'executed' | 'pending' | 'cancelled';

export interface Order {
  id: string;
  customer_id: string;
  symbol: string;
  status: OrderStatus;
  amount: number;
  created_at: string;
  customers?: Pick<Customer, 'name'>;
}

export type FinTransactionType = 'DIV' | 'DIVTAX';

export interface FinTransaction {
  id: string;
  customer_id: string;
  type: FinTransactionType;
  amount: number;
  created_at: string;
  customers?: Pick<Customer, 'name'>;
}

export interface DashboardSummary {
  partner_id: string;
  total_investors: number;
  active_investors: number;
  new_investors_7d: number;
  new_investors_30d: number;
  new_investors_90d: number;
}

export interface ActivityItem {
  id: string;
  customer_name: string;
  type: string;
  detail: string;
  timestamp: string;
  category: 'order' | 'transaction';
}
