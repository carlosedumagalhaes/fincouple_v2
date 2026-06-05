import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './hooks/useApp'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Split from './pages/Split'
import Goals from './pages/Goals'
import Planning from './pages/Planning'
import Settings from './pages/Settings'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
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
