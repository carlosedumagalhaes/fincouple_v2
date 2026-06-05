export type UserId = 'cadu' | 'stephanie'

export interface User {
  id: UserId
  name: string
  color: string
  avatar: string
}

export interface Transaction {
  id: string
  userId: UserId
  scope: 'personal' | 'shared'
  type: 'income' | 'expense'
  category: string
  description: string
  amount: number
  date: string // YYYY-MM-DD
  paymentMethod?: string
  isFixed: boolean
  createdAt: string
}

export interface Goal {
  id: string
  scope: 'personal' | 'shared'
  ownerId: UserId
  name: string
  emoji: string
  targetAmount: number
  currentAmount: number
  deadline: string // YYYY-MM
  category: 'imovel' | 'viagem' | 'reserva' | 'outro'
  color: string
}

export interface SplitExpense {
  id: string
  description: string
  totalAmount: number
  paidBy: UserId
  splitType: 'equal' | 'custom'
  splitPercent: number // % do Cadu (0-100)
  category: string
  date: string
  settled: boolean
  createdAt: string
}

export interface BudgetLimit {
  category: string
  limit: number
  scope: 'shared' | 'personal'
}

export interface AppState {
  users: Record<UserId, User>
  transactions: Transaction[]
  goals: Goal[]
  splitExpenses: SplitExpense[]
  budgetLimits: BudgetLimit[]
  activeUser: UserId
  selectedMonth: string // YYYY-MM
}

export const CATEGORIES_EXPENSE = [
  'Moradia', 'Alimentação', 'Transporte', 'Saúde', 'Lazer',
  'Roupas', 'Educação', 'Pet', 'Assinaturas', 'Restaurante',
  'Mercado', 'Farmácia', 'Combustível', 'Outros'
]

export const CATEGORIES_INCOME = [
  'Salário', 'Freelance', 'Investimentos', 'Bônus', 'Outros'
]

export const PAYMENT_METHODS = [
  'PIX', 'Débito', 'Crédito', 'Dinheiro', 'Transferência'
]

export const USERS: Record<UserId, User> = {
  cadu: { id: 'cadu', name: 'Cadu', color: '#6366f1', avatar: 'C' },
  stephanie: { id: 'stephanie', name: 'Stephanie', color: '#f43f5e', avatar: 'S' },
}
