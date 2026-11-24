'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Sub = {
  id: number;
  tradingviewUsername: string;
  planName: string;
  amountInr: number;
  paymentStatus: string;
  accessStatus: string;
  startsAt: string | null;
  expiresAt: string | null;
};

export default function MyPlanPage() {
  const [subs, setSubs] = useState<Sub[]>([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/my-subscriptions')
      .then(async (res) => {
        if (!res.ok) {
          setError('Please sign in to view your subscription.');
          setLoading(false);
          return;
        }
        const data = await res.json();
        setEmail(data.user?.email || '');
        setSubs(data.subscriptions || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load subscription data.');
        setLoading(false);
      });
  }, []);

  function getDaysLeft(expiresAt: string | null) {
    if (!expiresAt) return 0;
    const diff = new Date(expiresAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white py-10 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">My Indicator Subscription</h1>
            {email && <p className="text-sm text-gray-400">Signed in as {email}</p>}
          </div>
          <div className="space-x-4 text-sm">
            <Link href="/subscribe" className="text-orange-400 hover:underline">Plans</Link>
            <Link href="/admin" className="text-gray-300 hover:underline">Admin</Link>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-900/40 border border-red-700 rounded-lg text-red-200 mb-6">
            {error}{' '}
            <Link href="/sign-in" className="underline font-semibold">Sign In</Link>
          </div>
        )}

        {loading ? (
          <p className="text-gray-400">Loading your plans...</p>
        ) : subs.length === 0 ? (
          <div className="p-8 bg-gray-900 border border-gray-800 rounded-xl text-center">
            <p className="text-gray-400 mb-4">You don&apos;t have an active indicator subscription yet.</p>
            <Link
              href="/subscribe"
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 rounded-lg font-medium"
            >
              View Plans
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {subs.map((s) => (
              <div
                key={s.id}
                className="p-6 bg-gray-900 border border-gray-800 rounded-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div>
                  <h2 className="text-lg font-semibold">{s.planName} - ₹{s.amountInr}</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    TradingView Username:{' '}
                    <span className="font-mono text-orange-300">{s.tradingviewUsername}</span>
                  </p>
                  <p className="text-sm text-gray-400">
                    Expires:{' '}
                    {s.expiresAt ? new Date(s.expiresAt).toLocaleDateString() : 'Pending payment'}
                    {s.expiresAt ? ` (${getDaysLeft(s.expiresAt)} days left)` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs font-medium">
                  <span
                    className={`px-3 py-1 rounded-full ${
                      s.paymentStatus === 'paid'
                        ? 'bg-green-900/60 text-green-300 border border-green-700'
                        : 'bg-yellow-900/60 text-yellow-300 border border-yellow-700'
                    }`}
                  >
                    Payment: {s.paymentStatus}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full ${
                      s.accessStatus === 'active'
                        ? 'bg-blue-900/60 text-blue-300 border border-blue-700'
                        : 'bg-gray-800 text-gray-300 border border-gray-700'
                    }`}
                  >
                    TV Access: {s.accessStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}