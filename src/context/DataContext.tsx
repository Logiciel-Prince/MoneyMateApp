import React, {createContext, useContext, useState, useEffect, useCallback, ReactNode} from 'react';
import {
  Transaction,
  Account,
  Budget,
  Goal,
  Settings,
  AppData,
  Category,
} from '../types';
import { loadData, saveData, clearData } from '../utils/storage';
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
      if (data.categories) {
        setCategories(data.categories);
      }
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
    setCategories([]);
    // Do not reset settings to default, users usually prefer to keep theme/currency
    // setSettings(defaultSettings);
    await clearData();
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

