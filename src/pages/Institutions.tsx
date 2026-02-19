import { useState } from 'react'
import { Plus, Trash2, Star } from 'lucide-react'
import { useStore } from '@/store'
import { PageHeader } from '@/components/layout/PageHeader'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { InlineEdit } from '@/components/ui/InlineEdit'

type SubTab = 'banks' | 'securities' | 'cards'

function TH({ children, right }: { children?: React.ReactNode; right?: boolean }) {
  return <th className={`py-2.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-stone-400 border-b border-stone-100 whitespace-nowrap ${right ? 'text-right' : 'text-left'}`}>{children}</th>
}
function TD({ children, right, mono }: { children?: React.ReactNode; right?: boolean; mono?: boolean }) {
  return <td className={`py-2.5 px-3 text-sm text-stone-700 ${right ? 'text-right' : ''} ${mono ? 'font-finance' : ''}`}>{children}</td>
}

export function Institutions() {
  const { institutions, securities, cardComparisons, addInstitution, updateInstitution, deleteInstitution, addSecurity, updateSecurity, deleteSecurity, addCardComparison, updateCardComparison, deleteCardComparison } = useStore()
  const [tab, setTab] = useState<SubTab>('banks')
  const [open, setOpen] = useState(false)
  const [bankForm, setBankForm] = useState({ name: '', type: 'bank' as 'bank' | 'credit_union' | 'brokerage' | 'neobank', feesMinimums: '', checkingApy: '', savingsApy: '', cd6mo: '', cd12mo: '', cd24mo: '', pros: '', cons: '' })
  const [secForm, setSecForm] = useState({ ticker: '', name: '', expenseRatio: '', notes: '' })
  const [cardForm, setCardForm] = useState({ card: '', likelihood: '', annualFee: '', rewardType: '', apr: '', promoDetails: '' })

  const apyColor = (val: string) => {
    const n = parseFloat(val)
    if (isNaN(n) || n === 0) return 'text-stone-400'
    if (n >= 4) return 'text-emerald-700'
    if (n >= 1) return 'text-amber-600'
    return 'text-stone-500'
  }

  const TABS: { key: SubTab; label: string }[] = [
    { key: 'banks', label: 'Banks & Credit Unions' },
    { key: 'securities', label: 'Securities Reference' },
    { key: 'cards', label: 'Balance Transfer Cards' },
  ]

  const submitBank = () => {
    if (!bankForm.name) return
    addInstitution({ ...bankForm, isCurrentlyUsed: false })
    setBankForm({ name: '', type: 'bank', feesMinimums: '', checkingApy: '', savingsApy: '', cd6mo: '', cd12mo: '', cd24mo: '', pros: '', cons: '' })
    setOpen(false)
  }
  const submitSec = () => {
    if (!secForm.ticker) return
    addSecurity(secForm)
    setSecForm({ ticker: '', name: '', expenseRatio: '', notes: '' })
    setOpen(false)
  }
  const submitCard = () => {
    if (!cardForm.card) return
    addCardComparison(cardForm)
    setCardForm({ card: '', likelihood: '', annualFee: '', rewardType: '', apr: '', promoDetails: '' })
    setOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="Institutions"
        subtitle="Compare banks, brokerages, and credit cards side by side."
        action={
          <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 bg-stone-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-stone-700 transition-colors">
            <Plus size={14} /> Add Row
          </button>
        }
      />

      <p className="text-xs text-stone-400 mb-5 italic">Sample data shown as examples — not endorsements. Update with your own research.</p>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-stone-100 rounded-lg p-1 w-fit">
        {TABS.map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)} className={`px-4 py-1.5 text-sm rounded-md transition-colors font-medium ${tab === key ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>{label}</button>
        ))}
      </div>

      {/* Banks table */}
      {tab === 'banks' && (
        <div className="bg-white border border-stone-200 rounded-xl overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-stone-50">
                <TH>Institution</TH>
                <TH>Type</TH>
                <TH>Fees / Minimums</TH>
                <TH right>Checking APY</TH>
                <TH right>Savings APY</TH>
                <TH right>CD 6mo</TH>
                <TH right>CD 12mo</TH>
                <TH right>CD 24mo</TH>
                <TH>Pros</TH>
                <TH>Cons</TH>
                <TH>Using</TH>
                <TH />
              </tr>
            </thead>
            <tbody>
              {institutions.length === 0 && (
                <tr><td colSpan={12} className="py-10 text-center text-sm text-stone-400">No institutions yet.</td></tr>
              )}
              {institutions.map((inst) => (
                <tr key={inst.id} className="border-t border-stone-50 group">
                  <TD>
                    <InlineEdit value={inst.name} onSave={(v) => updateInstitution(inst.id, { name: v })} />
                  </TD>
                  <TD>
                    <span className="text-[10px] uppercase tracking-wide text-stone-400">{inst.type}</span>
                  </TD>
                  <TD>
                    <InlineEdit value={inst.feesMinimums} onSave={(v) => updateInstitution(inst.id, { feesMinimums: v })} placeholder="—" className="text-xs" />
                  </TD>
                  {(['checkingApy', 'savingsApy', 'cd6mo', 'cd12mo', 'cd24mo'] as const).map((field) => (
                    <td key={field} className={`py-2.5 px-3 text-sm text-right font-finance ${apyColor(inst[field])}`}>
                      <InlineEdit value={inst[field]} onSave={(v) => updateInstitution(inst.id, { [field]: v })} placeholder="—" type="number" inputClassName="w-16 text-right" />
                    </td>
                  ))}
                  <TD>
                    <InlineEdit value={inst.pros} onSave={(v) => updateInstitution(inst.id, { pros: v })} placeholder="—" className="text-xs max-w-[140px] truncate block" />
                  </TD>
                  <TD>
                    <InlineEdit value={inst.cons} onSave={(v) => updateInstitution(inst.id, { cons: v })} placeholder="—" className="text-xs max-w-[140px] truncate block text-red-600" />
                  </TD>
                  <td className="py-2.5 px-3">
                    <button
                      onClick={() => updateInstitution(inst.id, { isCurrentlyUsed: !inst.isCurrentlyUsed })}
                      className={`transition-colors ${inst.isCurrentlyUsed ? 'text-amber-500' : 'text-stone-200 hover:text-stone-400'}`}
                    >
                      <Star size={14} fill={inst.isCurrentlyUsed ? 'currentColor' : 'none'} />
                    </button>
                  </td>
                  <td className="py-2 px-2">
                    <button onClick={() => deleteInstitution(inst.id)} className="opacity-0 group-hover:opacity-100 p-1 text-stone-300 hover:text-red-500 transition-all">
                      <Trash2 size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Securities table */}
      {tab === 'securities' && (
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-stone-50">
                <TH>Ticker</TH>
                <TH>Fund Name</TH>
                <TH right>Expense Ratio</TH>
                <TH>Notes</TH>
                <TH />
              </tr>
            </thead>
            <tbody>
              {securities.length === 0 && <tr><td colSpan={5} className="py-10 text-center text-sm text-stone-400">No securities yet.</td></tr>}
              {securities.map((sec) => (
                <tr key={sec.id} className="border-t border-stone-50 group">
                  <TD mono><InlineEdit value={sec.ticker} onSave={(v) => updateSecurity(sec.id, { ticker: v })} /></TD>
                  <TD><InlineEdit value={sec.name} onSave={(v) => updateSecurity(sec.id, { name: v })} /></TD>
                  <td className="py-2.5 px-3 text-sm text-right font-finance text-emerald-700">
                    <InlineEdit value={sec.expenseRatio} onSave={(v) => updateSecurity(sec.id, { expenseRatio: v })} placeholder="—" type="number" inputClassName="w-16 text-right" />
                    {sec.expenseRatio && sec.expenseRatio !== '' ? '%' : ''}
                  </td>
                  <TD><InlineEdit value={sec.notes} onSave={(v) => updateSecurity(sec.id, { notes: v })} placeholder="—" className="text-xs text-stone-500" /></TD>
                  <td className="py-2 px-2"><button onClick={() => deleteSecurity(sec.id)} className="opacity-0 group-hover:opacity-100 p-1 text-stone-300 hover:text-red-500 transition-all"><Trash2 size={12} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Cards table */}
      {tab === 'cards' && (
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-stone-50">
                <TH>Card</TH>
                <TH>Likelihood</TH>
                <TH right>Annual Fee</TH>
                <TH>Reward Type</TH>
                <TH right>APR</TH>
                <TH>Promo / Reward Details</TH>
                <TH />
              </tr>
            </thead>
            <tbody>
              {cardComparisons.length === 0 && <tr><td colSpan={7} className="py-10 text-center text-sm text-stone-400">No cards added yet.</td></tr>}
              {cardComparisons.map((c) => (
                <tr key={c.id} className="border-t border-stone-50 group">
                  <TD><InlineEdit value={c.card} onSave={(v) => updateCardComparison(c.id, { card: v })} /></TD>
                  <TD><InlineEdit value={c.likelihood} onSave={(v) => updateCardComparison(c.id, { likelihood: v })} placeholder="—" className="text-xs" /></TD>
                  <TD right mono><InlineEdit value={c.annualFee} onSave={(v) => updateCardComparison(c.id, { annualFee: v })} placeholder="—" type="number" inputClassName="w-16 text-right" /></TD>
                  <TD><InlineEdit value={c.rewardType} onSave={(v) => updateCardComparison(c.id, { rewardType: v })} placeholder="—" className="text-xs" /></TD>
                  <TD right mono><InlineEdit value={c.apr} onSave={(v) => updateCardComparison(c.id, { apr: v })} placeholder="—" type="number" inputClassName="w-16 text-right" /></TD>
                  <TD><InlineEdit value={c.promoDetails} onSave={(v) => updateCardComparison(c.id, { promoDetails: v })} placeholder="—" className="text-xs max-w-xs" /></TD>
                  <td className="py-2 px-2"><button onClick={() => deleteCardComparison(c.id)} className="opacity-0 group-hover:opacity-100 p-1 text-stone-300 hover:text-red-500 transition-all"><Trash2 size={12} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add sheet */}
      <BottomSheet isOpen={open} onClose={() => setOpen(false)} title={`Add ${tab === 'banks' ? 'Institution' : tab === 'securities' ? 'Security' : 'Card'}`}>
        {tab === 'banks' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-stone-500 mb-1">Institution Name</label>
                <input type="text" value={bankForm.name} onChange={(e) => setBankForm((d) => ({ ...d, name: e.target.value }))} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300" placeholder="Ally Bank" autoFocus />
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">Type</label>
                <select value={bankForm.type} onChange={(e) => setBankForm((d) => ({ ...d, type: e.target.value as typeof bankForm.type }))} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                  <option value="bank">Bank</option><option value="credit_union">Credit Union</option><option value="brokerage">Brokerage</option><option value="neobank">Neobank</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-stone-500 mb-1">Fees / Minimums</label>
              <input type="text" value={bankForm.feesMinimums} onChange={(e) => setBankForm((d) => ({ ...d, feesMinimums: e.target.value }))} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none" placeholder="No fees, no minimums" />
            </div>
            <div className="grid grid-cols-5 gap-2">
              {([['checkingApy', 'Checking APY'], ['savingsApy', 'Savings APY'], ['cd6mo', 'CD 6mo'], ['cd12mo', 'CD 12mo'], ['cd24mo', 'CD 24mo']] as const).map(([key, label]) => (
                <div key={key}>
                  <label className="block text-[10px] text-stone-500 mb-1">{label}</label>
                  <input type="number" step="0.01" value={bankForm[key]} onChange={(e) => setBankForm((d) => ({ ...d, [key]: e.target.value }))} className="w-full border border-stone-200 rounded-lg px-2 py-1.5 text-xs font-finance focus:outline-none" placeholder="0.00" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-stone-500 mb-1">Pros</label>
                <input type="text" value={bankForm.pros} onChange={(e) => setBankForm((d) => ({ ...d, pros: e.target.value }))} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">Cons</label>
                <input type="text" value={bankForm.cons} onChange={(e) => setBankForm((d) => ({ ...d, cons: e.target.value }))} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
              </div>
            </div>
            <button onClick={submitBank} className="w-full bg-stone-900 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-stone-700 transition-colors">Add Institution</button>
          </div>
        )}
        {tab === 'securities' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-stone-500 mb-1">Ticker</label>
                <input type="text" value={secForm.ticker} onChange={(e) => setSecForm((d) => ({ ...d, ticker: e.target.value.toUpperCase() }))} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm font-finance uppercase focus:outline-none focus:ring-2 focus:ring-stone-300" placeholder="VOO" autoFocus />
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">Expense Ratio %</label>
                <input type="number" step="0.01" value={secForm.expenseRatio} onChange={(e) => setSecForm((d) => ({ ...d, expenseRatio: e.target.value }))} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm font-finance focus:outline-none" placeholder="0.03" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-stone-500 mb-1">Fund Name</label>
              <input type="text" value={secForm.name} onChange={(e) => setSecForm((d) => ({ ...d, name: e.target.value }))} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none" placeholder="Vanguard S&P 500 ETF" />
            </div>
            <div>
              <label className="block text-xs text-stone-500 mb-1">Notes</label>
              <input type="text" value={secForm.notes} onChange={(e) => setSecForm((d) => ({ ...d, notes: e.target.value }))} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
            </div>
            <button onClick={submitSec} className="w-full bg-stone-900 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-stone-700 transition-colors">Add Security</button>
          </div>
        )}
        {tab === 'cards' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-stone-500 mb-1">Card Name</label>
              <input type="text" value={cardForm.card} onChange={(e) => setCardForm((d) => ({ ...d, card: e.target.value }))} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300" autoFocus />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-stone-500 mb-1">Likelihood of Qualifying</label>
                <input type="text" value={cardForm.likelihood} onChange={(e) => setCardForm((d) => ({ ...d, likelihood: e.target.value }))} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">Annual Fee</label>
                <input type="number" value={cardForm.annualFee} onChange={(e) => setCardForm((d) => ({ ...d, annualFee: e.target.value }))} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm font-finance focus:outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-stone-500 mb-1">Reward Type</label>
                <input type="text" value={cardForm.rewardType} onChange={(e) => setCardForm((d) => ({ ...d, rewardType: e.target.value }))} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none" placeholder="Cash back / Points / Miles" />
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">APR %</label>
                <input type="number" value={cardForm.apr} onChange={(e) => setCardForm((d) => ({ ...d, apr: e.target.value }))} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm font-finance focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-stone-500 mb-1">Promo / Reward Details</label>
              <input type="text" value={cardForm.promoDetails} onChange={(e) => setCardForm((d) => ({ ...d, promoDetails: e.target.value }))} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
            </div>
            <button onClick={submitCard} className="w-full bg-stone-900 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-stone-700 transition-colors">Add Card</button>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
