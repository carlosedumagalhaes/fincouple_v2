import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useApp } from '../hooks/useApp'
import { USERS } from '../types'
import { fmtMonth } from '../lib/store'
import { format, addMonths, subMonths, parseISO } from 'date-fns'
import { LayoutDashboard, TrendingUp, ArrowLeftRight, Target, Receipt, ChevronLeft, ChevronRight, Settings, LogOut } from 'lucide-react'

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: Receipt, label: 'Lançamentos' },
  { to: '/split', icon: ArrowLeftRight, label: 'Divisão' },
  { to: '/goals', icon: Target, label: 'Metas' },
  { to: '/planning', icon: TrendingUp, label: 'Planejamento' },
  { to: '/settings', icon: Settings, label: 'Config.' },
]

export default function Layout({ onLogout }: { onLogout: () => void }) {
  const { state, setActiveUser, setSelectedMonth } = useApp()
  const { activeUser, selectedMonth } = state

  const prevMonth = () => {
    const d = parseISO(selectedMonth + '-01')
    setSelectedMonth(format(subMonths(d, 1), 'yyyy-MM'))
  }
  const nextMonth = () => {
    const d = parseISO(selectedMonth + '-01')
    setSelectedMonth(format(addMonths(d, 1), 'yyyy-MM'))
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <aside style={{
        width: 200, flexShrink: 0,
        background: 'var(--bg-card)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', padding: '20px 0',
      }}>
        {/* Logo */}
        <div style={{ padding: '0 20px 24px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em' }}>
            <span style={{ color: 'var(--cadu)' }}>Fin</span>
            <span style={{ color: 'var(--stephanie)' }}>Couple</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Cadu & Stephanie</div>
        </div>

        {/* User switcher */}
        <div style={{ padding: '0 12px 20px', display: 'flex', gap: 6 }}>
          {(['cadu', 'stephanie'] as const).map(uid => {
            const u = USERS[uid]
            const active = activeUser === uid
            return (
              <button key={uid} onClick={() => setActiveUser(uid)} style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '7px 8px', borderRadius: 10,
                border: active ? `1px solid ${u.color}40` : '1px solid var(--border)',
                background: active ? `${u.color}18` : 'transparent',
                cursor: 'pointer', transition: 'all 0.15s',
              }}>
                <div className="avatar" style={{ width: 22, height: 22, fontSize: 10, background: `${u.color}30`, color: u.color }}>
                  {u.avatar}
                </div>
                <span style={{ fontSize: 12, fontWeight: 500, color: active ? u.color : 'var(--text-muted)' }}>
                  {u.name}
                </span>
              </button>
            )
          })}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 10,
              color: isActive ? 'var(--text)' : 'var(--text-muted)',
              background: isActive ? 'var(--bg-card2)' : 'transparent',
              textDecoration: 'none', fontSize: 13,
              fontWeight: isActive ? 500 : 400,
              transition: 'all 0.15s',
              border: isActive ? '1px solid var(--border)' : '1px solid transparent',
            })}>
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Month selector */}
        <div style={{ padding: '12px 12px 0', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, paddingLeft: 4 }}>
            Período
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
            <button onClick={prevMonth} className="btn btn-ghost btn-sm" style={{ padding: '6px 8px' }}>
              <ChevronLeft size={13} />
            </button>
            <div style={{ flex: 1, textAlign: 'center', fontSize: 12, fontWeight: 600 }}>
              {fmtMonth(selectedMonth)}
            </div>
            <button onClick={nextMonth} className="btn btn-ghost btn-sm" style={{ padding: '6px 8px' }}>
              <ChevronRight size={13} />
            </button>
          </div>

          {/* Logout */}
          <button onClick={onLogout} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', gap: 8, fontSize: 12 }}>
            <LogOut size={13} />
            Sair
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, overflow: 'auto', padding: '28px 28px' }}>
        <Outlet />
      </main>
    </div>
  )
}
