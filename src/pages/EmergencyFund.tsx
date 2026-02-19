import { useState } from 'react'
import { useStore } from '@/store'
import { PageHeader } from '@/components/layout/PageHeader'
import { Toggle } from '@/components/ui/Toggle'
import { totalCash } from '@/lib/calculations'
import { formatCurrency } from '@/lib/formatters'

export function EmergencyFund() {
  const { emergencyFundScenarios, accounts, toggleScenario, updateScenarioAmount, goals, addGoal } = useStore()
  const [monthlyContribution, setMonthlyContribution] = useState(200)
  const [goalAdded, setGoalAdded] = useState(false)

  const efTotal = emergencyFundScenarios.filter((s) => s.enabled).reduce((sum, s) => sum + s.amount, 0)
  const currentCash = totalCash(accounts)
  const gap = Math.max(0, efTotal - currentCash)
  const monthsToTarget = monthlyContribution > 0 ? Math.ceil(gap / monthlyContribution) : null
  const monthlyInflationTopUp = efTotal * 0.05 / 12
  const pct = efTotal > 0 ? Math.min(100, (currentCash / efTotal) * 100) : 0

  const handleAddGoal = () => {
    addGoal({
      timeframe: 'short',
      type: 'savings',
      title: 'Emergency Fund',
      description: 'Build my personalized emergency fund',
      targetAmount: efTotal,
      currentAmount: currentCash,
      targetDate: '',
      smart: {
        specific: `Build an emergency fund of ${formatCurrency(efTotal)}`,
        measurable: 'Reach the target amount in a dedicated savings account',
        achievable: `Save ${formatCurrency(monthlyContribution)}/month`,
        relevant: 'Provides financial security against unexpected expenses',
        timeBound: monthsToTarget ? `Approximately ${monthsToTarget} months from now` : 'TBD',
      },
    })
    setGoalAdded(true)
  }

  return (
    <div>
      <PageHeader
        title="Emergency Fund"
        subtitle="Calculate your personalized emergency fund target."
      />

      <div className="grid grid-cols-[1fr_300px] gap-8">
        {/* Scenario checklist */}
        <div>
          <p className="text-sm text-stone-500 mb-5">
            Toggle the scenarios that apply to your life. Each one adds to your recommended emergency fund target.
          </p>

          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
            {emergencyFundScenarios.map((scenario, i) => (
              <div
                key={scenario.id}
                className={`flex items-start gap-4 px-5 py-4 transition-colors ${scenario.enabled ? 'bg-stone-50/60' : 'bg-white'} ${i > 0 ? 'border-t border-stone-100' : ''}`}
              >
                {/* Toggle */}
                <div className="pt-0.5">
                  <Toggle checked={scenario.enabled} onChange={() => toggleScenario(scenario.id)} />
                </div>

                {/* Label */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium transition-colors ${scenario.enabled ? 'text-stone-900' : 'text-stone-500'}`}>
                    {scenario.label}
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">{scenario.exampleHint}</p>
                </div>

                {/* Amount input */}
                <div className={`transition-opacity ${scenario.enabled ? 'opacity-100' : 'opacity-30'}`}>
                  <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden">
                    <span className="px-2 py-1.5 text-stone-400 text-xs bg-stone-50 border-r border-stone-200">$</span>
                    <input
                      type="number"
                      value={scenario.amount || ''}
                      onChange={(e) => updateScenarioAmount(scenario.id, parseFloat(e.target.value) || 0)}
                      disabled={!scenario.enabled}
                      className="w-24 px-2 py-1.5 text-sm font-finance text-right focus:outline-none disabled:bg-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live summary */}
        <div className="space-y-4 sticky top-6">
          {/* Target summary */}
          <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-stone-900">Your Target</h3>

            {/* Progress ring (simple) */}
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="#f0ede8" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15.5"
                    fill="none"
                    stroke={pct >= 100 ? '#2E7D52' : '#111111'}
                    strokeWidth="3"
                    strokeDasharray={`${(pct / 100) * 97.4} 97.4`}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-semibold text-stone-700">{pct.toFixed(0)}%</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <div>
                  <p className="text-[10px] text-stone-400 uppercase tracking-wide">Target</p>
                  <p className="font-finance font-semibold text-lg text-stone-900">{formatCurrency(efTotal)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-stone-400 uppercase tracking-wide">Currently Have</p>
                  <p className="font-finance text-sm text-stone-700">{formatCurrency(currentCash)}</p>
                </div>
              </div>
            </div>

            {efTotal > 0 && (
              <>
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${pct >= 100 ? 'bg-emerald-600' : 'bg-stone-900'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Gap remaining</span>
                    <span className="font-finance font-medium text-stone-800">{formatCurrency(gap)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">5% inflation top-up/mo</span>
                    <span className="font-finance text-stone-600">{formatCurrency(monthlyInflationTopUp)}</span>
                  </div>
                </div>
              </>
            )}

            {efTotal === 0 && (
              <p className="text-xs text-stone-400 text-center py-2">Toggle scenarios above to calculate your target.</p>
            )}
          </div>

          {/* Monthly contribution calculator */}
          {gap > 0 && (
            <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-semibold text-stone-900">Monthly Savings Plan</h3>
              <div>
                <label className="block text-xs text-stone-500 mb-2">Save per month:</label>
                <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden">
                  <span className="px-3 py-2 text-stone-400 bg-stone-50 border-r border-stone-200 text-sm">$</span>
                  <input
                    type="range"
                    min={50}
                    max={1000}
                    step={50}
                    value={monthlyContribution}
                    onChange={(e) => setMonthlyContribution(parseInt(e.target.value))}
                    className="flex-1 mx-3"
                  />
                  <span className="px-3 py-2 font-finance font-medium text-stone-800 text-sm w-20 text-right">
                    {formatCurrency(monthlyContribution)}
                  </span>
                </div>
              </div>
              {monthsToTarget && (
                <p className="text-sm text-stone-700">
                  You'll reach your target in{' '}
                  <span className="font-semibold">
                    {monthsToTarget < 12
                      ? `${monthsToTarget} month${monthsToTarget !== 1 ? 's' : ''}`
                      : `${(monthsToTarget / 12).toFixed(1)} years`}
                  </span>
                </p>
              )}
            </div>
          )}

          {/* Add to Goals CTA */}
          {efTotal > 0 && !goalAdded && (
            <button
              onClick={handleAddGoal}
              className="w-full border border-stone-900 text-stone-900 text-sm font-medium py-2.5 rounded-xl hover:bg-stone-900 hover:text-white transition-colors"
            >
              Add to Goals →
            </button>
          )}
          {goalAdded && (
            <p className="text-center text-sm text-emerald-700 font-medium">✓ Added to your Goals</p>
          )}
        </div>
      </div>
    </div>
  )
}
