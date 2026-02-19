import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { Overview } from '@/pages/Overview'
import { Goals } from '@/pages/Goals'
import { Accounts } from '@/pages/Accounts'
import { Expenses } from '@/pages/Expenses'
import { NetWorth } from '@/pages/NetWorth'
import { Income } from '@/pages/Income'
import { Schedule } from '@/pages/Schedule'
import { Institutions } from '@/pages/Institutions'
import { EmergencyFund } from '@/pages/EmergencyFund'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Overview /> },
      { path: 'goals', element: <Goals /> },
      { path: 'accounts', element: <Accounts /> },
      { path: 'expenses', element: <Expenses /> },
      { path: 'net-worth', element: <NetWorth /> },
      { path: 'income', element: <Income /> },
      { path: 'schedule', element: <Schedule /> },
      { path: 'institutions', element: <Institutions /> },
      { path: 'emergency-fund', element: <EmergencyFund /> },
    ],
  },
])
