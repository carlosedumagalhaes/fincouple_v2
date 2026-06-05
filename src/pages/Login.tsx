import { useState } from 'react'
import { USERS } from '../types'

const PASSWORDS: Record<string, string> = {
  cadu: 'cadu123',
  stephanie: 'steph123',
}

interface LoginProps {
  onLogin: (userId: 'cadu' | 'stephanie') => void
}

export default function Login({ onLogin }: LoginProps) {
  const [selected, setSelected] = useState<'cadu' | 'stephanie' | null>(null)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = () => {
    if (!selected) return
    if (password === PASSWORDS[selected]) {
      onLogin(selected)
    } else {
      setError('Senha incorreta. Tente novamente.')
      setPassword('')
    }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') submit()
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '20%', left: '10%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '20%', right: '10%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(244,63,94,0.12) 0%, transparent 70%)',
        }} />
      </div>

      <div style={{ width: '100%', maxWidth: 380, position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: 42, letterSpacing: '-0.03em', lineHeight: 1,
          }}>
            <span style={{ color: 'var(--cadu)' }}>Fin</span>
            <span style={{ color: 'var(--stephanie)' }}>Couple</span>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 8 }}>
            Finanças do casal, juntos
          </div>
        </div>

        <div className="card" style={{ padding: 28 }}>
          {!selected ? (
            <>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, textAlign: 'center' }}>
                Quem está acessando?
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                {(['cadu', 'stephanie'] as const).map(uid => {
                  const u = USERS[uid]
                  return (
                    <button
                      key={uid}
                      onClick={() => { setSelected(uid); setError('') }}
                      style={{
                        flex: 1,
                        padding: '20px 12px',
                        borderRadius: 14,
                        border: `1px solid ${u.color}30`,
                        background: `${u.color}10`,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 10,
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = `${u.color}20`)}
                      onMouseLeave={e => (e.currentTarget.style.background = `${u.color}10`)}
                    >
                      <div style={{
                        width: 52, height: 52, borderRadius: '50%',
                        background: `${u.color}25`, color: u.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22,
                      }}>
                        {u.avatar}
                      </div>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: u.color }}>
                        {u.name}
                      </span>
                    </button>
                  )
                })}
              </div>
            </>
          ) : (
            <>
              {/* Back + User header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => { setSelected(null); setPassword(''); setError('') }}
                >
                  ←
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: `${USERS[selected].color}25`,
                    color: USERS[selected].color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16,
                  }}>
                    {USERS[selected].avatar}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{USERS[selected].name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Digite sua senha</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input
                  className="input"
                  type="password"
                  autoFocus
                  placeholder="Senha"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  onKeyDown={handleKey}
                  style={{ fontSize: 16, padding: '12px 14px' }}
                />

                {error && (
                  <div style={{
                    fontSize: 12, color: 'var(--red)',
                    padding: '8px 12px', background: 'rgba(239,68,68,0.1)',
                    borderRadius: 8, textAlign: 'center',
                  }}>
                    {error}
                  </div>
                )}

                <button
                  className="btn"
                  style={{
                    background: USERS[selected].color,
                    color: '#fff',
                    padding: '12px',
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                  onClick={submit}
                >
                  Entrar
                </button>

                <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 4 }}>
                  Esqueceu? Muda a senha em Config → Zona de Perigo
                </div>
              </div>
            </>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: 'var(--text-muted)' }}>
          FinCouple · Seus dados ficam só no seu dispositivo
        </div>
      </div>
    </div>
  )
}
