import { useState } from 'react'
import { useApp } from '../hooks/useApp'
import { fmtBRL, getMonthTransactions, calcTotals } from '../lib/store'
import { CATEGORIES_EXPENSE } from '../types'
import { Sparkle, CircleNotch } from 'phosphor-react'

const GROQ_API_KEY = import.meta.env.VITE_GEMINI_KEY ?? ''
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

function priceInstallment(p: number, r: number, n: number): number {
  if (r === 0) return p / n
  const m = r / 100 / 12
  return p * (m * Math.pow(1 + m, n)) / (Math.pow(1 + m, n) - 1)
}

function Mini({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="card-inset" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--label-tertiary)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
        {label}
      </div>
      <div className="t-mono" style={{ fontSize: 15, fontWeight: 700, color: color ?? 'var(--label)' }}>
        {value}
      </div>
    </div>
  )
}

export default function Planning() {
  const { state, setBudgetLimit } = useApp()
  const monthTxs = getMonthTransactions(state.transactions, state.selectedMonth)
  const { income } = calcTotals(monthTxs)

  const [emergMonths, setEmergMonths] = useState(6)
  const fixedTotal = monthTxs.filter(t => t.type === 'expense' && t.isFixed).reduce((s, t) => s + t.amount, 0)
  const emergTarget = fixedTotal * emergMonths
  const emergSaved = state.goals.find(g => g.category === 'reserva' && g.scope === 'shared')?.currentAmount ?? 0
  const emergLeft = Math.max(emergTarget - emergSaved, 0)
  const emergMonthly = income > 0 ? Math.min(income * 0.2, emergLeft) : 0
  const emergPct = emergTarget > 0 ? Math.min((emergSaved / emergTarget) * 100, 100) : 0

  const [propValue, setPropValue] = useState(700000)
  const [downPct, setDownPct] = useState(20)
  const [propRate, setPropRate] = useState(10.5)
  const [propMonths, setPropMonths] = useState(360)
  const downPayment = propValue * (downPct / 100)
  const financed = propValue - downPayment
  const installment = priceInstallment(financed, propRate, propMonths)
  const incomeCommitPct = income > 0 ? (installment / income) * 100 : 0
  const monthsToDown = downPayment > 0 && income > 0 ? Math.ceil((downPayment - emergSaved) / (income * 0.3)) : 0

  const [buyValue, setBuyValue] = useState(0)
  const [buyInstallments, setBuyInstallments] = useState(12)
  const [buyRate, setBuyRate] = useState(2.99)
  const [buyMode, setBuyMode] = useState<'avista' | 'parcelado'>('avista')
  const [buyDescription, setBuyDescription] = useState('')
  const [aiAnalysis, setAiAnalysis] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')

  const balance = income - monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const canBuyAvista = buyValue <= balance
  const balAfterBuy = balance - buyValue
  const buyPctBalance = balance > 0 ? (buyValue / balance) * 100 : 0
  const installmentValue = buyValue > 0 ? priceInstallment(buyValue, buyRate > 0 ? buyRate : 0, buyInstallments) : 0
  const totalPaid = installmentValue * buyInstallments
  const installmentPctIncome = income > 0 ? (installmentValue / income) * 100 : 0

  const [budgetCategory, setBudgetCategory] = useState('')
  const [budgetValue, setBudgetValue] = useState('')
  const saveBudget = () => {
    if (!budgetCategory || !budgetValue) return
    setBudgetLimit({ category: budgetCategory, limit: parseFloat(budgetValue), scope: 'shared' })
    setBudgetCategory('')
    setBudgetValue('')
  }

  const askAI = async () => {
    if (!buyValue) return
    setAiLoading(true); setAiAnalysis(''); setAiError('')
    const totalExpense = monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const topCats = CATEGORIES_EXPENSE
      .map(cat => ({ cat, val: monthTxs.filter(t => t.type === 'expense' && t.category === cat).reduce((s, t) => s + t.amount, 0) }))
      .filter(c => c.val > 0).sort((a, b) => b.val - a.val).slice(0, 4)
      .map(c => `${c.cat}: ${fmtBRL(c.val)}`).join(', ')
    const goalsInfo = state.goals.filter(g => g.scope === 'shared').slice(0, 2)
      .map(g => `${g.name} (${((g.currentAmount / g.targetAmount) * 100).toFixed(0)}%)`).join(', ')
    const prompt = buyMode === 'avista'
      ? `Você é um consultor financeiro brasileiro direto. Analise: COMPRA: ${buyDescription || 'Item'} — ${fmtBRL(buyValue)} à vista. RENDA: ${fmtBRL(income)}/mês | GASTOS: ${fmtBRL(totalExpense)}/mês | SALDO: ${fmtBRL(balance)}. APÓS: ${fmtBRL(balAfterBuy)} (${buyPctBalance.toFixed(1)}% do saldo). GASTOS: ${topCats || 'sem dados'}. METAS: ${goalsInfo || 'nenhuma'}. Parecer em 3-4 linhas, sem markdown.`
      : `Você é um consultor financeiro brasileiro direto. Analise: COMPRA: ${buyDescription || 'Item'} — ${fmtBRL(buyValue)} em ${buyInstallments}x de ${fmtBRL(installmentValue)} (${buyRate}% a.m.). TOTAL: ${fmtBRL(totalPaid)} (juros: ${fmtBRL(totalPaid - buyValue)}). RENDA: ${fmtBRL(income)}/mês | SALDO: ${fmtBRL(balance)}. PARCELA = ${installmentPctIncome.toFixed(1)}% da renda. METAS: ${goalsInfo || 'nenhuma'}. Parecer em 3-4 linhas, sem markdown.`
    try {
      const res = await fetch(GROQ_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({ model: 'llama-3.1-8b-instant', messages: [{ role: 'user', content: prompt }], max_tokens: 300, temperature: 0.7 }),
      })
      const data = await res.json()
      if (data.error) setAiError(`Erro: ${data.error.message}`)
      else setAiAnalysis(data.choices?.[0]?.message?.content ?? 'Sem resposta.')
    } catch { setAiError('Erro de conexão.') }
    finally { setAiLoading(false) }
  }

  const field: React.CSSProperties = {
    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10, padding: '10px 13px', color: 'var(--label)',
    fontFamily: 'var(--font)', fontSize: 14, outline: 'none', width: '100%',
    colorScheme: 'dark' as any,
  }
  const lbl: React.CSSProperties = { fontSize: 12, fontWeight: 500, color: 'var(--label-secondary)', display: 'block', marginBottom: 5 }

  return (
    <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h1 className="t-largetitle">Planejamento</h1>
        <div style={{ fontSize: 14, color: 'var(--label-secondary)', marginTop: 3 }}>Metas, simulações e orçamento</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>

        {/* Reserva */}
        <div className="card">
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>🛡️ Reserva de Emergência</div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: 'var(--label-secondary)', marginBottom: 8 }}>Meta em meses de gastos fixos</div>
            <div className="segmented">
              {[3, 6, 12].map(m => (
                <button key={m} className={`seg-item${emergMonths === m ? ' active' : ''}`} onClick={() => setEmergMonths(m)}>
                  {m} meses
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
            <Mini label="Meta Total"      value={fmtBRL(emergTarget)} />
            <Mini label="Já Guardado"     value={fmtBRL(emergSaved)}              color="var(--green)" />
            <Mini label="Ainda Falta"     value={fmtBRL(emergLeft)}               color={emergLeft > 0 ? 'var(--red)' : 'var(--green)'} />
            <Mini label="Aporte Sugerido" value={fmtBRL(emergMonthly) + '/mês'}   color="var(--cadu)" />
          </div>
          <div className="progress-track-lg">
            <div className="progress-fill" style={{ width: `${emergPct}%`, background: 'var(--green)' }} />
          </div>
          <div style={{ fontSize: 12, color: 'var(--label-tertiary)', marginTop: 6, textAlign: 'right' }}>
            {emergPct.toFixed(1)}% da meta
          </div>
        </div>

        {/* Imóvel */}
        <div className="card">
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>🏡 Simulador de Imóvel</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
            <div>
              <span style={lbl}>Valor do Imóvel (R$)</span>
              <input style={field} type="number" step={10000} value={propValue} onChange={e => setPropValue(parseFloat(e.target.value) || 0)} />
            </div>
            <div>
              <span style={lbl}>Taxa de Juros Anual (%)</span>
              <input style={field} type="number" step={0.1} value={propRate} onChange={e => setPropRate(parseFloat(e.target.value) || 0)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <span style={lbl}>Entrada (%)</span>
                <input style={field} type="number" min={10} max={80} value={downPct} onChange={e => setDownPct(parseFloat(e.target.value) || 20)} />
              </div>
              <div>
                <span style={lbl}>Prazo</span>
                <select style={field} value={propMonths} onChange={e => setPropMonths(parseInt(e.target.value))}>
                  {[120,180,240,300,360,420].map(m => <option key={m} value={m}>{m}m ({m/12}a)</option>)}
                </select>
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <Mini label="Entrada"       value={fmtBRL(downPayment)}                color="var(--amber)" />
            <Mini label="Financiado"    value={fmtBRL(financed)}                   color="var(--label-secondary)" />
            <Mini label="Parcela PRICE" value={fmtBRL(installment)}                color="var(--cadu)" />
            <Mini label="% da Renda"    value={incomeCommitPct.toFixed(1) + '%'}   color={incomeCommitPct > 30 ? 'var(--red)' : 'var(--green)'} />
          </div>
          {incomeCommitPct > 30 && (
            <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(255,69,58,0.1)', borderRadius: 10, border: '1px solid rgba(255,69,58,0.2)', fontSize: 12, color: 'var(--red)' }}>
              ⚠️ Parcela acima de 30% da renda
            </div>
          )}
          {monthsToDown > 0 && (
            <div style={{ marginTop: 8, fontSize: 12, color: 'var(--label-tertiary)' }}>
              📅 Guardando 30%/mês: entrada em ~{monthsToDown} meses
            </div>
          )}
        </div>
      </div>

      {/* Posso Comprar */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ fontSize: 15, fontWeight: 600 }}>🛒 Posso Comprar?</div>
          <div className="segmented" style={{ width: 'auto' }}>
            {(['avista', 'parcelado'] as const).map(m => (
              <button key={m} className={`seg-item${buyMode === m ? ' active' : ''}`}
                onClick={() => { setBuyMode(m); setAiAnalysis(''); setAiError('') }}>
                {m === 'avista' ? 'À Vista' : 'Parcelado'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: buyMode === 'parcelado' ? 'repeat(auto-fit, minmax(130px, 1fr))' : '2fr 1fr', gap: 10, marginBottom: 16 }}>
          <div>
            <span style={lbl}>O que quer comprar?</span>
            <input style={field} value={buyDescription} onChange={e => setBuyDescription(e.target.value)} placeholder="Ex: iPhone, sofá..." />
          </div>
          <div>
            <span style={lbl}>Valor (R$)</span>
            <input style={field} type="number" value={buyValue || ''} onChange={e => { setBuyValue(parseFloat(e.target.value) || 0); setAiAnalysis(''); setAiError('') }} placeholder="0,00" />
          </div>
          {buyMode === 'parcelado' && (
            <>
              <div>
                <span style={lbl}>Parcelas</span>
                <input style={field} type="number" min={1} max={60} value={buyInstallments} onChange={e => setBuyInstallments(parseInt(e.target.value) || 1)} />
              </div>
              <div>
                <span style={lbl}>Taxa/mês (%)</span>
                <input style={field} type="number" step={0.01} value={buyRate} onChange={e => setBuyRate(parseFloat(e.target.value) || 0)} />
              </div>
            </>
          )}
        </div>

        {buyValue > 0 && (
          <>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%', flexShrink: 0, fontSize: 24,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: (buyMode === 'avista' ? canBuyAvista : installmentPctIncome <= 30) ? 'rgba(48,209,88,0.15)' : 'rgba(255,69,58,0.15)',
                border: `2px solid ${(buyMode === 'avista' ? canBuyAvista : installmentPctIncome <= 30) ? 'var(--green)' : 'var(--red)'}`,
              }}>
                {(buyMode === 'avista' ? canBuyAvista : installmentPctIncome <= 30) ? '✓' : '✗'}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, flex: 1 }}>
                {buyMode === 'avista' ? (
                  <>
                    <Mini label="Veredicto"      value={canBuyAvista ? 'Pode!' : 'Não recomendado'} color={canBuyAvista ? 'var(--green)' : 'var(--red)'} />
                    <Mini label="% do Saldo"     value={buyPctBalance.toFixed(1) + '%'}             color={buyPctBalance > 80 ? 'var(--red)' : 'var(--amber)'} />
                    <Mini label="Saldo Restante" value={fmtBRL(balAfterBuy)}                        color={balAfterBuy >= 0 ? 'var(--green)' : 'var(--red)'} />
                  </>
                ) : (
                  <>
                    <Mini label="Parcela"        value={fmtBRL(installmentValue)}                  color="var(--cadu)" />
                    <Mini label="% da Renda"     value={installmentPctIncome.toFixed(1) + '%'}      color={installmentPctIncome > 30 ? 'var(--red)' : 'var(--green)'} />
                    <Mini label="Total c/ Juros" value={fmtBRL(totalPaid)}                         color="var(--amber)" />
                  </>
                )}
              </div>
            </div>

            <button onClick={askAI} disabled={aiLoading} style={{
              width: '100%', padding: '12px', borderRadius: 12, border: 'none',
              cursor: aiLoading ? 'wait' : 'pointer',
              background: 'linear-gradient(135deg, var(--cadu), #9333ea)',
              color: '#fff', fontFamily: 'var(--font)', fontSize: 14, fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              opacity: aiLoading ? 0.7 : 1, transition: 'all 0.15s',
              marginBottom: (aiAnalysis || aiError) ? 12 : 0,
              boxShadow: '0 4px 20px rgba(110,107,245,0.3)',
            }}>
              {aiLoading
                ? <><CircleNotch size={16} style={{ animation: 'spin 1s linear infinite' }} /> Analisando...</>
                : <><Sparkle size={16} weight="fill" /> Analisar com IA</>}
            </button>

            {aiAnalysis && (
              <div style={{ padding: '14px 16px', borderRadius: 12, background: 'rgba(110,107,245,0.08)', border: '1px solid rgba(110,107,245,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <Sparkle size={13} color="var(--cadu)" weight="fill" />
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--cadu)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Análise IA</span>
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--label)' }}>{aiAnalysis}</div>
              </div>
            )}

            {aiError && (
              <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(255,69,58,0.1)', border: '1px solid rgba(255,69,58,0.2)', fontSize: 13, color: 'var(--red)' }}>
                ⚠️ {aiError}
              </div>
            )}
          </>
        )}
      </div>

      {/* Limites */}
      <div className="card">
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>📊 Limites de Orçamento</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <select style={{ ...field, maxWidth: 200 }} value={budgetCategory} onChange={e => setBudgetCategory(e.target.value)}>
            <option value="">Categoria...</option>
            {CATEGORIES_EXPENSE.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input style={{ ...field, maxWidth: 130 }} type="number" placeholder="Limite R$" value={budgetValue} onChange={e => setBudgetValue(e.target.value)} />
          <button className="btn btn-primary btn-sm" onClick={saveBudget}>Salvar</button>
        </div>
        {state.budgetLimits.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--label-tertiary)', textAlign: 'center', padding: '20px 0' }}>
            Nenhum limite definido ainda
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
            {state.budgetLimits.map(bl => {
              const spent = monthTxs.filter(t => t.type === 'expense' && t.category === bl.category).reduce((s, t) => s + t.amount, 0)
              const pct = Math.min((spent / bl.limit) * 100, 100)
              const color = pct >= 100 ? 'var(--red)' : pct >= 80 ? 'var(--amber)' : 'var(--green)'
              return (
                <div key={bl.category} className="card-inset">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{bl.category}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color }}>{pct.toFixed(0)}%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: 'var(--label-tertiary)' }}>
                    <span>{fmtBRL(spent)}</span>
                    <span>/ {fmtBRL(bl.limit)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
