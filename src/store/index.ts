import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { genId, today } from '@/lib/formatters'
import type {
  Goal, Account, CashAccount, InvestmentAccount, LoanAccount, CreditCard,
  Transaction, ExpenseSettings,
  NetWorthSettings, NetWorthEntry,
  IncomeStream, PaycheckEntry, EstimatedTaxPayment,
  ScheduleItem,
  InstitutionRow, SecurityReference, CardComparison,
  EmergencyFundScenario,
} from '@/types'

// ── Sample Data ───────────────────────────────────────────────────────────────

const sampleGoals: Goal[] = [
  {
    id: 'g1', timeframe: 'short', type: 'savings',
    title: 'Build Emergency Fund',
    description: 'Build a 1-month emergency fund of $3,000',
    targetAmount: 3000, currentAmount: 1800, targetDate: '2024-06-30',
    smart: {
      specific: 'Build a 1-month emergency fund of $3,000',
      measurable: 'Reach $3,000 in my Ally savings account',
      achievable: 'Save $200/month for 6 months; currently have $1,800',
      relevant: 'Provides a financial safety net for unexpected expenses',
      timeBound: 'By the end of June 2024',
    },
    createdAt: '2024-01-01',
  },
  {
    id: 'g2', timeframe: 'mid', type: 'debt_payoff',
    title: 'Pay Off Citi Card',
    description: 'Pay off the Citi Custom Cash card balance including interest',
    targetAmount: 7200, currentAmount: 5000, targetDate: '2027-01-01',
    smart: {
      specific: 'Pay off the Citi Custom Cash card — $7,200 total with interest',
      measurable: 'Balance reaches $0',
      achievable: '$200/month extra payment over ~3 years',
      relevant: 'Eliminating 25.24% APR debt is the highest-return move I can make',
      timeBound: 'Beginning of 2027',
    },
    createdAt: '2024-01-01',
  },
  {
    id: 'g3', timeframe: 'long', type: 'savings',
    title: 'Car Down Payment',
    description: 'Save $6,000 for a car down payment',
    targetAmount: 6000, currentAmount: 0, targetDate: '2029-01-01',
    smart: {
      specific: 'Save $6,000 for a car down payment',
      measurable: '$6,000 in a dedicated savings account',
      achievable: '$100/month once emergency fund and CC are handled',
      relevant: 'Current car is aging; need to plan ahead',
      timeBound: 'Beginning of 2029',
    },
    createdAt: '2024-01-01',
  },
]

const sampleAccounts: Account[] = [
  // Cash
  { id: 'a1', category: 'cash', institution: 'Ally Bank', nickname: 'Checking', lastFour: '4821', subtype: 'Checking', balance: 25, lastUpdated: today() } as CashAccount,
  { id: 'a2', category: 'cash', institution: 'Ally Bank', nickname: 'Savings', lastFour: '6204', subtype: 'High-Yield Savings', apy: 4.35, balance: 400, lastUpdated: today() } as CashAccount,
  { id: 'a3', category: 'cash', institution: 'Discover', nickname: 'CD', lastFour: '9103', subtype: 'CD', apy: 5.3, balance: 1000, notes: '12-month CD', lastUpdated: today() } as CashAccount,
  { id: 'a4', category: 'cash', institution: 'Wallet', nickname: 'Cash', subtype: 'Cash', balance: 30, lastUpdated: today() } as CashAccount,
  { id: 'a5', category: 'cash', institution: 'Chase', nickname: 'Checking', lastFour: '7712', subtype: 'Checking', balance: 88, notes: '$12 monthly fee — close this account', lastUpdated: today() } as CashAccount,
  // Investments
  { id: 'a6', category: 'investment', institution: 'Fidelity', nickname: 'DCP', lastFour: '0041', subtype: 'DCP (Pre-Tax)', allocationMix: '70/30', balance: 500, lastUpdated: today() } as InvestmentAccount,
  { id: 'a7', category: 'investment', institution: 'Fidelity', nickname: 'Roth IRA', lastFour: '0042', subtype: 'Roth IRA', allocationMix: '90/10', balance: 10, lastUpdated: today() } as InvestmentAccount,
  { id: 'a8', category: 'investment', institution: 'TIAA', nickname: '403(b)', lastFour: '2211', subtype: '403(b)', allocationMix: '80/20', balance: 2000, notes: 'Previous employer — includes employer match', lastUpdated: today() } as InvestmentAccount,
  { id: 'a9', category: 'investment', institution: 'Vanguard', nickname: 'Brokerage', lastFour: '5530', subtype: 'Brokerage', allocationMix: '100/0', balance: 1000, lastUpdated: today() } as InvestmentAccount,
  { id: 'a10', category: 'investment', institution: 'Robinhood', nickname: 'Stocks', subtype: 'Brokerage', balance: 200, lastUpdated: today() } as InvestmentAccount,
  { id: 'a11', category: 'investment', institution: 'Acorns', nickname: 'Round-ups', subtype: 'Brokerage', balance: 100, lastUpdated: today() } as InvestmentAccount,
  // Loans
  { id: 'a12', category: 'loan', institution: 'US Dept of Education', nickname: 'Student Loan (Sub)', subtype: 'Federal Subsidized', apr: 5.5, balance: 2000, minimumPayment: 0, notes: 'In deferment', lastUpdated: today() } as LoanAccount,
  { id: 'a13', category: 'loan', institution: 'US Dept of Education', nickname: 'Student Loan (Unsub)', subtype: 'Federal Unsubsidized', apr: 5.5, balance: 1000, minimumPayment: 0, lastUpdated: today() } as LoanAccount,
  { id: 'a14', category: 'loan', institution: 'Honda Financial', nickname: 'Auto Loan (Civic)', subtype: 'Auto', apr: 11.35, balance: 6870, minimumPayment: 489, dueDate: 15, lastUpdated: today() } as LoanAccount,
  { id: 'a15', category: 'loan', institution: 'UCLA Health', nickname: 'Medical Bill', subtype: 'Medical', apr: 0, balance: 400, minimumPayment: 50, notes: 'ER visit 6/8/23 — 0% interest', lastUpdated: today() } as LoanAccount,
  // Credit cards
  { id: 'a16', category: 'credit_card', institution: 'Citi', nickname: 'Custom Cash', lastFour: '4892', subtype: 'standard', apr: 25.24, creditLimit: 5000, balance: 5000, minimumPayment: 35, paymentDueDate: 8, closingDate: 16, rewards: '5% on top spend category', lastUpdated: today() } as CreditCard,
  { id: 'a17', category: 'credit_card', institution: 'Synchrony / Amazon', nickname: 'Amazon Prime', lastFour: '3311', subtype: 'co-branded', apr: 29.99, creditLimit: 1200, balance: 25, minimumPayment: 25, rewards: '5% back on Amazon', lastUpdated: today() } as CreditCard,
  { id: 'a18', category: 'credit_card', institution: 'Discover', nickname: 'Discover It', lastFour: '0072', subtype: 'standard', apr: 29.24, creditLimit: 2500, balance: 89, minimumPayment: 25, rewards: '5% rotating categories, 1% all else', lastUpdated: today() } as CreditCard,
  { id: 'a19', category: 'credit_card', institution: 'Chase', nickname: 'Southwest (AU)', lastFour: '6601', subtype: 'authorized_user', apr: 27.99, creditLimit: 5000, balance: 0, minimumPayment: 0, annualFee: 149, notes: "Mom's account — I'm an authorized user", lastUpdated: today() } as CreditCard,
  { id: 'a20', category: 'credit_card', institution: 'Chase', nickname: 'Freedom Unlimited', lastFour: '8834', subtype: 'standard', apr: 0, creditLimit: 3000, balance: 0, minimumPayment: 0, rewards: '0% intro APR for 15 months, 1.5% cash back', lastUpdated: today() } as CreditCard,
]

const sampleTransactions: Transaction[] = [
  { id: 't1', date: '2023-10-01', description: 'Rent', category: 'rent_mortgage', amount: 1509.83 },
  { id: 't2', date: '2023-10-02', description: 'Trader Joes', category: 'groceries', amount: 63.13 },
  { id: 't3', date: '2023-10-05', description: 'Chevron', category: 'gas', amount: 48.56 },
  { id: 't4', date: '2023-10-07', description: 'Honda payment', category: 'car_fees', amount: 489.00 },
  { id: 't5', date: '2023-10-10', description: 'Whole Foods', category: 'groceries', amount: 108.49 },
  { id: 't6', date: '2023-10-12', description: 'UCLA Student Health', category: 'health_medical', amount: 25.00 },
  { id: 't7', date: '2023-10-15', description: 'Spotify', category: 'entertainment_subscriptions', amount: 9.99 },
  { id: 't8', date: '2023-10-18', description: 'Bruin Plate (dining)', category: 'dining_out', amount: 32.50 },
  { id: 't9', date: '2023-10-20', description: 'Shell', category: 'gas', amount: 45.31 },
  { id: 't10', date: '2023-10-22', description: 'Amazon', category: 'home_goods', amount: 47.82 },
  { id: 't11', date: '2023-11-01', description: 'Rent', category: 'rent_mortgage', amount: 1509.83 },
  { id: 't12', date: '2023-11-03', description: 'Ralphs', category: 'groceries', amount: 94.20 },
  { id: 't13', date: '2023-11-05', description: 'Honda payment', category: 'car_fees', amount: 489.00 },
  { id: 't14', date: '2023-11-08', description: 'Costco Gas', category: 'gas', amount: 52.08 },
  { id: 't15', date: '2023-11-15', description: 'Netflix', category: 'entertainment_subscriptions', amount: 15.49 },
  { id: 't16', date: '2023-11-20', description: 'Target', category: 'clothing', amount: 68.44 },
  { id: 't17', date: '2023-11-24', description: 'Thanksgiving dinner', category: 'dining_out', amount: 87.30 },
  { id: 't18', date: '2023-12-01', description: 'Rent', category: 'rent_mortgage', amount: 1509.83 },
  { id: 't19', date: '2023-12-05', description: 'Honda payment', category: 'car_fees', amount: 489.00 },
  { id: 't20', date: '2023-12-07', description: 'Trader Joes', category: 'groceries', amount: 71.55 },
]

const sampleScheduleItems: ScheduleItem[] = [
  // Weekly/Biweekly
  { id: 's1', frequency: 'weekly_biweekly', task: 'Review budget, update transactions', myDates: '', isCustom: false, completedDates: [] },
  { id: 's2', frequency: 'weekly_biweekly', task: 'Pay off credit card balance', myDates: '', isCustom: false, completedDates: [], helperText: 'Pay before the closing date to keep utilization low. CFPB recommends staying under 30%.' },
  { id: 's3', frequency: 'weekly_biweekly', task: 'Review and track hours worked', myDates: '', isCustom: false, completedDates: [] },
  // Monthly
  { id: 's4', frequency: 'monthly', task: 'Pay minimum monthly payments on all debts', myDates: '', isCustom: false, completedDates: [] },
  { id: 's5', frequency: 'monthly', task: 'Pay monthly bills (rent, utilities, etc.)', myDates: '', isCustom: false, completedDates: [] },
  { id: 's6', frequency: 'monthly', task: 'Review, download, and save paycheck', myDates: '', isCustom: false, completedDates: [] },
  { id: 's7', frequency: 'monthly', task: 'Track net worth', myDates: '', isCustom: false, completedDates: [] },
  { id: 's8', frequency: 'monthly', task: 'Submit employee timesheet', myDates: '', isCustom: false, completedDates: [] },
  // Quarterly
  { id: 's9', frequency: 'quarterly', task: 'Pay estimated quarterly taxes', myDates: 'Apr 15 / Jun 15 / Sep 15 / Jan 15', isCustom: false, completedDates: [] },
  { id: 's10', frequency: 'quarterly', task: 'Download and save BruinBill Activity PDF', myDates: '', isCustom: false, completedDates: [] },
  { id: 's11', frequency: 'quarterly', task: 'Check credit card rewards and maximize', myDates: '', isCustom: false, completedDates: [] },
  { id: 's12', frequency: 'quarterly', task: 'Check credit report at annualcreditreport.com', myDates: '', isCustom: false, completedDates: [], helperText: 'Post-COVID you can check weekly at annualcreditreport.com.' },
  // Annually
  { id: 's13', frequency: 'annually', task: 'FAFSA application', myDates: '', isCustom: false, completedDates: [] },
  { id: 's14', frequency: 'annually', task: 'Download and check 1098T', myDates: '', isCustom: false, completedDates: [] },
  { id: 's15', frequency: 'annually', task: 'File taxes', myDates: '', isCustom: false, completedDates: [] },
  { id: 's16', frequency: 'annually', task: 'Invest in retirement accounts', myDates: '', isCustom: false, completedDates: [], helperText: 'Consider lump sum vs. dollar-cost averaging based on your timeline.' },
  { id: 's17', frequency: 'annually', task: 'Rebalance investment portfolio', myDates: '', isCustom: false, completedDates: [] },
  { id: 's18', frequency: 'annually', task: 'Review long-term financial goals', myDates: '', isCustom: false, completedDates: [] },
  { id: 's19', frequency: 'annually', task: 'Review all insurance plans', myDates: '', isCustom: false, completedDates: [] },
  { id: 's20', frequency: 'annually', task: 'Review employee benefits / employer financial planning services', myDates: '', isCustom: false, completedDates: [] },
  { id: 's21', frequency: 'annually', task: 'Verify and download employment contracts', myDates: '', isCustom: false, completedDates: [] },
  { id: 's22', frequency: 'annually', task: 'Review lease and other contracts', myDates: '', isCustom: false, completedDates: [] },
]

const sampleInstitutions: InstitutionRow[] = [
  { id: 'i1', name: 'Ally Bank', type: 'bank', feesMinimums: 'No fees, no minimums', checkingApy: '0.10', savingsApy: '4.35', cd6mo: '5.00', cd12mo: '5.25', cd24mo: '4.10', pros: 'Great rates, no fees, easy transfers', cons: 'No physical branches', isCurrentlyUsed: true },
  { id: 'i2', name: 'Marcus by Goldman Sachs', type: 'bank', feesMinimums: 'No fees', checkingApy: '', savingsApy: '4.50', cd6mo: '5.10', cd12mo: '5.15', cd24mo: '4.25', pros: 'High savings APY', cons: 'Savings only, no checking', isCurrentlyUsed: false },
  { id: 'i3', name: 'Chase Bank', type: 'bank', feesMinimums: '$12/mo (waivable)', checkingApy: '0.01', savingsApy: '0.01', cd6mo: '0.01', cd12mo: '0.01', cd24mo: '0.01', pros: 'Huge ATM network, branches everywhere', cons: 'Near-zero APY on savings', isCurrentlyUsed: true },
  { id: 'i4', name: 'Discover Bank', type: 'bank', feesMinimums: 'No fees', checkingApy: '1.00', savingsApy: '4.25', cd6mo: '4.70', cd12mo: '4.70', cd24mo: '4.25', pros: 'Good rates, 1% cash back on debit', cons: 'Limited ATM network', isCurrentlyUsed: false },
]

const sampleSecurities: SecurityReference[] = [
  { id: 'sec1', ticker: 'VOO', name: 'Vanguard S&P 500 ETF', expenseRatio: '0.03', notes: 'Core US large-cap holding' },
  { id: 'sec2', ticker: 'VTSAX', name: 'Vanguard Total Stock Market', expenseRatio: '0.04', notes: 'Broadest US market exposure' },
  { id: 'sec3', ticker: 'FZILX', name: 'Fidelity ZERO International', expenseRatio: '0.00', notes: 'Free international index fund' },
]

const sampleEmergencyFundScenarios: EmergencyFundScenario[] = [
  { id: 'ef1', label: 'Job Loss / Loss of Income', exampleHint: 'Example: 6 months of living expenses', enabled: true, amount: 12000 },
  { id: 'ef2', label: 'Unexpected Car Repairs', exampleHint: 'Example: $500–$2,000', enabled: false, amount: 0 },
  { id: 'ef3', label: 'Unexpected Home Repairs / Accommodations', exampleHint: 'Example: $1,000–$5,000', enabled: false, amount: 0 },
  { id: 'ef4', label: 'Medical Costs (Deductible)', exampleHint: 'Example: Your insurance deductible amount', enabled: false, amount: 0 },
  { id: 'ef5', label: 'Medical Costs (Out-of-Pocket Maximum)', exampleHint: 'Example: Your plan\'s out-of-pocket max', enabled: false, amount: 0 },
  { id: 'ef6', label: 'Unexpected Travel Costs', exampleHint: 'Example: Round-trip flight + 1 week hotel', enabled: false, amount: 0 },
  { id: 'ef7', label: 'Family Member Emergency', exampleHint: 'Example: 1 month of family member\'s living expenses', enabled: false, amount: 0 },
  { id: 'ef8', label: 'Rent / Utility Increases or Overlap', exampleHint: 'Example: 2 weeks of current rent', enabled: false, amount: 0 },
  { id: 'ef9', label: 'Insurance Policy Increases', exampleHint: 'Example: Estimated annual increase', enabled: false, amount: 0 },
  { id: 'ef10', label: 'Moving Expenses', exampleHint: 'Example: First + last month rent + movers', enabled: false, amount: 0 },
  { id: 'ef11', label: '"Leaving the Country" Fund', exampleHint: 'Example: Flights + 3 months living abroad', enabled: false, amount: 0 },
]

const sampleIncomeStreams: IncomeStream[] = [
  { id: 'is1', name: 'Neurology GSR', type: 'w2', isActive: true },
  { id: 'is2', name: 'Financial Wellness! (Hourly)', type: 'hourly', isActive: true },
  { id: 'is3', name: 'NRSA Fellowship', type: 'fellowship', isActive: true },
  { id: 'is4', name: 'GPB Fellowship Incentive Program', type: 'scholarship', isActive: false },
]

// ── Store Type ────────────────────────────────────────────────────────────────

interface AppState {
  // Onboarding
  onboardingCompleted: boolean
  completeOnboarding: () => void
  resetForOnboarding: () => void
  loadSampleData: () => void

  // Goals
  goals: Goal[]
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void
  updateGoal: (id: string, updates: Partial<Goal>) => void
  deleteGoal: (id: string) => void

  // Accounts
  accounts: Account[]
  addAccount: (account: Omit<Account, 'id' | 'lastUpdated'>) => void
  updateAccount: (id: string, updates: Partial<Account>) => void
  deleteAccount: (id: string) => void

  // Transactions
  transactions: Transaction[]
  expenseSettings: ExpenseSettings
  addTransaction: (t: Omit<Transaction, 'id'>) => void
  updateTransaction: (id: string, updates: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void
  updateExpenseSettings: (s: Partial<ExpenseSettings>) => void

  // Net Worth
  netWorthSettings: NetWorthSettings
  netWorthEntries: NetWorthEntry[]
  addNetWorthEntry: (entry: Omit<NetWorthEntry, 'id'>) => void
  updateNetWorthEntry: (id: string, updates: Partial<NetWorthEntry>) => void
  deleteNetWorthEntry: (id: string) => void
  updateNetWorthSettings: (s: Partial<NetWorthSettings>) => void

  // Income
  incomeStreams: IncomeStream[]
  paycheckEntries: PaycheckEntry[]
  estimatedTaxPayments: EstimatedTaxPayment[]
  addIncomeStream: (stream: Omit<IncomeStream, 'id'>) => void
  updateIncomeStream: (id: string, updates: Partial<IncomeStream>) => void
  deleteIncomeStream: (id: string) => void
  addPaycheckEntry: (entry: Omit<PaycheckEntry, 'id'>) => void
  deletePaycheckEntry: (id: string) => void
  addEstimatedTaxPayment: (payment: Omit<EstimatedTaxPayment, 'id'>) => void
  deleteEstimatedTaxPayment: (id: string) => void

  // Schedule
  scheduleItems: ScheduleItem[]
  toggleScheduleComplete: (id: string) => void
  updateScheduleDates: (id: string, myDates: string) => void
  addScheduleItem: (item: Omit<ScheduleItem, 'id'>) => void
  deleteScheduleItem: (id: string) => void

  // Institutions
  institutions: InstitutionRow[]
  securities: SecurityReference[]
  cardComparisons: CardComparison[]
  addInstitution: (row: Omit<InstitutionRow, 'id'>) => void
  updateInstitution: (id: string, updates: Partial<InstitutionRow>) => void
  deleteInstitution: (id: string) => void
  addSecurity: (sec: Omit<SecurityReference, 'id'>) => void
  updateSecurity: (id: string, updates: Partial<SecurityReference>) => void
  deleteSecurity: (id: string) => void
  addCardComparison: (card: Omit<CardComparison, 'id'>) => void
  updateCardComparison: (id: string, updates: Partial<CardComparison>) => void
  deleteCardComparison: (id: string) => void

  // Emergency Fund
  emergencyFundScenarios: EmergencyFundScenario[]
  toggleScenario: (id: string) => void
  updateScenarioAmount: (id: string, amount: number) => void
  resetEmergencyFundScenarios: () => void
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // ── Onboarding
      onboardingCompleted: false,
      completeOnboarding: () => set({ onboardingCompleted: true }),
      resetForOnboarding: () => set({
        onboardingCompleted: false,
        goals: [],
        accounts: [],
        transactions: [],
        expenseSettings: { startDate: '', endDate: '', monthlyGoal: 0 },
        incomeStreams: [],
        institutions: [],
        securities: [],
        emergencyFundScenarios: sampleEmergencyFundScenarios,
      }),
      loadSampleData: () => set({
        onboardingCompleted: true,
        goals: sampleGoals,
        accounts: sampleAccounts,
        transactions: sampleTransactions,
        expenseSettings: { startDate: '2023-10-01', endDate: '2023-12-31', monthlyGoal: 3150 },
        incomeStreams: sampleIncomeStreams,
        institutions: sampleInstitutions,
        securities: sampleSecurities,
        emergencyFundScenarios: sampleEmergencyFundScenarios,
      }),

      // ── Goals
      goals: [],
      addGoal: (goal) => set((s) => ({ goals: [...s.goals, { ...goal, id: genId(), createdAt: today() }] })),
      updateGoal: (id, updates) => set((s) => ({ goals: s.goals.map((g) => g.id === id ? { ...g, ...updates } : g) })),
      deleteGoal: (id) => set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),

      // ── Accounts
      accounts: [],
      addAccount: (account) => set((s) => ({ accounts: [...s.accounts, { ...account, id: genId(), lastUpdated: today() } as unknown as Account] })),
      updateAccount: (id, updates) => set((s) => ({ accounts: s.accounts.map((a) => a.id === id ? { ...a, ...updates } : a) as Account[] })),
      deleteAccount: (id) => set((s) => ({ accounts: s.accounts.filter((a) => a.id !== id) })),

      // ── Transactions
      transactions: [],
      expenseSettings: { startDate: '', endDate: '', monthlyGoal: 0 },
      addTransaction: (t) => set((s) => ({ transactions: [{ ...t, id: genId() }, ...s.transactions] })),
      updateTransaction: (id, updates) => set((s) => ({ transactions: s.transactions.map((t) => t.id === id ? { ...t, ...updates } : t) })),
      deleteTransaction: (id) => set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) })),
      updateExpenseSettings: (s) => set((st) => ({ expenseSettings: { ...st.expenseSettings, ...s } })),

      // ── Net Worth
      netWorthSettings: { monthlyGrowthGoal: 200 },
      netWorthEntries: [],
      addNetWorthEntry: (entry) => set((s) => ({ netWorthEntries: [...s.netWorthEntries, { ...entry, id: genId() }] })),
      updateNetWorthEntry: (id, updates) => set((s) => ({ netWorthEntries: s.netWorthEntries.map((e) => e.id === id ? { ...e, ...updates } : e) })),
      deleteNetWorthEntry: (id) => set((s) => ({ netWorthEntries: s.netWorthEntries.filter((e) => e.id !== id) })),
      updateNetWorthSettings: (s) => set((st) => ({ netWorthSettings: { ...st.netWorthSettings, ...s } })),

      // ── Income
      incomeStreams: [],
      paycheckEntries: [],
      estimatedTaxPayments: [],
      addIncomeStream: (stream) => set((s) => ({ incomeStreams: [...s.incomeStreams, { ...stream, id: genId() }] })),
      updateIncomeStream: (id, updates) => set((s) => ({ incomeStreams: s.incomeStreams.map((i) => i.id === id ? { ...i, ...updates } : i) })),
      deleteIncomeStream: (id) => set((s) => ({ incomeStreams: s.incomeStreams.filter((i) => i.id !== id) })),
      addPaycheckEntry: (entry) => set((s) => ({ paycheckEntries: [...s.paycheckEntries, { ...entry, id: genId() }] })),
      deletePaycheckEntry: (id) => set((s) => ({ paycheckEntries: s.paycheckEntries.filter((e) => e.id !== id) })),
      addEstimatedTaxPayment: (payment) => set((s) => ({ estimatedTaxPayments: [...s.estimatedTaxPayments, { ...payment, id: genId() }] })),
      deleteEstimatedTaxPayment: (id) => set((s) => ({ estimatedTaxPayments: s.estimatedTaxPayments.filter((p) => p.id !== id) })),

      // ── Schedule
      scheduleItems: sampleScheduleItems,
      toggleScheduleComplete: (id) => set((s) => ({
        scheduleItems: s.scheduleItems.map((item) => {
          if (item.id !== id) return item
          const todayStr = today()
          const alreadyDone = item.completedDates.includes(todayStr)
          return {
            ...item,
            completedDates: alreadyDone
              ? item.completedDates.filter((d) => d !== todayStr)
              : [...item.completedDates, todayStr],
          }
        }),
      })),
      updateScheduleDates: (id, myDates) => set((s) => ({ scheduleItems: s.scheduleItems.map((item) => item.id === id ? { ...item, myDates } : item) })),
      addScheduleItem: (item) => set((s) => ({ scheduleItems: [...s.scheduleItems, { ...item, id: genId() }] })),
      deleteScheduleItem: (id) => set((s) => ({ scheduleItems: s.scheduleItems.filter((i) => i.id !== id) })),

      // ── Institutions
      institutions: [],
      securities: [],
      cardComparisons: [],
      addInstitution: (row) => set((s) => ({ institutions: [...s.institutions, { ...row, id: genId() }] })),
      updateInstitution: (id, updates) => set((s) => ({ institutions: s.institutions.map((i) => i.id === id ? { ...i, ...updates } : i) })),
      deleteInstitution: (id) => set((s) => ({ institutions: s.institutions.filter((i) => i.id !== id) })),
      addSecurity: (sec) => set((s) => ({ securities: [...s.securities, { ...sec, id: genId() }] })),
      updateSecurity: (id, updates) => set((s) => ({ securities: s.securities.map((sec) => sec.id === id ? { ...sec, ...updates } : sec) })),
      deleteSecurity: (id) => set((s) => ({ securities: s.securities.filter((sec) => sec.id !== id) })),
      addCardComparison: (card) => set((s) => ({ cardComparisons: [...s.cardComparisons, { ...card, id: genId() }] })),
      updateCardComparison: (id, updates) => set((s) => ({ cardComparisons: s.cardComparisons.map((c) => c.id === id ? { ...c, ...updates } : c) })),
      deleteCardComparison: (id) => set((s) => ({ cardComparisons: s.cardComparisons.filter((c) => c.id !== id) })),

      // ── Emergency Fund
      emergencyFundScenarios: sampleEmergencyFundScenarios,
      toggleScenario: (id) => set((s) => ({ emergencyFundScenarios: s.emergencyFundScenarios.map((sc) => sc.id === id ? { ...sc, enabled: !sc.enabled } : sc) })),
      updateScenarioAmount: (id, amount) => set((s) => ({ emergencyFundScenarios: s.emergencyFundScenarios.map((sc) => sc.id === id ? { ...sc, amount } : sc) })),
      resetEmergencyFundScenarios: () => set({ emergencyFundScenarios: sampleEmergencyFundScenarios }),
    }),
    { name: 'roadmap-v2' }
  )
)
