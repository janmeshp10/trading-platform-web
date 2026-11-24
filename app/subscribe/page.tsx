'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';

const PLANS = [
  {
    id: 'trial',
    name: 'First Month Trial',
    price: 199,
    duration: '30 Days',
    desc: 'Test the institutional SMC dashboard in live markets.',
  },
  {
    id: '6months',
    name: '6 Months Plan',
    price: 1999,
    duration: '180 Days',
    desc: 'Best value for consistent swing & intraday traders.',
    popular: true,
  },
  {
    id: '12months',
    name: '12 Months Plan',
    price: 3499,
    duration: '365 Days',
    desc: 'Full year access with priority indicator updates.',
  },
];

export default function SubscribePage() {
  const [tvUsername, setTvUsername] = useState('');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  async function handleCheckout(planId: string) {
    setMessage(null);
    if (!tvUsername.trim()) {
      setMessage({ type: 'error', text: 'Please enter your TradingView username first.' });
      return;
    }

    setLoadingPlan(planId);
    try {
      const res = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, tradingviewUsername: tvUsername.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage({
          type: 'error',
          text: res.status === 401 ? 'Please sign in first before subscribing.' : data.error || 'Order failed',
        });
        setLoadingPlan(null);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: 'Trading Indicator Platform',
        description: data.planName,
        order_id: data.orderId,
        handler: async function (response: any) {
          const verifyRes = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          });
          if (verifyRes.ok) {
            setMessage({
              type: 'success',
              text: `Payment successful! TradingView access for "${tvUsername.trim()}" is now queued for admin approval.`,
            });
          } else {
            setMessage({ type: 'error', text: 'Payment verification failed. Contact support.' });
          }
        },
        theme: { color: '#ea580c' },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white py-12 px-4">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold">Indicator Subscription Plans</h1>
          <div className="space-x-4 text-sm">
            <Link href="/sign-in" className="text-gray-300 hover:text-white underline">Sign In</Link>
            <Link href="/admin" className="text-orange-400 hover:text-orange-300 underline">Admin Panel</Link>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8 max-w-md">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Your TradingView Username (Required for Invite-Only Access)
          </label>
          <input
            type="text"
            value={tvUsername}
            onChange={(e) => setTvUsername(e.target.value)}
            placeholder="e.g. janmesh_trades"
            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-orange-500"
          />
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg mb-8 text-sm ${
              message.type === 'success'
                ? 'bg-green-900/50 border border-green-700 text-green-200'
                : 'bg-red-900/50 border border-red-700 text-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl p-6 bg-gray-900 border ${
                plan.popular ? 'border-orange-500' : 'border-gray-800'
              } flex flex-col justify-between`}
            >
              <div>
                <h2 className="text-xl font-semibold mb-1">{plan.name}</h2>
                <p className="text-gray-400 text-sm mb-4">{plan.desc}</p>
                <div className="text-3xl font-bold mb-1">₹{plan.price}</div>
                <div className="text-xs text-gray-400 mb-6">{plan.duration} access</div>
              </div>
              <button
                onClick={() => handleCheckout(plan.id)}
                disabled={loadingPlan === plan.id}
                className="w-full py-2.5 px-4 rounded-lg bg-orange-600 hover:bg-orange-500 font-medium disabled:opacity-50"
              >
                {loadingPlan === plan.id ? 'Opening Razorpay...' : 'Pay with Razorpay'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}