import { useState } from 'react'
import { useApp } from '../hooks/useApp'
import { Transaction, USERS, CATEGORIES_INCOME, PAYMENT_METHODS } from '../types'
import { fmtBRL, getMonthTransactions, generateId } from '../lib/store'
import { Trash2, RotateCcw, Plus, Pencil, X, Check } from 'lucide-react'

function IncomeModal({
  onClose,
  userId,
  initial,
}: {
  onClose: () => void
  userId: 'cadu' | 'stephanie'
  initial?: Transaction
}) {
  const { state, addTransaction, updateTransaction } = useApp()
  const isEdit = !!initial
  const u = USERS[userId]

  const [form, setForm] = useState({
    category: initial?.category ?? 'Salário',
    description: initial?.description ?? '',
    amount: initial?.amount?.toString() ?? '',
    date: initial?.date ?? state.selectedMonth + '-05',
    paymentMethod: initial?.paymentMethod ?? 'PIX',
    isFixed: initial?.isFixed ?? true,
  })

  const submit = () => {
    if (!form.amount || !form.date) return
    const data = {
      userId,
      scope: 'personal' as const,
      type: 'income' as const,
      category: form.category,
      description: form.description,
      amount: parseFloat(form.amount),
      date: form.date,
      paymentMethod: form.paymentMethod,
      isFixed: form.isFixed,
    }
    if (isEdit && initial) {
      updateTransaction(initial.id, data)
    } else {
      addTransaction(data)
    }
    onClose()
  }

  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 400 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="avatar" style={{ background: `${u.color}25`, color: u.color, width: 32, height: 32 }}>
              {u.avatar}
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>
              {isEdit ? 'Editar receita' : 'Nova receita'} — {u.name}
            </h2>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={14} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Categoria</label>
            <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {CATEGORIES_INCOME.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Descrição</label>
            <input
              className="input"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Ex: Salário TRB Pharma, Freelance..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Valor (R$)</label>
              <input
                className="input"
                type="number"
                step="0.01"
                autoFocus
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

          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Forma de Recebimento</label>
            <select className="input" value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))}>
              {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancelar</button>
            <button
              className="btn"
              style={{ flex: 1, background: u.color, color: '#fff' }}
              onClick={submit}
            >
              <Check size={14} /> {isEdit ? 'Salvar' : 'Adicionar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Settings() {
  const { state, deleteTransaction } = useApp()
  const [confirmReset, setConfirmReset] = useState(false)
  const [addingFor, setAddingFor] = useState<'cadu' | 'stephanie' | null>(null)
  const [editingTx, setEditingTx] = useState<Transaction | null>(null)

  const monthTxs = getMonthTransactions(state.transactions, state.selectedMonth)
  const incomeByUser = (uid: 'cadu' | 'stephanie') =>
    monthTxs.filter(t => t.userId === uid && t.type === 'income')

  const hardReset = () => {
    Object.keys(localStorage).forEach(k => localStorage.removeItem(k))
    window.location.reload()
  }

  return (
    <div className="animate-stagger" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>
          Configurações
        </h1>
        <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>Receitas e perfis do casal</div>
      </div>

      {(['cadu', 'stephanie'] as const).map(uid => {
        const u = USERS[uid]
        const incomes = incomeByUser(uid)
        const total = incomes.reduce((s, t) => s + t.amount, 0)
        return (
          <div key={uid} className="card" style={{ borderColor: `${u.color}25` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="avatar" style={{ width: 38, height: 38, fontSize: 15, background: `${u.color}25`, color: u.color }}>
                  {u.avatar}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>{u.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>
                    Receitas de {['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][parseInt(state.selectedMonth.split('-')[1])-1]}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>Total</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--green)' }}>{fmtBRL(total)}</div>
                </div>
                <button
                  className="btn btn-sm"
                  style={{ background: `${u.color}20`, color: u.color, border: `1px solid ${u.color}30` }}
                  onClick={() => setAddingFor(uid)}
                >
                  <Plus size={13} /> Adicionar
                </button>
              </div>
            </div>

            {incomes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: 13, border: '1px dashed var(--border)', borderRadius: 10 }}>
                Nenhuma receita para {u.name} neste mês
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {incomes.map(t => (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-card2)', borderRadius: 10, padding: '10px 14px' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{t.description || t.category}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        {t.category} · {t.date.slice(8)}/{t.date.slice(5,7)} · {t.paymentMethod}
                        {t.isFixed && <span style={{ marginLeft: 6, color: u.color }}>· Fixo</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--green)' }}>{fmtBRL(t.amount)}</span>
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditingTx(t)}><Pencil size={12} /></button>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteTransaction(t.id)}><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}

      <div className="card">
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>ℹ️ Sobre o FinCouple</div>
        {[
          { label: 'Versão', value: '2.0.0' },
          { label: 'Stack', value: 'React + TypeScript + Vite' },
          { label: 'Banco', value: 'localStorage (offline-first)' },
          { label: 'Dados', value: `${state.transactions.length} transações · ${state.goals.length} metas` },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{item.label}</span>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{item.value}</span>
          </div>
        ))}
      </div>

      <div className="card" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 4, color: 'var(--red)' }}>⚠️ Zona de Perigo</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Apaga TODOS os dados. Irreversível.</div>
        {!confirmReset ? (
          <button className="btn btn-danger" onClick={() => setConfirmReset(true)}>
            <RotateCcw size={14} /> Limpar todos os dados
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: 'var(--red)', fontWeight: 500 }}>Tem certeza? Não tem volta.</span>
            <button className="btn btn-danger" onClick={hardReset}><Trash2 size={14} /> Sim, apagar tudo</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setConfirmReset(false)}>Cancelar</button>
          </div>
        )}
      </div>

      {addingFor && <IncomeModal userId={addingFor} onClose={() => setAddingFor(null)} />}
      {editingTx && <IncomeModal userId={editingTx.userId} initial={editingTx} onClose={() => setEditingTx(null)} />}
    </div>
  )
}
