import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Info } from 'lucide-react';
import { useState } from 'react';

interface MetricCardProps {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  loading?: boolean;
  pending?: boolean;
  pendingTooltip?: string;
  toggle?: ReactNode;
  onClick?: () => void;
  clickable?: boolean;
}

export function MetricCard({
  label,
  value,
  icon: Icon,
  loading,
  pending,
  pendingTooltip,
  toggle,
  onClick,
  clickable,
}: MetricCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      onClick={onClick}
      className={[
        'bg-white rounded-xl border p-5 transition-all',
        pending
          ? 'border-gray-200 bg-gray-50/50'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm',
        clickable ? 'cursor-pointer' : '',
      ].join(' ')}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${pending ? 'bg-gray-100' : 'bg-teal-50'}`}>
          <Icon className={`w-4.5 h-4.5 ${pending ? 'text-gray-400' : 'text-teal-600'}`} style={{ width: 18, height: 18 }} />
        </div>
        {toggle}
      </div>

      <p className={`text-sm font-medium mb-1 ${pending ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>

      {loading ? (
        <div className="h-8 w-20 bg-gray-100 rounded animate-pulse" />
      ) : pending ? (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-400">Not connected</span>
          <div className="relative" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
            <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
            {showTooltip && pendingTooltip && (
              <div className="absolute bottom-full right-0 mb-2 w-48 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg z-10 whitespace-normal">
                {pendingTooltip}
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="text-2xl font-bold font-mono text-gray-900 tabular-nums">{value}</p>
      )}

      {pending && (
        <p className="text-xs text-gray-400 mt-2">Data source not connected yet</p>
      )}
    </div>
  );
}
