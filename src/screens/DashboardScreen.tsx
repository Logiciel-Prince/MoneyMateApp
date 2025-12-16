import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Alert,
} from 'react-native';
import { BarChart, PieChart } from 'react-native-gifted-charts';
import Icon from 'react-native-vector-icons/Ionicons';
import { useData } from '../context/DataContext';
import { lightTheme, darkTheme } from '../theme';
import AddTransactionModal from '../components/AddTransactionModal';
import { Transaction, Goal } from '../types';
import AddGoalContributionModal from '../components/AddGoalContributionModal';
import {
  formatCurrency,
  getCurrencySymbol,
  formatCurrencyCompact,
} from '../utils/currency';

const screenWidth = Dimensions.get('window').width;

import tw from 'twrnc';

// ... existing imports

interface StatCardProps {
  label: string;
  value: string | number; // Allow formatted string
  icon: string;
  color: string; // Can be a tailwind class like 'text-green-600' or hex
  theme: any;
  trend?: string; // Text like "4.2% vs last month"
  trendDirection?: 'up' | 'down';
  isPositive?: boolean;
  currencyCode?: string;
}

const StatCard = ({
  label,
  value,
  icon,
  color, // e.g. "text-green-600" or hex
  theme,
  trend,
  trendDirection,
  isPositive,
  currencyCode = 'USD',
}: StatCardProps) => {
  // Resolve color: if it's a tailwind class, use tw, else use as is
  const iconColorStyle =
    color.startsWith('text-') || color.startsWith('bg-')
      ? tw`${color}`
      : { color: color };
  const iconColor = (iconColorStyle as any).color || color;
  const iconBgColor = color.startsWith('text-')
    ? color.replace('text-', 'bg-').replace('600', '100')
    : `${color}20`; // rough approx for bg

  const bgStyle = color.startsWith('text-')
    ? tw`${iconBgColor} opacity-20`
    : { backgroundColor: `${color}20` };

  return (
    <View
      style={[
        tw`p-4 rounded-2xl mb-4`,
        {
          backgroundColor: theme.card,
          elevation: 2,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
      ]}
    >
      <View style={tw`flex-row justify-between items-start`}>
        <View>
          <View
            style={[
              tw`w-10 h-10 rounded-full justify-center items-center mb-2`,
              bgStyle,
            ]}
          >
            <Icon name={icon} size={20} color={iconColor} />
          </View>
          <Text style={[tw`text-sm mb-1`, { color: theme.textSecondary }]}>
            {label}
          </Text>
          <Text style={[tw`text-2xl font-bold mb-1`, { color: theme.text }]}>
            {typeof value === 'number'
              ? formatCurrency(value, currencyCode)
              : value}
          </Text>

          {trend && (
            <View style={tw`flex-row items-center`}>
              <Icon
                name={trendDirection === 'up' ? 'arrow-up' : 'arrow-down'}
                size={14}
                color={
                  isPositive
                    ? theme.mode === 'dark'
                      ? '#4ade80'
                      : '#16a34a'
                    : theme.mode === 'dark'
                    ? '#f87171'
                    : '#dc2626'
                }
                style={[
                  tw`mr-1`,
                  {
                    transform: [
                      { rotate: trendDirection === 'up' ? '45deg' : '-45deg' },
                    ],
                  },
                ]}
              />
              <Text
                style={[
                  tw`text-xs`,
                  {
                    color: isPositive
                      ? theme.mode === 'dark'
                        ? '#4ade80'
                        : '#16a34a'
                      : theme.mode === 'dark'
                      ? '#f87171'
                      : '#dc2626',
                  },
                ]}
              >
                {trend}
              </Text>
            </View>
          )}
        </View>

        {/* Large background icon */}
        <View style={tw`absolute right-0 -mr-2 opacity-5`}>
          <Icon name={icon} size={100} color={theme.text} />
        </View>
      </View>
    </View>
  );
};

const DashboardScreen = ({ navigation }: any) => {
  // ... existing hooks
  const systemColorScheme = useColorScheme();
  const {
    transactions,
    accounts,
    goals,
    addTransaction,
    settings,
    updateGoal,
    updateAccount,
    scanSmsAndAddTransactions,
  } = useData();

  const activeThemeType =
    settings.theme === 'system' ? systemColorScheme : settings.theme;
  const theme = activeThemeType === 'dark' ? darkTheme : lightTheme;
  // inject mode for inline conditionals
  theme.mode = activeThemeType || 'light';

  // ... existing calculations

  // Refactor StatCard calls in render:
  // ...

  const [pieMonthOffset, setPieMonthOffset] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      const added = await scanSmsAndAddTransactions();
      if (added > 0) {
        Alert.alert(
          'Sync Complete',
          `Added ${added} new transactions found in SMS.`,
        );
      }
    } catch (e) {
      console.error('Refresh failed', e);
      Alert.alert('Error', 'Failed to scan SMS');
    } finally {
      setRefreshing(false);
    }
  }, [scanSmsAndAddTransactions]);

  const [modalVisible, setModalVisible] = useState(false);
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  // --- Calculations ---
  // --- Calculations ---
  // Helper for safe date parsing
  const parseDate = (dateStr: string) => {
    // Try standard constructor
    let d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d;

    // Attempt to handle "YYYY-MM-DD HH:mm" by replacing space with T
    if (typeof dateStr === 'string' && dateStr.includes(' ')) {
      d = new Date(dateStr.replace(' ', 'T'));
      if (!isNaN(d.getTime())) return d;
    }

    return new Date(); // Fallback to now (should not happen with good data)
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

  const sectionCount = 5;

  // Bar Chart Data
  const { barChartData, chartMaxValue, stepValue } = useMemo(() => {
    const data: any[] = [];
    let monthsBack = 5; // Default max 6 months

    if (transactions.length > 0) {
      const dates = transactions
        .map(t => parseDate(t.date).getTime())
        .filter(d => !isNaN(d));

      if (dates.length > 0) {
        const minTimestamp = Math.min(...dates);
        const minDate = new Date(minTimestamp);
        const now = new Date();

        const diffYears = now.getFullYear() - minDate.getFullYear();
        const diffMonths = diffYears * 12 + now.getMonth() - minDate.getMonth();

        // We show at most 5 months (indices 0 to 4)
        monthsBack = Math.min(Math.max(diffMonths, 0), 4);
      } else {
        monthsBack = 0;
      }
    } else {
      monthsBack = 0;
    }

    for (let i = monthsBack; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = d
        .toLocaleString('default', { month: 'short' })
        .substring(0, 3);
      const inc = getMonthlyTotal('income', d);
      const exp = getMonthlyTotal('expense', d);

      data.push({
        value: inc,
        frontColor: (theme as any).mode === 'dark' ? '#4ade80' : '#16a34a',
        spacing: 6,
        labelComponent: () => (
          <View style={{ width: 50, marginLeft: 6 }}>
            <Text
              style={{
                color: theme.textSecondary,
                fontSize: 10,
                textAlign: 'center',
              }}
              numberOfLines={1}
            >
              {label}
            </Text>
          </View>
        ),
      });
      data.push({
        value: exp,
        frontColor: (theme as any).mode === 'dark' ? '#f87171' : '#dc2626',
        spacing: 32, // larger spacing after the group
      });
    }

    const sectionCount = 5;
    const rawMax = Math.max(...data.map((d: any) => d.value || 0), 100);
    const maxValue = rawMax;
    const step = rawMax / sectionCount;

    return { barChartData: data, chartMaxValue: maxValue, stepValue: step };
  }, [transactions, theme.mode, getMonthlyTotal]);

  // Pie Chart Data
  const pieDisplayDate = new Date();
  pieDisplayDate.setMonth(pieDisplayDate.getMonth() + pieMonthOffset);

  const pieChartData = useMemo(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + pieMonthOffset);

    const monthlyExpenses = transactions.filter(
      t =>
        t.type === 'expense' &&
        new Date(t.date).getMonth() === date.getMonth() &&
        new Date(t.date).getFullYear() === date.getFullYear(),
    );

    const grouped: { [key: string]: number } = {};
    monthlyExpenses.forEach(t => {
      const amt = Number(t.amount) || 0;
      if (amt > 0) {
        grouped[t.category] = (grouped[t.category] || 0) + amt;
      }
    });

    // Consistent color palette
    const palette = [
      '#8B5CF6',
      '#F97316',
      '#EF4444',
      '#84CC16',
      '#EC4899',
      '#3B82F6',
      '#EAB308',
      '#14B8A6',
      '#6366F1',
      '#D946EF',
      '#06B6D4',
      '#F59E0B',
    ];

    const getCategoryColor = (cat: string) => {
      let hash = 0;
      for (let i = 0; i < cat.length; i++) {
        hash = cat.charCodeAt(i) + ((hash << 5) - hash);
      }
      return palette[Math.abs(hash) % palette.length];
    };

    let entries = Object.entries(grouped)
      .map(([name, amount]) => ({
        name,
        value: amount,
        color: getCategoryColor(name),
        text: '', // No text on slices
      }))
      .sort((a, b) => b.value - a.value);

    return entries;
  }, [transactions, pieMonthOffset, theme.textSecondary]);

  const totalExpenseForPie = pieChartData.reduce(
    (acc, curr) => acc + curr.value,
    0,
  );

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

    // 1. Update Goal Amount
    updateGoal(goalId, { currentAmount: goal.currentAmount + amount });

    // 2. If account selected, deduct money and create transaction
    if (accountId) {
      const account = accounts.find(a => a.id === accountId);
      if (account) {
        updateAccount(accountId, { balance: account.balance - amount });

        const newTransaction: Transaction = {
          id: Date.now().toString(),
          type: 'expense', // Treating as expense/transfer
          amount: amount,
          category: 'Savings', // Ideally we should have a generic category or pass it
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
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
      >
        {/* Dashboard Title Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.headerTitle, { color: theme.text }]}>
              Dashboard
            </Text>
            <Text
              style={[styles.headerSubtitle, { color: theme.textSecondary }]}
            >
              Welcome back, here's your financial overview.
            </Text>
          </View>
        </View>

        {accounts.length === 0 ? (
          <View
            style={[styles.emptyStateContainer, { borderColor: theme.border }]}
          >
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: `${theme.primary}20` },
              ]}
            >
              <Icon name="grid-outline" size={40} color={theme.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              Welcome to MoneyMate
            </Text>
            <Text
              style={[styles.emptySubtitle, { color: theme.textSecondary }]}
            >
              Your personal finance dashboard is currently empty. Get started by
              adding your accounts, or load demo data to explore the features.
            </Text>

            <TouchableOpacity
              style={[
                styles.emptyButtonPrimary,
                { backgroundColor: theme.primary },
              ]}
              onPress={() => navigation.navigate('Accounts')}
            >
              <Icon name="add" size={20} color="#FFF" />
              <Text style={styles.emptyButtonTextPrimary}>
                Add Your First Account
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.emptyButtonSecondary,
                { borderColor: theme.border, backgroundColor: theme.card },
              ]}
              onPress={() => navigation.navigate('Settings')}
            >
              <Text
                style={[styles.emptyButtonTextSecondary, { color: theme.text }]}
              >
                Go to Settings for Demo Data
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Vertical Stat Cards */}
            <View style={styles.statsContainer}>
              <StatCard
                label="Total Balance"
                value={totalBalance}
                icon="wallet-outline"
                color={theme.primary}
                theme={theme}
                currencyCode={settings.currency}
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
                currencyCode={settings.currency}
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
                currencyCode={settings.currency}
              />
            </View>

            {/* Bar Chart */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: theme.card,
                  overflow: 'visible',
                  zIndex: 10,
                },
              ]}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 20,
                  zIndex: 20,
                }}
              >
                <Text
                  style={[
                    styles.cardTitle,
                    { color: theme.text, marginBottom: 0 },
                  ]}
                >
                  Income & Expense History
                </Text>
              </View>

              {barChartData.length > 0 ? (
                // Centering Logic for 'Groww' style
                // Available width approx screenWidth - 80 (padding + Y-axis)
                // One month group width = 22 (inc) + 12 (gap) + 22 (exp) = 56
                // + 32 spacing after group = 88 per month approx
                // We calculate precise initialSpacing to center content.
                (() => {
                  // Chart container effective width
                  // Card padding (20*2) + margins (20) ~ 60.
                  // Y-Axis takes space? We set yAxisThickness=0 but labels exist.
                  // Let's assume safe usable width is screenWidth - 100.
                  const availableWidth = screenWidth - 100;

                  let barWidth = 22;
                  let groupSpacing = 32;
                  let internalSpacing = 10;
                  let initialSpacing = 20;

                  // Dynamic sizing based on data quantity
                  const numGroups = Math.ceil(barChartData.length / 2);

                  if (numGroups === 1) {
                    // 1 Month: Make bars FAT (mimic user image)
                    // available width split: 35% bar1, 10% gap, 35% bar2, 20% sides
                    barWidth = availableWidth * 0.35;
                    internalSpacing = availableWidth * 0.1;
                    groupSpacing = 0; // No other groups

                    // Center it
                    const contentWidth = barWidth * 2 + internalSpacing;
                    initialSpacing = (availableWidth - contentWidth) / 2;
                  } else if (numGroups === 2) {
                    // 2 Months: Wider bars but ensure they fit
                    // Fit 2 groups: [B G B] -- S -- [B G B]
                    // Total roughly 4 bars + 3 gaps.
                    barWidth = availableWidth / 7.5;
                    internalSpacing = barWidth / 2;
                    groupSpacing = barWidth;

                    const groupWidth = barWidth * 2 + internalSpacing;
                    const totalWidth = groupWidth * 2 + groupSpacing;
                    initialSpacing = (availableWidth - totalWidth) / 2;
                  } else if (numGroups === 3) {
                    // 3 Months: Needs to fit 3 groups
                    // 6 bars total + gaps.
                    // Factor ~11 (6 bars + 3 gaps + margins)
                    barWidth = availableWidth / 11;
                    internalSpacing = 5;
                    groupSpacing = barWidth * 0.8;

                    const groupWidth = barWidth * 2 + internalSpacing;
                    // 3 groups, 2 spaces between them
                    const totalWidth = groupWidth * 3 + groupSpacing * 2;
                    initialSpacing = (availableWidth - totalWidth) / 2;
                  } else if (numGroups === 4) {
                    // 4 Months: Fits nicely with slightly tighter naming
                    // 8 bars + 3 gaps between groups
                    barWidth = availableWidth / 14;
                    internalSpacing = 4;
                    groupSpacing = 12;

                    const groupWidth = barWidth * 2 + internalSpacing;
                    // 4 groups, 3 spaces between them
                    const totalWidth = groupWidth * 4 + groupSpacing * 3;
                    initialSpacing = (availableWidth - totalWidth) / 2;
                  } else {
                    // Standard sizing for many months (>3)
                    barWidth = 16;
                    groupSpacing = 20;
                    internalSpacing = 4;

                    // Helper to calc width
                    const gWidth = barWidth * 2 + internalSpacing;
                    const totWidth =
                      numGroups * gWidth +
                      Math.max(0, numGroups - 1) * groupSpacing;

                    // If still smaller than screen, center it
                    if (totWidth < availableWidth) {
                      initialSpacing = (availableWidth - totWidth) / 2;
                    } else {
                      initialSpacing = 20; // Default left padding for scrollable
                    }
                  }

                  // Apply spacing and label centering to data
                  const structuredData = barChartData.map((item, index) => {
                    const isIncomeBar = index % 2 === 0;
                    // For 1 or 2 months, we want the label centered across the group (Income + Expense)
                    // Group width = (barWidth * 2) + internalSpacing.
                    // We attach the label to the Income bar.
                    const groupWidth = barWidth * 2 + internalSpacing;

                    const newItem = {
                      ...item,
                      spacing: isIncomeBar ? internalSpacing : groupSpacing,
                    };

                    // Update label component to center under the GROUP
                    if (isIncomeBar) {
                      newItem.labelComponent = () => (
                        <View
                          style={{
                            width: groupWidth,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Text
                            style={{
                              color: theme.textSecondary,
                              fontSize: 10,
                              textAlign: 'center',
                              marginTop: 4,
                            }}
                            numberOfLines={1}
                          >
                            {
                              item.labelComponent().props.children.props
                                .children
                            }
                          </Text>
                        </View>
                      );
                    }
                    return newItem;
                  });

                  return (
                    <BarChart
                      key={`bar-chart-${transactions.length}-${barWidth}`}
                      data={structuredData}
                      barWidth={barWidth}
                      initialSpacing={Math.max(0, initialSpacing)}
                      disableScroll
                      roundedTop
                      roundedBottom={false}
                      rulesType="dashed"
                      rulesColor={theme.border}
                      rulesLength={screenWidth - 100}
                      xAxisThickness={0}
                      yAxisThickness={0}
                      yAxisTextStyle={{
                        color: theme.textSecondary,
                        fontSize: 10,
                      }}
                      noOfSections={sectionCount}
                      maxValue={chartMaxValue}
                      stepValue={stepValue > 0 ? stepValue : 10}
                      barBorderRadius={4}
                      isAnimated
                      animationDuration={500}
                      yAxisLabelPrefix={getCurrencySymbol(settings.currency)}
                      formatYLabel={(label: string) => {
                        if (!label) return '0';
                        const value = parseFloat(label);
                        if (isNaN(value)) return label;

                        const format = (
                          val: number,
                          divisor: number,
                          suffix: string,
                        ) => {
                          const v = val / divisor;
                          return (
                            (v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)) + suffix
                          );
                        };

                        if (value >= 10000000) {
                          return format(value, 10000000, 'Cr');
                        }
                        if (value >= 100000) {
                          return format(value, 100000, 'L');
                        }
                        if (value >= 1000) {
                          return format(value, 1000, 'k');
                        }
                        return value.toFixed(0);
                      }}
                      renderTooltip={(item: any, index: number) => {
                        const minTooltipWidth = 70;
                        const tooltipWidth = Math.max(
                          barWidth,
                          minTooltipWidth,
                        );

                        // Shift tooltip left for the last bar to prevent cut-off
                        const isLastBar = index === structuredData.length - 1;
                        const isFirstBar = index === 0;

                        let marginLeft = -(tooltipWidth / 2);
                        if (isLastBar) {
                          marginLeft = -(tooltipWidth - barWidth / 2);
                        } else if (isFirstBar) {
                          marginLeft = -(barWidth / 2);
                        }

                        return (
                          <View
                            style={{
                              marginLeft: marginLeft,
                              marginBottom:
                                item.value > chartMaxValue * 0.7 ? 0 : 6,
                              marginTop:
                                item.value > chartMaxValue * 0.7 ? 20 : 0,
                              width: tooltipWidth,
                              backgroundColor: theme.text, // Inverted background
                              paddingVertical: 2,
                              borderRadius: 16,
                              elevation: 4,
                              alignItems: 'center',
                              justifyContent: 'center',
                              shadowColor: '#000',
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: 0.15,
                              shadowRadius: 2,
                              zIndex: 2000,
                              position: 'absolute',
                            }}
                          >
                            <Text
                              style={{
                                color: theme.card, // Inverted text
                                fontSize: 10,
                                fontWeight: 'bold',
                                textAlign: 'center',
                              }}
                              numberOfLines={1}
                              adjustsFontSizeToFit
                            >
                              {getCurrencySymbol(settings.currency)}
                              {item.value.toLocaleString()}
                            </Text>
                          </View>
                        );
                      }}
                    />
                  );
                })()
              ) : (
                <View style={[styles.noDataContainer, { height: 200 }]}>
                  <Text style={{ color: theme.textSecondary }}>
                    No data available
                  </Text>
                </View>
              )}
              {/* Legend for Bar Chart */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  marginTop: 15,
                  gap: 20,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor:
                        (theme as any).mode === 'dark' ? '#4ade80' : '#16a34a',
                      marginRight: 8,
                    }}
                  />
                  <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                    Income
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor:
                        (theme as any).mode === 'dark' ? '#f87171' : '#dc2626',
                      marginRight: 8,
                    }}
                  />
                  <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                    Expense
                  </Text>
                </View>
              </View>
            </View>

            {/* Expense Breakdown (Donut) */}
            <View style={[styles.card, { backgroundColor: theme.card }]}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 20,
                }}
              >
                <Icon
                  name="pie-chart-outline"
                  size={20}
                  color={theme.text}
                  style={{ marginRight: 10 }}
                />
                <Text
                  style={[
                    styles.cardTitle,
                    { color: theme.text, marginBottom: 0 },
                  ]}
                >
                  Expense Breakdown
                </Text>
              </View>

              {/* Month Selector */}
              <View
                style={[
                  styles.monthSelector,
                  {
                    backgroundColor:
                      theme.mode === 'dark' ? '#1f2937' : '#f3f4f6',
                  },
                ]}
              >
                <TouchableOpacity
                  onPress={() => setPieMonthOffset(p => p - 1)}
                  style={styles.arrowButton}
                >
                  <Icon
                    name="chevron-back"
                    size={18}
                    color={theme.textSecondary}
                  />
                </TouchableOpacity>
                <Text style={[styles.monthText, { color: theme.text }]}>
                  {pieDisplayDate.toLocaleString('default', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
                <TouchableOpacity
                  onPress={() => setPieMonthOffset(p => p + 1)}
                  style={styles.arrowButton}
                >
                  <Icon
                    name="chevron-forward"
                    size={18}
                    color={theme.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 10,
                }}
              >
                {pieChartData.length > 0 ? (
                  <>
                    <PieChart
                      key={`pie-chart-${transactions.length}-${totalExpenseForPie}-${pieMonthOffset}`}
                      data={pieChartData}
                      donut
                      showText={false} // Hide customized text on chart slices
                      radius={110}
                      innerRadius={80}
                      innerCircleColor={theme.card}
                      centerLabelComponent={() => {
                        return (
                          <View
                            style={{
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                          >
                            <Text
                              style={{
                                color: theme.textSecondary,
                                fontSize: 12,
                                marginBottom: 4,
                              }}
                            >
                              TOTAL
                            </Text>
                            <Text
                              style={{
                                color: theme.text,
                                fontSize: 22,
                                fontWeight: 'bold',
                              }}
                            >
                              {formatCurrency(
                                totalExpenseForPie,
                                settings.currency,
                                {
                                  maximumFractionDigits: 0,
                                },
                              )}
                            </Text>
                          </View>
                        );
                      }}
                    />

                    {/* Custom Legend List */}
                    <View style={styles.legendContainer}>
                      {/* Fixed height scrollable container for list */}
                      <ScrollView
                        style={{ maxHeight: 250 }}
                        nestedScrollEnabled
                      >
                        {pieChartData.map((item, index) => (
                          <View key={index} style={styles.legendItem}>
                            <View style={styles.legendLeft}>
                              <View
                                style={[
                                  styles.legendDot,
                                  { backgroundColor: item.color },
                                ]}
                              />
                              <Text
                                numberOfLines={1}
                                style={[
                                  styles.legendName,
                                  { color: theme.textSecondary },
                                ]}
                              >
                                {item.name}
                              </Text>
                            </View>

                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 12,
                              }}
                            >
                              <View
                                style={[
                                  styles.percentBadge,
                                  {
                                    backgroundColor:
                                      theme.mode === 'dark'
                                        ? '#1f2937'
                                        : '#e5e7eb',
                                  },
                                ]}
                              >
                                <Text
                                  style={{
                                    color: theme.textSecondary,
                                    fontSize: 11,
                                    fontWeight: '600',
                                  }}
                                >
                                  {(
                                    (item.value / totalExpenseForPie) *
                                    100
                                  ).toFixed(1)}
                                  %
                                </Text>
                              </View>
                              <Text
                                style={[
                                  styles.legendAmount,
                                  { color: theme.text },
                                ]}
                              >
                                {formatCurrency(item.value, settings.currency)}
                              </Text>
                            </View>
                          </View>
                        ))}
                      </ScrollView>
                    </View>
                  </>
                ) : (
                  <View style={styles.noDataContainer}>
                    <Text style={{ color: theme.textSecondary }}>
                      No expenses for this month
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Top Savings Goals */}
            <View style={[styles.card, { backgroundColor: theme.card }]}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                Top Savings Goals
              </Text>
              {goals.slice(0, 3).map(goal => {
                const progress =
                  goal.targetAmount > 0
                    ? Math.min(goal.currentAmount / goal.targetAmount, 1)
                    : 0;
                const percent = Math.round(progress * 100);
                return (
                  <View
                    key={goal.id}
                    style={{
                      backgroundColor:
                        theme.mode === 'dark' ? '#1f2937' : '#f9fafb',
                      borderRadius: 16,
                      padding: 16,
                      marginBottom: 16,
                      borderWidth: 1,
                      borderColor:
                        theme.mode === 'dark' ? '#374151' : '#e5e7eb',
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 12,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: '700',
                          color: theme.text,
                        }}
                      >
                        {goal.name}
                      </Text>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <View
                          style={{
                            backgroundColor:
                              theme.mode === 'dark' ? '#374151' : '#e5e7eb',
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 8,
                          }}
                        >
                          <Text
                            style={{
                              color: '#3B82F6',
                              fontSize: 12,
                              fontWeight: 'bold',
                            }}
                          >
                            {percent}%
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 12,
                            backgroundColor:
                              theme.mode === 'dark' ? '#374151' : '#e5e7eb',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          onPress={() => {
                            setSelectedGoal(goal);
                            setGoalModalVisible(true);
                          }}
                        >
                          <Icon
                            name="add"
                            size={14}
                            color={theme.textSecondary}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        marginBottom: 12,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: '500',
                          color: theme.textSecondary,
                        }}
                      >
                        {formatCurrency(goal.currentAmount, settings.currency)}
                      </Text>
                      <Text
                        style={{ fontSize: 12, color: theme.textSecondary }}
                      >
                        of{' '}
                        {formatCurrency(goal.targetAmount, settings.currency)}
                      </Text>
                    </View>

                    <View
                      style={{
                        height: 8,
                        backgroundColor:
                          theme.mode === 'dark' ? '#374151' : '#e5e7eb',
                        borderRadius: 4,
                      }}
                    >
                      <View
                        style={{
                          height: '100%',
                          borderRadius: 4,
                          backgroundColor: '#3B82F6',
                          width: `${percent}%`,
                        }}
                      />
                    </View>
                  </View>
                );
              })}
              {goals.length === 0 && (
                <Text style={styles.noGoalsText}>No savings goals yet.</Text>
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* FAB - Only show if we have accounts, or maybe always? The empty state has a button. Let's hide FAB if empty state is evident to avoid clutter. */}
      {accounts.length > 0 && (
        <TouchableOpacity
          style={[
            styles.fab,
            { backgroundColor: theme.primary, shadowColor: theme.primary },
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  statsContainer: {
    paddingHorizontal: 20,
    gap: 15,
    marginBottom: 20,
  },
  statCard: {
    padding: 20,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    height: 140,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  statCardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  bgIconContainer: {
    position: 'absolute',
    right: -10,
    top: -10,
    zIndex: -1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '500',
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
    paddingRight: 0,
  },
  chartHeader: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: '#00000010',
    padding: 8,
    borderRadius: 10,
    marginBottom: 10,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
  },
  donutCenter: {
    position: 'absolute',
    top: 90,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  donutLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  donutValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  noDataContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  legendContainer: {
    marginTop: 20,
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendName: {
    fontSize: 14,
    fontWeight: '500',
  },
  legendRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  legendPercent: {
    fontSize: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  legendAmount: {
    fontSize: 14,
    fontWeight: '600',
    width: 80,
    textAlign: 'right',
  },
  goalItem: {
    marginBottom: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: '#33333320',
    borderRadius: 12,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  goalRightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  goalName: {
    fontWeight: '600',
    fontSize: 16,
  },
  goalPercentBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  miniAddButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalAmountText: {
    fontSize: 14,
    marginBottom: 10,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  noGoalsText: {
    textAlign: 'center',
    padding: 10,
    color: '#888',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30, // Above tab bar usually
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  // Empty State Styles
  emptyStateContainer: {
    margin: 20,
    padding: 30,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  emptyButtonPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginBottom: 15,
    width: '100%',
    gap: 8,
  },
  emptyButtonTextPrimary: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyButtonSecondary: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    borderWidth: 1,
    width: '100%',
  },
  emptyButtonTextSecondary: {
    fontSize: 16,
    fontWeight: '500',
  },
  arrowButton: {
    padding: 5,
  },
  percentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    minWidth: 50,
    alignItems: 'center',
  },
});

export default DashboardScreen;
