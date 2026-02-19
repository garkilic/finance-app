import { useState, useMemo } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useStore } from '@/store'
import { PageHeader } from '@/components/layout/PageHeader'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { spendByCategory, avgMonthlySpend } from '@/lib/calculations'
import { formatCurrency, formatDate, monthsBetween, today } from '@/lib/formatters'
import type { ExpenseCategory } from '@/types'

const CATEGORY_GROUPS: { group: string; items: { key: ExpenseCategory; label: string }[] }[] = [
  { group: 'Taxes', items: [{ key: 'tax_payments', label: 'Tax Payments (if not WH)' }] },
  { group: 'Housing', items: [{ key: 'rent_mortgage', label: 'Rent / Mortgage' }, { key: 'utilities', label: 'Utilities' }, { key: 'housing_fees', label: 'Housing Fees' }, { key: 'renters_insurance', label: "Renter's Insurance" }, { key: 'moving', label: 'Moving' }] },
  { group: 'Daily Life', items: [{ key: 'groceries', label: 'Groceries' }, { key: 'health_medical', label: 'Health / Medical' }, { key: 'transport_parking', label: 'Transport / Parking' }, { key: 'gas', label: 'Gas' }, { key: 'car_fees', label: 'Car Fees / Registration' }, { key: 'car_maintenance', label: 'Car Maintenance' }] },
  { group: 'Purchases', items: [{ key: 'clothing', label: 'Clothing' }, { key: 'life_insurance', label: 'Life Insurance' }, { key: 'legal', label: 'Legal' }, { key: 'home_goods', label: 'Home Goods' }, { key: 'technology', label: 'Technology' }, { key: 'tech_subscriptions', label: 'Tech Subscriptions' }] },
  { group: 'Personal', items: [{ key: 'personal_care', label: 'Personal Care' }, { key: 'education_office', label: 'Education / Office' }, { key: 'pets', label: 'Pets' }] },
  { group: 'Social', items: [{ key: 'dining_out', label: 'Dining Out' }, { key: 'party_hosting', label: 'Party Hosting' }, { key: 'travel', label: 'Travel' }, { key: 'fun_money', label: 'Fun Money' }, { key: 'entertainment_subscriptions', label: 'Entertainment Subscriptions' }] },
  { group: 'Giving', items: [{ key: 'charity', label: 'Charity' }, { key: 'gifts', label: 'Gifts' }, { key: 'family_support', label: 'Family Support' }] },
  { group: 'Savings', items: [{ key: 'savings_ira', label: 'IRA Contributions' }, { key: 'savings_emergency_fund', label: 'Emergency Fund' }, { key: 'savings_car_down', label: 'Car Down Payment' }, { key: 'savings_home_down', label: 'Home Down Payment' }, { key: 'savings_medical', label: 'Medical Procedure' }, { key: 'savings_computer', label: 'New Computer' }, { key: 'savings_wedding', label: 'Wedding' }] },
  { group: 'Debt', items: [{ key: 'debt_repayment', label: 'Credit Card Balance' }] },
  { group: 'Other', items: [{ key: 'other', label: 'Other' }] },
]

const ALL_CATEGORIES = CATEGORY_GROUPS.flatMap((g) => g.items)
const categoryLabel = (key: ExpenseCategory) => ALL_CATEGORIES.find((c) => c.key === key)?.label ?? key

export function Expenses() {
  const { transactions, expenseSettings, addTransaction, deleteTransaction, updateExpenseSettings } = useStore()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ date: today(), description: '', category: 'groceries' as ExpenseCategory, amount: '' })

  const months = monthsBetween(expenseSettings.startDate, expenseSettings.endDate)
  const byCategory = spendByCategory(transactions)
  const totalSpent = Object.values(byCategory).reduce((s, v) => s + v, 0)
  const avgMonthly = avgMonthlySpend(transactions, months)
  const overage = avgMonthly - expenseSettings.monthlyGoal

  const sortedTransactions = useMemo(() =>
    [...transactions].sort((a, b) => b.date.localeCompare(a.date)),
    [transactions]
  )

  const submit = () => {
    if (!form.amount) return
    addTransaction({ date: form.date, description: form.description, category: form.category, amount: parseFloat(form.amount) })
    setForm({ date: today(), description: '', category: 'groceries', amount: '' })
    setOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="Expenses"
        subtitle="Log your spending and track monthly averages by category."
        action={
          <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 bg-stone-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-stone-700 transition-colors">
            <Plus size={14} /> Add Transaction
          </button>
        }
      />

      {/* Settings bar */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-white border border-stone-200 rounded-xl text-sm">
        <div className="flex items-center gap-2">
          <span className="text-stone-400 text-xs">Date Range:</span>
          <input type="date" value={expenseSettings.startDate} onChange={(e) => updateExpenseSettings({ startDate: e.target.value })} className="border border-stone-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-stone-300" />
          <span className="text-stone-400">to</span>
          <input type="date" value={expenseSettings.endDate} onChange={(e) => updateExpenseSettings({ endDate: e.target.value })} className="border border-stone-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-stone-300" />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-stone-400 text-xs">Monthly Goal:</span>
          <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden">
            <span className="px-2 text-stone-400 text-xs bg-stone-50 border-r border-stone-200">$</span>
            <input
              type="number"
              value={expenseSettings.monthlyGoal}
              onChange={(e) => updateExpenseSettings({ monthlyGoal: parseFloat(e.target.value) || 0 })}
              className="w-24 px-2 py-1 text-xs font-finance focus:outline-none"
            />
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span>Avg: <span className="font-finance font-medium text-stone-800">{formatCurrency(avgMonthly)}/mo</span></span>
          <span className={`font-finance font-medium ${overage > 0 ? 'text-red-600' : 'text-emerald-700'}`}>
            {overage > 0 ? `↑ Over by ${formatCurrency(overage)}` : `↓ Under by ${formatCurrency(Math.abs(overage))}`}
          </span>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-[1fr_320px] gap-6">
        {/* Transaction log */}
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-stone-100 flex justify-between items-center">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Transactions</span>
            <span className="font-finance text-xs text-stone-500">{transactions.length} entries · {formatCurrency(totalSpent)} total</span>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-stone-50">
                <th className="text-left py-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-stone-400">Date</th>
                <th className="text-left py-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-stone-400">Description</th>
                <th className="text-left py-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-stone-400">Category</th>
                <th className="text-right py-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-stone-400">Amount</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {sortedTransactions.length === 0 && (
                <tr><td colSpan={5} className="py-10 text-center text-sm text-stone-400">No transactions yet.</td></tr>
              )}
              {sortedTransactions.map((t) => (
                <tr key={t.id} className="border-t border-stone-50 group">
                  <td className="py-2.5 px-4 text-xs font-finance text-stone-500 whitespace-nowrap">{formatDate(t.date)}</td>
                  <td className="py-2.5 px-4 text-sm text-stone-700">{t.description || <span className="text-stone-300 italic">—</span>}</td>
                  <td className="py-2.5 px-4 text-xs text-stone-500">{categoryLabel(t.category)}</td>
                  <td className="py-2.5 px-4 text-sm text-right font-finance text-stone-800">{formatCurrency(t.amount)}</td>
                  <td className="py-2 px-2">
                    <button onClick={() => deleteTransaction(t.id)} className="opacity-0 group-hover:opacity-100 p-1 text-stone-300 hover:text-red-500 transition-all">
                      <Trash2 size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Category summary */}
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden h-fit sticky top-6">
          <div className="px-4 py-3 border-b border-stone-100">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Category Summary</span>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-stone-50">
                <th className="text-left py-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-stone-400">Category</th>
                <th className="text-right py-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-stone-400">Total</th>
                <th className="text-right py-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-stone-400">/ Mo</th>
              </tr>
            </thead>
            <tbody>
              {ALL_CATEGORIES
                .filter((c) => byCategory[c.key] > 0)
                .sort((a, b) => (byCategory[b.key] ?? 0) - (byCategory[a.key] ?? 0))
                .map((c) => {
                  const total = byCategory[c.key] ?? 0
                  const perMonth = total / months
                  return (
                    <tr key={c.key} className="border-t border-stone-50">
                      <td className="py-2 px-4 text-xs text-stone-600">{c.label}</td>
                      <td className="py-2 px-4 text-xs text-right font-finance text-stone-700">{formatCurrency(total)}</td>
                      <td className="py-2 px-4 text-xs text-right font-finance text-stone-500">{formatCurrency(perMonth)}</td>
                    </tr>
                  )
                })}
              {Object.keys(byCategory).length === 0 && (
                <tr><td colSpan={3} className="py-6 text-center text-xs text-stone-400">Add transactions to see summaries.</td></tr>
              )}
              {totalSpent > 0 && (
                <tr className="border-t-2 border-stone-200 bg-stone-50">
                  <td className="py-2.5 px-4 text-xs font-semibold text-stone-600">Total</td>
                  <td className="py-2.5 px-4 text-xs text-right font-finance font-semibold text-stone-800">{formatCurrency(totalSpent)}</td>
                  <td className="py-2.5 px-4 text-xs text-right font-finance font-semibold text-stone-800">{formatCurrency(avgMonthly)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Sheet */}
      <BottomSheet isOpen={open} onClose={() => setOpen(false)} title="Add Transaction">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-stone-500 mb-1">Amount</label>
            <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-stone-300">
              <span className="px-3 py-2.5 text-stone-400 bg-stone-50 border-r border-stone-200">$</span>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm((d) => ({ ...d, amount: e.target.value }))}
                placeholder="0.00"
                className="flex-1 px-3 py-2.5 text-lg font-finance focus:outline-none"
                autoFocus
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-stone-500 mb-1">Description</label>
            <input type="text" value={form.description} onChange={(e) => setForm((d) => ({ ...d, description: e.target.value }))} placeholder="e.g. Trader Joe's" className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300" />
          </div>
          <div>
            <label className="block text-xs text-stone-500 mb-1">Category</label>
            <select value={form.category} onChange={(e) => setForm((d) => ({ ...d, category: e.target.value as ExpenseCategory }))} className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300">
              {CATEGORY_GROUPS.map((g) => (
                <optgroup key={g.group} label={g.group}>
                  {g.items.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-stone-500 mb-1">Date</label>
            <input type="date" value={form.date} onChange={(e) => setForm((d) => ({ ...d, date: e.target.value }))} className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300" />
          </div>
          <button onClick={submit} className="w-full bg-stone-900 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-stone-700 transition-colors">
            Add Transaction
          </button>
        </div>
      </BottomSheet>
    </div>
  )
}
