'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Sub = {
  id: number;
  userEmail: string;
  tradingviewUsername: string;
  planName: string;
  amountInr: number;
  paymentStatus: string;
  accessStatus: string;
  expiresAt: string | null;
};

export default function AdminPage() {
  const [subs, setSubs] = useState<Sub[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadSubs() {
    setLoading(true);
    const res = await fetch('/api/admin/subscriptions');
    if (!res.ok) {
      setError('Please sign in first to view the Admin Dashboard.');
      setLoading(false);
      return;
    }
    const data = await res.json();
    setSubs(data.subscriptions || []);
    setLoading(false);
  }

  useEffect(() => {
    loadSubs();
  }, []);

  async function updateAccess(id: number, accessStatus: string) {
    await fetch('/api/admin/subscriptions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, accessStatus }),
    });
    loadSubs();
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white py-10 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Admin - TradingView Access Management</h1>
          <Link href="/subscribe" className="text-orange-400 hover:underline text-sm">
            ← Back to Pricing
          </Link>
        </div>

        {error && <p className="text-red-400 mb-4">{error}</p>}
        {loading ? (
          <p className="text-gray-400">Loading subscriptions...</p>
        ) : (
          <div className="overflow-x-auto bg-gray-900 border border-gray-800 rounded-xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-800 text-gray-300">
                <tr>
                  <th className="p-3">Customer Email</th>
                  <th className="p-3">TradingView Username</th>
                  <th className="p-3">Plan</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3">TV Access</th>
                  <th className="p-3">Expires</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subs.map((s) => (
                  <tr key={s.id} className="border-t border-gray-800">
                    <td className="p-3">{s.userEmail}</td>
                    <td className="p-3 font-mono text-orange-300">{s.tradingviewUsername}</td>
                    <td className="p-3">{s.planName}</td>
                    <td className="p-3">₹{s.amountInr}</td>
                    <td className="p-3">
                      <span className={s.paymentStatus === 'paid' ? 'text-green-400' : 'text-yellow-400'}>
                        {s.paymentStatus}
                      </span>
                    </td>
                    <td className="p-3">{s.accessStatus}</td>
                    <td className="p-3">
                      {s.expiresAt ? new Date(s.expiresAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="p-3 space-x-2">
                      <button
                        onClick={() => updateAccess(s.id, 'active')}
                        className="px-2.5 py-1 bg-green-700 hover:bg-green-600 rounded text-xs"
                      >
                        Grant Access
                      </button>
                      <button
                        onClick={() => updateAccess(s.id, 'revoked')}
                        className="px-2.5 py-1 bg-red-700 hover:bg-red-600 rounded text-xs"
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
                {subs.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-slate-400">
                      No subscriptions yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}