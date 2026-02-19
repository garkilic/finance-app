import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { useStore } from './store'
import { Onboarding } from './pages/Onboarding'

export function App() {
  const onboardingCompleted = useStore((s) => s.onboardingCompleted)
  if (!onboardingCompleted) return <Onboarding />
  return <RouterProvider router={router} />
}
