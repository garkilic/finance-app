import { useState } from 'react'
import { Plus, Trash2, HelpCircle } from 'lucide-react'
import { useStore } from '@/store'
import { PageHeader } from '@/components/layout/PageHeader'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { today } from '@/lib/formatters'
import type { ScheduleFrequency } from '@/types'

const FREQUENCY_GROUPS: { key: ScheduleFrequency; label: string; sublabel: string }[] = [
  { key: 'weekly_biweekly', label: 'Weekly / Biweekly', sublabel: 'Recurring short-cycle tasks' },
  { key: 'monthly', label: 'Monthly', sublabel: 'Once per month' },
  { key: 'quarterly', label: 'Quarterly', sublabel: '4× per year' },
  { key: 'annually', label: 'Annually', sublabel: 'Once per year' },
]

export function Schedule() {
  const { scheduleItems, toggleScheduleComplete, updateScheduleDates, addScheduleItem, deleteScheduleItem } = useStore()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ task: '', frequency: 'monthly' as ScheduleFrequency, myDates: '' })
  const [tooltip, setTooltip] = useState<string | null>(null)

  const todayStr = today()

  const submit = () => {
    if (!form.task) return
    addScheduleItem({ task: form.task, frequency: form.frequency, myDates: form.myDates, isCustom: true, completedDates: [] })
    setForm({ task: '', frequency: 'monthly', myDates: '' })
    setOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="Schedule"
        subtitle="Your recurring financial hygiene tasks — weekly through annually."
        action={
          <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 bg-stone-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-stone-700 transition-colors">
            <Plus size={14} /> Add Task
          </button>
        }
      />

      <div className="space-y-8">
        {FREQUENCY_GROUPS.map(({ key, label, sublabel }) => {
          const items = scheduleItems.filter((s) => s.frequency === key)
          if (items.length === 0) return null
          const completedCount = items.filter((s) => s.completedDates.includes(todayStr)).length

          return (
            <div key={key}>
              <div className="flex items-baseline gap-3 mb-3">
                <h2 className="text-sm font-semibold text-stone-900">{label}</h2>
                <span className="text-xs text-stone-400">{sublabel}</span>
                <span className="ml-auto text-xs text-stone-400">{completedCount}/{items.length} done today</span>
              </div>

              <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-100">
                      <th className="w-10 py-2.5 px-4" />
                      <th className="text-left py-2.5 px-4 text-[10px] font-semibold uppercase tracking-wider text-stone-400">Task</th>
                      <th className="text-left py-2.5 px-4 text-[10px] font-semibold uppercase tracking-wider text-stone-400 w-56">My Date(s)</th>
                      <th className="w-8" />
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => {
                      const doneToday = item.completedDates.includes(todayStr)
                      return (
                        <tr key={item.id} className={`border-t border-stone-50 group transition-colors ${doneToday ? 'bg-stone-50/60' : ''}`}>
                          {/* Checkbox */}
                          <td className="py-3 px-4 w-10">
                            <button
                              onClick={() => toggleScheduleComplete(item.id)}
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${doneToday ? 'bg-stone-900 border-stone-900' : 'border-stone-300 hover:border-stone-600'}`}
                            >
                              {doneToday && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>
                          </td>

                          {/* Task */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm ${doneToday ? 'text-stone-400 line-through' : 'text-stone-800'}`}>
                                {item.task}
                              </span>
                              {item.helperText && (
                                <div className="relative">
                                  <button
                                    onMouseEnter={() => setTooltip(item.id)}
                                    onMouseLeave={() => setTooltip(null)}
                                    className="text-stone-300 hover:text-stone-500 transition-colors"
                                  >
                                    <HelpCircle size={13} />
                                  </button>
                                  {tooltip === item.id && (
                                    <div className="absolute left-5 top-0 z-10 w-64 bg-stone-900 text-white text-xs rounded-lg px-3 py-2.5 shadow-xl">
                                      {item.helperText}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* My dates — inline editable */}
                          <td className="py-3 px-4 w-56">
                            <input
                              type="text"
                              defaultValue={item.myDates}
                              onBlur={(e) => updateScheduleDates(item.id, e.target.value)}
                              placeholder="e.g. Every Sunday"
                              className="w-full text-xs text-stone-500 bg-transparent border border-transparent hover:border-stone-200 focus:border-stone-300 rounded px-2 py-1 focus:outline-none focus:bg-white transition-colors"
                            />
                          </td>

                          {/* Delete (custom only) */}
                          <td className="py-2 px-2">
                            {item.isCustom && (
                              <button
                                onClick={() => deleteScheduleItem(item.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-stone-300 hover:text-red-500 transition-all"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })}
      </div>

      <BottomSheet isOpen={open} onClose={() => setOpen(false)} title="Add Task">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-stone-500 mb-1">Task</label>
            <input type="text" value={form.task} onChange={(e) => setForm((d) => ({ ...d, task: e.target.value }))} placeholder="e.g. Review brokerage account" className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300" autoFocus />
          </div>
          <div>
            <label className="block text-xs text-stone-500 mb-1">Frequency</label>
            <div className="flex gap-2 flex-wrap">
              {FREQUENCY_GROUPS.map(({ key, label }) => (
                <button key={key} onClick={() => setForm((d) => ({ ...d, frequency: key }))} className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${form.frequency === key ? 'bg-stone-900 text-white border-stone-900' : 'border-stone-200 text-stone-600 hover:border-stone-400'}`}>{label}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-stone-500 mb-1">My Date(s) <span className="text-stone-400">(optional)</span></label>
            <input type="text" value={form.myDates} onChange={(e) => setForm((d) => ({ ...d, myDates: e.target.value }))} placeholder="e.g. 15th of each month" className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300" />
          </div>
          <button onClick={submit} className="w-full bg-stone-900 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-stone-700 transition-colors">
            Add Task
          </button>
        </div>
      </BottomSheet>
    </div>
  )
}
