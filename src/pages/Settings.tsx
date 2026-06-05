import { useState } from 'react'
import { useApp } from '../hooks/useApp'
import { USERS } from '../types'
import { fmtBRL, getMonthTransactions, calcTotals } from '../lib/store'
import { Trash2, RotateCcw } from 'lucide-react'

export default function Settings() {
  const { state } = useApp()
  const [confirmReset, setConfirmReset] = useState(false)

  const monthTxs = getMonthTransactions(state.transactions, state.selectedMonth)

  return (
    <div className="animate-stagger" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>Configurações</h1>
        <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>Perfis e preferências</div>
      </div>

      {/* Profiles */}
      <div className="card">
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>👫 Perfis do Casal</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {(['cadu', 'stephanie'] as const).map(uid => {
            const u = USERS[uid]
            const txs = monthTxs.filter(t => t.userId === uid)
            const { income, expense, balance } = calcTotals(txs)
            return (
              <div key={uid} style={{ background: 'var(--bg-card2)', borderRadius: 14, padding: 16, border: `1px solid ${u.color}20` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div className="avatar" style={{ width: 44, height: 44, fontSize: 16, background: `${u.color}25`, color: u.color }}>
                    {u.avatar}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>{u.name}</div>
                    <div className="pill" style={{ background: `${u.color}18`, color: u.color, marginTop: 4 }}>
                      {uid === state.activeUser ? 'Ativo agora' : 'Trocar no menu lateral'}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                  {[
                    { label: 'Receita', value: income, color: 'var(--green)' },
                    { label: 'Gastos', value: expense, color: 'var(--red)' },
                    { label: 'Saldo', value: balance, color: balance >= 0 ? 'var(--green)' : 'var(--red)' },
                  ].map(item => (
                    <div key={item.label} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>{item.label}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: item.color }}>{fmtBRL(item.value)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* About */}
      <div className="card">
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>ℹ️ Sobre o FinCouple</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { label: 'Versão', value: '1.0.0' },
            { label: 'Stack', value: 'React + TypeScript + Vite' },
            { label: 'Banco', value: 'localStorage (offline-first)' },
            { label: 'Hospedagem', value: 'Vercel / Netlify (gratuito)' },
            { label: 'Dados', value: `${state.transactions.length} transações · ${state.goals.length} metas` },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{item.label}</span>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="card" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 4, color: 'var(--red)' }}>⚠️ Zona de Perigo</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
          Estas ações são irreversíveis. Tenha certeza antes de prosseguir.
        </div>
        {!confirmReset ? (
          <button className="btn btn-danger" onClick={() => setConfirmReset(true)}>
            <RotateCcw size={14} /> Limpar todos os dados
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--red)' }}>Tem certeza? Esta ação não pode ser desfeita.</span>
            <button className="btn btn-danger" onClick={() => {
              localStorage.clear()
              window.location.reload()
            }}>
              <Trash2 size={14} /> Confirmar Reset
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setConfirmReset(false)}>Cancelar</button>
          </div>
        )}
      </div>
    </div>
  )
}
