import { AppState, Transaction, Goal, SplitExpense, USERS } from '../types'
import { format } from 'date-fns'

const STORAGE_KEY = 'fincouple_v2'

function getDefaultState(): AppState {
  return {
    users: USERS,
    transactions: [],
    goals: [],
    splitExpenses: [],
    budgetLimits: [],
    activeUser: 'cadu',
    selectedMonth: format(new Date(), 'yyyy-MM'),
  }
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return getDefaultState()
    const parsed = JSON.parse(raw) as AppState
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

export function getMonthTransactions(transactions: Transaction[], month: string) {
  return transactions.filter(t => t.date.startsWith(month))
}

export function calcTotals(transactions: Transaction[]) {
  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  return { income, expense, balance: income - expense }
}

export function calcSplitBalance(splits: SplitExpense[]): number {
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
