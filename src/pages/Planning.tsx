import { useState } from 'react'
import { useApp } from '../hooks/useApp'
import { fmtBRL, getMonthTransactions, calcTotals } from '../lib/store'
import { CATEGORIES_EXPENSE } from '../types'
import { Check, Sparkles, Loader } from 'lucide-react'

const GEMINI_API_KEY = 'CAQ.Ab8RN6IxKZex1GAgOpJHWB1MNG_H8iaOweA7oKB_7m46g3RSQA'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`

function priceInstallment(principal: number, annualRate: number, months: number): number {
  if (annualRate === 0) return principal / months
  const r = annualRate / 100 / 12
  return principal * (r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1)
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
    setAiLoading(true)
    setAiAnalysis('')
    setAiError('')

    const totalExpense = monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const topCats = CATEGORIES_EXPENSE
      .map(cat => ({ cat, val: monthTxs.filter(t => t.type === 'expense' && t.category === cat).reduce((s, t) => s + t.amount, 0) }))
      .filter(c => c.val > 0).sort((a, b) => b.val - a.val).slice(0, 4)
      .map(c => `${c.cat}: ${fmtBRL(c.val)}`).join(', ')
    const goalsInfo = state.goals.filter(g => g.scope === 'shared').slice(0, 2)
      .map(g => `${g.name} (${((g.currentAmount / g.targetAmount) * 100).toFixed(0)}%)`).join(', ')

    const prompt = buyMode === 'avista'
      ? `Você é um consultor financeiro brasileiro direto e simpático. Analise se o casal deve fazer esta compra:
COMPRA: ${buyDescription || 'Item'} — ${fmtBRL(buyValue)} à vista
RENDA DO CASAL: ${fmtBRL(income)}/mês | GASTOS: ${fmtBRL(totalExpense)}/mês | SALDO: ${fmtBRL(balance)}
APÓS COMPRA: ${fmtBRL(balAfterBuy)} restante (${buyPctBalance.toFixed(1)}% do saldo usado)
MAIORES GASTOS: ${topCats || 'sem dados'} | METAS: ${goalsInfo || 'nenhuma'}
Dê um parecer em 3-4 linhas: pode ou não, por que, e uma dica. Use números reais. Sem markdown.`
      : `Você é um consultor financeiro brasileiro direto e simpático. Analise se o casal deve parcelar:
COMPRA: ${buyDescription || 'Item'} — ${fmtBRL(buyValue)} em ${buyInstallments}x de ${fmtBRL(installmentValue)} (${buyRate}% a.m.)
TOTAL COM JUROS: ${fmtBRL(totalPaid)} (juros: ${fmtBRL(totalPaid - buyValue)})
RENDA: ${fmtBRL(income)}/mês | GASTOS: ${fmtBRL(totalExpense)}/mês | SALDO: ${fmtBRL(balance)}
PARCELA = ${installmentPctIncome.toFixed(1)}% da renda | METAS: ${goalsInfo || 'nenhuma'}
Dê um parecer em 3-4 linhas: vale parcelar ou pagar à vista, custo dos juros, uma dica. Sem markdown.`

    try {
      const res = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
        }),
      })
      const data = await res.json()
      if (data.error) {
        setAiError(`Erro da API: ${data.error.message}`)
      } else {
        setAiAnalysis(data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Sem resposta.')
      }
    } catch {
      setAiError('Erro de conexão. Verifique sua internet.')
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="animate-stagger" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>Planejamento</h1>
        <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>Metas, simulações e orçamento</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>🛡️ Reserva de Emergência</div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Meta em meses de gastos fixos</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {[3, 6, 12].map(m => (
                <button key={m} onClick={() => setEmergMonths(m)} className="btn btn-sm" style={{
                  flex: 1,
                  background: emergMonths === m ? 'rgba(16,185,129,0.2)' : 'var(--bg-card2)',
                  border: emergMonths === m ? '1px solid rgba(16,185,129,0.4)' : '1px solid var(--border)',
                  color: emergMonths === m ? 'var(--green)' : 'var(--text-muted)',
                }}>{m} meses</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            {[
              { label: 'Meta Total', value: fmtBRL(emergTarget), color: 'var(--text)' },
              { label: 'Já Guardado', value: fmtBRL(emergSaved), color: 'var(--green)' },
              { label: 'Ainda Falta', value: fmtBRL(emergLeft), color: emergLeft > 0 ? 'var(--red)' : 'var(--green)' },
              { label: 'Aporte Sugerido', value: fmtBRL(emergMonthly) + '/mês', color: 'var(--cadu)' },
            ].map(item => (
              <div key={item.label} style={{ background: 'var(--bg-card2)', borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>{item.label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: item.color }}>{item.value}</div>
              </div>
            ))}
          </div>
          <div className="progress-bar" style={{ height: 8 }}>
            <div className="progress-fill" style={{ width: `${Math.min((emergSaved / (emergTarget || 1)) * 100, 100)}%`, background: 'var(--green)' }} />
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, textAlign: 'right' }}>
            {emergTarget > 0 ? ((emergSaved / emergTarget) * 100).toFixed(1) : 0}% da meta
          </div>
        </div>

        <div className="card">
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>🏡 Simulador de Imóvel</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
            {[
              { label: 'Valor do Imóvel (R$)', value: propValue, setter: (v: number) => setPropValue(v), step: 10000 },
              { label: 'Taxa de Juros Anual (%)', value: propRate, setter: (v: number) => setPropRate(v), step: 0.1 },
            ].map(field => (
              <div key={field.label}>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>{field.label}</label>
                <input className="input" type="number" step={field.step} value={field.value} onChange={e => field.setter(parseFloat(e.target.value) || 0)} />
              </div>
            ))}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Entrada (%)</label>
                <input className="input" type="number" min={10} max={80} value={downPct} onChange={e => setDownPct(parseFloat(e.target.value) || 20)} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Prazo (meses)</label>
                <select className="input" value={propMonths} onChange={e => setPropMonths(parseInt(e.target.value))}>
                  {[120,180,240,300,360,420].map(m => <option key={m} value={m}>{m}m ({m/12}a)</option>)}
                </select>
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { label: 'Entrada', value: fmtBRL(downPayment), color: 'var(--amber)' },
              { label: 'Financiado', value: fmtBRL(financed), color: 'var(--text-muted)' },
              { label: 'Parcela (PRICE)', value: fmtBRL(installment), color: 'var(--cadu)' },
              { label: '% da Renda', value: incomeCommitPct.toFixed(1) + '%', color: incomeCommitPct > 30 ? 'var(--red)' : 'var(--green)' },
            ].map(item => (
              <div key={item.label} style={{ background: 'var(--bg-card2)', borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>{item.label}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: item.color }}>{item.value}</div>
              </div>
            ))}
          </div>
          {incomeCommitPct > 30 && (
            <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(239,68,68,0.1)', borderRadius: 8, fontSize: 12, color: 'var(--red)' }}>
              ⚠️ Parcela acima de 30% da renda — acima do recomendado
            </div>
          )}
          {monthsToDown > 0 && (
            <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
              📅 Juntando 30% da renda/mês: entrada em ~{monthsToDown} meses
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>🛒 Posso Comprar?</div>
          <div style={{ display: 'flex', gap: 4, padding: 3, background: 'var(--bg-card2)', borderRadius: 10, border: '1px solid var(--border)' }}>
            {(['avista', 'parcelado'] as const).map(m => (
              <button key={m} onClick={() => { setBuyMode(m); setAiAnalysis(''); setAiError('') }} className="btn btn-sm" style={{
                background: buyMode === m ? 'var(--bg-card)' : 'transparent',
                border: buyMode === m ? '1px solid var(--border)' : '1px solid transparent',
                color: buyMode === m ? 'var(--text)' : 'var(--text-muted)',
              }}>{m === 'avista' ? 'À Vista' : 'Parcelado'}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: buyMode === 'parcelado' ? '2fr 1fr 1fr 1fr' : '2fr 1fr', gap: 10, marginBottom: 16 }}>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>O que quer comprar?</label>
            <input className="input" value={buyDescription} onChange={e => setBuyDescription(e.target.value)} placeholder="Ex: iPhone, sofá, viagem..." />
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Valor (R$)</label>
            <input className="input" type="number" value={buyValue || ''} onChange={e => { setBuyValue(parseFloat(e.target.value) || 0); setAiAnalysis(''); setAiError('') }} placeholder="0,00" />
          </div>
          {buyMode === 'parcelado' && (<>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Parcelas</label>
              <input className="input" type="number" min={1} max={60} value={buyInstallments} onChange={e => setBuyInstallments(parseInt(e.target.value) || 1)} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Taxa/mês (%)</label>
              <input className="input" type="number" step={0.01} value={buyRate} onChange={e => setBuyRate(parseFloat(e.target.value) || 0)} />
            </div>
          </>)}
        </div>

        {buyValue > 0 && (<>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 12, alignItems: 'center', marginBottom: 16 }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%', flexShrink: 0, fontSize: 26,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: (buyMode === 'avista' ? canBuyAvista : installmentPctIncome <= 30) ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
              border: `2px solid ${(buyMode === 'avista' ? canBuyAvista : installmentPctIncome <= 30) ? 'var(--green)' : 'var(--red)'}`,
            }}>
              {(buyMode === 'avista' ? canBuyAvista : installmentPctIncome <= 30) ? '✓' : '✗'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {buyMode === 'avista' ? (<>
                {[
                  { label: 'Veredicto', value: canBuyAvista ? 'Pode comprar!' : 'Não recomendado', color: canBuyAvista ? 'var(--green)' : 'var(--red)' },
                  { label: '% do Saldo', value: buyPctBalance.toFixed(1) + '%', color: buyPctBalance > 80 ? 'var(--red)' : 'var(--amber)' },
                  { label: 'Saldo Restante', value: fmtBRL(balAfterBuy), color: balAfterBuy >= 0 ? 'var(--green)' : 'var(--red)' },
                ].map(item => (
                  <div key={item.label} style={{ background: 'var(--bg-card2)', borderRadius: 10, padding: '10px 12px' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>{item.label}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: item.color }}>{item.value}</div>
                  </div>
                ))}
              </>) : (<>
                {[
                  { label: 'Parcela', value: fmtBRL(installmentValue), color: 'var(--cadu)' },
                  { label: '% da Renda', value: installmentPctIncome.toFixed(1) + '%', color: installmentPctIncome > 30 ? 'var(--red)' : 'var(--green)' },
                  { label: 'Total c/ Juros', value: fmtBRL(totalPaid), color: 'var(--amber)' },
                ].map(item => (
                  <div key={item.label} style={{ background: 'var(--bg-card2)', borderRadius: 10, padding: '10px 12px' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>{item.label}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: item.color }}>{item.value}</div>
                  </div>
                ))}
              </>)}
            </div>
          </div>

          <button onClick={askAI} disabled={aiLoading} style={{
            width: '100%', padding: '12px', borderRadius: 12, border: 'none',
            cursor: aiLoading ? 'wait' : 'pointer',
            background: 'linear-gradient(135deg, #4f52e8, #7c3aed)',
            color: '#fff', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            opacity: aiLoading ? 0.7 : 1, transition: 'all 0.15s',
            marginBottom: (aiAnalysis || aiError) ? 12 : 0,
          }}>
            {aiLoading
              ? <><Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> Analisando com Gemini...</>
              : <><Sparkles size={15} /> Analisar com IA Gemini</>}
          </button>

          {aiAnalysis && (
            <div style={{ padding: '14px 16px', borderRadius: 12, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Sparkles size={13} color="var(--cadu)" />
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--cadu)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Análise Gemini</span>
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text)' }}>{aiAnalysis}</div>
            </div>
          )}

          {aiError && (
            <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', fontSize: 12, color: 'var(--red)' }}>
              ⚠️ {aiError}
            </div>
          )}
        </>)}
      </div>

      <div className="card">
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>📊 Limites de Orçamento</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <select className="input" value={budgetCategory} onChange={e => setBudgetCategory(e.target.value)}>
            <option value="">Selecionar categoria...</option>
            {CATEGORIES_EXPENSE.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input className="input" style={{ maxWidth: 140 }} type="number" placeholder="Limite R$" value={budgetValue} onChange={e => setBudgetValue(e.target.value)} />
          <button className="btn btn-primary" onClick={saveBudget}><Check size={14} /> Salvar</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
          {state.budgetLimits.map(bl => {
            const spent = monthTxs.filter(t => t.type === 'expense' && t.category === bl.category).reduce((s, t) => s + t.amount, 0)
            const pct = Math.min((spent / bl.limit) * 100, 100)
            const color = pct >= 100 ? 'var(--red)' : pct >= 80 ? 'var(--amber)' : 'var(--green)'
            return (
              <div key={bl.category} style={{ background: 'var(--bg-card2)', borderRadius: 12, padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 500 }}>{bl.category}</span>
                  <span style={{ fontSize: 11, color }}>{pct.toFixed(0)}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11 }}>
                  <span style={{ color: 'var(--text-muted)' }}>{fmtBRL(spent)}</span>
                  <span style={{ color: 'var(--text-muted)' }}>/ {fmtBRL(bl.limit)}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
