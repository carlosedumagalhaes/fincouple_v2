import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './hooks/useApp'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Split from './pages/Split'
import Goals from './pages/Goals'
import Planning from './pages/Planning'
import Settings from './pages/Settings'
import Login from './pages/Login'

const SESSION_KEY = 'fincouple_session'

export default function App() {
  const [loggedUser, setLoggedUser] = useState<'cadu' | 'stephanie' | null>(() => {
    const s = sessionStorage.getItem(SESSION_KEY)
    return (s === 'cadu' || s === 'stephanie') ? s : null
  })

  const handleLogin = (userId: 'cadu' | 'stephanie') => {
    sessionStorage.setItem(SESSION_KEY, userId)
    setLoggedUser(userId)
  }

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY)
    setLoggedUser(null)
  }

  if (!loggedUser) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <AppProvider initialUser={loggedUser}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout onLogout={handleLogout} />}>
            <Route index element={<Dashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="split" element={<Split />} />
            <Route path="goals" element={<Goals />} />
            <Route path="planning" element={<Planning />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
