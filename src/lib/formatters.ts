export function formatCurrency(value: number, opts?: { sign?: boolean }): string {
  const abs = Math.abs(value)
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(abs)

  if (opts?.sign) {
    return value >= 0 ? `+${formatted}` : `-${formatted}`
  }
  return value < 0 ? `-${formatted}` : formatted
}

export function formatPercent(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`
}

export function formatDate(date: string): string {
  return new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatMonthYear(date: string): string {
  return new Date(date + '-01T12:00:00').toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}

export function today(): string {
  return new Date().toISOString().split('T')[0]
}

export function currentMonth(): string {
  return new Date().toISOString().slice(0, 7)
}

// Returns number of full months between two ISO date strings
export function monthsBetween(start: string, end: string): number {
  const s = new Date(start)
  const e = new Date(end)
  const months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth())
  return Math.max(1, months)
}

export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

export function genId(): string {
  return Math.random().toString(36).slice(2, 11)
}
