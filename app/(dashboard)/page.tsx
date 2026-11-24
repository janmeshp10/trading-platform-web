import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold tracking-wider uppercase mb-6">
          Quant Edge | Algorithmic Trading Engine
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Backtest, Validate &amp; Deploy{' '}
          <span className="text-amber-400">Quantitative Strategies</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Test algorithmic strategies against real historical market data powered by our Python FastAPI engine, analyze institutional risk metrics, and manage your subscription in one place.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/backtest"
            className="px-7 py-3.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm sm:text-base transition shadow-lg shadow-amber-500/20"
          >
            Launch Strategy Backtester
          </Link>
          <Link
            href="/subscribe"
            className="px-7 py-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 font-semibold text-sm sm:text-base transition"
          >
            View Subscription Plans
          </Link>
          <Link
            href="/dashboard"
            className="px-7 py-3.5 rounded-lg bg-transparent hover:bg-slate-900 text-slate-300 border border-slate-800 font-semibold text-sm sm:text-base transition"
          >
            Open Dashboard
          </Link>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-6 hover:border-amber-500/40 transition">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold mb-4">
              01
            </div>
            <h2 className="text-lg font-semibold text-white">
              Python Backtesting Engine
            </h2>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Execute Moving Average crossovers and custom rules with instant Sharpe Ratio, Win Rate, Max Drawdown, and Final Capital breakdowns.
            </p>
          </div>

          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-6 hover:border-amber-500/40 transition">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold mb-4">
              02
            </div>
            <h2 className="text-lg font-semibold text-white">
              Global &amp; NSE Market Data
            </h2>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Run simulations across NSE stocks (<span className="text-slate-200">RELIANCE.NS</span>, <span className="text-slate-200">TCS.NS</span>), US equities (<span className="text-slate-200">AAPL</span>), and major indices.
            </p>
          </div>

          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-6 hover:border-amber-500/40 transition">
            <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold mb-4">
              03
            </div>
            <h2 className="text-lg font-semibold text-white">
              Seamless INR Subscriptions
            </h2>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Upgrade plans via Razorpay UPI and card checkout with live plan status tracking and full admin controls.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}