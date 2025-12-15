import React, {createContext, useContext, useState, useEffect, useCallback, ReactNode} from 'react';
import {
  Transaction,
  Account,
  Budget,
  Goal,
  Settings,
  AppData,
  Category,
  CategoryType,
} from '../types';
import { loadData, saveData } from '../utils/storage';
import { generateDemoData } from '../utils/demoData';

interface DataContextType {
  transactions: Transaction[];
  accounts: Account[];
  budgets: Budget[];
  goals: Goal[];
  categories: Category[];
  settings: Settings;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addAccount: (account: Account) => void;
  updateAccount: (id: string, account: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  addBudget: (budget: Budget) => void;
  updateBudget: (id: string, budget: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  addGoal: (goal: Goal) => void;
  updateGoal: (id: string, goal: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  addCategory: (category: Category) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  loadDemoData: () => void;
  clearAllData: () => Promise<void>;
  exportData: () => Promise<string>;
  importData: (jsonString: string) => Promise<boolean>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const defaultSettings: Settings = {
  theme: 'system',
  currency: 'USD',
  language: 'en',
};

const defaultCategories: Category[] = [
  // Income
  {
    id: 'cat_inc_1',
    name: 'Salary',
    type: CategoryType.INCOME,
    color: '#10B981',
    icon: 'wallet-outline',
    is_default: true,
  },
  {
    id: 'cat_inc_2',
    name: 'Freelance',
    type: CategoryType.INCOME,
    color: '#06B6D4',
    icon: 'briefcase-outline',
    is_default: true,
  },
  {
    id: 'cat_inc_3',
    name: 'Investments',
    type: CategoryType.INCOME,
    color: '#3B82F6',
    icon: 'trending-up-outline',
    is_default: true,
  },
  {
    id: 'cat_inc_4',
    name: 'Gifts',
    type: CategoryType.INCOME,
    color: '#8B5CF6',
    icon: 'gift-outline',
    is_default: true,
  },
  // Expense
  {
    id: 'cat_exp_1',
    name: 'Food',
    type: CategoryType.EXPENSE,
    color: '#F59E0B',
    icon: 'restaurant-outline',
    is_default: true,
  },
  {
    id: 'cat_exp_2',
    name: 'Transport',
    type: CategoryType.EXPENSE,
    color: '#3B82F6',
    icon: 'car-outline',
    is_default: true,
  },
  {
    id: 'cat_exp_3',
    name: 'Shopping',
    type: CategoryType.EXPENSE,
    color: '#EC4899',
    icon: 'cart-outline',
    is_default: true,
  },
  {
    id: 'cat_exp_4',
    name: 'Bills',
    type: CategoryType.EXPENSE,
    color: '#EF4444',
    icon: 'receipt-outline',
    is_default: true,
  },
  {
    id: 'cat_exp_5',
    name: 'Entertainment',
    type: CategoryType.EXPENSE,
    color: '#8B5CF6',
    icon: 'game-controller-outline',
    is_default: true,
  },
  {
    id: 'cat_exp_6',
    name: 'Health',
    type: CategoryType.EXPENSE,
    color: '#EF4444',
    icon: 'medkit-outline',
    is_default: true,
  },
  {
    id: 'cat_exp_7',
    name: 'Education',
    type: CategoryType.EXPENSE,
    color: '#FCD34D',
    icon: 'school-outline',
    is_default: true,
  },
  {
    id: 'cat_exp_8',
    name: 'Groceries',
    type: CategoryType.EXPENSE,
    color: '#10B981',
    icon: 'basket-outline',
    is_default: true,
  },
];

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  const loadInitialData = async () => {
    const data = await loadData();
    if (data) {
      setTransactions(data.transactions);
      setAccounts(data.accounts);
      setBudgets(data.budgets);
      setGoals(data.goals);
      setSettings(data.settings);
      if (data.categories && data.categories.length > 0) {
        setCategories(data.categories);
      } else {
        setCategories(defaultCategories);
      }
    } else {
      // First launch or no data
      setCategories(defaultCategories);
    }
  };

  const saveCurrentData = useCallback(async () => {
    const data: AppData = {
      transactions,
      accounts,
      budgets,
      goals,
      settings,
      categories,
    };
    await saveData(data);
  }, [transactions, accounts, budgets, goals, settings, categories]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    // Debounce save or save on every change
    const timer = setTimeout(() => {
      saveCurrentData();
    }, 500);
    return () => clearTimeout(timer);
  }, [saveCurrentData]);

  const addTransaction = (transaction: Transaction) => {
    setTransactions(prev => [...prev, transaction]);

    // Update account balances
    setAccounts(prevAccounts => {
      const { type, amount, accountId, toAccountId } = transaction;
      return prevAccounts.map(acc => {
        if (acc.id === accountId) {
          if (type === 'income') {
            return { ...acc, balance: acc.balance + amount };
          } else if (type === 'expense') {
            return { ...acc, balance: acc.balance - amount };
          } else if (type === 'transfer') {
            return { ...acc, balance: acc.balance - amount };
          }
        }
        if (type === 'transfer' && toAccountId && acc.id === toAccountId) {
          return { ...acc, balance: acc.balance + amount };
        }
        return acc;
      });
    });
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions(prev =>
      prev.map(t => (t.id === id ? { ...t, ...updates } : t)),
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addAccount = (account: Account) => {
    setAccounts(prev => [...prev, account]);
  };

  const updateAccount = (id: string, updates: Partial<Account>) => {
    setAccounts(prev =>
      prev.map(a => (a.id === id ? { ...a, ...updates } : a)),
    );
  };

  const deleteAccount = (id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
  };

  const addBudget = (budget: Budget) => {
    setBudgets(prev => [...prev, budget]);
  };

  const updateBudget = (id: string, updates: Partial<Budget>) => {
    setBudgets(prev => prev.map(b => (b.id === id ? { ...b, ...updates } : b)));
  };

  const deleteBudget = (id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
  };

  const addGoal = (goal: Goal) => {
    setGoals(prev => [...prev, goal]);
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setGoals(prev => prev.map(g => (g.id === id ? { ...g, ...updates } : g)));
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const addCategory = (category: Category) => {
    setCategories(prev => [...prev, category]);
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updates } : c)),
    );
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const updateSettings = (updates: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const loadDemoData = useCallback(() => {
    const data = generateDemoData();
    setTransactions(data.transactions);
    setAccounts(data.accounts);
    setBudgets(data.budgets);
    setGoals(data.goals);
    setSettings(data.settings);
    if (data.categories) {
      setCategories(data.categories);
    }
  }, []); // Removed [settings] dependency to avoid stale settings if not needed

  const clearAllData = async () => {
    setTransactions([]);
    setAccounts([]);
    setBudgets([]);
    setGoals([]);
    // Categories are preserved

    const cleanedData: AppData = {
      transactions: [],
      accounts: [],
      budgets: [],
      goals: [],
      settings,
      categories,
    };
    await saveData(cleanedData);
  };

  const exportData = async (): Promise<string> => {
    const data: AppData = {
      transactions,
      accounts,
      budgets,
      goals,
      settings,
      categories,
    };
    return JSON.stringify(data, null, 2);
  };

  const importData = async (jsonString: string): Promise<boolean> => {
    try {
      const data = JSON.parse(jsonString) as AppData;
      // Basic validation
      if (!Array.isArray(data.transactions) || !Array.isArray(data.accounts)) {
        return false;
      }

      setTransactions(data.transactions);
      setAccounts(data.accounts);
      setBudgets(data.budgets || []);
      setGoals(data.goals || []);
      if (data.settings) setSettings(data.settings);
      if (data.categories) setCategories(data.categories);

      // Save immediately
      await saveData(data);
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  };

  return (
    <DataContext.Provider
      value={{
        transactions,
        accounts,
        budgets,
        goals,
        categories,
        settings,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addAccount,
        updateAccount,
        deleteAccount,
        addBudget,
        updateBudget,
        deleteBudget,
        addGoal,
        updateGoal,
        deleteGoal,
        addCategory,
        updateCategory,
        deleteCategory,
        updateSettings,
        loadDemoData,
        clearAllData,
        exportData,
        importData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
