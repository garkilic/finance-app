import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Plus, ArrowRight } from 'lucide-react'
import { useStore } from '@/store'
import { formatCurrency, today } from '@/lib/formatters'
import { totalAssets, totalLiabilities, netWorth } from '@/lib/calculations'
import type {
  Account, CashAccount, InvestmentAccount, LoanAccount, CreditCard,
  GoalTimeframe, GoalType, IncomeStreamType, EmergencyFundScenario, ExpenseCategory,
} from '@/types'

// ── Constants ─────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 13

// Step name + phase shown in the progress bar header
const STEP_META: Record<number, { name: string; phase: 1 | 2 | 3 }> = {
  1:  { name: 'Overview',          phase: 1 },
  2:  { name: 'Goals',             phase: 1 },
  3:  { name: 'Cash Accounts',     phase: 1 },
  4:  { name: 'Investments',       phase: 1 },
  5:  { name: 'Loans',             phase: 1 },
  6:  { name: 'Credit Cards',      phase: 1 },
  7:  { name: 'Expenses',          phase: 1 },
  8:  { name: 'Overview',          phase: 2 },
  9:  { name: 'Income',            phase: 2 },
  10: { name: 'Schedule',          phase: 2 },
  11: { name: 'Overview',          phase: 3 },
  12: { name: 'Emergency Fund',    phase: 3 },
  13: { name: 'Done',              phase: 3 },
}

const PHASE_LABELS: Record<1 | 2 | 3, string> = {
  1: '01 / Understand',
  2: '02 / Create',
  3: '03 / Compare',
}

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
}

const transition = { duration: 0.22, ease: 'easeInOut' }

// ── Shared UI ─────────────────────────────────────────────────────────────────

function Input({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs text-stone-500">{label}</label>}
      <input
        {...props}
        className="border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-900 bg-white focus:outline-none focus:ring-2 focus:ring-stone-300 placeholder:text-stone-400"
      />
    </div>
  )
}

function Select({ label, options, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; options: { value: string; label: string }[] }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs text-stone-500">{label}</label>}
      <select
        {...props}
        className="border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-900 bg-white focus:outline-none focus:ring-2 focus:ring-stone-300"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

function Btn({ children, onClick, variant = 'primary', className = '' }: {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  className?: string
}) {
  const base = 'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors'
  const styles = {
    primary: 'bg-stone-900 text-white hover:bg-stone-800',
    secondary: 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50',
    ghost: 'text-stone-400 hover:text-stone-600',
  }
  return (
    <button onClick={onClick} className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </button>
  )
}

function StepInfo({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 bg-stone-100 border border-stone-200 rounded-xl px-4 py-3 mb-6">
      <span className="text-stone-400 text-xs mt-0.5 shrink-0">ℹ</span>
      <p className="text-xs text-stone-500 leading-relaxed">{children}</p>
    </div>
  )
}

// ── Step 0: Welcome ───────────────────────────────────────────────────────────

function StepWelcome({ onStart, onLoadSample }: { onStart: () => void; onLoadSample: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <div className="max-w-lg">
        <p className="text-xs uppercase tracking-widest text-stone-400 mb-6">Financial Wellness Workbook</p>
        <h1 className="text-4xl font-semibold text-stone-900 mb-4 leading-tight">
          Build your financial roadmap.
        </h1>
        <p className="text-stone-500 mb-8 leading-relaxed">
          A step-by-step guide to building your financial roadmap — from understanding your finances to creating a plan that works.
        </p>

        {/* Demo notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-8 text-left">
          <p className="text-xs font-medium text-amber-800 mb-0.5">This is a demo</p>
          <p className="text-xs text-amber-700 leading-relaxed">
            All data is saved locally in your browser and never sent anywhere. Use "Load sample data" to explore with pre-filled sample finances, or "Get Started" to enter your own.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Btn onClick={onStart} variant="primary">
            Get Started <ArrowRight size={14} />
          </Btn>
          <Btn onClick={onLoadSample} variant="secondary">
            Load sample data
          </Btn>
        </div>
      </div>
    </div>
  )
}

// ── Step 1/8/11: Phase Intro ──────────────────────────────────────────────────

function StepPhaseIntro({ phase, label, description, onNext }: {
  phase: string; label: string; description: string; onNext: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-lg mx-auto px-4">
      <p className="font-finance text-5xl text-stone-200 mb-2">{phase}</p>
      <p className="text-xs uppercase tracking-widest text-stone-400 mb-6">/ {label}</p>
      <p className="text-stone-500 mb-8 leading-relaxed">{description}</p>
      <Btn onClick={onNext}>Let's go <ArrowRight size={14} /></Btn>
    </div>
  )
}

// ── Step 2: Goals ─────────────────────────────────────────────────────────────

type DraftGoal = { title: string; targetAmount: string; targetDate: string; timeframe: GoalTimeframe; type: GoalType }

const TIMEFRAMES: { key: GoalTimeframe; label: string; sub: string }[] = [
  { key: 'short', label: 'Short-Term', sub: 'Under 6 months' },
  { key: 'mid', label: 'Mid-Term', sub: '6 months – 5 years' },
  { key: 'long', label: 'Long-Term', sub: '5+ years' },
]

function StepGoals({ onNext, onSkip }: { onNext: (goals: DraftGoal[]) => void; onSkip: () => void }) {
  const [goals, setGoals] = useState<DraftGoal[]>([])
  const [form, setForm] = useState<Partial<DraftGoal> & { timeframe: GoalTimeframe }>({ timeframe: 'short', type: 'savings' as GoalType, title: '', targetAmount: '', targetDate: '' })
  const [adding, setAdding] = useState(false)

  function addGoal() {
    if (!form.title) return
    setGoals((prev) => [...prev, { title: form.title!, targetAmount: form.targetAmount || '0', targetDate: form.targetDate || '', timeframe: form.timeframe, type: (form.type as GoalType) || 'savings' }])
    setForm({ timeframe: form.timeframe, type: 'savings', title: '', targetAmount: '', targetDate: '' })
    setAdding(false)
  }

  return (
    <div className="max-w-2xl mx-auto w-full px-4">
      <h2 className="text-xl font-semibold text-stone-900 mb-1">What are your financial goals?</h2>
      <p className="text-sm text-stone-500 mb-4">Add goals across timeframes. You can always update these later.</p>
      <StepInfo>
        Written goals are one of the strongest predictors of financial follow-through. By naming a target amount and date, you turn a vague intention into a measurable milestone the app can track alongside your accounts.
      </StepInfo>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {TIMEFRAMES.map((tf) => (
          <div key={tf.key}>
            <div className="mb-2">
              <p className="text-sm font-medium text-stone-700">{tf.label}</p>
              <p className="text-xs text-stone-400">{tf.sub}</p>
            </div>
            <div className="space-y-2 mb-2">
              {goals.filter((g) => g.timeframe === tf.key).map((g, i) => (
                <div key={i} className="flex items-center justify-between bg-stone-100 rounded-lg px-3 py-2">
                  <span className="text-xs text-stone-700 truncate flex-1">{g.title}</span>
                  <button
                    onClick={() => setGoals((prev) => prev.filter((_, idx) => !(prev.indexOf(g) === idx)))}
                    className="ml-2 text-stone-300 hover:text-red-400 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => { setForm({ timeframe: tf.key, type: 'savings', title: '', targetAmount: '', targetDate: '' }); setAdding(true) }}
              className="text-xs text-stone-400 hover:text-stone-600 flex items-center gap-1 transition-colors"
            >
              <Plus size={12} /> Add goal
            </button>
          </div>
        ))}
      </div>

      {adding && (
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 mb-6">
          <p className="text-xs text-stone-500 mb-3">Adding {TIMEFRAMES.find((t) => t.key === form.timeframe)?.label} goal</p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <Input label="Goal title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Build emergency fund" className="col-span-2" />
            <Input label="Target amount" type="number" value={form.targetAmount} onChange={(e) => setForm((f) => ({ ...f, targetAmount: e.target.value }))} placeholder="0" />
            <Input label="Target date" type="date" value={form.targetDate} onChange={(e) => setForm((f) => ({ ...f, targetDate: e.target.value }))} />
          </div>
          <div className="flex gap-2">
            <Btn onClick={addGoal} variant="primary">Add</Btn>
            <Btn onClick={() => setAdding(false)} variant="ghost">Cancel</Btn>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <Btn onClick={() => onNext(goals)}>Continue <ArrowRight size={14} /></Btn>
        <button onClick={onSkip} className="text-xs text-stone-400 hover:text-stone-600 transition-colors">Skip for now</button>
      </div>
    </div>
  )
}

// ── Steps 3–6: Accounts ───────────────────────────────────────────────────────

type DraftAccount =
  | Omit<CashAccount, 'id' | 'lastUpdated'>
  | Omit<InvestmentAccount, 'id' | 'lastUpdated'>
  | Omit<LoanAccount, 'id' | 'lastUpdated'>
  | Omit<CreditCard, 'id' | 'lastUpdated'>

const CASH_SUBTYPES = ['Checking', 'Savings', 'High-Yield Savings', 'CD', 'Cash']
const INVEST_SUBTYPES = ['Roth IRA', '403(b)', '401(k)', 'DCP (Pre-Tax)', 'Brokerage']
const LOAN_SUBTYPES = ['Federal Subsidized', 'Federal Unsubsidized', 'Auto', 'Medical', 'Personal', 'Other']
const CARD_SUBTYPES: CreditCard['subtype'][] = ['standard', 'store', 'co-branded', 'authorized_user']

function AccountsStep({
  category,
  title,
  description,
  whyItMatters,
  totalLabel,
  drafts,
  onDraftsChange,
  onNext,
  onSkip,
}: {
  category: Account['category']
  title: string
  description: string
  whyItMatters: string
  totalLabel: string
  drafts: DraftAccount[]
  onDraftsChange: (d: DraftAccount[]) => void
  onNext: () => void
  onSkip: () => void
}) {
  const emptyForm = (): Record<string, string> => {
    if (category === 'cash') return { institution: '', nickname: '', subtype: 'Checking', balance: '', apy: '' }
    if (category === 'investment') return { institution: '', nickname: '', subtype: 'Roth IRA', balance: '' }
    if (category === 'loan') return { institution: '', nickname: '', subtype: 'Auto', balance: '', apr: '', minimumPayment: '' }
    return { institution: '', nickname: '', subtype: 'standard', creditLimit: '', balance: '', apr: '' }
  }
  const [form, setForm] = useState<Record<string, string>>(emptyForm)

  const runningTotal = drafts.reduce((sum, a) => {
    const bal = (a as { balance: number }).balance
    return sum + (bal || 0)
  }, 0)

  function handleAdd() {
    if (!form.institution && !form.nickname) return
    const bal = parseFloat(form.balance) || 0
    let account: DraftAccount
    if (category === 'cash') {
      account = { category: 'cash', institution: form.institution, nickname: form.nickname, subtype: form.subtype, balance: bal, apy: form.apy ? parseFloat(form.apy) : undefined } as Omit<CashAccount, 'id' | 'lastUpdated'>
    } else if (category === 'investment') {
      account = { category: 'investment', institution: form.institution, nickname: form.nickname, subtype: form.subtype, balance: bal } as Omit<InvestmentAccount, 'id' | 'lastUpdated'>
    } else if (category === 'loan') {
      account = { category: 'loan', institution: form.institution, nickname: form.nickname, subtype: form.subtype, balance: bal, apr: parseFloat(form.apr) || 0, minimumPayment: parseFloat(form.minimumPayment) || 0 } as Omit<LoanAccount, 'id' | 'lastUpdated'>
    } else {
      account = { category: 'credit_card', institution: form.institution, nickname: form.nickname, subtype: (form.subtype as CreditCard['subtype']) || 'standard', creditLimit: parseFloat(form.creditLimit) || 0, balance: bal, apr: parseFloat(form.apr) || 0, minimumPayment: 0 } as Omit<CreditCard, 'id' | 'lastUpdated'>
    }
    onDraftsChange([...drafts, account])
    setForm(emptyForm())
  }

  function getSubtypes() {
    if (category === 'cash') return CASH_SUBTYPES
    if (category === 'investment') return INVEST_SUBTYPES
    if (category === 'loan') return LOAN_SUBTYPES
    return CARD_SUBTYPES as string[]
  }

  return (
    <div className="max-w-3xl mx-auto w-full px-4">
      <div className="flex items-start justify-between mb-1">
        <h2 className="text-xl font-semibold text-stone-900">{title}</h2>
        <div className="text-right">
          <p className="text-xs text-stone-400">{totalLabel}</p>
          <p className="font-finance text-lg text-stone-900">{formatCurrency(runningTotal)}</p>
        </div>
      </div>
      <p className="text-sm text-stone-500 mb-4">{description}</p>
      <StepInfo>{whyItMatters}</StepInfo>

      {/* Existing rows */}
      {drafts.length > 0 && (
        <div className="mb-4 border border-stone-200 rounded-xl overflow-hidden">
          {drafts.map((a, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-stone-100 last:border-0">
              <div>
                <span className="text-sm text-stone-700">{(a as { nickname: string }).nickname || (a as { institution: string }).institution}</span>
                <span className="text-xs text-stone-400 ml-2">{(a as { institution: string }).institution}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-finance text-sm text-stone-900">{formatCurrency((a as { balance: number }).balance)}</span>
                <button onClick={() => onDraftsChange(drafts.filter((_, idx) => idx !== i))} className="text-stone-300 hover:text-red-400 transition-colors">
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add form */}
      <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 mb-6">
        <p className="text-xs text-stone-500 mb-3">Add account</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <Input label="Institution" value={form.institution} onChange={(e) => setForm((f) => ({ ...f, institution: e.target.value }))} placeholder="e.g. Chase" />
          <Input label="Nickname" value={form.nickname} onChange={(e) => setForm((f) => ({ ...f, nickname: e.target.value }))} placeholder="e.g. Checking" />
          <Select
            label="Type"
            value={form.subtype}
            onChange={(e) => setForm((f) => ({ ...f, subtype: e.target.value }))}
            options={getSubtypes().map((s) => ({ value: s, label: s }))}
          />
          <Input label="Balance ($)" type="number" value={form.balance} onChange={(e) => setForm((f) => ({ ...f, balance: e.target.value }))} placeholder="0.00" />
          {category === 'cash' && (
            <Input label="APY % (optional)" type="number" value={form.apy} onChange={(e) => setForm((f) => ({ ...f, apy: e.target.value }))} placeholder="e.g. 4.35" />
          )}
          {(category === 'loan' || category === 'credit_card') && (
            <Input label="APR %" type="number" value={form.apr} onChange={(e) => setForm((f) => ({ ...f, apr: e.target.value }))} placeholder="e.g. 25.24" />
          )}
          {category === 'loan' && (
            <Input label="Min Payment ($)" type="number" value={form.minimumPayment} onChange={(e) => setForm((f) => ({ ...f, minimumPayment: e.target.value }))} placeholder="0.00" />
          )}
          {category === 'credit_card' && (
            <Input label="Credit Limit ($)" type="number" value={form.creditLimit} onChange={(e) => setForm((f) => ({ ...f, creditLimit: e.target.value }))} placeholder="0.00" />
          )}
        </div>
        <Btn onClick={handleAdd} variant="secondary"><Plus size={14} /> Add account</Btn>
      </div>

      <div className="flex items-center gap-4">
        <Btn onClick={onNext}>Continue <ArrowRight size={14} /></Btn>
        <button onClick={onSkip} className="text-xs text-stone-400 hover:text-stone-600 transition-colors">Skip for now</button>
      </div>
    </div>
  )
}

// ── Step 7: Expenses ──────────────────────────────────────────────────────────

const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: 'rent_mortgage', label: 'Rent / Mortgage' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'groceries', label: 'Groceries' },
  { value: 'dining_out', label: 'Dining Out' },
  { value: 'gas', label: 'Gas' },
  { value: 'transport_parking', label: 'Transport / Parking' },
  { value: 'car_fees', label: 'Car Fees' },
  { value: 'car_maintenance', label: 'Car Maintenance' },
  { value: 'health_medical', label: 'Health / Medical' },
  { value: 'entertainment_subscriptions', label: 'Subscriptions' },
  { value: 'tech_subscriptions', label: 'Tech Subscriptions' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'home_goods', label: 'Home Goods' },
  { value: 'personal_care', label: 'Personal Care' },
  { value: 'education_office', label: 'Education / Office' },
  { value: 'travel', label: 'Travel' },
  { value: 'fun_money', label: 'Fun Money' },
  { value: 'gifts', label: 'Gifts' },
  { value: 'charity', label: 'Charity' },
  { value: 'debt_repayment', label: 'Debt Repayment' },
  { value: 'savings_emergency_fund', label: 'Savings – Emergency Fund' },
  { value: 'tax_payments', label: 'Tax Payments' },
  { value: 'other', label: 'Other' },
]

const expenseCategoryLabel = (key: ExpenseCategory) =>
  EXPENSE_CATEGORIES.find((c) => c.value === key)?.label ?? key

type DraftTransaction = { date: string; description: string; category: ExpenseCategory; amount: string }

function StepExpenses({ onNext }: { onNext: (data: { startDate: string; endDate: string; monthlyGoal: number; transactions: DraftTransaction[] }) => void }) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [monthlyGoal, setMonthlyGoal] = useState('')
  const [transactions, setTransactions] = useState<DraftTransaction[]>([])
  const [form, setForm] = useState<DraftTransaction>({ date: today(), description: '', category: 'groceries', amount: '' })

  const totalSpent = transactions.reduce((s, t) => s + (parseFloat(t.amount) || 0), 0)

  function handleAdd() {
    if (!form.amount) return
    setTransactions((prev) => [...prev, { ...form }])
    setForm({ date: today(), description: '', category: 'groceries', amount: '' })
  }

  return (
    <div className="max-w-2xl mx-auto w-full px-4">
      <h2 className="text-xl font-semibold text-stone-900 mb-1">Expenses</h2>
      <p className="text-sm text-stone-500 mb-4">Set a tracking period, monthly goal, and log your recent transactions.</p>
      <StepInfo>
        A budget without boundaries is just a guess. Anchoring your spending to a specific date range lets you compare actual vs. planned monthly spend — and spot the categories eating your margin.
      </StepInfo>

      {/* Settings row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Input label="Start date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <Input label="End date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <Input label="Monthly goal ($)" type="number" value={monthlyGoal} onChange={(e) => setMonthlyGoal(e.target.value)} placeholder="e.g. 3000" />
      </div>

      {/* Transaction list */}
      {transactions.length > 0 && (
        <div className="mb-4 border border-stone-200 rounded-xl overflow-hidden">
          <div className="flex justify-between items-center px-4 py-2 border-b border-stone-100 bg-stone-50">
            <span className="text-xs text-stone-500 uppercase tracking-wider">Transactions</span>
            <span className="font-finance text-xs text-stone-500">{formatCurrency(totalSpent)} total</span>
          </div>
          {transactions.map((t, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-2.5 border-b border-stone-50 last:border-0">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xs text-stone-400 shrink-0">{t.date}</span>
                <span className="text-sm text-stone-700 truncate">{t.description || expenseCategoryLabel(t.category)}</span>
                <span className="text-xs text-stone-400 shrink-0">{expenseCategoryLabel(t.category)}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-3">
                <span className="font-finance text-sm text-stone-900">{formatCurrency(parseFloat(t.amount) || 0)}</span>
                <button onClick={() => setTransactions((prev) => prev.filter((_, idx) => idx !== i))} className="text-stone-300 hover:text-red-400 transition-colors">
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add form */}
      <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 mb-6">
        <p className="text-xs text-stone-500 mb-3">Add transaction</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <Input label="Date" type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
          <Input label="Description (optional)" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="e.g. Trader Joe's" />
          <Select
            label="Category"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ExpenseCategory }))}
            options={EXPENSE_CATEGORIES}
          />
          <Input label="Amount ($)" type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} placeholder="0.00" />
        </div>
        <Btn onClick={handleAdd} variant="secondary"><Plus size={14} /> Add transaction</Btn>
      </div>

      <div className="flex items-center gap-4">
        <Btn onClick={() => onNext({ startDate, endDate, monthlyGoal: parseFloat(monthlyGoal) || 0, transactions })}>
          Continue <ArrowRight size={14} />
        </Btn>
        <button onClick={() => onNext({ startDate, endDate, monthlyGoal: parseFloat(monthlyGoal) || 0, transactions: [] })} className="text-xs text-stone-400 hover:text-stone-600 transition-colors">Skip for now</button>
      </div>
    </div>
  )
}

// ── Step 9: Income ────────────────────────────────────────────────────────────

type DraftIncome = { name: string; type: IncomeStreamType; isActive: boolean }

const INCOME_TYPES: { value: IncomeStreamType; label: string }[] = [
  { value: 'w2', label: 'W-2 (Salary)' },
  { value: 'hourly', label: 'Hourly' },
  { value: 'fellowship', label: 'Fellowship' },
  { value: 'scholarship', label: 'Scholarship' },
  { value: 'other', label: 'Other' },
]

function StepIncome({ onNext, onSkip }: { onNext: (streams: DraftIncome[]) => void; onSkip: () => void }) {
  const [streams, setStreams] = useState<DraftIncome[]>([])
  const [form, setForm] = useState({ name: '', type: 'w2' as IncomeStreamType, isActive: true })

  function handleAdd() {
    if (!form.name) return
    setStreams((prev) => [...prev, { ...form }])
    setForm({ name: '', type: 'w2', isActive: true })
  }

  return (
    <div className="max-w-lg mx-auto w-full px-4">
      <h2 className="text-xl font-semibold text-stone-900 mb-1">Income sources</h2>
      <p className="text-sm text-stone-500 mb-4">What income sources do you have?</p>
      <StepInfo>
        Your income type determines how taxes work and when money arrives. W-2 and hourly income is withheld at the source; fellowships and scholarships often aren't — meaning you may owe estimated quarterly taxes.
      </StepInfo>

      {streams.length > 0 && (
        <div className="mb-4 border border-stone-200 rounded-xl overflow-hidden">
          {streams.map((s, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-stone-100 last:border-0">
              <div>
                <span className="text-sm text-stone-700">{s.name}</span>
                <span className="text-xs text-stone-400 ml-2">{INCOME_TYPES.find((t) => t.value === s.type)?.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-0.5 rounded-full ${s.isActive ? 'bg-green-50 text-green-600' : 'bg-stone-100 text-stone-400'}`}>
                  {s.isActive ? 'Active' : 'Inactive'}
                </span>
                <button onClick={() => setStreams((prev) => prev.filter((_, idx) => idx !== i))} className="text-stone-300 hover:text-red-400 transition-colors">
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 mb-6">
        <p className="text-xs text-stone-500 mb-3">Add income source</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <Input label="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Research GSR" />
          <Select
            label="Type"
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as IncomeStreamType }))}
            options={INCOME_TYPES}
          />
        </div>
        <div className="flex items-center gap-3 mb-3">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              className="rounded border-stone-300"
            />
            <span className="text-sm text-stone-600">Currently active</span>
          </label>
        </div>
        <Btn onClick={handleAdd} variant="secondary"><Plus size={14} /> Add</Btn>
      </div>

      <div className="flex items-center gap-4">
        <Btn onClick={() => onNext(streams)}>Continue <ArrowRight size={14} /></Btn>
        <button onClick={onSkip} className="text-xs text-stone-400 hover:text-stone-600 transition-colors">Skip for now</button>
      </div>
    </div>
  )
}

// ── Step 10: Schedule ─────────────────────────────────────────────────────────

const FREQ_LABELS: Record<string, string> = {
  weekly_biweekly: 'Weekly / Biweekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  annually: 'Annually',
}

function StepSchedule({ items, onNext }: { items: { frequency: string; task: string }[]; onNext: () => void }) {
  const grouped = items.reduce((acc, item) => {
    if (!acc[item.frequency]) acc[item.frequency] = []
    acc[item.frequency].push(item.task)
    return acc
  }, {} as Record<string, string[]>)

  return (
    <div className="max-w-2xl mx-auto w-full px-4">
      <h2 className="text-xl font-semibold text-stone-900 mb-1">Your financial schedule</h2>
      <p className="text-sm text-stone-500 mb-6">We've pre-loaded your financial schedule. You can customize dates on the Schedule page.</p>

      <div className="space-y-5 mb-8">
        {['weekly_biweekly', 'monthly', 'quarterly', 'annually'].map((freq) => (
          grouped[freq] ? (
            <div key={freq}>
              <p className="text-xs uppercase tracking-widest text-stone-400 mb-2">{FREQ_LABELS[freq]}</p>
              <div className="space-y-1">
                {grouped[freq].map((task, i) => (
                  <div key={i} className="flex items-center gap-2 py-1.5 px-3 bg-stone-50 rounded-lg">
                    <div className="w-1.5 h-1.5 rounded-full bg-stone-300 shrink-0" />
                    <span className="text-sm text-stone-600">{task}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null
        ))}
      </div>

      <Btn onClick={onNext}>Looks good <ArrowRight size={14} /></Btn>
    </div>
  )
}

// ── Step 12: Emergency Fund ───────────────────────────────────────────────────

function StepEmergencyFund({
  scenarios,
  onScenariosChange,
  onNext,
}: {
  scenarios: EmergencyFundScenario[]
  onScenariosChange: (s: EmergencyFundScenario[]) => void
  onNext: () => void
}) {
  const total = scenarios.filter((s) => s.enabled).reduce((sum, s) => sum + s.amount, 0)

  function toggle(id: string) {
    onScenariosChange(scenarios.map((s) => s.id === id ? { ...s, enabled: !s.enabled, amount: !s.enabled ? s.amount : 0 } : s))
  }

  function updateAmount(id: string, amount: number) {
    onScenariosChange(scenarios.map((s) => s.id === id ? { ...s, amount } : s))
  }

  return (
    <div className="max-w-2xl mx-auto w-full px-4">
      <div className="flex items-start justify-between mb-1">
        <h2 className="text-xl font-semibold text-stone-900">Emergency fund planning</h2>
        <div className="text-right">
          <p className="text-xs text-stone-400">Your target</p>
          <p className="font-finance text-lg text-stone-900">{formatCurrency(total)}</p>
        </div>
      </div>
      <p className="text-sm text-stone-500 mb-4">Toggle each risk scenario and enter a target amount.</p>
      <StepInfo>
        Most advice says "save 3–6 months of expenses," but your actual risks are specific. A car you depend on, a high insurance deductible, or student visa status all change the number. Size your fund to your life, not a rule of thumb.
      </StepInfo>

      <div className="space-y-3 mb-8">
        {scenarios.map((sc) => (
          <div key={sc.id} className={`border rounded-xl px-4 py-3 transition-colors ${sc.enabled ? 'border-stone-300 bg-white' : 'border-stone-100 bg-stone-50'}`}>
            <div className="flex items-center justify-between gap-3">
              <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-0">
                <input
                  type="checkbox"
                  checked={sc.enabled}
                  onChange={() => toggle(sc.id)}
                  className="rounded border-stone-300 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-sm text-stone-700 leading-tight">{sc.label}</p>
                  <p className="text-xs text-stone-400 truncate">{sc.exampleHint}</p>
                </div>
              </label>
              {sc.enabled && (
                <input
                  type="number"
                  value={sc.amount || ''}
                  onChange={(e) => updateAmount(sc.id, parseFloat(e.target.value) || 0)}
                  placeholder="Amount"
                  className="w-28 border border-stone-200 rounded-lg px-3 py-1.5 text-sm font-finance text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-300 shrink-0"
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <Btn onClick={onNext}>Continue <ArrowRight size={14} /></Btn>
    </div>
  )
}

// ── Step 13: Done ─────────────────────────────────────────────────────────────

function StepDone({ accounts, onFinish, onReset }: { accounts: Account[]; onFinish: () => void; onReset: () => void }) {
  const assets = totalAssets(accounts)
  const liabilities = totalLiabilities(accounts)
  const nw = netWorth(accounts)

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-lg mx-auto px-4">
      <p className="text-xs uppercase tracking-widest text-stone-400 mb-4">Setup complete</p>
      <h2 className="text-3xl font-semibold text-stone-900 mb-8">You're all set.</h2>

      <div className="flex gap-6 mb-10">
        {[
          { label: 'Total Assets', value: assets },
          { label: 'Total Liabilities', value: liabilities },
          { label: 'Net Worth', value: nw },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="text-xs text-stone-400 mb-1">{stat.label}</p>
            <p className={`font-finance text-xl ${stat.label === 'Net Worth' && nw < 0 ? 'text-red-500' : 'text-stone-900'}`}>
              {formatCurrency(stat.value)}
            </p>
          </div>
        ))}
      </div>

      <Btn onClick={onFinish} variant="primary">
        Go to Overview <ArrowRight size={14} />
      </Btn>
      <button
        onClick={onReset}
        className="mt-4 text-xs text-stone-400 hover:text-stone-600 transition-colors"
      >
        Reset onboarding
      </button>
    </div>
  )
}

// ── Main Onboarding Component ─────────────────────────────────────────────────

export function Onboarding() {
  const { completeOnboarding, resetForOnboarding, loadSampleData, addGoal, addAccount, updateExpenseSettings, addTransaction, addIncomeStream, scheduleItems, emergencyFundScenarios, toggleScenario, updateScenarioAmount } = useStore()

  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)

  // Draft state (committed to store on Continue)
  const [draftGoals, setDraftGoals] = useState<DraftGoal[]>([])
  const [cashAccounts, setCashAccounts] = useState<DraftAccount[]>([])
  const [investAccounts, setInvestAccounts] = useState<DraftAccount[]>([])
  const [loanAccounts, setLoanAccounts] = useState<DraftAccount[]>([])
  const [cardAccounts, setCardAccounts] = useState<DraftAccount[]>([])
  const [localEFScenarios, setLocalEFScenarios] = useState<EmergencyFundScenario[]>(emergencyFundScenarios)

  // All committed accounts (for done screen)
  const allDraftAccounts = [...cashAccounts, ...investAccounts, ...loanAccounts, ...cardAccounts] as Account[]

  function go(targetStep: number) {
    setDirection(targetStep > step ? 1 : -1)
    setStep(targetStep)
  }

  function next() { go(step + 1) }
  function back() { if (step > 1) go(step - 1) }

  function commitGoals(goals: DraftGoal[]) {
    goals.forEach((g) => addGoal({ timeframe: g.timeframe, type: g.type, title: g.title, description: '', targetAmount: parseFloat(g.targetAmount) || 0, currentAmount: 0, targetDate: g.targetDate, smart: { specific: '', measurable: '', achievable: '', relevant: '', timeBound: '' } }))
  }

  function commitAccounts(accounts: DraftAccount[]) {
    accounts.forEach((a) => addAccount(a as Parameters<typeof addAccount>[0]))
  }

  function handleFinish() {
    // Commit all draft data
    commitGoals(draftGoals)
    commitAccounts([...cashAccounts, ...investAccounts, ...loanAccounts, ...cardAccounts])
    // EF scenarios
    localEFScenarios.forEach((sc) => {
      if (sc.enabled !== emergencyFundScenarios.find((e) => e.id === sc.id)?.enabled) toggleScenario(sc.id)
      if (sc.amount !== emergencyFundScenarios.find((e) => e.id === sc.id)?.amount) updateScenarioAmount(sc.id, sc.amount)
    })
    completeOnboarding()
  }

  const showProgressBar = step >= 1
  const showBack = step >= 2

  return (
    <div className="min-h-screen bg-[#F9F7F4] flex flex-col">
      {/* Progress bar + nav */}
      {showProgressBar && (() => {
        const meta = STEP_META[step]
        return (
          <div className="shrink-0">
            {/* Bar */}
            <div className="h-[3px] bg-stone-100">
              <div
                className="h-full bg-stone-900 transition-all duration-500"
                style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
              />
            </div>
            {/* Nav row */}
            <div className="flex items-center justify-between px-6 pt-4 pb-2">
              <div className="w-16">
                {showBack && (
                  <button onClick={back} className="text-xs text-stone-400 hover:text-stone-600 transition-colors">
                    ← Back
                  </button>
                )}
              </div>
              <div className="text-center">
                <p className="text-xs font-medium text-stone-700">{meta?.name}</p>
                <p className="text-[10px] text-stone-400">{meta ? PHASE_LABELS[meta.phase] : ''}</p>
              </div>
              <span className="text-xs text-stone-400 w-16 text-right">{step} / {TOTAL_STEPS}</span>
            </div>
          </div>
        )
      })()}

      {/* Step content */}
      <div className="flex-1 flex items-center justify-center py-10">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transition}
            className="w-full"
          >
            {step === 0 && (
              <StepWelcome
                onStart={() => { resetForOnboarding(); setLocalEFScenarios(emergencyFundScenarios); go(1) }}
                onLoadSample={() => { loadSampleData() }}
              />
            )}

            {step === 1 && (
              <StepPhaseIntro
                phase="01"
                label="Understand"
                description="We'll start by mapping your current financial picture — your goals, accounts, and expenses."
                onNext={next}
              />
            )}

            {step === 2 && (
              <StepGoals
                onNext={(goals) => { setDraftGoals(goals); next() }}
                onSkip={next}
              />
            )}

            {step === 3 && (
              <AccountsStep
                category="cash"
                title="Cash accounts"
                description="Checking, savings, CDs, and cash on hand."
                whyItMatters="Your cash position is your financial runway — how long you can cover expenses without any income. Including every account (even a $30 wallet) gives you an accurate starting point for your net worth."
                totalLabel="Total cash"
                drafts={cashAccounts}
                onDraftsChange={setCashAccounts}
                onNext={next}
                onSkip={next}
              />
            )}

            {step === 4 && (
              <AccountsStep
                category="investment"
                title="Investment accounts"
                description="Retirement accounts, brokerage, and other investments."
                whyItMatters="Investment accounts are your long-term wealth. Listing them now — even with small balances — establishes a baseline so you can watch them grow over time and make sure you're not leaving employer match on the table."
                totalLabel="Total investments"
                drafts={investAccounts}
                onDraftsChange={setInvestAccounts}
                onNext={next}
                onSkip={next}
              />
            )}

            {step === 5 && (
              <AccountsStep
                category="loan"
                title="Loans"
                description="Student loans, auto loans, medical debt, and other borrowing."
                whyItMatters="Debt has a real cost measured by APR. Listing every loan — including 0% medical bills — lets you rank payoff priority (highest APR first) and see your true net worth, not just your assets."
                totalLabel="Total loan balance"
                drafts={loanAccounts}
                onDraftsChange={setLoanAccounts}
                onNext={next}
                onSkip={next}
              />
            )}

            {step === 6 && (
              <AccountsStep
                category="credit_card"
                title="Credit cards"
                description="All credit cards, including authorized user accounts."
                whyItMatters="Credit card balances carried month-to-month accrue interest at some of the highest rates available (often 25–30% APR). Tracking all cards — including ones you're an authorized user on — gives you a full picture of revolving debt."
                totalLabel="Total card balance"
                drafts={cardAccounts}
                onDraftsChange={setCardAccounts}
                onNext={next}
                onSkip={next}
              />
            )}

            {step === 7 && (
              <StepExpenses
                onNext={({ startDate, endDate, monthlyGoal, transactions }) => {
                  updateExpenseSettings({ startDate, endDate, monthlyGoal })
                  transactions.forEach((t) => addTransaction({ date: t.date, description: t.description, category: t.category, amount: parseFloat(t.amount) || 0 }))
                  next()
                }}
              />
            )}

            {step === 8 && (
              <StepPhaseIntro
                phase="02"
                label="Create"
                description="Now we'll set up your income streams and build your financial schedule."
                onNext={next}
              />
            )}

            {step === 9 && (
              <StepIncome
                onNext={(streams) => {
                  streams.forEach((s) => addIncomeStream(s))
                  next()
                }}
                onSkip={next}
              />
            )}

            {step === 10 && (
              <StepSchedule items={scheduleItems} onNext={next} />
            )}

            {step === 11 && (
              <StepPhaseIntro
                phase="03"
                label="Compare"
                description="Finally, we'll plan your emergency fund so you're prepared for the unexpected."
                onNext={next}
              />
            )}

            {step === 12 && (
              <StepEmergencyFund
                scenarios={localEFScenarios}
                onScenariosChange={setLocalEFScenarios}
                onNext={next}
              />
            )}

            {step === 13 && (
              <StepDone
                accounts={allDraftAccounts}
                onFinish={handleFinish}
                onReset={() => { resetForOnboarding(); setLocalEFScenarios(emergencyFundScenarios); go(0) }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
