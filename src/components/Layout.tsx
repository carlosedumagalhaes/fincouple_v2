import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useApp } from '../hooks/useApp'
import { USERS } from '../types'
import { fmtMonth } from '../lib/store'
import { format, addMonths, subMonths, parseISO } from 'date-fns'
import {
  SquaresFour, ArrowsLeftRight, Target, Receipt,
  ChartLine, Gear, SignOut, List, X, CaretLeft, CaretRight
} from 'phosphor-react'

const NAV = [
  { to: '/', icon: SquaresFour,     label: 'Início'       },
  { to: '/transactions', icon: Receipt,       label: 'Lançamentos'  },
  { to: '/split',        icon: ArrowsLeftRight,label: 'Divisão'      },
  { to: '/goals',        icon: Target,         label: 'Metas'        },
  { to: '/planning',     icon: ChartLine,      label: 'Planejar'     },
  { to: '/settings',     icon: Gear,           label: 'Config.'      },
]

export default function Layout({ onLogout }: { onLogout: () => void }) {
  const { state, setActiveUser, setSelectedMonth } = useApp()
  const { activeUser, selectedMonth } = state
  const [drawerOpen, setDrawerOpen] = useState(false)

  const prevMonth = () => setSelectedMonth(format(subMonths(parseISO(selectedMonth + '-01'), 1), 'yyyy-MM'))
  const nextMonth = () => setSelectedMonth(format(addMonths(parseISO(selectedMonth + '-01'), 1), 'yyyy-MM'))

  const UserPills = () => (
    <div style={{ display: 'flex', gap: 6 }}>
      {(['cadu', 'stephanie'] as const).map(uid => {
        const u = USERS[uid]; const active = activeUser === uid
        return (
          <button key={uid} onClick={() => setActiveUser(uid)} style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            padding: '8px 10px', borderRadius: 12,
            border: `1px solid ${active ? u.color + '50' : 'var(--glass-border2)'}`,
            background: active ? u.color + '1a' : 'transparent',
            cursor: 'pointer', transition: 'all 0.15s',
          }}>
            <div className="avatar" style={{ width: 22, height: 22, fontSize: 10, fontWeight: 700, background: u.color + '30', color: u.color }}>
              {u.avatar}
            </div>
            <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? u.color : 'var(--label-secondary)' }}>
              {u.name}
            </span>
          </button>
        )
      })}
    </div>
  )

  const MonthPicker = ({ compact = false }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2, background: 'rgba(255,255,255,0.07)', borderRadius: 10, padding: '4px 6px', border: '1px solid var(--glass-border2)' }}>
      <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--label-secondary)', padding: '2px 4px', display: 'flex' }}>
        <CaretLeft size={13} weight="bold" />
      </button>
      <span style={{ fontSize: compact ? 12 : 12, fontWeight: 600, minWidth: compact ? 52 : 58, textAlign: 'center', color: 'var(--label)' }}>
        {fmtMonth(selectedMonth)}
      </span>
      <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--label-secondary)', padding: '2px 4px', display: 'flex' }}>
        <CaretRight size={13} weight="bold" />
      </button>
    </div>
  )

  return (
    <>
      {/* Aurora wallpaper */}
      <div className="aurora-bg"><div className="aurora-orb" /></div>

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', height: '100dvh', flexDirection: 'column', overflow: 'hidden' }}>

        {/* ── MOBILE TOPBAR ── */}
        <div className="topbar show-mobile hide-desktop" style={{
          padding: '12px 16px', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
        }}>
          <div style={{ fontFamily: 'var(--font)', fontWeight: 700, fontSize: 19, letterSpacing: '-0.3px' }}>
            <span style={{ color: 'var(--cadu)' }}>Fin</span>
            <span style={{ color: 'var(--steph)' }}>Couple</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MonthPicker compact />
            <button onClick={() => setDrawerOpen(true)} className="btn btn-ghost btn-icon-sm">
              <List size={19} weight="regular" />
            </button>
          </div>
        </div>

        {/* ── MOBILE DRAWER ── */}
        {drawerOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(12px)' }}
            onClick={() => setDrawerOpen(false)}>
            <div style={{
              position: 'absolute', top: 0, right: 0, bottom: 0, width: 270,
              background: 'rgba(8,8,20,0.92)', backdropFilter: 'blur(60px)',
              borderLeft: '1px solid var(--glass-border2)',
              display: 'flex', flexDirection: 'column', padding: '20px 14px',
              boxShadow: '-24px 0 80px rgba(0,0,0,0.5)',
            }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
                <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: '-0.2px' }}>
                  <span style={{ color: 'var(--cadu)' }}>Fin</span><span style={{ color: 'var(--steph)' }}>Couple</span>
                </span>
                <button onClick={() => setDrawerOpen(false)} className="btn btn-ghost btn-icon-sm">
                  <X size={16} />
                </button>
              </div>
              <div style={{ marginBottom: 18 }}><UserPills /></div>
              <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {NAV.map(({ to, icon: Icon, label }) => (
                  <NavLink key={to} to={to} end={to === '/'} onClick={() => setDrawerOpen(false)}
                    className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                    style={{ fontSize: 15, padding: '11px 14px' }}>
                    <Icon size={18} weight="regular" />{label}
                  </NavLink>
                ))}
              </nav>
              <button onClick={onLogout} className="btn btn-ghost" style={{ justifyContent: 'center', gap: 8, marginTop: 8 }}>
                <SignOut size={15} /> Sair
              </button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

          {/* ── DESKTOP SIDEBAR ── */}
          <aside className="sidebar hide-mobile show-desktop" style={{
            width: 216, flexShrink: 0,
            display: 'flex', flexDirection: 'column', padding: '22px 0',
          }}>
            <div style={{ padding: '0 18px 26px' }}>
              <div style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.25px', marginBottom: 3 }}>
                <span style={{ color: 'var(--cadu)' }}>Fin</span>
                <span style={{ color: 'var(--steph)' }}>Couple</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--label-tertiary)' }}>Cadu & Stephanie</div>
            </div>

            <div style={{ padding: '0 12px 18px' }}><UserPills /></div>

            <nav style={{ flex: 1, padding: '0 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
              {NAV.map(({ to, icon: Icon, label }) => (
                <NavLink key={to} to={to} end={to === '/'}
                  className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                  <Icon size={16} weight="regular" />{label}
                </NavLink>
              ))}
            </nav>

            <div style={{ padding: '14px 12px 0', borderTop: '1px solid var(--glass-border2)' }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--label-quaternary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8, paddingLeft: 2 }}>
                Período
              </div>
              <div style={{ marginBottom: 10 }}><MonthPicker /></div>
              <button onClick={onLogout} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', gap: 7, fontSize: 13 }}>
                <SignOut size={14} /> Sair
              </button>
            </div>
          </aside>

          {/* ── MAIN CONTENT ── */}
          <main className="main-scroll" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '28px 24px' }}>
            <Outlet />
          </main>
        </div>

        {/* ── MOBILE TAB BAR ── */}
        <nav className="tabbar show-mobile hide-desktop safe-bottom" style={{
          display: 'flex', padding: '8px 4px 6px', flexShrink: 0,
        }}>
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'}
              style={({ isActive }) => ({
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                padding: '4px 2px', borderRadius: 10, textDecoration: 'none',
                color: isActive ? 'var(--cadu)' : 'var(--label-tertiary)',
                fontSize: 10, fontWeight: isActive ? 600 : 400,
                WebkitTapHighlightColor: 'transparent',
              })}>
              <Icon size={22} weight="regular" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  )
}
