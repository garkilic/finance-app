import type { Account, Transaction, ExpenseCategory } from '@/types'

// ── Net Worth ─────────────────────────────────────────────────────────────────

export function totalAssets(accounts: Account[]): number {
  return accounts
    .filter((a) => a.category === 'cash' || a.category === 'investment')
    .reduce((sum, a) => sum + a.balance, 0)
}

export function totalLiabilities(accounts: Account[]): number {
  const loans = accounts
    .filter((a) => a.category === 'loan')
    .reduce((sum, a) => sum + a.balance, 0)
  const cards = accounts
    .filter((a) => a.category === 'credit_card')
    .reduce((sum, a) => sum + (a as { balance: number }).balance, 0)
  return loans + cards
}

export function netWorth(accounts: Account[]): number {
  return totalAssets(accounts) - totalLiabilities(accounts)
}

// ── Cash ──────────────────────────────────────────────────────────────────────

export function totalCash(accounts: Account[]): number {
  return accounts
    .filter((a) => a.category === 'cash')
    .reduce((sum, a) => sum + a.balance, 0)
}

// ── Expenses ──────────────────────────────────────────────────────────────────

export function totalSpend(transactions: Transaction[]): number {
  return transactions.reduce((sum, t) => sum + t.amount, 0)
}

export function spendByCategory(
  transactions: Transaction[]
): Record<ExpenseCategory, number> {
  return transactions.reduce(
    (acc, t) => {
      acc[t.category] = (acc[t.category] ?? 0) + t.amount
      return acc
    },
    {} as Record<ExpenseCategory, number>
  )
}

export function avgMonthlySpend(transactions: Transaction[], months: number): number {
  return totalSpend(transactions) / Math.max(1, months)
}

// ── Income ────────────────────────────────────────────────────────────────────

export function expectedNet(entry: {
  grossAmount: number
  federalWH: number
  fica: number
  medicareEE: number
  stateWH: number
  retirement: number
  otherPreTax: number
}): number {
  return (
    entry.grossAmount -
    entry.federalWH -
    entry.fica -
    entry.medicareEE -
    entry.stateWH -
    entry.retirement -
    entry.otherPreTax
  )
}

export function discrepancy(entry: {
  grossAmount: number
  federalWH: number
  fica: number
  medicareEE: number
  stateWH: number
  retirement: number
  otherPreTax: number
  receivedNet: number
}): number {
  return entry.receivedNet - expectedNet(entry)
}
