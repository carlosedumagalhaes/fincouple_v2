import { useState } from 'react'
import { useApp } from '../hooks/useApp'
import { Goal, USERS } from '../types'
import { fmtBRL } from '../lib/store'
import { Plus, X, Check, Trash2, Plus as PlusIcon } from 'lucide-react'
import { differenceInMonths, parseISO, format } from 'date-fns'

const GOAL_EMOJIS = ['🏡','✈️','🛡️','🚗','💍','📱','🎓','🏖️','💊','🎸','🐕','💰']
const GOAL_COLORS = ['#6366f1','#f43f5e','#10b981','#f59e0b','#3b82f6','#8b5cf6','#ec4899','#14b8a6']

function GoalModal({ onClose }: { onClose: () => void }) {
  const { state, addGoal } = useApp()
  const [form, setForm] = useState({
    name: '',
    emoji: '🏡',
    targetAmount: '',
    currentAmount: '0',
    deadline: format(new Date(), 'yyyy-MM'),
    category: 'outro' as Goal['category'],
    scope: 'shared' as Goal['scope'],
    ownerId: state.activeUser,
    color: '#6366f1',
  })

  const submit = () => {
    if (!form.name || !form.targetAmount) return
    addGoal({ ...form, targetAmount: parseFloat(form.targetAmount), currentAmount: parseFloat(form.currentAmount) || 0 })
    onClose()
  }

  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17 }}>Nova Meta</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={14} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Emoji picker */}
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Ícone</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {GOAL_EMOJIS.map(e => (
                <button key={e} onClick={() => setForm(f => ({ ...f, emoji: e }))}
                  style={{
                    width: 36, height: 36, borderRadius: 8, border: form.emoji === e ? '2px solid var(--cadu)' : '1px solid var(--border)',
                    background: 'var(--bg-card2)', cursor: 'pointer', fontSize: 18,
                  }}>
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Nome da Meta</label>
            <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Entrada do Imóvel" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Valor Alvo (R$)</label>
              <input className="input" type="number" value={form.targetAmount} onChange={e => setForm(f => ({ ...f, targetAmount: e.target.value }))} placeholder="0,00" />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Já Guardado (R$)</label>
              <input className="input" type="number" value={form.currentAmount} onChange={e => setForm(f => ({ ...f, currentAmount: e.target.value }))} placeholder="0,00" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Prazo</label>
              <input className="input" type="month" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Escopo</label>
              <select className="input" value={form.scope} onChange={e => setForm(f => ({ ...f, scope: e.target.value as any }))}>
                <option value="shared">Casal</option>
                <option value="personal">Pessoal</option>
              </select>
            </div>
          </div>

          {/* Color */}
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Cor</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {GOAL_COLORS.map(c => (
                <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                  style={{
                    width: 28, height: 28, borderRadius: '50%', background: c, border: 'none', cursor: 'pointer',
                    outline: form.color === c ? `3px solid ${c}` : 'none', outlineOffset: 2,
                  }} />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancelar</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={submit}><Check size={14} /> Criar</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ContributionModal({ goal, onClose }: { goal: Goal, onClose: () => void }) {
  const { addGoalContribution } = useApp()
  const [amount, setAmount] = useState('')

  const submit = () => {
    const v = parseFloat(amount)
    if (!v || v <= 0) return
    addGoalContribution(goal.id, v)
    onClose()
  }

  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 360 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17 }}>
            {goal.emoji} Aportar em {goal.name}
          </h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={14} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Valor a aportar (R$)</label>
            <input className="input" type="number" autoFocus value={amount} onChange={e => setAmount(e.target.value)} placeholder="0,00" />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancelar</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={submit}><Check size={14} /> Aportar</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Goals() {
  const { state, deleteGoal } = useApp()
  const [showModal, setShowModal] = useState(false)
  const [contributing, setContributing] = useState<Goal | null>(null)
  const [filter, setFilter] = useState<'all' | 'shared' | 'personal'>('all')

  const goals = state.goals.filter(g => {
    if (filter === 'shared') return g.scope === 'shared'
    if (filter === 'personal') return g.scope === 'personal'
    return true
  })

  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0)
  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0)

  return (
    <div className="animate-stagger" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>Metas</h1>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>
            {fmtBRL(totalSaved)} de {fmtBRL(totalTarget)} guardados
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={14} /> Nova Meta
        </button>
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 6 }}>
        {(['all', 'shared', 'personal'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className="btn btn-sm"
            style={{
              background: filter === f ? 'var(--bg-card2)' : 'transparent',
              border: filter === f ? '1px solid var(--border)' : '1px solid transparent',
              color: filter === f ? 'var(--text)' : 'var(--text-muted)',
            }}>
            {f === 'all' ? 'Todas' : f === 'shared' ? '👫 Casal' : '👤 Pessoal'}
          </button>
        ))}
      </div>

      {/* Goals grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
        {goals.length === 0 && (
          <div style={{ color: 'var(--text-muted)', fontSize: 13, gridColumn: '1/-1', textAlign: 'center', padding: '40px 0' }}>
            Nenhuma meta criada ainda
          </div>
        )}
        {goals.map(g => {
          const pct = Math.min((g.currentAmount / g.targetAmount) * 100, 100)
          const remaining = g.targetAmount - g.currentAmount
          const monthsLeft = Math.max(differenceInMonths(parseISO(g.deadline + '-01'), new Date()), 1)
          const monthlyNeeded = remaining / monthsLeft
          const u = USERS[g.ownerId]
          const done = pct >= 100

          return (
            <div key={g.id} className="card" style={{ borderColor: done ? `${g.color}40` : 'var(--border)', position: 'relative' }}>
              {done && (
                <div style={{
                  position: 'absolute', top: 12, right: 12,
                  background: `${g.color}20`, color: g.color,
                  borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600
                }}>
                  ✓ Concluída!
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ fontSize: 28 }}>{g.emoji}</div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>{g.name}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                    <span className="pill" style={{ background: g.scope === 'shared' ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.05)', color: g.scope === 'shared' ? 'var(--cadu)' : 'var(--text-muted)' }}>
                      {g.scope === 'shared' ? '👫 Casal' : '👤 ' + u.name}
                    </span>
                    <span className="pill" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                      Prazo: {g.deadline}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Guardado</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: g.color }}>{pct.toFixed(1)}%</span>
                </div>
                <div className="progress-bar" style={{ height: 8 }}>
                  <div className="progress-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${g.color}, ${g.color}aa)` }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{fmtBRL(g.currentAmount)}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{fmtBRL(g.targetAmount)}</span>
                </div>
              </div>

              {/* Stats */}
              {!done && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                  <div style={{ background: 'var(--bg-card2)', borderRadius: 10, padding: '8px 12px' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>Falta</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--red)' }}>{fmtBRL(remaining)}</div>
                  </div>
                  <div style={{ background: 'var(--bg-card2)', borderRadius: 10, padding: '8px 12px' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>Aporte/mês</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: g.color }}>{fmtBRL(monthlyNeeded)}</div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 8 }}>
                {!done && (
                  <button className="btn btn-sm" onClick={() => setContributing(g)}
                    style={{ flex: 1, background: `${g.color}20`, color: g.color, border: `1px solid ${g.color}30` }}>
                    <PlusIcon size={12} /> Aportar
                  </button>
                )}
                <button className="btn btn-danger btn-sm" onClick={() => deleteGoal(g.id)}>
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {showModal && <GoalModal onClose={() => setShowModal(false)} />}
      {contributing && <ContributionModal goal={contributing} onClose={() => setContributing(null)} />}
    </div>
  )
}
