import { X, UserCog } from 'lucide-react';
import type { RelationshipManager } from '@/types/database';

interface RMBreakdownModalProps {
  open: boolean;
  onClose: () => void;
  data: Array<{ rm: RelationshipManager; customer_count: number }>;
  loading: boolean;
}

export function RMBreakdownModal({ open, onClose, data, loading }: RMBreakdownModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <UserCog className="w-5 h-5 text-teal-600" />
            <h2 className="text-base font-semibold text-gray-900">Relationship Manager Breakdown</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-12 text-sm text-gray-400">
              No relationship managers with assigned customers found.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                  <th className="pb-2 font-medium">RM Name</th>
                  <th className="pb-2 font-medium">Email</th>
                  <th className="pb-2 text-right font-medium">Customers</th>
                </tr>
              </thead>
              <tbody>
                {data.map(({ rm, customer_count }) => (
                  <tr key={rm.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 font-medium text-gray-900">{rm.name}</td>
                    <td className="py-3 text-gray-500">{rm.email ?? '—'}</td>
                    <td className="py-3 text-right font-mono font-medium text-gray-900 tabular-nums">
                      {customer_count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
