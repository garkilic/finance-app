import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useStore } from '@/store'
import { PageHeader } from '@/components/layout/PageHeader'
import { netWorth, totalAssets, totalLiabilities } from '@/lib/calculations'
import { formatCurrency, formatMonthYear, currentMonth, today } from '@/lib/formatters'

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-stone-200 rounded-xl px-4 py-3 shadow-lg text-xs">
      <p className="font-medium text-stone-600 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className={`font-finance ${p.name === 'Goal' ? 'text-stone-400' : p.value >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  )
}

export function NetWorth() {
  const { accounts, netWorthEntries, netWorthSettings, addNetWorthEntry, updateNetWorthEntry, deleteNetWorthEntry, updateNetWorthSettings } = useStore()
  const [newNote, setNewNote] = useState('')

  const currentNW = netWorth(accounts)
  const assets = totalAssets(accounts)
  const liabilities = totalLiabilities(accounts)

  // Build account value map from current balances for "Add Month"
  const currentValues: Record<string, number> = {}
  accounts.forEach((a) => { currentValues[a.id] = a.balance })

  const handleAddMonth = () => {
    const month = currentMonth()
    if (netWorthEntries.find((e) => e.date === month)) return
    addNetWorthEntry({ date: month, values: { ...currentValues }, note: newNote })
    setNewNote('')
  }

  // Build chart data
  const sortedEntries = [...netWorthEntries].sort((a, b) => a.date.localeCompare(b.date))
  let goalValue = sortedEntries[0] ? Object.values(sortedEntries[0].values).reduce((s, v) => s + v, 0) : currentNW
  const chartData = sortedEntries.map((entry, i) => {
    const nw = Object.values(entry.values).reduce((s, v) => s + v, 0)
    if (i === 0) goalValue = nw
    const goal = goalValue + netWorthSettings.monthlyGrowthGoal * i
    return { month: formatMonthYear(entry.date), 'Net Worth': nw, Goal: goal }
  })

  return (
    <div>
      <PageHeader
        title="Net Worth"
        subtitle="Track your net worth month by month against your growth goal."
      />

      {/* Summary */}
      <div className="flex gap-6 mb-8 px-5 py-4 bg-white border border-stone-200 rounded-xl">
        <div>
          <p className="text-xs text-stone-400">Current Net Worth</p>
          <p className={`font-finance text-2xl font-medium ${currentNW >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>{formatCurrency(currentNW)}</p>
        </div>
        <div className="w-px bg-stone-200" />
        <div>
          <p className="text-xs text-stone-400">Assets</p>
          <p className="font-finance font-medium text-stone-800">{formatCurrency(assets)}</p>
        </div>
        <div className="w-px bg-stone-200" />
        <div>
          <p className="text-xs text-stone-400">Liabilities</p>
          <p className="font-finance font-medium text-stone-800">{formatCurrency(liabilities)}</p>
        </div>
        <div className="w-px bg-stone-200" />
        <div className="flex items-center gap-2">
          <p className="text-xs text-stone-400">Monthly Goal</p>
          <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden">
            <span className="px-2 text-stone-400 text-xs bg-stone-50 border-r border-stone-200">+$</span>
            <input
              type="number"
              value={netWorthSettings.monthlyGrowthGoal}
              onChange={(e) => updateNetWorthSettings({ monthlyGrowthGoal: parseFloat(e.target.value) || 0 })}
              className="w-20 px-2 py-1 text-xs font-finance focus:outline-none"
            />
            <span className="px-2 text-stone-400 text-xs bg-stone-50 border-l border-stone-200">/mo</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      {chartData.length >= 2 ? (
        <div className="bg-white border border-stone-200 rounded-xl p-6 mb-6">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="Net Worth" stroke="#111111" strokeWidth={2} dot={{ r: 3, fill: '#111111' }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="Goal" stroke="#d6d3ce" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 text-xs text-stone-400 justify-center">
            <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-stone-900 inline-block" /> Actual</span>
            <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-stone-300 inline-block border-dashed" /> Goal</span>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-dashed border-stone-300 rounded-xl p-10 mb-6 text-center">
          <p className="text-sm text-stone-400">Log at least 2 months to see your net worth chart.</p>
        </div>
      )}

      {/* Add month */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Optional note for this month…"
          className="flex-1 border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
        />
        <button
          onClick={handleAddMonth}
          className="flex items-center gap-1.5 bg-stone-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-stone-700 transition-colors whitespace-nowrap"
        >
          <Plus size={14} /> Log This Month
        </button>
      </div>

      {/* Monthly log table */}
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-stone-50">
              <th className="text-left py-2.5 px-4 text-[10px] font-semibold uppercase tracking-wider text-stone-400">Month</th>
              <th className="text-right py-2.5 px-4 text-[10px] font-semibold uppercase tracking-wider text-stone-400">Net Worth</th>
              <th className="text-right py-2.5 px-4 text-[10px] font-semibold uppercase tracking-wider text-stone-400">Goal</th>
              <th className="text-left py-2.5 px-4 text-[10px] font-semibold uppercase tracking-wider text-stone-400">Note</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {sortedEntries.length === 0 && (
              <tr><td colSpan={5} className="py-10 text-center text-sm text-stone-400">No months logged yet. Click "Log This Month" to start.</td></tr>
            )}
            {sortedEntries.map((entry, i) => {
              const nw = Object.values(entry.values).reduce((s, v) => s + v, 0)
              const baseNW = sortedEntries[0] ? Object.values(sortedEntries[0].values).reduce((s, v) => s + v, 0) : nw
              const goal = baseNW + netWorthSettings.monthlyGrowthGoal * i
              const delta = nw - (i > 0 ? Object.values(sortedEntries[i - 1].values).reduce((s, v) => s + v, 0) : nw)
              return (
                <tr key={entry.id} className="border-t border-stone-50 group">
                  <td className="py-3 px-4 text-sm text-stone-700">{formatMonthYear(entry.date)}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`font-finance text-sm font-medium ${nw >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>{formatCurrency(nw)}</span>
                    {i > 0 && <span className={`ml-2 text-xs font-finance ${delta >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{delta >= 0 ? '+' : ''}{formatCurrency(delta)}</span>}
                  </td>
                  <td className="py-3 px-4 text-right font-finance text-sm text-stone-400">{formatCurrency(goal)}</td>
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      defaultValue={entry.note ?? ''}
                      onBlur={(e) => updateNetWorthEntry(entry.id, { note: e.target.value })}
                      placeholder="—"
                      className="text-xs text-stone-500 bg-transparent focus:outline-none focus:bg-stone-50 rounded px-1 py-0.5 w-full"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <button onClick={() => deleteNetWorthEntry(entry.id)} className="opacity-0 group-hover:opacity-100 p-1 text-stone-300 hover:text-red-500 transition-all">
                      <Trash2 size={12} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
