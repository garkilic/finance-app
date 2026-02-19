import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export function AppShell() {
  return (
    <div className="flex min-h-screen bg-stone-50">
      <Sidebar />
      <main className="flex-1 min-w-0 px-10 py-10 max-w-4xl">
        <Outlet />
      </main>
    </div>
  )
}
