import React from 'react';
import { View } from 'react-native';
import tw from 'twrnc';
import { Theme } from '../theme';
import StatCard from './StatCard';

interface IncomeExpenseStatsProps {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  incomeChange: number;
  expenseChange: number;
  theme: Theme;
  currencyCode: string;
}

const IncomeExpenseStats: React.FC<IncomeExpenseStatsProps> = ({
  totalBalance,
  monthlyIncome,
  monthlyExpense,
  incomeChange,
  expenseChange,
  theme,
  currencyCode,
}) => {
  return (
    <View style={tw`px-5 gap-4 mb-5`}>
      <StatCard
        label="Total Balance"
        value={totalBalance}
        icon="wallet-outline"
        color={theme.primary}
        theme={theme}
        currencyCode={currencyCode}
      />
      <StatCard
        label="Monthly Income"
        value={monthlyIncome}
        icon="trending-up-outline"
        color={theme.income}
        trend={`${Math.abs(incomeChange).toFixed(1)}% vs last month`}
        trendDirection={incomeChange >= 0 ? 'up' : 'down'}
        isPositive={incomeChange >= 0}
        theme={theme}
        currencyCode={currencyCode}
      />
      <StatCard
        label="Monthly Expense"
        value={monthlyExpense}
        icon="trending-down-outline"
        color={theme.expense}
        trend={`${Math.abs(expenseChange).toFixed(1)}% vs last month`}
        trendDirection={expenseChange >= 0 ? 'up' : 'down'}
        isPositive={expenseChange < 0}
        theme={theme}
        currencyCode={currencyCode}
      />
    </View>
  );
};

export default IncomeExpenseStats;
