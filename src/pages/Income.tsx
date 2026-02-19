import { useState } from 'react'
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { useStore } from '@/store'
import { PageHeader } from '@/components/layout/PageHeader'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { expectedNet, discrepancy } from '@/lib/calculations'
import { formatCurrency, today } from '@/lib/formatters'
import type { IncomeStreamType, PaycheckEntry } from '@/types'

const STREAM_TYPE_LABELS: Record<IncomeStreamType, string> = {
  w2: 'W-2 / Salary',
  hourly: 'Hourly',
  fellowship: 'Fellowship (Non-WH)',
  scholarship: 'Scholarship (Non-WH)',
  other: 'Other',
}

function streamTypeBadge(type: IncomeStreamType) {
  const colors: Record<IncomeStreamType, string> = {
    w2: 'bg-stone-100 text-stone-600',
    hourly: 'bg-stone-100 text-stone-600',
    fellowship: 'bg-amber-50 text-amber-700 border border-amber-200',
    scholarship: 'bg-amber-50 text-amber-700 border border-amber-200',
    other: 'bg-stone-100 text-stone-500',
  }
  return `inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${colors[type]}`
}

function IncomeStreamCard({ streamId }: { streamId: string }) {
  const { incomeStreams, paycheckEntries, deleteIncomeStream, addPaycheckEntry, deletePaycheckEntry } = useStore()
  const stream = incomeStreams.find((s) => s.id === streamId)
  const [expanded, setExpanded] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState({
    periodStart: '', periodEnd: '', paycheckDate: today(),
    grossAmount: '', hoursWorked: '', hourlyRate: '',
    federalWH: '0', fica: '0', medicareEE: '0', stateWH: '0', retirement: '0', otherPreTax: '0',
    receivedNet: '',
  })

  if (!stream) return null

  const entries = paycheckEntries.filter((e) => e.streamId === streamId).sort((a, b) => b.paycheckDate.localeCompare(a.paycheckDate))
  const totalGross = entries.reduce((s, e) => s + e.grossAmount, 0)
  const totalNet = entries.reduce((s, e) => s + e.receivedNet, 0)
  const isNonWH = stream.type === 'fellowship' || stream.type === 'scholarship'

  const submitPaycheck = () => {
    const entry: Omit<PaycheckEntry, 'id'> = {
      streamId,
      periodStart: form.periodStart,
      periodEnd: form.periodEnd,
      paycheckDate: form.paycheckDate,
      grossAmount: parseFloat(form.grossAmount) || (parseFloat(form.hoursWorked) * parseFloat(form.hourlyRate)) || 0,
      hoursWorked: parseFloat(form.hoursWorked) || undefined,
      hourlyRate: parseFloat(form.hourlyRate) || undefined,
      federalWH: parseFloat(form.federalWH) || 0,
      fica: parseFloat(form.fica) || 0,
      medicareEE: parseFloat(form.medicareEE) || 0,
      stateWH: parseFloat(form.stateWH) || 0,
      retirement: parseFloat(form.retirement) || 0,
      otherPreTax: parseFloat(form.otherPreTax) || 0,
      receivedNet: parseFloat(form.receivedNet) || 0,
    }
    addPaycheckEntry(entry)
    setAddOpen(false)
    setForm({ periodStart: '', periodEnd: '', paycheckDate: today(), grossAmount: '', hoursWorked: '', hourlyRate: '', federalWH: '0', fica: '0', medicareEE: '0', stateWH: '0', retirement: '0', otherPreTax: '0', receivedNet: '' })
  }

  return (
    <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-stone-900 text-sm">{stream.name}</h3>
            <span className={streamTypeBadge(stream.type)}>{STREAM_TYPE_LABELS[stream.type]}</span>
          </div>
          {isNonWH && (
            <p className="text-xs text-amber-600 mt-0.5">⚠ No withholding — track estimated tax payments below.</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-stone-400">YTD Gross</p>
            <p className="font-finance text-sm font-medium text-stone-800">{formatCurrency(totalGross)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-stone-400">YTD Net</p>
            <p className="font-finance text-sm font-medium text-stone-800">{formatCurrency(totalNet)}</p>
          </div>
          <button onClick={() => setAddOpen(true)} className="flex items-center gap-1 text-xs border border-stone-200 rounded-lg px-3 py-1.5 text-stone-600 hover:border-stone-400 transition-colors">
            <Plus size={12} /> Log Entry
          </button>
          <button onClick={() => setExpanded((v) => !v)} className="p-1.5 text-stone-400 hover:text-stone-600">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button onClick={() => deleteIncomeStream(streamId)} className="p-1.5 text-stone-300 hover:text-red-500 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Log table */}
      {expanded && (
        <div className="border-t border-stone-100">
          {entries.length === 0 ? (
            <p className="text-sm text-stone-400 text-center py-6">No entries logged yet.</p>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-stone-50">
                  <th className="text-left py-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-stone-400 whitespace-nowrap">Pay Date</th>
                  {stream.type === 'hourly' && <>
                    <th className="text-right py-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-stone-400">Hours</th>
                    <th className="text-right py-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-stone-400">Rate</th>
                  </>}
                  <th className="text-right py-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-stone-400">Gross</th>
                  {!isNonWH && <>
                    <th className="text-right py-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-stone-400">Fed WH</th>
                    <th className="text-right py-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-stone-400">State WH</th>
                    <th className="text-right py-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-stone-400">Retirement</th>
                    <th className="text-right py-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-stone-400">Expected Net</th>
                    <th className="text-right py-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-stone-400">Received</th>
                    <th className="text-right py-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-stone-400">Diff</th>
                  </>}
                  {isNonWH && <th className="text-right py-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-stone-400">Received</th>}
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => {
                  const exp = expectedNet(e)
                  const diff = discrepancy(e)
                  return (
                    <tr key={e.id} className="border-t border-stone-50 group">
                      <td className="py-2 px-4 font-finance text-stone-600">{e.paycheckDate}</td>
                      {stream.type === 'hourly' && <>
                        <td className="py-2 px-4 text-right font-finance text-stone-600">{e.hoursWorked ?? '—'}</td>
                        <td className="py-2 px-4 text-right font-finance text-stone-600">{e.hourlyRate ? formatCurrency(e.hourlyRate) : '—'}</td>
                      </>}
                      <td className="py-2 px-4 text-right font-finance text-stone-800">{formatCurrency(e.grossAmount)}</td>
                      {!isNonWH && <>
                        <td className="py-2 px-4 text-right font-finance text-stone-500">{formatCurrency(e.federalWH)}</td>
                        <td className="py-2 px-4 text-right font-finance text-stone-500">{formatCurrency(e.stateWH)}</td>
                        <td className="py-2 px-4 text-right font-finance text-stone-500">{formatCurrency(e.retirement)}</td>
                        <td className="py-2 px-4 text-right font-finance text-stone-700">{formatCurrency(exp)}</td>
                        <td className="py-2 px-4 text-right font-finance text-stone-800">{formatCurrency(e.receivedNet)}</td>
                        <td className={`py-2 px-4 text-right font-finance ${Math.abs(diff) < 0.01 ? 'text-stone-400' : diff > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {Math.abs(diff) < 0.01 ? '—' : (diff > 0 ? '+' : '') + formatCurrency(diff)}
                        </td>
                      </>}
                      {isNonWH && <td className="py-2 px-4 text-right font-finance text-stone-800">{formatCurrency(e.receivedNet)}</td>}
                      <td className="py-2 px-2">
                        <button onClick={() => deletePaycheckEntry(e.id)} className="opacity-0 group-hover:opacity-100 p-1 text-stone-300 hover:text-red-500 transition-all">
                          <Trash2 size={11} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Log entry sheet */}
      <BottomSheet isOpen={addOpen} onClose={() => setAddOpen(false)} title={`Log Entry — ${stream.name}`}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-stone-500 mb-1">Period Start</label>
              <input type="date" value={form.periodStart} onChange={(e) => setForm((d) => ({ ...d, periodStart: e.target.value }))} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300" />
            </div>
            <div>
              <label className="block text-xs text-stone-500 mb-1">Period End</label>
              <input type="date" value={form.periodEnd} onChange={(e) => setForm((d) => ({ ...d, periodEnd: e.target.value }))} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-stone-500 mb-1">Paycheck Date</label>
              <input type="date" value={form.paycheckDate} onChange={(e) => setForm((d) => ({ ...d, paycheckDate: e.target.value }))} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
            </div>
            {stream.type === 'hourly' ? (
              <>
                <div>
                  <label className="block text-xs text-stone-500 mb-1">Hours Worked</label>
                  <input type="number" value={form.hoursWorked} onChange={(e) => setForm((d) => ({ ...d, hoursWorked: e.target.value }))} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm font-finance focus:outline-none" />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-xs text-stone-500 mb-1">Gross Amount</label>
                <input type="number" value={form.grossAmount} onChange={(e) => setForm((d) => ({ ...d, grossAmount: e.target.value }))} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm font-finance focus:outline-none" placeholder="0.00" />
              </div>
            )}
          </div>
          {stream.type === 'hourly' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-stone-500 mb-1">Hourly Rate</label>
                <input type="number" value={form.hourlyRate} onChange={(e) => setForm((d) => ({ ...d, hourlyRate: e.target.value }))} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm font-finance focus:outline-none" />
              </div>
              <div className="flex items-end">
                <p className="text-xs text-stone-500 pb-2.5">
                  Gross: <span className="font-finance font-medium">{formatCurrency((parseFloat(form.hoursWorked) || 0) * (parseFloat(form.hourlyRate) || 0))}</span>
                </p>
              </div>
            </div>
          )}
          {!isNonWH && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'federalWH', label: 'Federal WH' },
                { key: 'fica', label: 'FICA' },
                { key: 'medicareEE', label: 'Medicare EE' },
                { key: 'stateWH', label: 'State WH' },
                { key: 'retirement', label: 'Retirement' },
                { key: 'otherPreTax', label: 'Other Pre-Tax' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-xs text-stone-500 mb-1">{label}</label>
                  <input type="number" value={form[key as keyof typeof form]} onChange={(e) => setForm((d) => ({ ...d, [key]: e.target.value }))} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm font-finance focus:outline-none" placeholder="0" />
                </div>
              ))}
            </div>
          )}
          <div>
            <label className="block text-xs text-stone-500 mb-1">Received Net (Actual)</label>
            <input type="number" value={form.receivedNet} onChange={(e) => setForm((d) => ({ ...d, receivedNet: e.target.value }))} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm font-finance focus:outline-none focus:ring-2 focus:ring-stone-300" placeholder="0.00" />
          </div>
          <button onClick={submitPaycheck} className="w-full bg-stone-900 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-stone-700 transition-colors">
            Log Entry
          </button>
        </div>
      </BottomSheet>
    </div>
  )
}

export function Income() {
  const { incomeStreams, paycheckEntries, estimatedTaxPayments, addIncomeStream, addEstimatedTaxPayment, deleteEstimatedTaxPayment } = useStore()
  const [addStreamOpen, setAddStreamOpen] = useState(false)
  const [streamForm, setStreamForm] = useState({ name: '', type: 'w2' as IncomeStreamType })
  const [taxForm, setTaxForm] = useState({ jurisdiction: 'federal' as 'federal' | 'state', date: today(), amount: '', confirmationNumber: '', quarter: '' })

  const totalGross = paycheckEntries.reduce((s, e) => s + e.grossAmount, 0)
  const totalNet = paycheckEntries.reduce((s, e) => s + e.receivedNet, 0)
  const totalMonths = paycheckEntries.length > 0 ? 12 : 1
  const avgMonthly = totalNet / totalMonths

  const fedWH = paycheckEntries.reduce((s, e) => s + e.federalWH, 0)
  const fedEst = estimatedTaxPayments.filter((p) => p.jurisdiction === 'federal').reduce((s, p) => s + p.amount, 0)
  const stateWH = paycheckEntries.reduce((s, e) => s + e.stateWH, 0)
  const stateEst = estimatedTaxPayments.filter((p) => p.jurisdiction === 'state').reduce((s, p) => s + p.amount, 0)

  return (
    <div>
      <PageHeader
        title="Income"
        subtitle="Track all income streams paycheck by paycheck."
        action={
          <button onClick={() => setAddStreamOpen(true)} className="flex items-center gap-1.5 bg-stone-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-stone-700 transition-colors">
            <Plus size={14} /> Add Stream
          </button>
        }
      />

      {/* Summary bar */}
      {paycheckEntries.length > 0 && (
        <div className="flex gap-6 mb-6 px-5 py-4 bg-white border border-stone-200 rounded-xl text-sm">
          <div><p className="text-xs text-stone-400">Total Gross</p><p className="font-finance font-medium">{formatCurrency(totalGross)}</p></div>
          <div className="w-px bg-stone-200" />
          <div><p className="text-xs text-stone-400">Total Take-Home</p><p className="font-finance font-medium">{formatCurrency(totalNet)}</p></div>
          <div className="w-px bg-stone-200" />
          <div><p className="text-xs text-stone-400">Avg / Month</p><p className="font-finance font-medium">{formatCurrency(avgMonthly)}</p></div>
        </div>
      )}

      {/* Stream cards */}
      <div className="space-y-4 mb-8">
        {incomeStreams.length === 0 && (
          <div className="bg-white border border-dashed border-stone-300 rounded-xl p-10 text-center">
            <p className="text-sm text-stone-400">No income streams yet. Add your first one.</p>
          </div>
        )}
        {incomeStreams.map((s) => <IncomeStreamCard key={s.id} streamId={s.id} />)}
      </div>

      {/* Tax tracking */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-stone-900 mb-4">Tax Tracking</h2>
        <div className="grid grid-cols-2 gap-6">
          {/* Summary */}
          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-stone-100 text-xs font-semibold text-stone-500 uppercase tracking-wider">Tax Summary</div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-50">
                  <th className="text-left py-2 px-4 text-[10px] font-semibold uppercase text-stone-400"></th>
                  <th className="text-right py-2 px-4 text-[10px] font-semibold uppercase text-stone-400">Federal</th>
                  <th className="text-right py-2 px-4 text-[10px] font-semibold uppercase text-stone-400">State</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-stone-50"><td className="py-2.5 px-4 text-xs text-stone-600">Withheld (W-2)</td><td className="py-2.5 px-4 text-right font-finance text-stone-700">{formatCurrency(fedWH)}</td><td className="py-2.5 px-4 text-right font-finance text-stone-700">{formatCurrency(stateWH)}</td></tr>
                <tr className="border-t border-stone-50"><td className="py-2.5 px-4 text-xs text-stone-600">Estimated Payments</td><td className="py-2.5 px-4 text-right font-finance text-stone-700">{formatCurrency(fedEst)}</td><td className="py-2.5 px-4 text-right font-finance text-stone-700">{formatCurrency(stateEst)}</td></tr>
                <tr className="border-t-2 border-stone-200 bg-stone-50"><td className="py-2.5 px-4 text-xs font-semibold text-stone-700">Total Paid</td><td className="py-2.5 px-4 text-right font-finance font-semibold text-stone-900">{formatCurrency(fedWH + fedEst)}</td><td className="py-2.5 px-4 text-right font-finance font-semibold text-stone-900">{formatCurrency(stateWH + stateEst)}</td></tr>
              </tbody>
            </table>
          </div>

          {/* Estimated payment log */}
          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Estimated Tax Payments</span>
            </div>
            <div className="p-4 space-y-2">
              {estimatedTaxPayments.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm group">
                  <div>
                    <span className="text-stone-700">{p.date}</span>
                    <span className={`ml-2 text-[10px] font-medium uppercase tracking-wide ${p.jurisdiction === 'federal' ? 'text-blue-600' : 'text-stone-500'}`}>{p.jurisdiction}</span>
                    {p.quarter && <span className="ml-1 text-xs text-stone-400">{p.quarter}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-finance">{formatCurrency(p.amount)}</span>
                    <button onClick={() => deleteEstimatedTaxPayment(p.id)} className="opacity-0 group-hover:opacity-100 p-1 text-stone-300 hover:text-red-500 transition-all"><Trash2 size={11} /></button>
                  </div>
                </div>
              ))}
              {/* Inline add */}
              <div className="flex gap-2 pt-2 border-t border-stone-100">
                <select value={taxForm.jurisdiction} onChange={(e) => setTaxForm((d) => ({ ...d, jurisdiction: e.target.value as 'federal' | 'state' }))} className="border border-stone-200 rounded px-2 py-1 text-xs focus:outline-none">
                  <option value="federal">Federal</option>
                  <option value="state">State</option>
                </select>
                <input type="date" value={taxForm.date} onChange={(e) => setTaxForm((d) => ({ ...d, date: e.target.value }))} className="border border-stone-200 rounded px-2 py-1 text-xs focus:outline-none flex-1" />
                <input type="number" value={taxForm.amount} onChange={(e) => setTaxForm((d) => ({ ...d, amount: e.target.value }))} placeholder="Amount" className="border border-stone-200 rounded px-2 py-1 text-xs font-finance focus:outline-none w-20" />
                <input type="text" value={taxForm.confirmationNumber} onChange={(e) => setTaxForm((d) => ({ ...d, confirmationNumber: e.target.value }))} placeholder="Conf #" className="border border-stone-200 rounded px-2 py-1 text-xs focus:outline-none w-20" />
                <button
                  onClick={() => {
                    if (!taxForm.amount) return
                    addEstimatedTaxPayment({ jurisdiction: taxForm.jurisdiction, date: taxForm.date, amount: parseFloat(taxForm.amount), confirmationNumber: taxForm.confirmationNumber || undefined, quarter: taxForm.quarter || undefined })
                    setTaxForm({ jurisdiction: 'federal', date: today(), amount: '', confirmationNumber: '', quarter: '' })
                  }}
                  className="bg-stone-900 text-white text-xs px-3 py-1 rounded hover:bg-stone-700 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add stream sheet */}
      <BottomSheet isOpen={addStreamOpen} onClose={() => setAddStreamOpen(false)} title="Add Income Stream">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-stone-500 mb-1">Stream Name</label>
            <input type="text" value={streamForm.name} onChange={(e) => setStreamForm((d) => ({ ...d, name: e.target.value }))} placeholder="e.g. Grad Student Researcher" className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300" autoFocus />
          </div>
          <div>
            <label className="block text-xs text-stone-500 mb-1">Type</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(STREAM_TYPE_LABELS) as [IncomeStreamType, string][]).map(([key, label]) => (
                <button key={key} onClick={() => setStreamForm((d) => ({ ...d, type: key }))} className={`px-3 py-2 text-sm rounded-lg border transition-colors ${streamForm.type === key ? 'bg-stone-900 text-white border-stone-900' : 'border-stone-200 text-stone-600 hover:border-stone-400'}`}>{label}</button>
              ))}
            </div>
          </div>
          <button onClick={() => { if (!streamForm.name) return; addIncomeStream({ name: streamForm.name, type: streamForm.type, isActive: true }); setStreamForm({ name: '', type: 'w2' }); setAddStreamOpen(false) }} className="w-full bg-stone-900 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-stone-700 transition-colors">
            Add Income Stream
          </button>
        </div>
      </BottomSheet>
    </div>
  )
}
