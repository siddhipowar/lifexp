import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAppStore } from './store/useAppStore'
import Landing from './pages/Landing'
import Onboarding from './pages/Onboarding'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import QuestBoard from './pages/QuestBoard'
import Habits from './pages/Habits'
import Soul from './pages/Soul'
import Guide from './pages/Guide'
import MasterDocument from './pages/MasterDocument'
import Shop from './pages/Shop'
import Profile from './pages/Profile'
import Calendar from './pages/Calendar'
import Journey from './pages/Journey'
import Notifications from './components/Notifications'

function AppRoutes() {
  const onboardingComplete  = useAppStore((s) => s.user.onboardingComplete)
  const checkDailyReset     = useAppStore((s) => s.checkDailyReset)

  // Run once on mount — rolls over quests if a new day has started
  useEffect(() => { checkDailyReset() }, [])

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/app/onboarding" element={<Onboarding />} />
      <Route
        path="/app/*"
        element={
          onboardingComplete
            ? <Layout />
            : <Navigate to="/app/onboarding" replace />
        }
      >
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard"      element={<Dashboard />} />
        <Route path="quests"         element={<QuestBoard />} />
        <Route path="habits"         element={<Habits />} />
        <Route path="soul"           element={<Soul />} />
        <Route path="guide"          element={<Guide />} />
        <Route path="my-life"        element={<MasterDocument />} />
        <Route path="shop"           element={<Shop />} />
        <Route path="profile"        element={<Profile />} />
        <Route path="calendar"       element={<Calendar />} />
        <Route path="journey"        element={<Journey />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <Notifications />
    </BrowserRouter>
  )
}
