import {Transaction, Account, Budget, Goal} from '../types';

export const demoTransactions: Transaction[] = [
  {
    id: '1',
    type: 'income',
    amount: 5000,
    category: 'Salary',
    description: 'Monthly Salary',
    date: '2024-12-01',
    accountId: '1',
  },
  {
    id: '2',
    type: 'expense',
    amount: 1200,
    category: 'Rent',
    description: 'Monthly Rent Payment',
    date: '2024-12-02',
    accountId: '1',
  },
  {
    id: '3',
    type: 'expense',
    amount: 350,
    category: 'Groceries',
    description: 'Weekly Groceries',
    date: '2024-12-03',
    accountId: '1',
  },
  {
    id: '4',
    type: 'expense',
    amount: 80,
    category: 'Transportation',
    description: 'Gas and Metro',
    date: '2024-12-04',
    accountId: '1',
  },
  {
    id: '5',
    type: 'expense',
    amount: 150,
    category: 'Entertainment',
    description: 'Movies and Dining',
    date: '2024-12-05',
    accountId: '1',
  },
  {
    id: '6',
    type: 'income',
    amount: 500,
    category: 'Freelance',
    description: 'Freelance Project',
    date: '2024-12-06',
    accountId: '2',
  },
];

export const demoAccounts: Account[] = [
  {
    id: '1',
    name: 'Main Checking',
    type: 'checking',
    balance: 3220,
    currency: 'USD',
  },
  {
    id: '2',
    name: 'Savings Account',
    type: 'savings',
    balance: 10500,
    currency: 'USD',
  },
  {
    id: '3',
    name: 'Credit Card',
    type: 'credit',
    balance: -850,
    currency: 'USD',
  },
];

export const demoBudgets: Budget[] = [
  {
    id: '1',
    category: 'Groceries',
    amount: 500,
    spent: 350,
    period: 'monthly',
  },
  {
    id: '2',
    category: 'Transportation',
    amount: 200,
    spent: 80,
    period: 'monthly',
  },
  {
    id: '3',
    category: 'Entertainment',
    amount: 300,
    spent: 150,
    period: 'monthly',
  },
  {
    id: '4',
    category: 'Rent',
    amount: 1200,
    spent: 1200,
    period: 'monthly',
  },
];

export const demoGoals: Goal[] = [
  {
    id: '1',
    name: 'Emergency Fund',
    targetAmount: 10000,
    currentAmount: 7500,
    deadline: '2025-06-30',
    category: 'Savings',
  },
  {
    id: '2',
    name: 'Vacation',
    targetAmount: 3000,
    currentAmount: 1200,
    deadline: '2025-08-15',
    category: 'Travel',
  },
  {
    id: '3',
    name: 'New Laptop',
    targetAmount: 1500,
    currentAmount: 800,
    deadline: '2025-03-01',
    category: 'Electronics',
  },
];
