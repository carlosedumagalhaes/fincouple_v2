import { useState } from 'react'
import { useApp } from '../hooks/useApp'
import { getMonthTransactions, calcTotals, fmtBRL, calcSplitBalance } from '../lib/store'
import { USERS, CATEGORIES_EXPENSE } from '../types'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import { TrendingUp, TrendingDown, Wallet, Users, AlertTriangle } from 'lucide-react'
import { format, subMonths, parseISO } from 'date-fns'

function StatCard({ label, value, icon: Icon, color, sub }: any) {
  return (
    <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
            {label}
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>
            {value}
          </div>
          {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
        </div>
        <div style={{ padding: 10, borderRadius: 12, background: `${color}18` }}>
          <Icon size={18} color={color} />
        </div>
      </div>
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${color}60, transparent)`
      }} />
    </div>
  )
}

export default function Dashboard() {
  const { state } = useApp()
  const { transactions, selectedMonth, splitExpenses, goals, budgetLimits } = state
  const [view, setView] = useState<'couple' | 'personal'>('couple')

  const monthTxs = getMonthTransactions(transactions, selectedMonth)

  // Couple totals
  const coupleIncome = monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const coupleExpense = monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const coupleBalance = coupleIncome - coupleExpense

  const sharedExpense = monthTxs.filter(t => t.type === 'expense' && t.scope === 'shared').reduce((s, t) => s + t.amount, 0)

  // Per user
  const caduIncome = monthTxs.filter(t => t.userId === 'cadu' && t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const stephanieIncome = monthTxs.filter(t => t.userId === 'stephanie' && t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const caduExpense = monthTxs.filter(t => t.userId === 'cadu' && t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const stephanieExpense = monthTxs.filter(t => t.userId === 'stephanie' && t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  // Split balance
  const splitBal = calcSplitBalance(splitExpenses.filter(s => s.date.startsWith(selectedMonth)))

  // History 6 months
  const historyData = Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(parseISO(selectedMonth + '-01'), 5 - i)
    const m = format(d, 'yyyy-MM')
    const txs = getMonthTransactions(transactions, m)
    const totals = calcTotals(txs)
    const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
    return { month: months[d.getMonth()], income: totals.income, expense: totals.expense }
  })

  // Category breakdown
  const catData = CATEGORIES_EXPENSE
    .map(cat => ({
      name: cat,
      value: monthTxs.filter(t => t.type === 'expense' && t.category === cat).reduce((s, t) => s + t.amount, 0)
    }))
    .filter(c => c.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)

  const COLORS = ['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6']

  // Budget alerts
  const alerts = budgetLimits.map(bl => {
    const spent = monthTxs.filter(t => t.type === 'expense' && t.category === bl.category).reduce((s, t) => s + t.amount, 0)
    const pct = (spent / bl.limit) * 100
    return { ...bl, spent, pct }
  }).filter(a => a.pct >= 70)

  return (
    <div className="animate-stagger" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>
            Dashboard
          </h1>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>
            Visão financeira do casal
          </div>
        </div>

        {/* View toggle */}
        <div style={{ display: 'flex', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 3, gap: 2 }}>
          {(['couple', 'personal'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                padding: '6px 14px', borderRadius: 9, border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 500,
                background: view === v ? 'var(--bg-card2)' : 'transparent',
                color: view === v ? 'var(--text)' : 'var(--text-muted)',
                transition: 'all 0.15s',
              }}
            >
              {v === 'couple' ? '👫 Casal' : '👤 Pessoal'}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {alerts.map(a => (
            <div key={a.category} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 14px', borderRadius: 10,
              background: a.pct >= 100 ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
              border: `1px solid ${a.pct >= 100 ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.25)'}`,
              fontSize: 12,
            }}>
              <AlertTriangle size={13} color={a.pct >= 100 ? 'var(--red)' : 'var(--amber)'} />
              <span style={{ color: 'var(--text-muted)' }}>{a.category}:</span>
              <span style={{ fontWeight: 600, color: a.pct >= 100 ? 'var(--red)' : 'var(--amber)' }}>
                {a.pct.toFixed(0)}% do limite
              </span>
            </div>
          ))}
        </div>
      )}

      {view === 'couple' ? (
        <>
          {/* Couple summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            <StatCard label="Renda Total" value={fmtBRL(coupleIncome)} icon={TrendingUp} color="var(--green)"
              sub={`Cadu ${fmtBRL(caduIncome)} · Steph ${fmtBRL(stephanieIncome)}`} />
            <StatCard label="Gastos Totais" value={fmtBRL(coupleExpense)} icon={TrendingDown} color="var(--red)"
              sub={`Fixos · Variáveis`} />
            <StatCard label="Gastos Compartilhados" value={fmtBRL(sharedExpense)} icon={Users} color="var(--cadu)"
              sub="Despesas do casal" />
            <StatCard label="Saldo do Mês" value={fmtBRL(coupleBalance)} icon={Wallet}
              color={coupleBalance >= 0 ? 'var(--green)' : 'var(--red)'}
              sub={coupleBalance >= 0 ? 'Dentro do orçamento' : 'Atenção ao orçamento'} />
          </div>

          {/* Charts row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {/* Area chart */}
            <div className="card">
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Últimos 6 Meses</div>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={historyData}>
                  <defs>
                    <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false}
                    tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }}
                    formatter={(v) => fmtBRL(Number(v))}
                  />
                  <Area type="monotone" dataKey="income" stroke="#10b981" fill="url(#gIncome)" strokeWidth={2} name="Receita" />
                  <Area type="monotone" dataKey="expense" stroke="#ef4444" fill="url(#gExpense)" strokeWidth={2} name="Gasto" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Pie chart */}
            <div className="card">
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Gastos por Categoria</div>
              {catData.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: 12, textAlign: 'center', paddingTop: 60 }}>
                  Nenhum gasto registrado neste mês
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <ResponsiveContainer width={140} height={140}>
                    <PieChart>
                      <Pie data={catData} dataKey="value" cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3}>
                        {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {catData.map((c, i) => (
                      <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 8, height: 8, borderRadius: 2, background: COLORS[i % COLORS.length] }} />
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.name}</span>
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
            <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                  Saldo de Divisão
                </div>
                {splitBal > 0 ? (
                  <div style={{ fontSize: 15, fontWeight: 600 }}>
                    Stephanie deve <span style={{ color: 'var(--green)' }}>{fmtBRL(splitBal)}</span> para Cadu
                  </div>
                ) : (
                  <div style={{ fontSize: 15, fontWeight: 600 }}>
                    Cadu deve <span style={{ color: 'var(--red)' }}>{fmtBRL(Math.abs(splitBal))}</span> para Stephanie
                  </div>
                )}
              </div>
              <div className="pill" style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--cadu)' }}>
                Ver em Divisão →
              </div>
            </div>
          )}

          {/* Goals preview */}
          <div className="card">
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Metas do Casal</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {goals.filter(g => g.scope === 'shared').slice(0, 3).map(g => {
                const pct = Math.min((g.currentAmount / g.targetAmount) * 100, 100)
                return (
                  <div key={g.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>{g.emoji}</span>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{g.name}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{fmtBRL(g.currentAmount)}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>/ {fmtBRL(g.targetAmount)}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: g.color }}>{pct.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%`, background: g.color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Personal view */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
            {(['cadu', 'stephanie'] as const).map(uid => {
              const u = USERS[uid]
              const inc = monthTxs.filter(t => t.userId === uid && t.type === 'income').reduce((s, t) => s + t.amount, 0)
              const exp = monthTxs.filter(t => t.userId === uid && t.type === 'expense').reduce((s, t) => s + t.amount, 0)
              const bal = inc - exp
              return (
                <div key={uid} className="card" style={{ borderColor: `${u.color}30` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <div className="avatar" style={{ background: `${u.color}25`, color: u.color, width: 36, height: 36, fontSize: 14 }}>
                      {u.avatar}
                    </div>
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{u.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Visão pessoal</div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                    {[
                      { label: 'Receita', value: inc, color: 'var(--green)' },
                      { label: 'Gastos', value: exp, color: 'var(--red)' },
                      { label: 'Saldo', value: bal, color: bal >= 0 ? 'var(--green)' : 'var(--red)' },
                    ].map(item => (
                      <div key={item.label} style={{ background: 'var(--bg-card2)', borderRadius: 10, padding: '10px 12px' }}>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                          {item.label}
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: item.color }}>
                          {fmtBRL(item.value)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
