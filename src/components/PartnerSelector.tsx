import { useState } from 'react';
import { ChevronsUpDown, Check, Building2 } from 'lucide-react';
import type { Partner } from '@/types/database';

interface PartnerSelectorProps {
  partners: Partner[];
  selectedId: string | null;
  onChange: (id: string | null) => void;
}

export function PartnerSelector({ partners, selectedId, onChange }: PartnerSelectorProps) {
  const [open, setOpen] = useState(false);

  const selected = partners.find((p) => p.id === selectedId);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-400 transition-colors min-w-[180px]"
      >
        <Building2 className="w-4 h-4 text-gray-400" />
        <span className="flex-1 text-left truncate">
          {selected ? selected.name : 'All Partners'}
        </span>
        <ChevronsUpDown className="w-4 h-4 text-gray-400" />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-full min-w-[200px] bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 max-h-72 overflow-y-auto">
          <button
            onMouseDown={() => { onChange(null); setOpen(false); }}
            className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            All Partners
            {!selectedId && <Check className="w-4 h-4 text-teal-600" />}
          </button>
          <div className="border-t border-gray-100 my-1" />
          {partners.map((p) => (
            <button
              key={p.id}
              onMouseDown={() => { onChange(p.id); setOpen(false); }}
              className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <span className="truncate">{p.name}</span>
              {selectedId === p.id && <Check className="w-4 h-4 text-teal-600 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
