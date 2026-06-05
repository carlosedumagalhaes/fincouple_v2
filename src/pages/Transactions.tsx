import { useState } from 'react'
import { useApp } from '../hooks/useApp'
import { Transaction, CATEGORIES_EXPENSE, CATEGORIES_INCOME, PAYMENT_METHODS, USERS } from '../types'
import { getMonthTransactions, fmtBRL } from '../lib/store'
import { Plus, Trash2, X, Check, Pencil } from 'lucide-react'
import { format } from 'date-fns'

const EMPTY_FORM = (activeUser: string, selectedMonth: string) => ({
  type: 'expense' as 'income' | 'expense',
  userId: activeUser as 'cadu' | 'stephanie',
  scope: 'personal' as 'personal' | 'shared',
  category: '',
  description: '',
  amount: '',
  date: selectedMonth + '-' + format(new Date(), 'dd'),
  paymentMethod: 'PIX',
  isFixed: false,
})

function TransactionModal({
  onClose,
  initial,
}: {
  onClose: () => void
  initial?: Transaction
}) {
  const { state, addTransaction, updateTransaction } = useApp()
  const isEdit = !!initial

  const [form, setForm] = useState(
    initial
      ? {
          type: initial.type,
          userId: initial.userId,
          scope: initial.scope,
          category: initial.category,
          description: initial.description,
          amount: initial.amount.toString(),
          date: initial.date,
          paymentMethod: initial.paymentMethod ?? 'PIX',
          isFixed: initial.isFixed,
        }
      : EMPTY_FORM(state.activeUser, state.selectedMonth)
  )

  const cats = form.type === 'income' ? CATEGORIES_INCOME : CATEGORIES_EXPENSE

  const submit = () => {
    if (!form.category || !form.amount || !form.date) return
    const data = { ...form, amount: parseFloat(form.amount) }
    if (isEdit && initial) {
      updateTransaction(initial.id, data)
    } else {
      addTransaction(data as Omit<Transaction, 'id' | 'createdAt'>)
    }
    onClose()
  }

  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17 }}>
            {isEdit ? 'Editar Transação' : 'Nova Transação'}
          </h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={14} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Type */}
          <div style={{ display: 'flex', gap: 6 }}>
            {(['expense', 'income'] as const).map(t => (
              <button
                key={t}
                onClick={() => setForm(f => ({ ...f, type: t, category: '' }))}
                className="btn"
                style={{
                  flex: 1,
                  background: form.type === t ? (t === 'income' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)') : 'var(--bg-card2)',
                  color: form.type === t ? (t === 'income' ? 'var(--green)' : 'var(--red)') : 'var(--text-muted)',
                  border: `1px solid ${form.type === t ? (t === 'income' ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)') : 'var(--border)'}`,
                }}
              >
                {t === 'income' ? '↑ Receita' : '↓ Despesa'}
              </button>
            ))}
          </div>

          {/* User + Scope */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Quem</label>
              <select className="input" value={form.userId} onChange={e => setForm(f => ({ ...f, userId: e.target.value as any }))}>
                {Object.values(USERS).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Escopo</label>
              <select className="input" value={form.scope} onChange={e => setForm(f => ({ ...f, scope: e.target.value as any }))}>
                <option value="personal">Pessoal</option>
                <option value="shared">Compartilhado</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Categoria</label>
            <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              <option value="">Selecionar...</option>
              {cats.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Descrição</label>
            <input
              className="input"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Ex: Mercado, Aluguel..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Valor (R$)</label>
              <input
                className="input"
                type="number"
                step="0.01"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                placeholder="0,00"
              />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Data</label>
              <input
                className="input"
                type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Pagamento</label>
              <select className="input" value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))}>
                {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 4 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                <input
                  type="checkbox"
                  checked={form.isFixed}
                  onChange={e => setForm(f => ({ ...f, isFixed: e.target.checked }))}
                />
                Gasto fixo
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancelar</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={submit}>
              <Check size={14} /> {isEdit ? 'Salvar' : 'Adicionar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Transactions() {
  const { state, deleteTransaction } = useApp()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [filter, setFilter] = useState<'all' | 'cadu' | 'stephanie' | 'shared'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [search, setSearch] = useState('')

  const monthTxs = getMonthTransactions(state.transactions, state.selectedMonth)
    .sort((a, b) => b.date.localeCompare(a.date))

  const filtered = monthTxs.filter(t => {
    if (filter === 'cadu' && t.userId !== 'cadu') return false
    if (filter === 'stephanie' && t.userId !== 'stephanie') return false
    if (filter === 'shared' && t.scope !== 'shared') return false
    if (typeFilter !== 'all' && t.type !== typeFilter) return false
    if (
      search &&
      !t.description.toLowerCase().includes(search.toLowerCase()) &&
      !t.category.toLowerCase().includes(search.toLowerCase())
    )
      return false
    return true
  })

  const totalIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  return (
    <div className="animate-stagger" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>
            Lançamentos
          </h1>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>
            {filtered.length} transações
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={14} /> Nova
        </button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
        {[
          { label: 'Receitas', value: totalIncome, color: 'var(--green)' },
          { label: 'Despesas', value: totalExpense, color: 'var(--red)' },
          { label: 'Saldo', value: totalIncome - totalExpense, color: totalIncome - totalExpense >= 0 ? 'var(--green)' : 'var(--red)' },
        ].map(item => (
          <div key={item.label} className="card card-sm" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
              {item.label}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: item.color }}>{fmtBRL(item.value)}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          className="input"
          style={{ maxWidth: 200 }}
          placeholder="Buscar..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div style={{ display: 'flex', gap: 4 }}>
          {(['all', 'cadu', 'stephanie', 'shared'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="btn btn-sm"
              style={{
                background: filter === f ? 'var(--bg-card2)' : 'transparent',
                border: filter === f ? '1px solid var(--border)' : '1px solid transparent',
                color: filter === f ? 'var(--text)' : 'var(--text-muted)',
              }}
            >
              {f === 'all' ? 'Todos' : f === 'cadu' ? 'Cadu' : f === 'stephanie' ? 'Stephanie' : 'Compartilhados'}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['all', 'income', 'expense'] as const).map(f => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className="btn btn-sm"
              style={{
                background: typeFilter === f ? 'var(--bg-card2)' : 'transparent',
                border: typeFilter === f ? '1px solid var(--border)' : '1px solid transparent',
                color: typeFilter === f ? 'var(--text)' : 'var(--text-muted)',
              }}
            >
              {f === 'all' ? 'Tipo' : f === 'income' ? '↑ Receita' : '↓ Despesa'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th>Categoria</th>
                <th>Quem</th>
                <th>Escopo</th>
                <th>Pagamento</th>
                <th style={{ textAlign: 'right' }}>Valor</th>
                <th style={{ textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
                    {state.transactions.length === 0
                      ? 'Nenhuma transação ainda — clique em "Nova" para começar!'
                      : 'Nenhuma transação encontrada com esses filtros'}
                  </td>
                </tr>
              )}
              {filtered.map(t => {
                const u = USERS[t.userId]
                return (
                  <tr key={t.id} style={{ cursor: 'pointer' }} onClick={() => setEditing(t)}>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{t.date.slice(5)}</td>
                    <td style={{ fontWeight: 500 }}>{t.description || '—'}</td>
                    <td>
                      <span className="pill" style={{ background: 'var(--bg-card2)', color: 'var(--text-muted)' }}>
                        {t.category}
                      </span>
                    </td>
                    <td>
                      <div
                        className="avatar"
                        style={{ background: `${u.color}25`, color: u.color }}
                        title={u.name}
                      >
                        {u.avatar}
                      </div>
                    </td>
                    <td>
                      <span
                        className="pill"
                        style={{
                          background: t.scope === 'shared' ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.05)',
                          color: t.scope === 'shared' ? 'var(--cadu)' : 'var(--text-muted)',
                        }}
                      >
                        {t.scope === 'shared' ? 'Compartilhado' : 'Pessoal'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{t.paymentMethod}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: t.type === 'income' ? 'var(--green)' : 'var(--red)' }}>
                      {t.type === 'income' ? '+' : '-'}{fmtBRL(t.amount)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }} onClick={e => e.stopPropagation()}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setEditing(t)}
                          title="Editar"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => deleteTransaction(t.id)}
                          title="Deletar"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hint */}
      {filtered.length > 0 && (
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
          Clique em qualquer linha para editar
        </div>
      )}

      {showModal && <TransactionModal onClose={() => setShowModal(false)} />}
      {editing && <TransactionModal onClose={() => setEditing(null)} initial={editing} />}
    </div>
  )
}
