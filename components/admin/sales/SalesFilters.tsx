// components/admin/sales/SalesFilters.tsx
"use client";

import { Calendar } from 'lucide-react';

interface SalesFiltersProps {
  month: string | null;
  months: Array<{ label: string; value: string }>;
  onMonth: (month: string | null) => void;
}

export default function SalesFilters({ 
  month, 
  months, 
  onMonth 
}: SalesFiltersProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <select
          value={month || ''}
          onChange={(e) => onMonth(e.target.value || null)}
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="">All Time</option>
          {months.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>
      
      {month && (
        <button
          onClick={() => onMonth(null)}
          className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  );
}