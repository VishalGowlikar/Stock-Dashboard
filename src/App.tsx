// src/App.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { fetchGlobalQuote} from './services/api';
import StockTable from './components/StockTable';
import './tailwind.css';

const DEFAULT_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'TSLA'];

export default function App() {
  const [symbols, setSymbols] = useState<string[]>(DEFAULT_SYMBOLS);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'symbol' | 'price' | 'change'>('symbol');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [series, setSeries] = useState<{ date: string; close: number }[] | null>(null);

  // Fetch quotes for a list of symbols
  const fetchQuotes = useCallback(
    async (list: string[]) => {
      setLoading(true);
      setErrorMsg(null);
      try {
        // Promise.allSettled so one failing symbol doesn't kill the whole set
        const promises = list.map((s) => fetchGlobalQuote(s));
        const results = await Promise.all(promises);
        setQuotes(results);
      } catch (err: any) {
        setErrorMsg(err.message ?? 'Unknown error fetching quotes');
      } finally {
        setLoading(false);
      }
    },
    [setQuotes]
  );

  useEffect(() => {
    fetchQuotes(symbols);
  }, [symbols, fetchQuotes]);

  // add search symbol
  const addSymbol = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const s = search.trim().toUpperCase();
    if (!s) return;
    if (symbols.includes(s)) {
      setSearch('');
      return;
    }
    // optimistic add to list (fetch will update quote)
    setSymbols((prev) => [s, ...prev].slice(0, 20));
    setSearch('');
  };

  // sort handler
  const onSort = (col: 'symbol' | 'price' | 'change') => {
    if (sortBy === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortBy(col);
      setSortDir('asc');
    }
  };

  const sortedQuotes = [...quotes].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    if (sortBy === 'symbol') return dir * a.symbol.localeCompare(b.symbol);
    if (sortBy === 'price') return dir * ((a.price ?? -Infinity) - (b.price ?? -Infinity));
    return dir * ((a.changePercent ?? -Infinity) - (b.changePercent ?? -Infinity));
  });

  // fetch series for chart when selecting a row
  useEffect(() => {
    if (!selectedSymbol) {
      setSeries(null);
      return;
    }
    let mounted = true;
    (async () => {
      try {
        setSeries(null); // show spinner if you want
        const s = await fetchDailySeries(selectedSymbol, 40);
        if (!mounted) return;
        setSeries(s);
      } catch (err) {
        // ignore chart errors
        setSeries(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [selectedSymbol]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">Stock Dashboard</h1>
          <p className="text-sm text-gray-600">Simple table of live quotes — built with React + Tailwind</p>
        </header>

        <form onSubmit={addSymbol} className="flex gap-2 items-center mb-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Add symbol (e.g., AAPL)"
            className="flex-1 px-3 py-2 border rounded shadow-sm focus:outline-none"
          />
          <button className="px-4 py-2 bg-indigo-600 text-white rounded" type="submit">
            Add
          </button>
          <button
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded"
            type="button"
            onClick={() => fetchQuotes(symbols)}
          >
            Refresh
          </button>
        </form>

        {errorMsg && (
          <div className="mb-4 p-3 rounded bg-red-100 text-red-800">{errorMsg}</div>
        )}

        <div className="mb-4">
          <div className="rounded-lg p-4 bg-white shadow">
            {loading ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="gray" strokeWidth="4" fill="none" strokeDasharray="31.4 31.4" />
                </svg>
                <span>Loading quotes…</span>
              </div>
            ) : (
              <StockTable
                quotes={sortedQuotes}
                onSort={onSort}
                sortBy={sortBy}
                sortDir={sortDir}
                onSelect={(s) => setSelectedSymbol(s)}
              />
            )}
          </div>
        </div>

        {/* Chart area (optional) */}
        {selectedSymbol && (
          <div className="rounded-lg p-4 bg-white shadow">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Daily chart — {selectedSymbol}</h3>
              <button className="text-sm text-gray-500" onClick={() => setSelectedSymbol(null)}>
                Close
              </button>
            </div>
            {series == null ? (
              <div className="text-sm text-gray-500">Loading chart…</div>
            ) : (
              <div className="w-full">
                {/* small inline chart component placeholder; paste Chart code from optional section below */}
                <pre className="text-xs text-gray-600">
                  {series.map((s) => `${s.date} ${s.close}`).slice(-5).join('\n')}
                </pre>
              </div>
            )}
          </div>
        )}

        <footer className="mt-6 text-xs text-gray-500">
          Tip: Alpha Vantage free tier has API rate limits — for more stocks or heavy usage put a small caching proxy in front.
        </footer>
      </div>
    </div>
  );
}
