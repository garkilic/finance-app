// ── Goals ─────────────────────────────────────────────────────────────────────

export type GoalTimeframe = 'short' | 'mid' | 'long'
export type GoalType = 'savings' | 'debt_payoff' | 'milestone' | 'habit'

export interface Goal {
  id: string
  timeframe: GoalTimeframe
  type: GoalType
  title: string
  description: string
  targetAmount: number
  currentAmount: number
  targetDate: string
  linkedAccountId?: string
  smart: {
    specific: string
    measurable: string
    achievable: string
    relevant: string
    timeBound: string
  }
  createdAt: string
  completedAt?: string
}

// ── Accounts ──────────────────────────────────────────────────────────────────

export type AccountCategory = 'cash' | 'investment' | 'loan' | 'credit_card'

export interface CashAccount {
  id: string
  category: 'cash'
  institution: string
  nickname: string
  lastFour?: string
  subtype: string
  apy?: number
  balance: number
  notes?: string
  lastUpdated: string
}

export interface InvestmentAccount {
  id: string
  category: 'investment'
  institution: string
  nickname: string
  lastFour?: string
  subtype: string
  allocationMix?: string
  balance: number
  notes?: string
  lastUpdated: string
}

export interface LoanAccount {
  id: string
  category: 'loan'
  institution: string
  nickname: string
  lastFour?: string
  subtype: string
  apr: number
  balance: number
  minimumPayment: number
  dueDate?: number
  notes?: string
  lastUpdated: string
}

export interface CreditCard {
  id: string
  category: 'credit_card'
  institution: string
  nickname: string
  lastFour?: string
  subtype: 'standard' | 'store' | 'co-branded' | 'authorized_user'
  apr: number
  creditLimit: number
  balance: number
  minimumPayment: number
  paymentDueDate?: number
  closingDate?: number
  annualFee?: number
  foreignTransactionFee?: number
  rewards?: string
  notes?: string
  lastUpdated: string
}

export type Account = CashAccount | InvestmentAccount | LoanAccount | CreditCard

// ── Expenses ──────────────────────────────────────────────────────────────────

export type ExpenseCategory =
  | 'tax_payments'
  | 'rent_mortgage' | 'utilities' | 'housing_fees' | 'renters_insurance' | 'moving'
  | 'groceries' | 'health_medical' | 'transport_parking' | 'gas'
  | 'car_fees' | 'car_maintenance'
  | 'clothing' | 'life_insurance' | 'legal' | 'home_goods'
  | 'technology' | 'tech_subscriptions'
  | 'personal_care' | 'education_office' | 'pets'
  | 'dining_out' | 'party_hosting' | 'travel' | 'fun_money' | 'entertainment_subscriptions'
  | 'charity' | 'gifts' | 'family_support'
  | 'savings_ira' | 'savings_medical' | 'savings_computer' | 'savings_wedding'
  | 'savings_car_down' | 'savings_home_down' | 'savings_emergency_fund'
  | 'debt_repayment' | 'other'

export interface Transaction {
  id: string
  date: string
  description: string
  category: ExpenseCategory
  amount: number
  accountId?: string
}

export interface ExpenseSettings {
  startDate: string
  endDate: string
  monthlyGoal: number
}

// ── Net Worth ─────────────────────────────────────────────────────────────────

export interface NetWorthSettings {
  monthlyGrowthGoal: number
}

export interface NetWorthEntry {
  id: string
  date: string
  values: Record<string, number>
  note?: string
}

// ── Income ────────────────────────────────────────────────────────────────────

export type IncomeStreamType = 'w2' | 'hourly' | 'fellowship' | 'scholarship' | 'other'

export interface IncomeStream {
  id: string
  name: string
  type: IncomeStreamType
  isActive: boolean
}

export interface PaycheckEntry {
  id: string
  streamId: string
  periodStart: string
  periodEnd: string
  paycheckDate: string
  grossAmount: number
  hoursWorked?: number
  hourlyRate?: number
  federalWH: number
  fica: number
  medicareEE: number
  stateWH: number
  retirement: number
  otherPreTax: number
  receivedNet: number
}

export interface EstimatedTaxPayment {
  id: string
  jurisdiction: 'federal' | 'state'
  date: string
  amount: number
  confirmationNumber?: string
  quarter?: string
}

// ── Schedule ──────────────────────────────────────────────────────────────────

export type ScheduleFrequency = 'weekly_biweekly' | 'monthly' | 'quarterly' | 'annually'

export interface ScheduleItem {
  id: string
  frequency: ScheduleFrequency
  task: string
  myDates: string
  isCustom: boolean
  completedDates: string[]
  helperText?: string
}

// ── Institutions ──────────────────────────────────────────────────────────────

export interface InstitutionRow {
  id: string
  name: string
  type: 'bank' | 'credit_union' | 'brokerage' | 'neobank'
  feesMinimums: string
  checkingApy: string
  savingsApy: string
  cd6mo: string
  cd12mo: string
  cd24mo: string
  pros: string
  cons: string
  isCurrentlyUsed: boolean
}

export interface SecurityReference {
  id: string
  ticker: string
  name: string
  expenseRatio: string
  notes: string
}

export interface CardComparison {
  id: string
  card: string
  likelihood: string
  annualFee: string
  rewardType: string
  apr: string
  promoDetails: string
}

// ── Emergency Fund ────────────────────────────────────────────────────────────

export interface EmergencyFundScenario {
  id: string
  label: string
  exampleHint: string
  enabled: boolean
  amount: number
}
