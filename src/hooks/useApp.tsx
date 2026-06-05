import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { AppState, Transaction, Goal, SplitExpense, BudgetLimit, UserId } from '../types'
import { loadState, saveState, generateId } from '../lib/store'

interface AppContextType {
  state: AppState
  setActiveUser: (id: UserId) => void
  setSelectedMonth: (month: string) => void
  addTransaction: (t: Omit<Transaction, 'id' | 'createdAt'>) => void
  updateTransaction: (id: string, t: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void
  addGoal: (g: Omit<Goal, 'id'>) => void
  updateGoal: (id: string, g: Partial<Goal>) => void
  deleteGoal: (id: string) => void
  addGoalContribution: (id: string, amount: number) => void
  addSplit: (s: Omit<SplitExpense, 'id' | 'createdAt'>) => void
  deleteSplit: (id: string) => void
  settleAll: () => void
  setBudgetLimit: (b: BudgetLimit) => void
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children, initialUser }: { children: React.ReactNode, initialUser: UserId }) {
  const [state, setState] = useState<AppState>(() => {
    const s = loadState()
    s.activeUser = initialUser
    return s
  })

  useEffect(() => { saveState(state) }, [state])

  const update = useCallback((fn: (s: AppState) => AppState) => {
    setState(prev => fn(prev))
  }, [])

  const setActiveUser = (id: UserId) => update(s => ({ ...s, activeUser: id }))
  const setSelectedMonth = (month: string) => update(s => ({ ...s, selectedMonth: month }))

  const addTransaction = (t: Omit<Transaction, 'id' | 'createdAt'>) =>
    update(s => ({ ...s, transactions: [...s.transactions, { ...t, id: generateId(), createdAt: new Date().toISOString() }] }))

  const updateTransaction = (id: string, t: Partial<Transaction>) =>
    update(s => ({ ...s, transactions: s.transactions.map(x => x.id === id ? { ...x, ...t } : x) }))

  const deleteTransaction = (id: string) =>
    update(s => ({ ...s, transactions: s.transactions.filter(x => x.id !== id) }))

  const addGoal = (g: Omit<Goal, 'id'>) =>
    update(s => ({ ...s, goals: [...s.goals, { ...g, id: generateId() }] }))

  const updateGoal = (id: string, g: Partial<Goal>) =>
    update(s => ({ ...s, goals: s.goals.map(x => x.id === id ? { ...x, ...g } : x) }))

  const deleteGoal = (id: string) =>
    update(s => ({ ...s, goals: s.goals.filter(x => x.id !== id) }))

  const addGoalContribution = (id: string, amount: number) =>
    update(s => ({ ...s, goals: s.goals.map(x => x.id === id ? { ...x, currentAmount: Math.min(x.currentAmount + amount, x.targetAmount) } : x) }))

  const addSplit = (s: Omit<SplitExpense, 'id' | 'createdAt'>) =>
    update(st => ({ ...st, splitExpenses: [...st.splitExpenses, { ...s, id: generateId(), createdAt: new Date().toISOString() }] }))

  const deleteSplit = (id: string) =>
    update(s => ({ ...s, splitExpenses: s.splitExpenses.filter(x => x.id !== id) }))

  const settleAll = () =>
    update(s => ({ ...s, splitExpenses: s.splitExpenses.map(x => ({ ...x, settled: true })) }))

  const setBudgetLimit = (b: BudgetLimit) =>
    update(s => {
      const existing = s.budgetLimits.findIndex(x => x.category === b.category)
      if (existing >= 0) {
        const limits = [...s.budgetLimits]
        limits[existing] = b
        return { ...s, budgetLimits: limits }
      }
      return { ...s, budgetLimits: [...s.budgetLimits, b] }
    })

  return (
    <AppContext.Provider value={{
      state, setActiveUser, setSelectedMonth,
      addTransaction, updateTransaction, deleteTransaction,
      addGoal, updateGoal, deleteGoal, addGoalContribution,
      addSplit, deleteSplit, settleAll, setBudgetLimit
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be inside AppProvider')
  return ctx
}
