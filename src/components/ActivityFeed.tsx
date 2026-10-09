import { ShoppingBag, ArrowDownCircle } from 'lucide-react';
import type { ActivityItem } from '@/types/database';

interface ActivityFeedProps {
  items: ActivityItem[];
  loading: boolean;
}

export function ActivityFeed({ items, loading }: ActivityFeedProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-900">Recent Activity</h2>
        <p className="text-xs text-gray-400 mt-0.5">Latest orders and transactions</p>
      </div>

      <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
                <div className="h-2.5 bg-gray-100 rounded animate-pulse w-1/3" />
              </div>
            </div>
          ))
        ) : items.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-gray-400">
            No recent activity to display.
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="px-4 py-3 flex items-start gap-3 hover:bg-gray-50/50 transition-colors">
              <div className={[
                'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                item.category === 'order' ? 'bg-teal-50' : 'bg-blue-50',
              ].join(' ')}>
                {item.category === 'order'
                  ? <ShoppingBag className="w-4 h-4 text-teal-600" />
                  : <ArrowDownCircle className="w-4 h-4 text-blue-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.customer_name}</p>
                  <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">
                    {formatRelative(item.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  <span className="font-medium text-gray-600">{item.type}</span>
                  {' — '}
                  {item.detail}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function formatRelative(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) {
    const mins = Math.floor(diff / (1000 * 60));
    if (mins < 1) return 'just now';
    return `${mins}m ago`;
  }
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}
