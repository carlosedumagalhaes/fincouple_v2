import { useState } from 'react'
import { USERS } from '../types'
import { Eye, EyeSlash } from 'phosphor-react'

const PASSWORDS: Record<string, string> = {
  cadu:      import.meta.env.VITE_PASS_CADU      ?? 'cadu123',
  stephanie: import.meta.env.VITE_PASS_STEPHANIE ?? 'steph123',
}

export default function Login({ onLogin }: { onLogin: (uid: 'cadu' | 'stephanie') => void }) {
  const [selected, setSelected] = useState<'cadu' | 'stephanie' | null>(null)
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)

  const submit = () => {
    if (!selected) return
    if (password === PASSWORDS[selected]) {
      onLogin(selected)
    } else {
      setError('Senha incorreta')
      setPassword('')
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }

  return (
    <>
      <div className="aurora-bg"><div className="aurora-orb" /></div>

      <div style={{
        position: 'relative', zIndex: 1,
        minHeight: '100dvh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}>
        <div style={{ width: '100%', maxWidth: 360 }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{
              width: 72, height: 72, borderRadius: 22, margin: '0 auto 18px',
              background: 'rgba(110,107,245,0.15)',
              border: '1px solid rgba(110,107,245,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(110,107,245,0.2)',
            }}>
              <span style={{ fontSize: 34 }}>💑</span>
            </div>
            <div style={{ fontWeight: 700, fontSize: 28, letterSpacing: '-0.3px', marginBottom: 6 }}>
              <span style={{ color: 'var(--cadu)' }}>Fin</span>
              <span style={{ color: 'var(--steph)' }}>Couple</span>
            </div>
            <div style={{ fontSize: 14, color: 'var(--label-secondary)' }}>
              Finanças do casal, juntos
            </div>
          </div>

          {/* Card */}
          <div className="card" style={{ padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
            {!selected ? (
              <>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--label-secondary)', textAlign: 'center', marginBottom: 16 }}>
                  Quem está acessando?
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  {(['cadu', 'stephanie'] as const).map(uid => {
                    const u = USERS[uid]
                    return (
                      <button key={uid} onClick={() => { setSelected(uid); setError('') }}
                        style={{
                          flex: 1, padding: '20px 12px',
                          borderRadius: 16,
                          border: `1px solid ${u.color}30`,
                          background: `${u.color}0d`,
                          cursor: 'pointer', transition: 'all 0.2s var(--spring)',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${u.color}1a`; (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${u.color}0d`; (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
                      >
                        <div className="avatar" style={{
                          width: 54, height: 54, fontSize: 22, fontWeight: 700,
                          background: `${u.color}25`, color: u.color,
                          boxShadow: `0 4px 16px ${u.color}30`,
                        }}>
                          {u.avatar}
                        </div>
                        <span style={{ fontSize: 15, fontWeight: 600, color: u.color }}>{u.name}</span>
                      </button>
                    )
                  })}
                </div>
              </>
            ) : (
              <>
                <button onClick={() => { setSelected(null); setPassword(''); setError('') }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cadu)', fontSize: 14, fontWeight: 500, marginBottom: 18, padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                  ← Voltar
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
                  <div className="avatar" style={{ width: 42, height: 42, fontSize: 17, fontWeight: 700, background: `${USERS[selected].color}25`, color: USERS[selected].color, flexShrink: 0 }}>
                    {USERS[selected].avatar}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>{USERS[selected].name}</div>
                    <div style={{ fontSize: 12, color: 'var(--label-secondary)' }}>Digite sua senha para entrar</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ position: 'relative' }}>
                    <input
                      className="field"
                      type={show ? 'text' : 'password'}
                      autoFocus
                      placeholder="Senha"
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError('') }}
                      onKeyDown={e => e.key === 'Enter' && submit()}
                      style={{
                        fontSize: 16, paddingRight: 44,
                        animation: shake ? 'shakeX 0.4s ease' : 'none',
                      }}
                    />
                    <button onClick={() => setShow(s => !s)} style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: 'var(--label-tertiary)',
                      display: 'flex',
                    }}>
                      {show ? <EyeSlash size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {error && (
                    <div style={{ fontSize: 13, color: 'var(--red)', textAlign: 'center', padding: '8px 12px', background: 'rgba(255,69,58,0.1)', borderRadius: 10, border: '1px solid rgba(255,69,58,0.2)' }}>
                      {error}
                    </div>
                  )}

                  <button className="btn btn-primary" style={{ width: '100%', fontSize: 16, padding: '13px' }} onClick={submit}>
                    Entrar
                  </button>
                </div>
              </>
            )}
          </div>

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--label-quaternary)' }}>
            Seus dados ficam só no seu dispositivo
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shakeX {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
      `}</style>
    </>
  )
}
