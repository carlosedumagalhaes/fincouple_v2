import { AppState, Transaction, Goal, SplitExpense, BudgetLimit, USERS } from '../types'
import { format } from 'date-fns'

const STORAGE_KEY = 'fincouple_v1'

const SEED_TRANSACTIONS: Transaction[] = [
  {
    id: 't1', userId: 'cadu', scope: 'personal', type: 'income',
    category: 'Salário', description: 'Salário TRB Pharma', amount: 8500,
    date: format(new Date(), 'yyyy-MM') + '-05', paymentMethod: 'PIX', isFixed: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 't2', userId: 'stephanie', scope: 'personal', type: 'income',
    category: 'Salário', description: 'Salário Stephanie', amount: 4200,
    date: format(new Date(), 'yyyy-MM') + '-05', paymentMethod: 'PIX', isFixed: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 't3', userId: 'cadu', scope: 'shared', type: 'expense',
    category: 'Moradia', description: 'Aluguel', amount: 1800,
    date: format(new Date(), 'yyyy-MM') + '-10', paymentMethod: 'PIX', isFixed: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 't4', userId: 'cadu', scope: 'shared', type: 'expense',
    category: 'Assinaturas', description: 'Internet', amount: 120,
    date: format(new Date(), 'yyyy-MM') + '-15', paymentMethod: 'Débito', isFixed: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 't5', userId: 'stephanie', scope: 'shared', type: 'expense',
    category: 'Mercado', description: 'Supermercado mensal', amount: 650,
    date: format(new Date(), 'yyyy-MM') + '-08', paymentMethod: 'Crédito', isFixed: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 't6', userId: 'cadu', scope: 'personal', type: 'expense',
    category: 'Transporte', description: 'Combustível', amount: 280,
    date: format(new Date(), 'yyyy-MM') + '-12', paymentMethod: 'Crédito', isFixed: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 't7', userId: 'stephanie', scope: 'personal', type: 'expense',
    category: 'Saúde', description: 'Academia', amount: 89,
    date: format(new Date(), 'yyyy-MM') + '-01', paymentMethod: 'Débito', isFixed: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 't8', userId: 'cadu', scope: 'shared', type: 'expense',
    category: 'Restaurante', description: 'Jantar Osteria Limoncello', amount: 210,
    date: format(new Date(), 'yyyy-MM') + '-20', paymentMethod: 'Crédito', isFixed: false,
    createdAt: new Date().toISOString()
  },
]

const SEED_GOALS: Goal[] = [
  {
    id: 'g1', scope: 'shared', ownerId: 'cadu', name: 'Entrada do Imóvel',
    emoji: '🏡', targetAmount: 140000, currentAmount: 18500,
    deadline: '2028-12', category: 'imovel', color: '#6366f1'
  },
  {
    id: 'g2', scope: 'shared', ownerId: 'stephanie', name: 'Reserva de Emergência',
    emoji: '🛡️', targetAmount: 38400, currentAmount: 12000,
    deadline: '2026-12', category: 'reserva', color: '#f43f5e'
  },
  {
    id: 'g3', scope: 'shared', ownerId: 'cadu', name: 'Viagem Europa',
    emoji: '✈️', targetAmount: 25000, currentAmount: 4200,
    deadline: '2027-07', category: 'viagem', color: '#10b981'
  },
]

const SEED_SPLITS: SplitExpense[] = [
  {
    id: 's1', description: 'Aluguel + condomínio', totalAmount: 1800,
    paidBy: 'cadu', splitType: 'equal', splitPercent: 50,
    category: 'Moradia', date: format(new Date(), 'yyyy-MM') + '-10',
    settled: false, createdAt: new Date().toISOString()
  },
  {
    id: 's2', description: 'Mercado', totalAmount: 650,
    paidBy: 'stephanie', splitType: 'equal', splitPercent: 50,
    category: 'Alimentação', date: format(new Date(), 'yyyy-MM') + '-08',
    settled: false, createdAt: new Date().toISOString()
  },
]

function getDefaultState(): AppState {
  return {
    users: USERS,
    transactions: SEED_TRANSACTIONS,
    goals: SEED_GOALS,
    splitExpenses: SEED_SPLITS,
    budgetLimits: [
      { category: 'Mercado', limit: 800, scope: 'shared' },
      { category: 'Restaurante', limit: 400, scope: 'shared' },
      { category: 'Lazer', limit: 300, scope: 'shared' },
    ],
    activeUser: 'cadu',
    selectedMonth: format(new Date(), 'yyyy-MM'),
  }
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return getDefaultState()
    const parsed = JSON.parse(raw) as AppState
    // ensure users always has the latest definitions
    parsed.users = USERS
    return parsed
  } catch {
    return getDefaultState()
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.error('Erro ao salvar estado', e)
  }
}

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

// Finance helpers
export function getMonthTransactions(transactions: Transaction[], month: string) {
  return transactions.filter(t => t.date.startsWith(month))
}

export function calcTotals(transactions: Transaction[]) {
  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  return { income, expense, balance: income - expense }
}

export function calcSplitBalance(splits: SplitExpense[]): number {
  // positive = Stephanie deve para Cadu; negative = Cadu deve para Stephanie
  return splits
    .filter(s => !s.settled)
    .reduce((acc, s) => {
      const caduShare = s.totalAmount * (s.splitPercent / 100)
      const stephanieShare = s.totalAmount - caduShare
      if (s.paidBy === 'cadu') {
        return acc + stephanieShare
      } else {
        return acc - caduShare
      }
    }, 0)
}

export function fmtBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function fmtMonth(month: string): string {
  const [y, m] = month.split('-')
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return `${months[parseInt(m) - 1]} ${y}`
}
