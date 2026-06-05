import { useState } from 'react'
import { useApp } from '../hooks/useApp'
import { SplitExpense, USERS } from '../types'
import { fmtBRL, calcSplitBalance } from '../lib/store'
import { Plus, X, Check, Trash2, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'

const SPLIT_CATS = ['Moradia', 'Alimentação', 'Restaurante', 'Lazer', 'Transporte', 'Pet', 'Saúde', 'Outros']

function SplitModal({ onClose }: { onClose: () => void }) {
  const { addSplit } = useApp()
  const [form, setForm] = useState({
    description: '',
    totalAmount: '',
    paidBy: 'cadu' as 'cadu' | 'stephanie',
    splitType: 'equal' as 'equal' | 'custom',
    splitPercent: 50,
    category: 'Alimentação',
    date: format(new Date(), 'yyyy-MM-dd'),
    settled: false,
  })

  const submit = () => {
    if (!form.description || !form.totalAmount) return
    addSplit({ ...form, totalAmount: parseFloat(form.totalAmount) })
    onClose()
  }

  const caduShare = parseFloat(form.totalAmount || '0') * (form.splitPercent / 100)
  const stephanieShare = parseFloat(form.totalAmount || '0') - caduShare

  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17 }}>Nova Despesa Compartilhada</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={14} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Descrição</label>
            <input className="input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Ex: Jantar, Mercado..." />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Valor Total (R$)</label>
              <input className="input" type="number" value={form.totalAmount} onChange={e => setForm(f => ({ ...f, totalAmount: e.target.value }))} placeholder="0,00" />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Categoria</label>
              <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {SPLIT_CATS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Quem Pagou</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {(['cadu', 'stephanie'] as const).map(uid => {
                  const u = USERS[uid]
                  return (
                    <button key={uid} onClick={() => setForm(f => ({ ...f, paidBy: uid }))}
                      style={{
                        flex: 1, padding: '8px', borderRadius: 10, border: form.paidBy === uid ? `1px solid ${u.color}40` : '1px solid var(--border)',
                        background: form.paidBy === uid ? `${u.color}18` : 'var(--bg-card2)',
                        color: form.paidBy === uid ? u.color : 'var(--text-muted)',
                        cursor: 'pointer', fontSize: 12, fontWeight: 500
                      }}>
                      {u.name}
                    </button>
                  )
                })}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Data</label>
              <input className="input" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
          </div>

          {/* Split type */}
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Como Dividir</label>
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
              {(['equal', 'custom'] as const).map(t => (
                <button key={t} onClick={() => setForm(f => ({ ...f, splitType: t, splitPercent: t === 'equal' ? 50 : f.splitPercent }))}
                  className="btn btn-sm" style={{
                    background: form.splitType === t ? 'var(--bg-card2)' : 'transparent',
                    border: form.splitType === t ? '1px solid var(--border)' : '1px solid transparent',
                    color: form.splitType === t ? 'var(--text)' : 'var(--text-muted)',
                  }}>
                  {t === 'equal' ? '50 / 50' : 'Personalizado'}
                </button>
              ))}
            </div>

            {form.splitType === 'custom' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                  <span style={{ color: USERS.cadu.color }}>Cadu: {form.splitPercent}%</span>
                  <span style={{ color: USERS.stephanie.color }}>Stephanie: {100 - form.splitPercent}%</span>
                </div>
                <input type="range" min={0} max={100} value={form.splitPercent}
                  onChange={e => setForm(f => ({ ...f, splitPercent: parseInt(e.target.value) }))}
                  style={{ width: '100%' }} />
              </div>
            )}

            {/* Preview */}
            {form.totalAmount && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                {[
                  { u: USERS.cadu, share: caduShare },
                  { u: USERS.stephanie, share: stephanieShare },
                ].map(({ u, share }) => (
                  <div key={u.id} style={{ background: `${u.color}10`, border: `1px solid ${u.color}25`, borderRadius: 10, padding: '8px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{u.name}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: u.color }}>{fmtBRL(share)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancelar</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={submit}><Check size={14} /> Registrar</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Split() {
  const { state, addSplit, deleteSplit, settleAll } = useApp()
  const [showModal, setShowModal] = useState(false)

  const activeSplits = state.splitExpenses.filter(s => !s.settled)
  const settledSplits = state.splitExpenses.filter(s => s.settled)

  const balance = calcSplitBalance(activeSplits)
  const totalShared = activeSplits.reduce((s, e) => s + e.totalAmount, 0)

  return (
    <div className="animate-stagger" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>Divisão</h1>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>Despesas compartilhadas do casal</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {activeSplits.length > 0 && (
            <button className="btn btn-ghost" onClick={settleAll}>
              <CheckCircle size={14} /> Quitar Tudo
            </button>
          )}
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={14} /> Registrar
          </button>
        </div>
      </div>

      {/* Balance card */}
      <div className="card" style={{
        background: Math.abs(balance) < 0.01
          ? 'var(--bg-card)'
          : balance > 0 ? 'rgba(16,185,129,0.08)' : 'rgba(244,63,94,0.08)',
        borderColor: Math.abs(balance) < 0.01 ? 'var(--border)'
          : balance > 0 ? 'rgba(16,185,129,0.25)' : 'rgba(244,63,94,0.25)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
            Saldo Atual
          </div>
          {Math.abs(balance) < 0.01 ? (
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--green)' }}>✓ Tudo quitado!</div>
          ) : balance > 0 ? (
            <div style={{ fontSize: 18, fontWeight: 700 }}>
              <span style={{ color: USERS.stephanie.color }}>Stephanie</span>
              <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 14 }}> deve </span>
              <span style={{ color: 'var(--green)' }}>{fmtBRL(balance)}</span>
              <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 14 }}> para </span>
              <span style={{ color: USERS.cadu.color }}>Cadu</span>
            </div>
          ) : (
            <div style={{ fontSize: 18, fontWeight: 700 }}>
              <span style={{ color: USERS.cadu.color }}>Cadu</span>
              <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 14 }}> deve </span>
              <span style={{ color: 'var(--red)' }}>{fmtBRL(Math.abs(balance))}</span>
              <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 14 }}> para </span>
              <span style={{ color: USERS.stephanie.color }}>Stephanie</span>
            </div>
          )}
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
            {activeSplits.length} despesas em aberto · Total: {fmtBRL(totalShared)}
          </div>
        </div>
      </div>

      {/* Active splits */}
      {activeSplits.length > 0 && (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: 13 }}>
            Em aberto
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Categoria</th>
                  <th>Data</th>
                  <th>Pagou</th>
                  <th style={{ textAlign: 'center' }}>Cadu</th>
                  <th style={{ textAlign: 'center' }}>Stephanie</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {activeSplits.map(s => {
                  const caduShare = s.totalAmount * (s.splitPercent / 100)
                  const stephanieShare = s.totalAmount - caduShare
                  const paidByUser = USERS[s.paidBy]
                  return (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 500 }}>{s.description}</td>
                      <td><span className="pill" style={{ background: 'var(--bg-card2)', color: 'var(--text-muted)' }}>{s.category}</span></td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{s.date.slice(5)}</td>
                      <td>
                        <div className="avatar" style={{ background: `${paidByUser.color}25`, color: paidByUser.color }}>
                          {paidByUser.avatar}
                        </div>
                      </td>
                      <td style={{ textAlign: 'center', color: USERS.cadu.color, fontWeight: 600, fontSize: 13 }}>{fmtBRL(caduShare)}</td>
                      <td style={{ textAlign: 'center', color: USERS.stephanie.color, fontWeight: 600, fontSize: 13 }}>{fmtBRL(stephanieShare)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmtBRL(s.totalAmount)}</td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteSplit(s.id)}>
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Settled */}
      {settledSplits.length > 0 && (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: 13, color: 'var(--text-muted)' }}>
            Quitados ({settledSplits.length})
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Categoria</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {settledSplits.map(s => (
                  <tr key={s.id} style={{ opacity: 0.5 }}>
                    <td style={{ textDecoration: 'line-through' }}>{s.description}</td>
                    <td><span className="pill" style={{ background: 'var(--bg-card2)', color: 'var(--text-muted)' }}>{s.category}</span></td>
                    <td style={{ textAlign: 'right' }}>{fmtBRL(s.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && <SplitModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
