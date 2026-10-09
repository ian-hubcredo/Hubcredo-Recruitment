import { useState, useMemo, useEffect } from 'react';
import { ChevronUp, ChevronDown, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Customer, CustomerStatus } from '@/types/database';
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/constants';

interface CustomerTableProps {
  customers: Customer[];
  loading: boolean;
}

type SortField = 'name' | 'email' | 'account_number' | 'status' | 'created_at';
type SortDir = 'asc' | 'desc';

const STATUS_FILTERS: Array<{ key: CustomerStatus | 'all'; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'approved', label: 'Approved' },
  { key: 'pending', label: 'Pending' },
  { key: 'closed', label: 'Closed' },
  { key: 'unlinked', label: 'Unlinked' },
];

const PAGE_SIZE = 10;

export function CustomerTable({ customers, loading }: CustomerTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CustomerStatus | 'all'>('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    let result = [...customers];

    if (statusFilter !== 'all') {
      result = result.filter((c) => c.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.email?.toLowerCase().includes(q) ?? false) ||
          c.account_number.toLowerCase().includes(q) ||
          (c.phone?.toLowerCase().includes(q) ?? false) ||
          (c.relationship_managers?.name.toLowerCase().includes(q) ?? false)
      );
    }

    result.sort((a, b) => {
      let aVal: string | number = '';
      let bVal: string | number = '';

      switch (sortField) {
        case 'name': aVal = a.name; bVal = b.name; break;
        case 'email': aVal = a.email ?? ''; bVal = b.email ?? ''; break;
        case 'account_number': aVal = a.account_number; bVal = b.account_number; break;
        case 'status': aVal = a.status; bVal = b.status; break;
        case 'created_at': aVal = a.created_at; bVal = b.created_at; break;
      }

      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [customers, search, statusFilter, sortField, sortDir]);

  useEffect(() => {
    setPage(0);
  }, [search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronUp className="w-3.5 h-3.5 text-gray-300" />;
    return sortDir === 'asc'
      ? <ChevronUp className="w-3.5 h-3.5 text-teal-600" />
      : <ChevronDown className="w-3.5 h-3.5 text-teal-600" />;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      {/* Header / Controls */}
      <div className="p-4 border-b border-gray-100 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, account, phone, or RM..."
              className="w-full pl-10 pr-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={[
                'px-3 py-1 text-xs font-medium rounded-full transition-colors border',
                statusFilter === f.key
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300',
              ].join(' ')}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
              <th className="px-4 py-3 font-medium cursor-pointer select-none hover:text-gray-700" onClick={() => toggleSort('name')}>
                <span className="flex items-center gap-1">Name <SortIcon field="name" /></span>
              </th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">Email</th>
              <th className="px-4 py-3 font-medium hidden lg:table-cell">Phone</th>
              <th className="px-4 py-3 font-medium cursor-pointer select-none hover:text-gray-700" onClick={() => toggleSort('account_number')}>
                <span className="flex items-center gap-1">Account <SortIcon field="account_number" /></span>
              </th>
              <th className="px-4 py-3 font-medium cursor-pointer select-none hover:text-gray-700" onClick={() => toggleSort('status')}>
                <span className="flex items-center gap-1">Status <SortIcon field="status" /></span>
              </th>
              <th className="px-4 py-3 font-medium hidden xl:table-cell">RM</th>
              <th className="px-4 py-3 font-medium cursor-pointer select-none hover:text-gray-700" onClick={() => toggleSort('created_at')}>
                <span className="flex items-center gap-1">Created <SortIcon field="created_at" /></span>
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i} className="border-b border-gray-50">
                  {[...Array(7)].map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : pageData.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                  No customers found matching your filters.
                </td>
              </tr>
            ) : (
              pageData.map((c) => (
                <tr key={c.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{c.name}</td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell whitespace-nowrap">{c.email ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500 hidden lg:table-cell whitespace-nowrap font-mono text-xs">{c.phone ?? '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600 whitespace-nowrap">{c.account_number}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full border ${STATUS_COLORS[c.status]}`}>
                      {STATUS_LABELS[c.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden xl:table-cell whitespace-nowrap">
                    {c.relationship_managers?.name ?? <span className="text-gray-300">Unassigned</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                    {new Date(c.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Showing <span className="font-medium text-gray-700">{page * PAGE_SIZE + 1}</span>–
            <span className="font-medium text-gray-700">{Math.min((page + 1) * PAGE_SIZE, filtered.length)}</span> of{' '}
            <span className="font-medium text-gray-700">{filtered.length}</span>
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-gray-500 px-2">
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
