import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import {
    Account, 
    Transaction, 
    Category, 
    Budget, 
    Goal, 
    AccountType, 
    CategoryType, 
    AppData,
    Settings
} from '../types';

export const generateDemoData = (): AppData => {
  // 1. Categories
  const categoriesData = [
    { name: 'Food & Dining', type: CategoryType.EXPENSE, color: '#ef4444', icon: 'fast-food-outline', is_default: true },
    { name: 'Shopping', type: CategoryType.EXPENSE, color: '#f97316', icon: 'bag-handle-outline', is_default: true },
    { name: 'Transportation', type: CategoryType.EXPENSE, color: '#eab308', icon: 'car-sport-outline', is_default: true },
    { name: 'Bills & Utilities', type: CategoryType.EXPENSE, color: '#84cc16', icon: 'flash-outline', is_default: true },
    { name: 'Entertainment', type: CategoryType.EXPENSE, color: '#06b6d4', icon: 'film-outline', is_default: true },
    { name: 'Healthcare', type: CategoryType.EXPENSE, color: '#3b82f6', icon: 'medical-outline', is_default: true },
    { name: 'Education', type: CategoryType.EXPENSE, color: '#6366f1', icon: 'school-outline', is_default: true },
    { name: 'Rent', type: CategoryType.EXPENSE, color: '#8b5cf6', icon: 'home-outline', is_default: true },
    { name: 'Insurance', type: CategoryType.EXPENSE, color: '#d946ef', icon: 'shield-checkmark-outline', is_default: true },
    { name: 'Personal Care', type: CategoryType.EXPENSE, color: '#f43f5e', icon: 'heart-outline', is_default: true },
    { name: 'Travel', type: CategoryType.EXPENSE, color: '#14b8a6', icon: 'airplane-outline', is_default: true },
    { name: 'Subscriptions', type: CategoryType.EXPENSE, color: '#64748b', icon: 'repeat-outline', is_default: true },
    { name: 'Gifts', type: CategoryType.EXPENSE, color: '#ec4899', icon: 'gift-outline', is_default: true },
    { name: 'Other Expense', type: CategoryType.EXPENSE, color: '#94a3b8', icon: 'help-circle-outline', is_default: true },
    
    { name: 'Salary', type: CategoryType.INCOME, color: '#22c55e', icon: 'cash-outline', is_default: true },
    { name: 'Freelance', type: CategoryType.INCOME, color: '#10b981', icon: 'laptop-outline', is_default: true },
    { name: 'Investments', type: CategoryType.INCOME, color: '#14b8a6', icon: 'trending-up-outline', is_default: true },
    { name: 'Business', type: CategoryType.INCOME, color: '#0ea5e9', icon: 'briefcase-outline', is_default: true },
    { name: 'Rental Income', type: CategoryType.INCOME, color: '#3b82f6', icon: 'key-outline', is_default: true },
    { name: 'Refunds', type: CategoryType.INCOME, color: '#a855f7', icon: 'refresh-circle-outline', is_default: true },
    { name: 'Other Income', type: CategoryType.INCOME, color: '#64748b', icon: 'add-circle-outline', is_default: true },
  ];

  const categories: Category[] = categoriesData.map(c => ({ ...c, id: uuidv4() }));
  const categoryMap: Record<string, string> = {};
  categories.forEach(c => categoryMap[c.name] = c.id);

  // 2. Accounts
  const accountsData = [
      { name: 'HDFC Bank', type: AccountType.BANK, starting_balance: 50000, color: 'bg-blue-600', icon: 'landmark' },
      { name: 'Cash Wallet', type: AccountType.CASH, starting_balance: 5000, color: 'bg-green-600', icon: 'banknote' },
      { name: 'Paytm', type: AccountType.WALLET, starting_balance: 2500, color: 'bg-purple-600', icon: 'wallet' },
      { name: 'ICICI Credit Card', type: AccountType.CREDIT_CARD, starting_balance: 0, color: 'bg-yellow-600', icon: 'credit-card' }
  ];

  const accounts: Account[] = accountsData.map(a => ({ 
      id: uuidv4(),
      name: a.name,
      type: a.type as any, // Cast to match stricter Account interface union type
      balance: a.starting_balance,
      currency: 'INR',
      is_active: true 
  }));

  const accountMap: Record<string, string> = {};
  accounts.forEach(a => accountMap[a.name] = a.id);

  // 3. Transactions
  const transactions: Transaction[] = [];
  const now = moment();
  
  // Loop for the last 6 months (0 to 5)
  for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
      const month = now.clone().subtract(monthOffset, 'months');
      
      // Salary (1st of month)
      transactions.push({
          id: uuidv4(),
          type: 'income',
          amount: 75000 + Math.floor(Math.random() * 5000),
          date: month.clone().date(1).hour(10).minute(0).toISOString(),
          accountId: accountMap['HDFC Bank'],
          categoryId: categoryMap['Salary'],
          category: 'Salary', // Flat field for UI
          description: 'Monthly salary',
      });

      // Random expenses
      const numExpenses = 15 + Math.floor(Math.random() * 10);
      const expenseCategories = [
          { name: 'Food & Dining', min: 200, max: 2000 },
          { name: 'Shopping', min: 500, max: 5000 },
          { name: 'Transportation', min: 100, max: 1000 },
          { name: 'Bills & Utilities', min: 500, max: 3000 },
          { name: 'Entertainment', min: 200, max: 1500 },
          { name: 'Healthcare', min: 300, max: 2000 },
          { name: 'Personal Care', min: 200, max: 1000 },
          { name: 'Subscriptions', min: 200, max: 600 }
      ];

      for (let i = 0; i < numExpenses; i++) {
          const cat = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
          const accountNames = ['HDFC Bank', 'Cash Wallet', 'Paytm', 'ICICI Credit Card'];
          const accountName = accountNames[Math.floor(Math.random() * accountNames.length)];
          const day = 1 + Math.floor(Math.random() * 27);

          transactions.push({
              id: uuidv4(),
              type: 'expense',
              amount: cat.min + Math.floor(Math.random() * (cat.max - cat.min)),
              date: month.clone().date(day).hour(Math.floor(Math.random() * 24)).minute(Math.floor(Math.random() * 60)).toISOString(),
              accountId: accountMap[accountName],
              categoryId: categoryMap[cat.name],
              category: cat.name, // Flat field for UI
              description: `${cat.name} expense`,
          });
      }

      // Rent (5th of month) - Only for last 4 months as per requested logic
      if (monthOffset < 4) {
          transactions.push({
              id: uuidv4(),
              type: 'expense',
              amount: 15000,
              date: month.clone().date(5).hour(12).minute(0).toISOString(),
              accountId: accountMap['HDFC Bank'],
              categoryId: categoryMap['Rent'],
              category: 'Rent',
              description: 'Monthly rent',
          });
      }

      // Occasional freelance income
      if (Math.random() > 0.5) {
          transactions.push({
              id: uuidv4(),
              type: 'income',
              amount: 10000 + Math.floor(Math.random() * 15000),
              date: month.clone().date(15 + Math.floor(Math.random() * 10)).toISOString(),
              accountId: accountMap['HDFC Bank'],
              categoryId: categoryMap['Freelance'],
              category: 'Freelance',
              description: 'Freelance project',
          });
      }
  }

  // 4. Budgets
  const budgetCategories = [
      { name: 'Food & Dining', amount: 8000 },
      { name: 'Shopping', amount: 10000 },
      { name: 'Transportation', amount: 3000 },
      { name: 'Entertainment', amount: 5000 },
      { name: 'Bills & Utilities', amount: 5000 }
  ];

  const budgets: Budget[] = [];
  budgetCategories.forEach(b => {
      budgets.push({
          id: uuidv4(),
          category: b.name,
          categoryId: categoryMap[b.name],
          amount: b.amount,
          spent: transactions
                .filter(t => t.categoryId === categoryMap[b.name] && t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0), // Calculate spent roughly
          period: 'monthly',
          month: now.month(),
          year: now.year()
      });
  });

  // 5. Savings Goals
  const goalsData = [
      { name: 'Emergency Fund', target_amount: 300000, current_amount: 125000, target_date: moment().add(12, 'months').toISOString(), color: 'bg-green-500', icon: 'shield' },
      { name: 'Vacation to Europe', target_amount: 200000, current_amount: 45000, target_date: moment().add(8, 'months').toISOString(), color: 'bg-blue-500', icon: 'plane' },
      { name: 'New Laptop', target_amount: 80000, current_amount: 60000, target_date: moment().add(1, 'months').toISOString(), color: 'bg-purple-500', icon: 'laptop' }
  ];

  const goals: Goal[] = goalsData.map(g => ({
      id: uuidv4(),
      name: g.name,
      targetAmount: g.target_amount,
      currentAmount: g.current_amount,
      deadline: g.target_date,
      category: 'General', // Default
      color: g.color,
      icon: g.icon
  }));

  const defaultSettings: Settings = {
      theme: 'system',
      currency: 'INR',
      language: 'en',
  };

  return {
      transactions,
      accounts,
      budgets,
      goals,
      settings: defaultSettings,
      categories
  };
};
