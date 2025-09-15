// src/components/StockTable.tsx
import React from 'react';
import type { Quote } from '../services/api';

type Props = {
  quotes: Quote[];
  onSort: (col: 'symbol' | 'price' | 'change') => void;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  onSelect?: (symbol: string) => void;
};

export default function StockTable({ quotes, onSort, sortBy, sortDir, onSelect }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => onSort('symbol')}
            >
              Symbol {sortBy === 'symbol' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
            </th>
            <th
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => onSort('price')}
            >
              Price {sortBy === 'price' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
            </th>
            <th
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => onSort('change')}
            >
              Change % {sortBy === 'change' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {quotes.map((q) => (
            <tr
              key={q.symbol}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => onSelect?.(q.symbol)}
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{q.symbol}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                {q.price != null ? q.price.toFixed(2) : '—'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                {q.changePercent == null ? (
                  '—'
                ) : (
                  <span className={q.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {q.changePercent >= 0 ? '+' : ''}
                    {q.changePercent.toFixed(2)}%
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
