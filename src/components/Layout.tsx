import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useApp } from '../hooks/useApp'
import { USERS } from '../types'
import { fmtMonth } from '../lib/store'
import { format, addMonths, subMonths, parseISO } from 'date-fns'
import {
  LayoutDashboard, TrendingUp, ArrowLeftRight, Target,
  Receipt, ChevronLeft, ChevronRight, Settings, LogOut, Menu, X
} from 'lucide-react'

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const prevMonth = () => {
    const d = parseISO(selectedMonth + '-01')
    setSelectedMonth(format(subMonths(d, 1), 'yyyy-MM'))
  }
  const nextMonth = () => {
    const d = parseISO(selectedMonth + '-01')
    setSelectedMonth(format(addMonths(d, 1), 'yyyy-MM'))
  }

  const navLinkStyle = (isActive: boolean) => ({
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '9px 12px', borderRadius: 12,
    color: isActive ? '#fff' : 'var(--text-muted)',
    background: isActive ? 'rgba(129,140,248,0.15)' : 'transparent',
    textDecoration: 'none', fontSize: 13,
    fontWeight: isActive ? 500 : 400,
    transition: 'all 0.15s',
    border: isActive ? '1px solid rgba(129,140,248,0.25)' : '1px solid transparent',
    backdropFilter: isActive ? 'blur(10px)' : 'none',
  })

  return (
    <div style={{ display: 'flex', height: '100dvh', overflow: 'hidden', flexDirection: 'column' }}>

      {/* Mobile header */}
      <div className="mobile-header mobile-header-glass" style={{
        display: 'none',
        padding: '12px 16px',
        borderBottom: '1px solid var(--glass-border)',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, letterSpacing: '-0.02em' }}>
          <span style={{ color: 'var(--cadu)' }}>Fin</span>
          <span style={{ color: 'var(--stephanie)' }}>Couple</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '4px 6px', border: '1px solid var(--glass-border)' }}>
            <button onClick={prevMonth} className="btn btn-ghost btn-sm" style={{ padding: '4px 6px', background: 'transparent', border: 'none' }}>
              <ChevronLeft size={13} />
            </button>
            <span style={{ fontSize: 12, fontWeight: 600, minWidth: 56, textAlign: 'center' }}>
              {fmtMonth(selectedMonth)}
            </span>
            <button onClick={nextMonth} className="btn btn-ghost btn-sm" style={{ padding: '4px 6px', background: 'transparent', border: 'none' }}>
              <ChevronRight size={13} />
            </button>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => setMobileMenuOpen(true)} style={{ padding: '7px 9px' }}>
            <Menu size={17} />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
        }} onClick={() => setMobileMenuOpen(false)}>
          <div style={{
            position: 'absolute', top: 0, right: 0, bottom: 0, width: 260,
            background: 'rgba(10, 8, 30, 0.92)',
            backdropFilter: 'blur(40px)',
            borderLeft: '1px solid var(--glass-border)',
            display: 'flex', flexDirection: 'column',
            padding: '20px 12px',
            boxShadow: '-20px 0 60px rgba(0,0,0,0.4)',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingLeft: 4 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 19 }}>
                <span style={{ color: 'var(--cadu)' }}>Fin</span>
                <span style={{ color: 'var(--stephanie)' }}>Couple</span>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setMobileMenuOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {(['cadu', 'stephanie'] as const).map(uid => {
                const u = USERS[uid]
                const active = activeUser === uid
                return (
                  <button key={uid} onClick={() => setActiveUser(uid)} style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                    padding: '9px', borderRadius: 12,
                    border: active ? `1px solid ${u.color}50` : '1px solid var(--glass-border)',
                    background: active ? `${u.color}20` : 'rgba(255,255,255,0.04)',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}>
                    <div className="avatar" style={{ width: 24, height: 24, fontSize: 11, background: `${u.color}30`, color: u.color }}>
                      {u.avatar}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 500, color: active ? u.color : 'var(--text-muted)' }}>
                      {u.name}
                    </span>
                  </button>
                )
              })}
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
              {NAV.map(({ to, icon: Icon, label }) => (
                <NavLink key={to} to={to} end={to === '/'} onClick={() => setMobileMenuOpen(false)}
                  style={({ isActive }) => ({ ...navLinkStyle(isActive), fontSize: 14, padding: '11px 14px' })}>
                  <Icon size={16} />{label}
                </NavLink>
              ))}
            </nav>

            <button onClick={onLogout} className="btn btn-ghost" style={{ justifyContent: 'center', gap: 8, fontSize: 13, marginTop: 8 }}>
              <LogOut size={14} /> Sair
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Desktop sidebar */}
        <aside className="desktop-sidebar" style={{
          width: 210, flexShrink: 0,
          display: 'flex', flexDirection: 'column', padding: '22px 0',
        }}>
          <div style={{ padding: '0 20px 28px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 19, letterSpacing: '-0.02em' }}>
              <span style={{ color: 'var(--cadu)' }}>Fin</span>
              <span style={{ color: 'var(--stephanie)' }}>Couple</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>Cadu & Stephanie</div>
          </div>

          <div style={{ padding: '0 12px 20px', display: 'flex', gap: 6 }}>
            {(['cadu', 'stephanie'] as const).map(uid => {
              const u = USERS[uid]
              const active = activeUser === uid
              return (
                <button key={uid} onClick={() => setActiveUser(uid)} style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '8px', borderRadius: 12,
                  border: active ? `1px solid ${u.color}40` : '1px solid var(--glass-border)',
                  background: active ? `${u.color}18` : 'rgba(255,255,255,0.03)',
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

          <nav style={{ flex: 1, padding: '0 10px', display: 'flex', flexDirection: 'column', gap: 3 }}>
            {NAV.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to} end={to === '/'}
                style={({ isActive }) => navLinkStyle(isActive)}>
                <Icon size={15} />{label}
              </NavLink>
            ))}
          </nav>

          <div style={{ padding: '14px 12px 0', borderTop: '1px solid var(--glass-border)' }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, paddingLeft: 4 }}>
              Período
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
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
            <button onClick={onLogout} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', gap: 8, fontSize: 12 }}>
              <LogOut size={13} /> Sair
            </button>
          </div>
        </aside>

        <main className="main-content" style={{ flex: 1, overflow: 'auto', padding: '28px' }}>
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="mobile-bottom-nav mobile-bottom-glass" style={{
        display: 'none',
        borderTop: '1px solid var(--glass-border)',
        padding: '6px 4px 10px',
        flexShrink: 0,
      }}>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'}
            style={({ isActive }) => ({
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              padding: '6px 2px', borderRadius: 10, flex: 1,
              color: isActive ? 'var(--cadu)' : 'var(--text-muted)',
              textDecoration: 'none', fontSize: 9, fontWeight: isActive ? 600 : 400,
            })}>
            <Icon size={19} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
