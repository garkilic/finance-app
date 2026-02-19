import { useState } from 'react'
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'
import { useStore } from '@/store'
import { PageHeader } from '@/components/layout/PageHeader'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { formatCurrency, formatDate } from '@/lib/formatters'
import type { Goal, GoalTimeframe, GoalType } from '@/types'

const TIMEFRAMES: { key: GoalTimeframe; label: string; sub: string }[] = [
  { key: 'short', label: 'Short-Term', sub: 'Under 6 months' },
  { key: 'mid', label: 'Mid-Term', sub: '6 months – 5 years' },
  { key: 'long', label: 'Long-Term', sub: '5+ years' },
]

const SMART_FIELDS: { key: keyof Goal['smart']; letter: string; label: string; question: string }[] = [
  { key: 'specific', letter: 'S', label: 'Specific', question: 'What exactly do you want to achieve?' },
  { key: 'measurable', letter: 'M', label: 'Measurable', question: 'How will you measure success?' },
  { key: 'achievable', letter: 'A', label: 'Achievable', question: "What's your plan to get there?" },
  { key: 'relevant', letter: 'R', label: 'Relevant', question: 'Why does this matter to you?' },
  { key: 'timeBound', letter: 'T', label: 'Time-bound', question: 'When will you achieve it?' },
]

function GoalCard({ goal }: { goal: Goal }) {
  const [expanded, setExpanded] = useState(false)
  const { updateGoal, deleteGoal } = useStore()
  const pct = Math.min(100, goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0)
  const smartFilled = Object.values(goal.smart).filter(Boolean).length

  return (
    <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
      {/* Card header */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-stone-900 text-sm leading-tight">{goal.title}</h3>
            {goal.description && <p className="text-xs text-stone-500 mt-0.5">{goal.description}</p>}
          </div>
          <div className="flex items-center gap-1 ml-2">
            <span className="text-[10px] text-stone-400 border border-stone-200 rounded px-1.5 py-0.5">
              {smartFilled}/5 SMART
            </span>
            <button
              onClick={() => deleteGoal(goal.id)}
              className="p-1 text-stone-300 hover:text-red-500 transition-colors rounded"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-finance text-stone-700">{formatCurrency(goal.currentAmount)}</span>
            <span className="font-finance text-stone-400">{formatCurrency(goal.targetAmount)}</span>
          </div>
          <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-stone-900 rounded-full transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-stone-400">
            <span>{pct.toFixed(0)}% complete</span>
            {goal.targetDate && <span>Due {formatDate(goal.targetDate)}</span>}
          </div>
        </div>

        {/* Update progress */}
        <div className="mt-3 flex gap-2">
          <input
            type="number"
            placeholder="Update current amount…"
            className="flex-1 text-xs border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-stone-300 font-finance"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const val = parseFloat((e.target as HTMLInputElement).value)
                if (!isNaN(val)) {
                  updateGoal(goal.id, { currentAmount: val });
                  (e.target as HTMLInputElement).value = ''
                }
              }
            }}
          />
        </div>
      </div>

      {/* SMART expand toggle */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-2.5 border-t border-stone-100 text-xs text-stone-500 hover:bg-stone-50 transition-colors"
      >
        <span>SMART criteria</span>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {/* SMART table */}
      {expanded && (
        <div className="border-t border-stone-100">
          <table className="w-full text-xs">
            <tbody>
              {SMART_FIELDS.map((f) => (
                <tr key={f.key} className="border-b border-stone-50 last:border-0">
                  <td className="px-4 py-2.5 w-6">
                    <span className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold ${goal.smart[f.key] ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-400'}`}>
                      {f.letter}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3 w-24">
                    <span className="font-medium text-stone-600">{f.label}</span>
                    <br />
                    <span className="text-stone-400 text-[10px]">{f.question}</span>
                  </td>
                  <td className="py-2.5 pr-4">
                    <textarea
                      defaultValue={goal.smart[f.key]}
                      onBlur={(e) => updateGoal(goal.id, { smart: { ...goal.smart, [f.key]: e.target.value } })}
                      placeholder="Not set…"
                      rows={1}
                      className="w-full resize-none text-stone-700 placeholder:text-stone-300 bg-transparent focus:outline-none focus:bg-stone-50 rounded px-1 py-0.5"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const emptyGoal = (): Omit<Goal, 'id' | 'createdAt'> => ({
  timeframe: 'short',
  type: 'savings',
  title: '',
  description: '',
  targetAmount: 0,
  currentAmount: 0,
  targetDate: '',
  smart: { specific: '', measurable: '', achievable: '', relevant: '', timeBound: '' },
})

export function Goals() {
  const { goals, addGoal } = useStore()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(emptyGoal)

  const submit = () => {
    if (!draft.title) return
    addGoal(draft)
    setDraft(emptyGoal())
    setOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="Goals"
        subtitle="Set SMART goals for the short, mid, and long term."
        action={
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-1.5 bg-stone-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-stone-700 transition-colors"
          >
            <Plus size={14} /> Add Goal
          </button>
        }
      />

      <div className="grid grid-cols-3 gap-6">
        {TIMEFRAMES.map(({ key, label, sub }) => {
          const filtered = goals.filter((g) => g.timeframe === key)
          return (
            <div key={key}>
              <div className="mb-3">
                <h2 className="text-sm font-semibold text-stone-900">{label}</h2>
                <p className="text-xs text-stone-400">{sub}</p>
              </div>
              {filtered.length === 0 ? (
                <div className="border border-dashed border-stone-300 rounded-xl p-6 text-center">
                  <p className="text-sm text-stone-400">No {label.toLowerCase()} goal yet.</p>
                  <button
                    onClick={() => { setDraft({ ...emptyGoal(), timeframe: key }); setOpen(true) }}
                    className="mt-2 text-xs text-stone-500 hover:text-stone-900 underline"
                  >
                    + Set goal
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filtered.map((g) => <GoalCard key={g.id} goal={g} />)}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Add Goal Sheet */}
      <BottomSheet isOpen={open} onClose={() => setOpen(false)} title="New Goal">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-stone-500 mb-1">Timeframe</label>
              <select
                value={draft.timeframe}
                onChange={(e) => setDraft((d) => ({ ...d, timeframe: e.target.value as GoalTimeframe }))}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
              >
                <option value="short">Short-Term (&lt;6mo)</option>
                <option value="mid">Mid-Term (6mo–5yr)</option>
                <option value="long">Long-Term (5yr+)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-stone-500 mb-1">Type</label>
              <select
                value={draft.type}
                onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value as GoalType }))}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
              >
                <option value="savings">Savings</option>
                <option value="debt_payoff">Debt Payoff</option>
                <option value="milestone">Milestone</option>
                <option value="habit">Habit</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-stone-500 mb-1">Goal Title</label>
            <input
              type="text"
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              placeholder="e.g. Build Emergency Fund"
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-stone-500 mb-1">Target Amount</label>
              <input
                type="number"
                value={draft.targetAmount || ''}
                onChange={(e) => setDraft((d) => ({ ...d, targetAmount: parseFloat(e.target.value) || 0 }))}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm font-finance focus:outline-none focus:ring-2 focus:ring-stone-300"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-500 mb-1">Current Amount</label>
              <input
                type="number"
                value={draft.currentAmount || ''}
                onChange={(e) => setDraft((d) => ({ ...d, currentAmount: parseFloat(e.target.value) || 0 }))}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm font-finance focus:outline-none focus:ring-2 focus:ring-stone-300"
                placeholder="0.00"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-stone-500 mb-1">Target Date</label>
            <input
              type="date"
              value={draft.targetDate}
              onChange={(e) => setDraft((d) => ({ ...d, targetDate: e.target.value }))}
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
            />
          </div>
          <button
            onClick={submit}
            disabled={!draft.title}
            className="w-full bg-stone-900 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-stone-700 disabled:opacity-40 transition-colors"
          >
            Add Goal
          </button>
        </div>
      </BottomSheet>
    </div>
  )
}
