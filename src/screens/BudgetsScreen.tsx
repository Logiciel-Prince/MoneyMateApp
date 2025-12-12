import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  useColorScheme,
  TouchableOpacity,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useData } from '../context/DataContext';
import { lightTheme, darkTheme } from '../theme';
import { Budget } from '../types';
import AddBudgetModal from '../components/AddBudgetModal';

const BudgetsScreen = () => {
  const systemColorScheme = useColorScheme();
  const {
    budgets,
    transactions,
    addBudget,
    updateBudget,
    deleteBudget,
    settings,
  } = useData();
  const activeThemeType =
    settings.theme === 'system' ? systemColorScheme : settings.theme;
  const theme = activeThemeType === 'dark' ? darkTheme : lightTheme;

  const [modalVisible, setModalVisible] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | undefined>(
    undefined,
  );

  const handleAddBudget = (budgetData: Omit<Budget, 'id'>) => {
    if (editingBudget) {
      updateBudget(editingBudget.id, budgetData);
    } else {
      const newBudget: Budget = {
        ...budgetData,
        id: Date.now().toString(),
      };
      addBudget(newBudget);
    }
    setEditingBudget(undefined);
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Budget',
      'Are you sure you want to delete this budget?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteBudget(id),
        },
      ],
    );
  };

  const getSpendingForPeriod = (
    categoryName: string,
    month: number,
    year: number,
  ) => {
    return transactions
      .filter(t => {
        const tDate = new Date(t.date);
        return (
          t.type === 'expense' &&
          t.category === categoryName &&
          tDate.getMonth() === month &&
          tDate.getFullYear() === year
        );
      })
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const renderBudget = ({ item }: { item: Budget }) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentSpent = getSpendingForPeriod(
      item.category,
      currentMonth,
      currentYear,
    );
    const previousSpent = getSpendingForPeriod(
      item.category,
      previousMonth,
      previousYear,
    );

    const percentage = (currentSpent / item.amount) * 100;
    const isOverBudget = percentage > 100;

    // Calculate trend
    let trendPercentage = 0;
    let trendDirection: 'up' | 'down' | 'same' = 'same';

    if (previousSpent > 0) {
      trendPercentage = ((currentSpent - previousSpent) / previousSpent) * 100;
      if (currentSpent > previousSpent) trendDirection = 'up';
      else if (currentSpent < previousSpent) trendDirection = 'down';
    } else if (currentSpent > 0) {
      trendDirection = 'up';
      trendPercentage = 100;
    }

    return (
      <TouchableOpacity
        style={[styles.budgetCard, { backgroundColor: theme.card }]}
        onLongPress={() => handleEdit(item)}
      >
        <View style={styles.budgetHeader}>
          <View style={styles.budgetLeft}>
            <Text style={[styles.category, { color: theme.text }]}>
              {item.category}
            </Text>
            <Text style={[styles.period, { color: theme.textSecondary }]}>
              {item.period.charAt(0).toUpperCase() + item.period.slice(1)}
            </Text>
          </View>
          <View style={styles.budgetRight}>
            <Text style={[styles.amount, { color: theme.text }]}>
              ${currentSpent.toFixed(2)} / ${item.amount.toFixed(2)}
            </Text>
            <TouchableOpacity
              onPress={() => handleDelete(item.id)}
              style={styles.deleteButton}
            >
              <Icon name="trash-outline" size={18} color={theme.danger} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(percentage, 100)}%`,
                backgroundColor: isOverBudget ? theme.danger : theme.success,
              },
            ]}
          />
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <Text
            style={[
              styles.percentage,
              { color: isOverBudget ? theme.danger : theme.textSecondary },
            ]}
          >
            {percentage.toFixed(1)}% {isOverBudget ? 'over' : 'used'}
          </Text>

          {/* Trend Indicator */}
          <View style={styles.trendContainer}>
            {trendDirection !== 'same' && (
              <Icon
                name={trendDirection === 'up' ? 'arrow-up' : 'arrow-down'}
                size={16}
                color={trendDirection === 'up' ? theme.danger : theme.success}
                style={styles.trendIcon}
              />
            )}
            <Text
              style={[
                styles.trendText,
                {
                  color:
                    trendDirection === 'same'
                      ? theme.textSecondary
                      : trendDirection === 'up'
                      ? theme.danger
                      : theme.success,
                },
              ]}
            >
              {trendDirection === 'same'
                ? 'No change vs last month'
                : `${Math.abs(trendPercentage).toFixed(1)}% vs last mo.`}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderOverview = () => {
    if (budgets.length === 0) return null;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const totalBudgetAmount = budgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpentAmount = budgets.reduce((sum, b) => {
      return sum + getSpendingForPeriod(b.category, currentMonth, currentYear);
    }, 0);

    const totalRemaining = Math.max(0, totalBudgetAmount - totalSpentAmount);
    const overallPercentage =
      totalBudgetAmount > 0 ? (totalSpentAmount / totalBudgetAmount) * 100 : 0;
    const isOverBudget = totalSpentAmount > totalBudgetAmount;

    return (
      <LinearGradient
        colors={[theme.primary, '#4c669f']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.overviewCard}
      >
        <Text style={styles.overviewTitle}>Total Budget</Text>
        <Text style={styles.overviewAmount}>${totalRemaining.toFixed(2)}</Text>
        <Text style={styles.overviewSubtitle}>Remaining</Text>

        <View style={styles.overviewRow}>
          <View>
            <Text style={styles.overviewLabel}>Budgeted</Text>
            <Text style={styles.overviewValue}>
              ${totalBudgetAmount.toFixed(2)}
            </Text>
          </View>
          <View style={styles.alignRight}>
            <Text style={styles.overviewLabel}>Spent</Text>
            <Text style={styles.overviewValue}>
              ${totalSpentAmount.toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.overviewProgressBg}>
          <View
            style={[
              styles.overviewProgressFill,
              {
                width: `${Math.min(overallPercentage, 100)}%`,
                backgroundColor: isOverBudget ? '#FF6B6B' : '#FFF',
              },
            ]}
          />
        </View>
        <Text style={styles.overviewProgressText}>
          {overallPercentage.toFixed(1)}% used
        </Text>
      </LinearGradient>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={budgets}
        ListHeaderComponent={renderOverview}
        renderItem={renderBudget}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon
              name="pie-chart-outline"
              size={64}
              color={theme.textSecondary}
            />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No budgets yet
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
              Tap the + button to create your first budget
            </Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={() => {
          setEditingBudget(undefined);
          setModalVisible(true);
        }}
      >
        <Icon name="add" size={28} color="#FFF" />
      </TouchableOpacity>

      {/* Add/Edit Modal */}
      <AddBudgetModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingBudget(undefined);
        }}
        onSave={handleAddBudget}
        editBudget={editingBudget}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 15,
    paddingBottom: 80,
  },
  overviewCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  overviewTitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  overviewAmount: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  overviewSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 20,
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  overviewLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginBottom: 4,
  },
  overviewValue: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  overviewProgressBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  overviewProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  overviewProgressText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    textAlign: 'right',
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  budgetCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  budgetLeft: {
    flex: 1,
  },
  budgetRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  category: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  period: {
    fontSize: 14,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  percentage: {
    fontSize: 14,
    fontWeight: '600',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  trendIcon: {
    marginRight: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default BudgetsScreen;
