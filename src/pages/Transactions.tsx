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
    <div className="sheet-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sheet fade-up">
        {/* Header do Modal */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="t-headline">
            {isEdit ? 'Editar Transação' : 'Nova Transação'}
          </h2>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Formulário */}
        <div className="flex flex-col gap-4">
          
          {/* Tipo de Transação (O Quadrado Protetor com Efeito Apple) */}
          <div className="flex flex-col gap-1.5">
            <span className="field-label">Tipo</span>
            <div className="segmented-container">
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, type: 'expense', category: '' }))}
                className={`seg-button ${form.type === 'expense' ? 'active-despesa' : ''}`}
              >
                ↓ Despesa
              </button>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, type: 'income', category: '' }))}
                className={`seg-button ${form.type === 'income' ? 'active-receita' : ''}`}
              >
                ↑ Receita
              </button>
            </div>
          </div>

          {/* Quem + Escopo */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Quem</label>
              <select 
                className="field" 
                value={form.userId} 
                onChange={e => setForm(f => ({ ...f, userId: e.target.value as any }))}
              >
                {Object.values(USERS).map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">Escopo</label>
              <select 
                className="field" 
                value={form.scope} 
                onChange={e => setForm(f => ({ ...f, scope: e.target.value as any }))}
              >
                <option value="personal">Pessoal</option>
                <option value="shared">Compartilhado</option>
              </select>
            </div>
          </div>

          {/* Categoria */}
          <div>
            <label className="field-label">Categoria</label>
            <select 
              className="field" 
              value={form.category} 
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            >
              <option value="">Selecionar...</option>
              {cats.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Descrição */}
          <div>
            <label className="field-label">Descrição</label>
            <input
              className="field"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Ex: Mercado, Aluguel..."
            />
          </div>

          {/* Valor + Data */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Valor (R$)</label>
              <input
                className="field t-mono"
                type="number"
                step="0.01"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                placeholder="0,00"
              />
            </div>
            <div>
              <label className="field-label">Data</label>
              <input
                className="field"
                type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              />
            </div>
          </div>

          {/* Forma de Pagamento + Gasto Fixo */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Pagamento</label>
              <select 
                className="field" 
                value={form.paymentMethod} 
                onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))}
              >
                {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="flex items-center pt-5 pl-1">
              <label className="flex items-center gap-2.5 cursor-pointer text-sm select-none">
                <input
                  type="checkbox"
                  style={{ width: 'auto', backgroundColor: 'transparent' }}
                  checked={form.isFixed}
                  onChange={e => setForm(f => ({ ...f, isFixed: e.target.checked }))}
                />
                <span style={{ color: 'var(--label-secondary)' }}>Gasto fixo</span>
              </label>
            </div>
          </div>

          {/* Ações Inferiores */}
          <div className="flex gap-3 mt-3">
            <button type="button" className="btn btn-ghost flex-1" onClick={onClose}>
              Cancelar
            </button>
            <button type="button" className="btn btn-primary flex-1" onClick={submit}>
              <Check size={16} /> {isEdit ? 'Salvar' : 'Adicionar'}
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
    <div className="stagger flex flex-col gap-5">
      {/* Header da Tela Principal */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="t-largetitle">Lançamentos</h1>
          <div style={{ color: 'var(--label-secondary)', fontSize: 13, marginTop: 2 }}>
            {filtered.length} transações
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Nova
        </button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Receitas', value: totalIncome, color: 'var(--green)' },
          { label: 'Despesas', value: totalExpense, color: 'var(--red)' },
          { label: 'Saldo', value: totalIncome - totalExpense, color: totalIncome - totalExpense >= 0 ? 'var(--green)' : 'var(--red)' },
        ].map(item => (
          <div key={item.label} className="card flex flex-col items-center justify-center p-4">
            <div style={{ fontSize: 11, color: 'var(--label-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
              {item.label}
            </div>
            <div className="t-title2" style={{ color: item.color }}>{fmtBRL(item.value)}</div>
          </div>
        ))}
      </div>

      {/* Barra de Filtros */}
      <div className="flex gap-2 flex-wrap items-center">
        <input
          className="field"
          style={{ maxWidth: 200 }}
          placeholder="Buscar..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        
        {/* Filtro por Usuário */}
        <div className="segmented">
          {(['all', 'cadu', 'stephanie', 'shared'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`seg-item ${filter === f ? 'active' : ''}`}
            >
              {f === 'all' ? 'Todos' : f === 'cadu' ? 'Cadu' : f === 'stephanie' ? 'Stephanie' : 'Compartilhados'}
            </button>
          ))}
        </div>

        {/* Filtro por Tipo */}
        <div className="segmented">
          {(['all', 'income', 'expense'] as const).map(f => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={`seg-item ${typeFilter === f ? 'active' : ''}`}
            >
              {f === 'all' ? 'Tipo' : f === 'income' ? '↑ Receita' : '↓ Despesa'}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela de Lançamentos */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-scroll">
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
                  <td colSpan={8} style={{ textAlign: 'center', color: 'var(--label-tertiary)', padding: '40px 0' }}>
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
                    <td className="t-mono" style={{ color: 'var(--label-secondary)', fontSize: 13 }}>{t.date.slice(5)}</td>
                    <td style={{ fontWeight: 500 }}>{t.description || '—'}</td>
                    <td>
                      <span className="pill" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--label-secondary)' }}>
                        {t.category}
                      </span>
                    </td>
                    <td>
                      <div
                        className="avatar"
                        style={{ background: `${u.color}25`, color: u.color, width: 26, height: 26, fontSize: 12 }}
                        title={u.name}
                      >
                        {u.avatar}
                      </div>
                    </td>
                    <td>
                      <span
                        className="pill"
                        style={{
                          background: t.scope === 'shared' ? 'rgba(110,107,245,0.12)' : 'rgba(255,255,255,0.04)',
                          color: t.scope === 'shared' ? 'var(--cadu)' : 'var(--label-secondary)',
                        }}
                      >
                        {t.scope === 'shared' ? 'Compartilhado' : 'Pessoal'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--label-secondary)' }}>{t.paymentMethod}</td>
                    <td className="t-mono" style={{ textAlign: 'right', fontWeight: 600, color: t.type === 'income' ? 'var(--green)' : 'var(--red)' }}>
                      {t.type === 'income' ? '+' : '-'}{fmtBRL(t.amount)}
                    </td>
                    <td>
                      <div className="flex gap-1 justify-center" onClick={e => e.stopPropagation()}>
                        <button
                          className="btn btn-ghost btn-icon-sm"
                          onClick={() => setEditing(t)}
                          title="Editar"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          className="btn btn-danger btn-icon-sm"
                          onClick={() => deleteTransaction(t.id)}
                          title="Deletar"
                        >
                          <Trash2 size={13} />
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

      {/* Dica Inferior */}
      {filtered.length > 0 && (
        <div style={{ fontSize: 12, color: 'var(--label-tertiary)', textAlign: 'center' }}>
          Clique em qualquer linha para editar
        </div>
      )}

      {showModal && <TransactionModal onClose={() => setShowModal(false)} />}
      {editing && <TransactionModal onClose={() => setEditing(null)} initial={editing} />}
    </div>
  )
}
