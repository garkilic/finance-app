import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

const nav = [
  { label: 'Overview', to: '/' },
  {
    phase: 'Phase 1 — Understand',
    items: [
      { label: 'Goals', to: '/goals' },
      { label: 'Accounts', to: '/accounts' },
      { label: 'Expenses', to: '/expenses' },
    ],
  },
  {
    phase: 'Phase 2 — Create',
    items: [
      { label: 'Net Worth', to: '/net-worth' },
      { label: 'Income', to: '/income' },
      { label: 'Schedule', to: '/schedule' },
    ],
  },
  {
    phase: 'Phase 3 — Compare',
    items: [
      { label: 'Institutions', to: '/institutions' },
      { label: 'Emergency Fund', to: '/emergency-fund' },
    ],
  },
]

export function Sidebar() {
  return (
    <aside className="w-56 shrink-0 h-screen sticky top-0 flex flex-col border-r border-stone-200 bg-stone-50 pt-8 pb-6 overflow-y-auto">
      {/* Logo */}
      <div className="px-5 mb-8">
        <span className="text-sm font-semibold tracking-tight text-stone-900">Roadmap</span>
        <p className="text-xs text-stone-400 mt-0.5">Your finances, step by step.</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-5">
        {/* Overview */}
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            cn(
              'block px-3 py-1.5 rounded-md text-sm transition-colors',
              isActive
                ? 'bg-stone-900 text-white font-medium'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            )
          }
        >
          Overview
        </NavLink>

        {/* Phases */}
        {nav.slice(1).map((section) => {
          if (!('phase' in section)) return null
          return (
            <div key={section.phase}>
              <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-stone-400">
                {section.phase}
              </p>
              <div className="space-y-0.5">
                {(section.items ?? []).map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        'block px-3 py-1.5 rounded-md text-sm transition-colors',
                        isActive
                          ? 'bg-stone-900 text-white font-medium'
                          : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 pt-4 border-t border-stone-200">
        <p className="text-[10px] text-stone-400">Financial Wellness Workbook</p>
      </div>
    </aside>
  )
}
