import React, {createContext, useContext, useState, useEffect, useCallback, ReactNode} from 'react';
import {Transaction, Account, Budget, Goal, Settings, AppData} from '../types';
import {loadData, saveData, clearData} from '../utils/storage';
import {generateDemoData} from '../utils/demoData';

interface DataContextType {
  transactions: Transaction[];
  accounts: Account[];
  budgets: Budget[];
  goals: Goal[];
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
  updateSettings: (settings: Partial<Settings>) => void;
  loadDemoData: () => void;
  clearAllData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const defaultSettings: Settings = {
  theme: 'system',
  currency: 'USD',
  language: 'en',
};

export const DataProvider = ({children}: {children: ReactNode}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    saveCurrentData();
  }, [transactions, accounts, budgets, goals, settings]);

  const loadInitialData = async () => {
    const data = await loadData();
    if (data) {
      setTransactions(data.transactions);
      setAccounts(data.accounts);
      setBudgets(data.budgets);
      setGoals(data.goals);
      setSettings(data.settings);
    }
  };

  const saveCurrentData = useCallback(async () => {
    const data: AppData = {
      transactions,
      accounts,
      budgets,
      goals,
      settings,
    };
    await saveData(data);
  }, [transactions, accounts, budgets, goals, settings]);

  const addTransaction = (transaction: Transaction) => {
    setTransactions(prev => [...prev, transaction]);
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions(prev =>
      prev.map(t => (t.id === id ? {...t, ...updates} : t)),
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addAccount = (account: Account) => {
    setAccounts(prev => [...prev, account]);
  };

  const updateAccount = (id: string, updates: Partial<Account>) => {
    setAccounts(prev => prev.map(a => (a.id === id ? {...a, ...updates} : a)));
  };

  const deleteAccount = (id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
  };

  const addBudget = (budget: Budget) => {
    setBudgets(prev => [...prev, budget]);
  };

  const updateBudget = (id: string, updates: Partial<Budget>) => {
    setBudgets(prev => prev.map(b => (b.id === id ? {...b, ...updates} : b)));
  };

  const deleteBudget = (id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
  };

  const addGoal = (goal: Goal) => {
    setGoals(prev => [...prev, goal]);
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setGoals(prev => prev.map(g => (g.id === id ? {...g, ...updates} : g)));
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const updateSettings = (updates: Partial<Settings>) => {
    setSettings(prev => ({...prev, ...updates}));
  };

  const loadDemoData = useCallback(() => {
    const data = generateDemoData();
    setTransactions(data.transactions);
    setAccounts(data.accounts);
    setBudgets(data.budgets);
    setGoals(data.goals);
    // Persist immediately
    const appData: AppData = {
        transactions: data.transactions,
        accounts: data.accounts,
        budgets: data.budgets,
        goals: data.goals,
        settings: settings,
        categories: data.categories
    };
    saveData(appData);
  }, [settings]);

  const clearAllData = async () => {
    setTransactions([]);
    setAccounts([]);
    setBudgets([]);
    setGoals([]);
    // setSettings(defaultSettings);
    await clearData();
  };

  return (
    <DataContext.Provider
      value={{
        transactions,
        accounts,
        budgets,
        goals,
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
        updateSettings,
        loadDemoData,
        clearAllData,
      }}>
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
