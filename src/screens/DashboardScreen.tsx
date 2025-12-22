import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useData } from '../context/DataContext';
import { lightTheme, darkTheme } from '../theme';
import AddTransactionModal from '../components/AddTransactionModal';
import { Transaction, Goal } from '../types';
import AddGoalContributionModal from '../components/AddGoalContributionModal';
import IncomeExpenseStats from '../components/IncomeExpenseStats';
import IncomeExpenseChart from '../components/IncomeExpenseChart';
import ExpenseBreakdownChart from '../components/ExpenseBreakdownChart';
import SavingsGoalsList from '../components/SavingsGoalsList';
import tw from 'twrnc';

const DashboardScreen = ({ navigation }: any) => {
  const systemColorScheme = useColorScheme();
  const {
    transactions,
    accounts,
    goals,
    addTransaction,
    settings,
    updateGoal,
    updateAccount,
  } = useData();

  const activeThemeType =
    settings.theme === 'system' ? systemColorScheme : settings.theme;
  const theme = activeThemeType === 'dark' ? darkTheme : lightTheme;

  const [modalVisible, setModalVisible] = useState(false);
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  // --- Calculations for Stats ---
  const parseDate = (dateStr: string) => {
    let d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d;

    if (typeof dateStr === 'string' && dateStr.includes(' ')) {
      d = new Date(dateStr.replace(' ', 'T'));
      if (!isNaN(d.getTime())) return d;
    }

    return new Date();
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const getMonthlyTotal = React.useCallback(
    (type: 'income' | 'expense', date: Date) => {
      return transactions
        .filter(t => {
          if (t.type !== type) return false;
          const tDate = parseDate(t.date);
          return (
            tDate.getMonth() === date.getMonth() &&
            tDate.getFullYear() === date.getFullYear()
          );
        })
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    },
    [transactions],
  );

  const currentDate = new Date();
  const prevDate = new Date();
  prevDate.setMonth(currentDate.getMonth() - 1);

  const monthlyIncome = getMonthlyTotal('income', currentDate);
  const monthlyExpense = getMonthlyTotal('expense', currentDate);
  const prevMonthlyIncome = getMonthlyTotal('income', prevDate);
  const prevMonthlyExpense = getMonthlyTotal('expense', prevDate);

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const incomeChange = calculateChange(monthlyIncome, prevMonthlyIncome);
  const expenseChange = calculateChange(monthlyExpense, prevMonthlyExpense);

  const handleSaveTransaction = (transactionData: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: Date.now().toString(),
    };
    addTransaction(newTransaction);
    setModalVisible(false);
  };

  const handleAddMoneyToGoal = (
    goalId: string,
    amount: number,
    accountId?: string,
  ) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    updateGoal(goalId, { currentAmount: goal.currentAmount + amount });

    if (accountId) {
      const account = accounts.find(a => a.id === accountId);
      if (account) {
        updateAccount(accountId, { balance: account.balance - amount });

        const newTransaction: Transaction = {
          id: Date.now().toString(),
          type: 'expense',
          amount: amount,
          category: 'Savings',
          description: `Contribution to ${goal.name}`,
          date: new Date().toISOString().split('T')[0],
          accountId: accountId,
        };
        addTransaction(newTransaction);
      }
    }
    setGoalModalVisible(false);
    setSelectedGoal(null);
  };

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: theme.background }]}>
      <ScrollView
        style={[tw`flex-1`, { backgroundColor: theme.background }]}
        contentContainerStyle={tw`pb-25`}
      >
        {/* Dashboard Title Header */}
        <View style={tw`px-5 pt-2.5 pb-5`}>
          <View>
            <Text style={[tw`text-3xl font-bold`, { color: theme.text }]}>
              Dashboard
            </Text>
            <Text style={[tw`text-sm mt-1`, { color: theme.textSecondary }]}>
              Welcome back, here's your financial overview.
            </Text>
          </View>
        </View>

        {accounts.length === 0 ? (
          <View
            style={[
              tw`m-5 p-7.5 border-2 border-dashed rounded-2xl items-center justify-center`,
              { borderColor: theme.border },
            ]}
          >
            <View
              style={[
                tw`w-20 h-20 rounded-full justify-center items-center mb-5`,
                { backgroundColor: `${theme.primary}20` },
              ]}
            >
              <Icon name="grid-outline" size={40} color={theme.primary} />
            </View>
            <Text
              style={[
                tw`text-2xl font-bold mb-2.5 text-center`,
                { color: theme.text },
              ]}
            >
              Welcome to MoneyMate
            </Text>
            <Text
              style={[
                tw`text-base text-center leading-6 mb-7.5 px-2.5`,
                { color: theme.textSecondary },
              ]}
            >
              Your personal finance dashboard is currently empty. Get started by
              adding your accounts, or load demo data to explore the features.
            </Text>

            <TouchableOpacity
              style={[
                tw`flex-row items-center justify-center py-3 px-6 rounded-xl mb-4 w-full gap-2`,
                { backgroundColor: theme.primary },
              ]}
              onPress={() => navigation.navigate('Accounts')}
            >
              <Icon name="add" size={20} color="#FFF" />
              <Text style={tw`text-white text-base font-semibold`}>
                Add Your First Account
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                tw`items-center justify-center py-3 px-6 rounded-xl border w-full`,
                { borderColor: theme.border, backgroundColor: theme.card },
              ]}
              onPress={() => navigation.navigate('Settings')}
            >
              <Text style={[tw`text-base font-medium`, { color: theme.text }]}>
                Go to Settings for Demo Data
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Income & Expense Stats */}
            <IncomeExpenseStats
              totalBalance={totalBalance}
              monthlyIncome={monthlyIncome}
              monthlyExpense={monthlyExpense}
              incomeChange={incomeChange}
              expenseChange={expenseChange}
              theme={theme}
              currencyCode={settings.currency}
            />

            {/* Income & Expense Chart */}
            <IncomeExpenseChart
              transactions={transactions}
              theme={theme}
              currencyCode={settings.currency}
            />

            {/* Expense Breakdown */}
            <ExpenseBreakdownChart
              transactions={transactions}
              theme={theme}
              currencyCode={settings.currency}
            />

            {/* Savings Goals */}
            <SavingsGoalsList
              goals={goals}
              theme={theme}
              currencyCode={settings.currency}
              onAddMoney={goal => {
                setSelectedGoal(goal);
                setGoalModalVisible(true);
              }}
            />
          </>
        )}
      </ScrollView>

      {/* FAB */}
      {accounts.length > 0 && (
        <TouchableOpacity
          style={[
            tw`absolute right-5 bottom-7 w-15 h-15 rounded-full justify-center items-center shadow-lg`,
            {
              backgroundColor: theme.primary,
              shadowColor: theme.primary,
            },
          ]}
          onPress={() => setModalVisible(true)}
        >
          <Icon name="add" size={32} color="#FFF" />
        </TouchableOpacity>
      )}

      {/* Add Transaction Modal */}
      <AddTransactionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveTransaction}
        accounts={accounts}
      />

      {/* Add Money to Goal Modal */}
      <AddGoalContributionModal
        visible={goalModalVisible}
        onClose={() => setGoalModalVisible(false)}
        onSave={handleAddMoneyToGoal}
        goal={selectedGoal}
        accounts={accounts}
      />
    </SafeAreaView>
  );
};

export default DashboardScreen;
