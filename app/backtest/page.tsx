'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const ENGINE_URL = process.env.NEXT_PUBLIC_ENGINE_URL || 'http://127.0.0.1:8000';

type Strategy = {
  id: number;
  name: string;
  strategy_type: 'momentum' | 'mean_reversion' | 'breakout';
};

type BacktestResult = {
  id: number;
  symbol: string;
  initial_capital: number;
  final_capital: number;
  total_return: number;
  sharpe_ratio: number | null;
  max_drawdown: number | null;
  win_rate: number | null;
  total_trades: number;
  profitable_trades: number;
  losing_trades: number;
  profit_factor: number | null;
};

const PRESET_PARAMS: Record<string, Record<string, number>> = {
  momentum: { fast_period: 10, slow_period: 30 },
  mean_reversion: { period: 20, std_dev: 2.0 },
  breakout: { lookback: 20 },
};

export default function BacktestPage() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [selectedStrategyId, setSelectedStrategyId] = useState<number | ''>('');
  const [newStrategyType, setNewStrategyType] = useState<'momentum' | 'mean_reversion' | 'breakout'>('momentum');
  const [symbol, setSymbol] = useState('AAPL');
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');
  const [initialCapital, setInitialCapital] = useState(100000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<BacktestResult | null>(null);

  async function loadStrategies() {
    try {
      const res = await fetch('/api/strategies');
      if (!res.ok) return;
      const data: Strategy[] = await res.json();
      setStrategies(data);
      if (data.length > 0 && !selectedStrategyId) {
        setSelectedStrategyId(data[0].id);
      }
    } catch {
      setError('Cannot reach Python Trading Engine on port 8000. Make sure uvicorn is running.');
    }
  }

  useEffect(() => {
    loadStrategies();
  }, []);

  async function createQuickStrategy() {
    setError('');
    try {
      const res = await fetch('/api/strategies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${newStrategyType.replace('_', ' ').toUpperCase()} Strategy`,
          description: 'Auto-created from Trading Platform UI',
          strategy_type: newStrategyType,
          parameters: PRESET_PARAMS[newStrategyType],
          is_active: true,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.detail || 'Failed to create strategy');
        return;
      }
      const created: Strategy = await res.json();
      await loadStrategies();
      setSelectedStrategyId(created.id);
    } catch {
      setError('Failed to connect to Python engine.');
    }
  }

  async function runBacktest(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!selectedStrategyId) {
      setError('Please create or select a strategy first.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/backtest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategy_id: Number(selectedStrategyId),
          symbol: symbol.trim().toUpperCase(),
          start_date: `${startDate}T00:00:00`,
          end_date: `${endDate}T00:00:00`,
          initial_capital: Number(initialCapital),
          commission: 0.001,
          slippage: 0.0005,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.detail === 'string' ? data.detail : 'Backtest failed. Check symbol/dates.');
      } else {
        setResult(data);
      }
    } catch {
      setError('Failed to run backtest. Make sure the Python server is running on port 8000.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white py-10 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8 border-b border-gray-800 pb-4">
          <h1 className="text-2xl font-bold">Algorithmic Strategy Backtester</h1>
          <div className="flex gap-5 text-sm">
            <Link href="/subscribe" className="text-gray-300 hover:text-white">Plans</Link>
            <Link href="/my-plan" className="text-gray-300 hover:text-white">My Plan</Link>
            <Link href="/backtest" className="text-orange-400 font-semibold">Backtest</Link>
            <Link href="/admin" className="text-gray-300 hover:text-white">Admin</Link>
          </div>
        </div>

        {error && (
          <div className="p-4 mb-6 bg-red-900/40 border border-red-700 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Quick Strategy Creator */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-lg font-semibold mb-3">1. Create Strategy</h2>
            <label className="block text-xs text-gray-400 mb-1">Strategy Type</label>
            <select
              value={newStrategyType}
              onChange={(e) => setNewStrategyType(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm mb-4"
            >
              <option value="momentum">Momentum (MA Crossover)</option>
              <option value="mean_reversion">Mean Reversion (Bollinger)</option>
              <option value="breakout">Breakout (Donchian)</option>
            </select>
            <button
              onClick={createQuickStrategy}
              className="w-full py-2 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 text-sm font-medium"
            >
              + Add Strategy
            </button>
          </div>

          {/* Backtest Form */}
          <form onSubmit={runBacktest} className="md:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-lg font-semibold mb-3">2. Run Backtest</h2>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Select Strategy</label>
                <select
                  value={selectedStrategyId}
                  onChange={(e) => setSelectedStrategyId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm"
                >
                  {strategies.length === 0 && <option value="">No strategies yet — add one left</option>}
                  {strategies.map((s) => (
                    <option key={s.id} value={s.id}>
                      #{s.id} — {s.name} ({s.strategy_type})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Symbol (e.g. AAPL, RELIANCE.NS, ^NSEI)</label>
                <input
                  type="text"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Initial Capital</label>
                <input
                  type="number"
                  value={initialCapital}
                  onChange={(e) => setInitialCapital(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-orange-600 hover:bg-orange-500 font-medium text-sm disabled:opacity-50"
            >
              {loading ? 'Running Backtest...' : 'Run Backtest'}
            </button>
          </form>
        </div>

        {/* Results */}
        {result && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Backtest Results — {result.symbol}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-800 rounded-lg">
                <div className="text-xs text-gray-400">Final Capital</div>
                <div className="text-xl font-bold mt-1">{result.final_capital.toFixed(2)}</div>
              </div>
              <div className="p-4 bg-gray-800 rounded-lg">
                <div className="text-xs text-gray-400">Total Return</div>
                <div className={`text-xl font-bold mt-1 ${result.total_return >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {(result.total_return * 100).toFixed(2)}%
                </div>
              </div>
              <div className="p-4 bg-gray-800 rounded-lg">
                <div className="text-xs text-gray-400">Win Rate</div>
                <div className="text-xl font-bold mt-1">
                  {result.win_rate != null ? `${(result.win_rate * 100).toFixed(1)}%` : 'N/A'}
                </div>
              </div>
              <div className="p-4 bg-gray-800 rounded-lg">
                <div className="text-xs text-gray-400">Sharpe Ratio</div>
                <div className="text-xl font-bold mt-1">
                  {result.sharpe_ratio != null ? result.sharpe_ratio.toFixed(2) : 'N/A'}
                </div>
              </div>
              <div className="p-4 bg-gray-800 rounded-lg">
                <div className="text-xs text-gray-400">Max Drawdown</div>
                <div className="text-xl font-bold mt-1 text-red-400">
                  {result.max_drawdown != null ? `${(result.max_drawdown * 100).toFixed(2)}%` : 'N/A'}
                </div>
              </div>
              <div className="p-4 bg-gray-800 rounded-lg">
                <div className="text-xs text-gray-400">Total Trades</div>
                <div className="text-xl font-bold mt-1">{result.total_trades}</div>
              </div>
              <div className="p-4 bg-gray-800 rounded-lg">
                <div className="text-xs text-gray-400">Profitable / Losing</div>
                <div className="text-xl font-bold mt-1">
                  <span className="text-green-400">{result.profitable_trades}</span> /{' '}
                  <span className="text-red-400">{result.losing_trades}</span>
                </div>
              </div>
              <div className="p-4 bg-gray-800 rounded-lg">
                <div className="text-xs text-gray-400">Profit Factor</div>
                <div className="text-xl font-bold mt-1">
                  {result.profit_factor != null ? result.profit_factor.toFixed(2) : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}