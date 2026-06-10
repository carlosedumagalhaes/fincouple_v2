import { useState } from 'react'
import { useApp } from '../hooks/useApp'
import { getMonthTransactions, calcTotals, fmtBRL, calcSplitBalance } from '../lib/store'
import { USERS, CATEGORIES_EXPENSE } from '../types'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts'
import { TrendUp, TrendDown, Wallet, Users, Warning } from 'phosphor-react'
import { format, subMonths, parseISO } from 'date-fns'

function StatCard({ label, value, icon: Icon, color, sub }: any) {
  return (
    <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--label-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
            {label}
          </div>
          <div className="t-mono" style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.3px', lineHeight: 1.1 }}>
            {value}
          </div>
          {sub && <div style={{ fontSize: 11, color: 'var(--label-tertiary)', marginTop: 5 }}>{sub}</div>}
        </div>
        <div style={{ padding: 9, borderRadius: 12, background: color + '18', flexShrink: 0, marginLeft: 10 }}>
          <Icon size={18} color={color} weight="regular" />
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${color}80, transparent)` }} />
    </div>
  )
}

export default function Dashboard() {
  const { state } = useApp()
  const { transactions, selectedMonth, splitExpenses, goals, budgetLimits } = state
  const [view, setView] = useState<'couple' | 'personal'>('couple')

  const monthTxs = getMonthTransactions(transactions, selectedMonth)
  const coupleIncome  = monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const coupleExpense = monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const coupleBalance = coupleIncome - coupleExpense
  const sharedExpense = monthTxs.filter(t => t.type === 'expense' && t.scope === 'shared').reduce((s, t) => s + t.amount, 0)
  const caduIncome    = monthTxs.filter(t => t.userId === 'cadu'      && t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const stephanieIncome = monthTxs.filter(t => t.userId === 'stephanie' && t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const splitBal = calcSplitBalance(splitExpenses.filter(s => s.date.startsWith(selectedMonth)))

  const historyData = Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(parseISO(selectedMonth + '-01'), 5 - i)
    const m = format(d, 'yyyy-MM')
    const totals = calcTotals(getMonthTransactions(transactions, m))
    const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
    return { month: months[d.getMonth()], income: totals.income, expense: totals.expense }
  })

  const catData = CATEGORIES_EXPENSE
    .map(cat => ({ name: cat, value: monthTxs.filter(t => t.type === 'expense' && t.category === cat).reduce((s, t) => s + t.amount, 0) }))
    .filter(c => c.value > 0).sort((a, b) => b.value - a.value).slice(0, 6)

  const COLORS = ['#6E6BF5','#F2537A','#30D158','#FFD60A','#0A84FF','#BF5AF2']

  const alerts = budgetLimits.map(bl => {
    const spent = monthTxs.filter(t => t.type === 'expense' && t.category === bl.category).reduce((s, t) => s + t.amount, 0)
    return { ...bl, spent, pct: (spent / bl.limit) * 100 }
  }).filter(a => a.pct >= 70)

  return (
    <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="t-largetitle">Dashboard</h1>
          <div style={{ fontSize: 14, color: 'var(--label-secondary)', marginTop: 3 }}>Visão financeira do casal</div>
        </div>
        <div className="segmented">
          {(['couple', 'personal'] as const).map(v => (
            <button key={v} className={`seg-item${view === v ? ' active' : ''}`} onClick={() => setView(v)}>
              {v === 'couple' ? '👫 Casal' : '👤 Pessoal'}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {alerts.map(a => (
            <div key={a.category} style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '7px 12px', borderRadius: 10,
              background: a.pct >= 100 ? 'rgba(255,69,58,0.12)' : 'rgba(255,214,10,0.12)',
              border: `1px solid ${a.pct >= 100 ? 'rgba(255,69,58,0.25)' : 'rgba(255,214,10,0.25)'}`,
              fontSize: 12, backdropFilter: 'blur(10px)',
            }}>
              <Warning size={13} color={a.pct >= 100 ? 'var(--red)' : 'var(--amber)'} weight="fill" />
              <span style={{ color: 'var(--label-secondary)' }}>{a.category}:</span>
              <span style={{ fontWeight: 600, color: a.pct >= 100 ? 'var(--red)' : 'var(--amber)' }}>{a.pct.toFixed(0)}% do limite</span>
            </div>
          ))}
        </div>
      )}

      {view === 'couple' ? (
        <>
          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12 }}>
            <StatCard label="Renda Total"    value={fmtBRL(coupleIncome)}  icon={TrendUp}   color="var(--green)" sub={`Cadu ${fmtBRL(caduIncome)} · Steph ${fmtBRL(stephanieIncome)}`} />
            <StatCard label="Gastos"         value={fmtBRL(coupleExpense)} icon={TrendDown} color="var(--red)"   sub="Fixos + variáveis" />
            <StatCard label="Compartilhados" value={fmtBRL(sharedExpense)} icon={Users}     color="var(--cadu)"  sub="Despesas do casal" />
            <StatCard label="Saldo do Mês"   value={fmtBRL(coupleBalance)} icon={Wallet}    color={coupleBalance >= 0 ? 'var(--green)' : 'var(--red)'} sub={coupleBalance >= 0 ? 'Dentro do orçamento' : 'Atenção!'} />
          </div>

          {/* Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
            <div className="card">
              <div className="t-headline" style={{ marginBottom: 14 }}>Últimos 6 Meses</div>
              <ResponsiveContainer width="100%" height={170}>
                <AreaChart data={historyData}>
                  <defs>
                    <linearGradient id="gI" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#30D158" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#30D158" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gE" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#FF453A" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#FF453A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fill: 'var(--label-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--label-secondary)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ background: 'rgba(20,20,32,0.95)', border: '1px solid var(--glass-border)', borderRadius: 12, fontSize: 12 }} formatter={(v) => fmtBRL(Number(v))} />
                  <Area type="monotone" dataKey="income"  stroke="#30D158" fill="url(#gI)" strokeWidth={2} name="Receita" />
                  <Area type="monotone" dataKey="expense" stroke="#FF453A" fill="url(#gE)" strokeWidth={2} name="Gasto" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <div className="t-headline" style={{ marginBottom: 14 }}>Por Categoria</div>
              {catData.length === 0 ? (
                <div style={{ color: 'var(--label-tertiary)', fontSize: 13, textAlign: 'center', paddingTop: 55 }}>Nenhum gasto registrado</div>
              ) : (
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <ResponsiveContainer width={120} height={120}>
                    <PieChart>
                      <Pie data={catData} dataKey="value" cx="50%" cy="50%" innerRadius={30} outerRadius={55} paddingAngle={3}>
                        {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {catData.map((c, i) => (
                      <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 7, height: 7, borderRadius: 2, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                          <span style={{ fontSize: 11, color: 'var(--label-secondary)' }}>{c.name}</span>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600 }}>{fmtBRL(c.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Split balance */}
          {Math.abs(splitBal) > 0.01 && (
            <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--label-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>Saldo de Divisão</div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>
                  {splitBal > 0
                    ? <><span style={{ color: 'var(--steph)' }}>Stephanie</span> deve <span style={{ color: 'var(--green)' }}>{fmtBRL(splitBal)}</span> para <span style={{ color: 'var(--cadu)' }}>Cadu</span></>
                    : <><span style={{ color: 'var(--cadu)' }}>Cadu</span> deve <span style={{ color: 'var(--red)' }}>{fmtBRL(Math.abs(splitBal))}</span> para <span style={{ color: 'var(--steph)' }}>Stephanie</span></>
                  }
                </div>
              </div>
              <span className="pill" style={{ background: 'rgba(110,107,245,0.15)', color: 'var(--cadu)' }}>Ver Divisão →</span>
            </div>
          )}

          {/* Goals */}
          {goals.filter(g => g.scope === 'shared').length > 0 && (
            <div className="card">
              <div className="t-headline" style={{ marginBottom: 14 }}>Metas do Casal</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {goals.filter(g => g.scope === 'shared').slice(0, 3).map(g => {
                  const pct = Math.min((g.currentAmount / g.targetAmount) * 100, 100)
                  return (
                    <div key={g.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 18 }}>{g.emoji}</span>
                          <span style={{ fontSize: 14, fontWeight: 500 }}>{g.name}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span style={{ fontSize: 11, color: 'var(--label-tertiary)' }}>{fmtBRL(g.currentAmount)} / {fmtBRL(g.targetAmount)}</span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: g.color }}>{pct.toFixed(0)}%</span>
                        </div>
                      </div>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${pct}%`, background: g.color }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
          {(['cadu', 'stephanie'] as const).map(uid => {
            const u = USERS[uid]
            const inc = monthTxs.filter(t => t.userId === uid && t.type === 'income').reduce((s, t) => s + t.amount, 0)
            const exp = monthTxs.filter(t => t.userId === uid && t.type === 'expense').reduce((s, t) => s + t.amount, 0)
            const bal = inc - exp
            return (
              <div key={uid} className="card" style={{ borderColor: u.color + '30' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div className="avatar" style={{ width: 38, height: 38, fontSize: 15, fontWeight: 700, background: u.color + '25', color: u.color, boxShadow: `0 4px 14px ${u.color}30` }}>
                    {u.avatar}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{u.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--label-tertiary)' }}>Visão pessoal</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                  {[
                    { label: 'Receita', value: inc, color: 'var(--green)' },
                    { label: 'Gastos',  value: exp, color: 'var(--red)' },
                    { label: 'Saldo',   value: bal, color: bal >= 0 ? 'var(--green)' : 'var(--red)' },
                  ].map(item => (
                    <div key={item.label} className="card-inset" style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--label-tertiary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>{item.label}</div>
                      <div className="t-mono" style={{ fontSize: 13, fontWeight: 700, color: item.color }}>{fmtBRL(item.value)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
