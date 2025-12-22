import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  useColorScheme,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useData } from '../context/DataContext';
import { lightTheme, darkTheme } from '../theme';
import { Budget } from '../types';
import AddBudgetModal from '../components/AddBudgetModal';
import BudgetOverviewCard from '../components/BudgetOverviewCard';
import BudgetCard from '../components/BudgetCard';
import EmptyBudgetList from '../components/EmptyBudgetList';
import AnimatedScreenWrapper from '../components/AnimatedScreenWrapper';

const BudgetsScreen = () => {
  const systemColorScheme = useColorScheme();
  const {
    deleteBudget,
    categories,
    settings,
    budgets,
    transactions,
    addBudget,
    updateBudget,
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

  const renderOverview = () => {
    if (budgets.length === 0) return null;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const totalBudgetAmount = budgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpentAmount = budgets.reduce((sum, b) => {
      return sum + getSpendingForPeriod(b.category, currentMonth, currentYear);
    }, 0);

    return (
      <BudgetOverviewCard
        totalBudgetAmount={totalBudgetAmount}
        totalSpentAmount={totalSpentAmount}
        currencyCode={settings.currency}
        theme={theme}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <AnimatedScreenWrapper>
        <FlatList
          data={budgets}
          ListHeaderComponent={renderOverview}
          renderItem={({ item }) => {
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
            const previousYear =
              currentMonth === 0 ? currentYear - 1 : currentYear;

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

            const categoryObj = categories.find(c => c.name === item.category);

            return (
              <BudgetCard
                budget={item}
                currentSpent={currentSpent}
                previousSpent={previousSpent}
                category={categoryObj}
                theme={theme}
                currencyCode={settings.currency}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            );
          }}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyBudgetList theme={theme} />}
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
      </AnimatedScreenWrapper>
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
