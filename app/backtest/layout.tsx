import Link from 'next/link';

export default function ServiceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-800 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap justify-between items-center gap-4">
          <Link href="/" className="text-xl font-semibold text-white">Quant Edge</Link>
          <nav className="flex flex-wrap items-center gap-5 text-sm font-medium text-slate-300">
            <Link href="/dashboard" className="hover:text-amber-400">Dashboard</Link>
            <Link href="/backtest" className="hover:text-amber-400">Strategy Backtester</Link>
            <Link href="/my-plan" className="hover:text-amber-400">My Plan</Link>
            <Link href="/subscribe" className="hover:text-amber-400">Subscribe Plans</Link>
            <Link href="/admin" className="hover:text-amber-400">Admin Panel</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}