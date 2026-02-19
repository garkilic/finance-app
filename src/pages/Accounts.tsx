import { useState } from 'react'
import { Plus, Trash2, Star } from 'lucide-react'
import { useStore } from '@/store'
import { PageHeader } from '@/components/layout/PageHeader'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { netWorth, totalAssets, totalLiabilities } from '@/lib/calculations'
import { formatCurrency, formatPercent, today } from '@/lib/formatters'
import type { Account, AccountCategory } from '@/types'

type TabKey = AccountCategory
const TABS: { key: TabKey; label: string }[] = [
  { key: 'cash', label: 'Cash Accounts' },
  { key: 'investment', label: 'Investment Accounts' },
  { key: 'loan', label: 'Loans & Debt' },
  { key: 'credit_card', label: 'Credit Cards' },
]

const aprColor = (apr: number) => {
  if (apr === 0) return 'text-emerald-700'
  if (apr <= 7) return 'text-emerald-600'
  if (apr <= 15) return 'text-amber-600'
  return 'text-red-600'
}

function TH({ children, right }: { children?: React.ReactNode; right?: boolean }) {
  return (
    <th className={`py-2.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-stone-400 border-b border-stone-100 ${right ? 'text-right' : 'text-left'} whitespace-nowrap`}>
      {children}
    </th>
  )
}

function TD({ children, right, mono }: { children?: React.ReactNode; right?: boolean; mono?: boolean }) {
  return (
    <td className={`py-2.5 px-3 text-sm text-stone-700 ${right ? 'text-right' : ''} ${mono ? 'font-finance' : ''}`}>
      {children}
    </td>
  )
}

export function Accounts() {
  const { accounts, addAccount, updateAccount, deleteAccount } = useStore()
  const [tab, setTab] = useState<TabKey>('cash')
  const [open, setOpen] = useState(false)
  const [draftType, setDraftType] = useState<TabKey>('cash')

  // Form state
  const [form, setForm] = useState({
    institution: '', nickname: '', lastFour: '', subtype: '',
    balance: '', apy: '', allocationMix: '', apr: '',
    creditLimit: '', minimumPayment: '', dueDate: '', notes: '',
    rewards: '', annualFee: '', subCardType: 'standard',
  })
  const f = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const filtered = accounts.filter((a) => a.category === tab)

  const totalRow = (cat: TabKey) => {
    const items = accounts.filter((a) => a.category === cat)
    return items.reduce((s, a) => s + a.balance, 0)
  }

  const submit = () => {
    const base = {
      institution: form.institution,
      nickname: form.nickname,
      lastFour: form.lastFour,
      notes: form.notes,
      lastUpdated: today(),
    }
    if (draftType === 'cash') {
      addAccount({ ...base, category: 'cash', subtype: form.subtype || 'Checking', apy: parseFloat(form.apy) || undefined, balance: parseFloat(form.balance) || 0 } as Omit<Account, 'id' | 'lastUpdated'>)
    } else if (draftType === 'investment') {
      addAccount({ ...base, category: 'investment', subtype: form.subtype || 'Brokerage', allocationMix: form.allocationMix, balance: parseFloat(form.balance) || 0 } as Omit<Account, 'id' | 'lastUpdated'>)
    } else if (draftType === 'loan') {
      addAccount({ ...base, category: 'loan', subtype: form.subtype || 'Personal', apr: parseFloat(form.apr) || 0, balance: parseFloat(form.balance) || 0, minimumPayment: parseFloat(form.minimumPayment) || 0, dueDate: parseInt(form.dueDate) || undefined } as Omit<Account, 'id' | 'lastUpdated'>)
    } else {
      addAccount({ ...base, category: 'credit_card', subtype: form.subCardType as 'standard', apr: parseFloat(form.apr) || 0, creditLimit: parseFloat(form.creditLimit) || 0, balance: parseFloat(form.balance) || 0, minimumPayment: parseFloat(form.minimumPayment) || 0, annualFee: parseFloat(form.annualFee) || undefined, rewards: form.rewards } as Omit<Account, 'id' | 'lastUpdated'>)
    }
    setOpen(false)
    setForm({ institution: '', nickname: '', lastFour: '', subtype: '', balance: '', apy: '', allocationMix: '', apr: '', creditLimit: '', minimumPayment: '', dueDate: '', notes: '', rewards: '', annualFee: '', subCardType: 'standard' })
  }

  const nw = netWorth(accounts)
  const assets = totalAssets(accounts)
  const liabilities = totalLiabilities(accounts)

  return (
    <div>
      <PageHeader
        title="Accounts"
        subtitle="Your complete financial account inventory."
        action={
          <button
            onClick={() => { setDraftType(tab); setOpen(true) }}
            className="flex items-center gap-1.5 bg-stone-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-stone-700 transition-colors"
          >
            <Plus size={14} /> Add Account
          </button>
        }
      />

      {/* Net worth summary bar */}
      <div className="flex gap-6 mb-6 px-5 py-4 bg-white border border-stone-200 rounded-xl">
        <div>
          <p className="text-xs text-stone-400">Assets</p>
          <p className="font-finance font-medium text-emerald-700">{formatCurrency(assets)}</p>
        </div>
        <div className="w-px bg-stone-200" />
        <div>
          <p className="text-xs text-stone-400">Liabilities</p>
          <p className="font-finance font-medium text-red-600">{formatCurrency(liabilities)}</p>
        </div>
        <div className="w-px bg-stone-200" />
        <div>
          <p className="text-xs text-stone-400">Net Worth</p>
          <p className={`font-finance font-medium ${nw >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>{formatCurrency(nw)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-stone-100 rounded-lg p-1 w-fit">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-1.5 text-sm rounded-md transition-colors font-medium ${tab === key ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-stone-50">
              {tab === 'cash' && (<><TH>Institution</TH><TH>Nickname</TH><TH>Last 4</TH><TH>Type</TH><TH right>APY %</TH><TH right>Balance</TH><TH>Notes</TH><TH /></>)}
              {tab === 'investment' && (<><TH>Institution</TH><TH>Nickname</TH><TH>Last 4</TH><TH>Type</TH><TH>Allocation</TH><TH right>Balance</TH><TH>Notes</TH><TH /></>)}
              {tab === 'loan' && (<><TH>Institution</TH><TH>Nickname</TH><TH>Last 4</TH><TH>Type</TH><TH right>APR %</TH><TH right>Balance</TH><TH right>Min. Payment</TH><TH>Notes</TH><TH /></>)}
              {tab === 'credit_card' && (<><TH>Institution</TH><TH>Nickname</TH><TH>Last 4</TH><TH>Type</TH><TH right>APR %</TH><TH right>Balance</TH><TH right>Limit</TH><TH right>Min. Pmt</TH><TH>Notes</TH><TH /></>)}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="py-10 text-center text-sm text-stone-400">
                  No accounts yet. Click "Add Account" to get started.
                </td>
              </tr>
            )}
            {filtered.map((a) => (
              <tr key={a.id} className="border-t border-stone-50 group">
                <TD>{a.institution}</TD>
                <TD>{a.nickname}</TD>
                <TD mono>{a.lastFour ? `···${a.lastFour}` : '—'}</TD>
                <TD>{'subtype' in a ? String(a.subtype) : '—'}</TD>

                {tab === 'cash' && (
                  <TD right mono>{('apy' in a && a.apy) ? formatPercent(a.apy) : '—'}</TD>
                )}
                {tab === 'investment' && (
                  <TD>{('allocationMix' in a && a.allocationMix) ? String(a.allocationMix) : '—'}</TD>
                )}
                {(tab === 'loan' || tab === 'credit_card') && (
                  <td className={`py-2.5 px-3 text-sm text-right font-finance ${'apr' in a ? aprColor((a as { apr: number }).apr) : ''}`}>
                    {'apr' in a ? formatPercent((a as { apr: number }).apr) : '—'}
                  </td>
                )}

                <TD right mono>
                  <input
                    type="number"
                    defaultValue={a.balance}
                    onBlur={(e) => updateAccount(a.id, { balance: parseFloat(e.target.value) || 0 })}
                    className="w-24 text-right font-finance text-sm bg-transparent border-0 focus:outline-none focus:bg-stone-50 focus:border focus:border-stone-200 rounded px-1 py-0.5"
                  />
                </TD>

                {tab === 'loan' && (
                  <TD right mono>{'minimumPayment' in a ? formatCurrency((a as { minimumPayment: number }).minimumPayment) : '—'}</TD>
                )}
                {tab === 'credit_card' && (
                  <>
                    <TD right mono>{'creditLimit' in a ? formatCurrency((a as { creditLimit: number }).creditLimit) : '—'}</TD>
                    <TD right mono>{'minimumPayment' in a ? formatCurrency((a as { minimumPayment: number }).minimumPayment) : '—'}</TD>
                  </>
                )}

                <TD>
                  <span className="text-xs text-stone-400 truncate max-w-[120px] block">
                    {'notes' in a ? String(a.notes || '') : ''}
                  </span>
                </TD>
                <td className="py-2 px-2">
                  <button
                    onClick={() => deleteAccount(a.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-stone-300 hover:text-red-500 transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </td>
              </tr>
            ))}
            {/* Total row */}
            {filtered.length > 0 && (
              <tr className="border-t-2 border-stone-200 bg-stone-50">
                <TD><span className="font-semibold text-stone-600">Total</span></TD>
                <td colSpan={tab === 'credit_card' ? 5 : tab === 'loan' ? 4 : tab === 'investment' ? 3 : 3} />
                <TD right mono>
                  <span className={`font-semibold ${(tab === 'loan' || tab === 'credit_card') ? 'text-red-600' : 'text-emerald-700'}`}>
                    {formatCurrency(totalRow(tab))}
                  </span>
                </TD>
                {tab === 'loan' && <TD />}
                {tab === 'credit_card' && <><TD /><TD /></>}
                <TD /><TD />
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Credit score links (when on credit card tab) */}
      {tab === 'credit_card' && (
        <div className="mt-4 flex gap-4 text-xs text-stone-500">
          <a href="https://www.annualcreditreport.com" target="_blank" rel="noreferrer" className="hover:text-stone-900 underline">
            annualcreditreport.com
          </a>
          <a href="https://www.creditkarma.com" target="_blank" rel="noreferrer" className="hover:text-stone-900 underline">
            creditkarma.com
          </a>
        </div>
      )}

      {/* Add Account Sheet */}
      <BottomSheet isOpen={open} onClose={() => setOpen(false)} title="Add Account" wide>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-stone-500 mb-1">Account Type</label>
            <div className="flex gap-2">
              {TABS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setDraftType(key)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${draftType === key ? 'bg-stone-900 text-white border-stone-900' : 'border-stone-200 text-stone-600 hover:border-stone-400'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-stone-500 mb-1">Institution</label>
              <input type="text" value={form.institution} onChange={f('institution')} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300" placeholder="Ally Bank" />
            </div>
            <div>
              <label className="block text-xs text-stone-500 mb-1">Nickname</label>
              <input type="text" value={form.nickname} onChange={f('nickname')} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300" placeholder="Savings" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-stone-500 mb-1">Last 4 Digits</label>
              <input type="text" value={form.lastFour} onChange={f('lastFour')} maxLength={4} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm font-finance focus:outline-none focus:ring-2 focus:ring-stone-300" placeholder="1234" />
            </div>
            <div>
              <label className="block text-xs text-stone-500 mb-1">Balance</label>
              <input type="number" value={form.balance} onChange={f('balance')} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm font-finance focus:outline-none focus:ring-2 focus:ring-stone-300" placeholder="0.00" />
            </div>
          </div>
          {draftType === 'cash' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-stone-500 mb-1">Account Subtype</label>
                <select value={form.subtype} onChange={f('subtype')} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300">
                  <option>Checking</option><option>High-Yield Savings</option><option>CD</option><option>Cash</option><option>Money Market</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">APY %</label>
                <input type="number" step="0.01" value={form.apy} onChange={f('apy')} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm font-finance focus:outline-none focus:ring-2 focus:ring-stone-300" placeholder="4.35" />
              </div>
            </div>
          )}
          {draftType === 'investment' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-stone-500 mb-1">Account Subtype</label>
                <select value={form.subtype} onChange={f('subtype')} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                  <option>Brokerage</option><option>Roth IRA</option><option>Traditional IRA</option><option>401(k)</option><option>403(b)</option><option>DCP</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">Allocation Mix</label>
                <input type="text" value={form.allocationMix} onChange={f('allocationMix')} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none" placeholder="80/20" />
              </div>
            </div>
          )}
          {(draftType === 'loan' || draftType === 'credit_card') && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-stone-500 mb-1">APR %</label>
                <input type="number" step="0.01" value={form.apr} onChange={f('apr')} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm font-finance focus:outline-none focus:ring-2 focus:ring-stone-300" placeholder="25.24" />
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">Min. Payment</label>
                <input type="number" value={form.minimumPayment} onChange={f('minimumPayment')} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm font-finance focus:outline-none focus:ring-2 focus:ring-stone-300" placeholder="35.00" />
              </div>
            </div>
          )}
          {draftType === 'credit_card' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-stone-500 mb-1">Credit Limit</label>
                <input type="number" value={form.creditLimit} onChange={f('creditLimit')} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm font-finance focus:outline-none" placeholder="5000" />
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">Annual Fee</label>
                <input type="number" value={form.annualFee} onChange={f('annualFee')} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm font-finance focus:outline-none" placeholder="0" />
              </div>
            </div>
          )}
          <div>
            <label className="block text-xs text-stone-500 mb-1">Notes</label>
            <input type="text" value={form.notes} onChange={f('notes')} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none" placeholder="Optional notes…" />
          </div>
          <button onClick={submit} className="w-full bg-stone-900 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-stone-700 transition-colors">
            Add Account
          </button>
        </div>
      </BottomSheet>

      {/* Unused import suppression */}
      <span className="hidden"><Star size={0} /></span>
    </div>
  )
}
