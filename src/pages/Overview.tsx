import { Link } from 'react-router-dom'
import { useStore } from '@/store'
import { netWorth, totalAssets, totalLiabilities, totalCash } from '@/lib/calculations'
import { formatCurrency, monthsBetween } from '@/lib/formatters'

const pages = [
  { label: 'Goals', to: '/goals', phase: 'Phase 1' },
  { label: 'Accounts', to: '/accounts', phase: 'Phase 1' },
  { label: 'Expenses', to: '/expenses', phase: 'Phase 1' },
  { label: 'Net Worth', to: '/net-worth', phase: 'Phase 2' },
  { label: 'Income', to: '/income', phase: 'Phase 2' },
  { label: 'Schedule', to: '/schedule', phase: 'Phase 2' },
  { label: 'Institutions', to: '/institutions', phase: 'Phase 3' },
  { label: 'Emergency Fund', to: '/emergency-fund', phase: 'Phase 3' },
]

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-5">
      <p className="text-xs text-stone-500 mb-1">{label}</p>
      <p className={`font-finance text-xl font-medium ${color ?? 'text-stone-900'}`}>{value}</p>
    </div>
  )
}

export function Overview() {
  const { accounts, goals, transactions, expenseSettings, scheduleItems, emergencyFundScenarios, resetForOnboarding } = useStore()

  const nw = netWorth(accounts)
  const assets = totalAssets(accounts)
  const liabilities = totalLiabilities(accounts)
  const cash = totalCash(accounts)

  // Upcoming schedule items (not completed today)
  const todayStr = new Date().toISOString().split('T')[0]
  const upcoming = scheduleItems.filter((s) => !s.completedDates.includes(todayStr)).slice(0, 3)

  // Expense stats
  const months = monthsBetween(expenseSettings.startDate, expenseSettings.endDate)
  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0)
  const avgMonthly = totalSpent / months

  // Emergency fund progress
  const efTarget = emergencyFundScenarios.filter((s) => s.enabled).reduce((sum, s) => sum + s.amount, 0)
  const efCurrent = cash
  const efPct = efTarget > 0 ? Math.min(100, (efCurrent / efTarget) * 100) : 0

  // Goals closest to completion
  const nearGoals = [...goals]
    .filter((g) => !g.completedAt && g.targetAmount > 0)
    .sort((a, b) => b.currentAmount / b.targetAmount - a.currentAmount / a.targetAmount)
    .slice(0, 2)

  return (
    <div>
      {/* Net Worth Hero */}
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">Net Worth</p>
        <p className={`font-finance text-5xl font-medium tracking-tight ${nw >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
          {formatCurrency(nw)}
        </p>
        <div className="flex gap-6 mt-3">
          <span className="text-sm text-stone-500">Assets <span className="font-finance font-medium text-stone-700">{formatCurrency(assets)}</span></span>
          <span className="text-stone-300">·</span>
          <span className="text-sm text-stone-500">Liabilities <span className="font-finance font-medium text-stone-700">{formatCurrency(liabilities)}</span></span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <StatCard label="Monthly Spending Avg" value={formatCurrency(avgMonthly)} />
        <StatCard label="Monthly Goal" value={formatCurrency(expenseSettings.monthlyGoal)} />
        <StatCard
          label="vs. Goal"
          value={formatCurrency(Math.abs(avgMonthly - expenseSettings.monthlyGoal), { sign: true })}
          color={avgMonthly <= expenseSettings.monthlyGoal ? 'text-emerald-700' : 'text-red-600'}
        />
      </div>

      {/* Two-column bottom */}
      <div className="grid grid-cols-2 gap-8">
        {/* Goals progress */}
        <div>
          <h2 className="text-sm font-semibold text-stone-900 mb-3">Goals</h2>
          <div className="space-y-3">
            {nearGoals.map((g) => {
              const pct = Math.min(100, (g.currentAmount / g.targetAmount) * 100)
              return (
                <div key={g.id} className="bg-white border border-stone-200 rounded-xl p-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-stone-800">{g.title}</span>
                    <span className="font-finance text-xs text-stone-500">{pct.toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-stone-900 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="font-finance text-xs text-stone-500">{formatCurrency(g.currentAmount)}</span>
                    <span className="font-finance text-xs text-stone-400">{formatCurrency(g.targetAmount)}</span>
                  </div>
                </div>
              )
            })}
            <Link to="/goals" className="text-xs text-stone-500 hover:text-stone-900 transition-colors">
              View all goals →
            </Link>
          </div>
        </div>

        {/* What's next */}
        <div>
          <h2 className="text-sm font-semibold text-stone-900 mb-3">What's next</h2>
          <div className="space-y-2">
            {/* Emergency fund */}
            {efTarget > 0 && (
              <div className="bg-white border border-stone-200 rounded-xl p-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-stone-800">Emergency Fund</span>
                  <span className="font-finance text-xs text-stone-500">{efPct.toFixed(0)}%</span>
                </div>
                <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${efPct}%` }} />
                </div>
                <p className="text-xs text-stone-500 mt-1.5">{formatCurrency(efCurrent)} of {formatCurrency(efTarget)}</p>
              </div>
            )}

            {/* Upcoming tasks */}
            {upcoming.slice(0, 2).map((item) => (
              <div key={item.id} className="bg-white border border-stone-200 rounded-xl px-4 py-3">
                <p className="text-sm text-stone-800">{item.task}</p>
                <p className="text-xs text-stone-400 mt-0.5 capitalize">{item.frequency.replace('_', '/')}</p>
              </div>
            ))}
            <Link to="/schedule" className="text-xs text-stone-500 hover:text-stone-900 transition-colors">
              View full schedule →
            </Link>
          </div>
        </div>
      </div>

      {/* Section links */}
      <div className="mt-12 pt-8 border-t border-stone-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-stone-900">All sections</h2>
          <button
            onClick={resetForOnboarding}
            className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
          >
            ↺ Reset onboarding
          </button>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {pages.map((p) => (
            <Link
              key={p.to}
              to={p.to}
              className="bg-white border border-stone-200 rounded-xl p-4 hover:border-stone-400 hover:shadow-sm transition-all group"
            >
              <p className="text-[10px] text-stone-400 uppercase tracking-widest mb-1">{p.phase}</p>
              <p className="text-sm font-medium text-stone-800 group-hover:text-stone-900">{p.label}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
