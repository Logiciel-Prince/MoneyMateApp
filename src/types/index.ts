// Enums for Demo Data
export enum AccountType {
  BANK = 'checking', // Mapped to existing 'checking' for compatibility
  CASH = 'cash',
  WALLET = 'savings', // Mapped to 'savings' or 'wallet' if we add it
  CREDIT_CARD = 'credit',
}

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export enum CategoryType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export enum RecurringFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  color: string;
  icon: string;
  is_default: boolean;
}

export interface SavingsGoal extends Goal {
  // mapped from Goal
  is_completed?: boolean;
}

// Existing interfaces
export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string; // mapped from 'note'
  date: string;
  accountId: string; // mapped from 'account_id'
  categoryId?: string; // Optional for new data model
}

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'cash';
  balance: number;
  currency: string;
  is_active?: boolean;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  spent: number;
  period: 'monthly' | 'yearly';
  categoryId?: string;
  month?: number;
  year?: number;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // mapped from target_date
  category: string;
  color?: string;
  icon?: string;
}

export interface Settings {
  theme: 'light' | 'dark' | 'system';
  currency: string;
  language: string;
}

export interface AppData {
  transactions: Transaction[];
  accounts: Account[];
  budgets: Budget[];
  goals: Goal[];
  settings: Settings;
  categories?: Category[]; // New field
}
