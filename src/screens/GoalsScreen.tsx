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
import { Goal, Transaction } from '../types';
import AddGoalModal from '../components/AddGoalModal';
import AddGoalContributionModal from '../components/AddGoalContributionModal';
import GoalCard from '../components/GoalCard';
import EmptyGoalList from '../components/EmptyGoalList';

const GoalsScreen = () => {
  const systemColorScheme = useColorScheme();
  const {
    goals,
    addGoal,
    updateGoal,
    deleteGoal,
    settings,
    accounts,
    updateAccount,
    addTransaction,
  } = useData();
  const activeThemeType =
    settings.theme === 'system' ? systemColorScheme : settings.theme;
  const theme = activeThemeType === 'dark' ? darkTheme : lightTheme;

  const [modalVisible, setModalVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>(undefined);
  const [addFundsModalVisible, setAddFundsModalVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const handleAddGoal = (goalData: Omit<Goal, 'id'>) => {
    if (editingGoal) {
      updateGoal(editingGoal.id, goalData);
    } else {
      const newGoal: Goal = {
        ...goalData,
        id: Date.now().toString(),
      };
      addGoal(newGoal);
    }
    setEditingGoal(undefined);
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Goal', 'Are you sure you want to delete this goal?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteGoal(id),
      },
    ]);
  };

  const handleAddFunds = (goal: Goal) => {
    setSelectedGoal(goal);
    setAddFundsModalVisible(true);
  };

  const handleSaveContribution = (
    goalId: string,
    amount: number,
    accountId?: string,
  ) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    // Update goal amount
    updateGoal(goalId, { currentAmount: goal.currentAmount + amount });

    // If account is selected, deduct from account and create transaction
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

    setAddFundsModalVisible(false);
    setSelectedGoal(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={goals}
        renderItem={({ item }) => (
          <GoalCard
            goal={item}
            theme={theme}
            currencyCode={settings.currency}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddFunds={handleAddFunds}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyGoalList theme={theme} />}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={() => {
          setEditingGoal(undefined);
          setModalVisible(true);
        }}
      >
        <Icon name="add" size={28} color="#FFF" />
      </TouchableOpacity>

      {/* Add/Edit Goal Modal */}
      <AddGoalModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingGoal(undefined);
        }}
        onSave={handleAddGoal}
        editGoal={editingGoal}
      />

      {/* Add Funds Modal */}
      <AddGoalContributionModal
        visible={addFundsModalVisible}
        onClose={() => {
          setAddFundsModalVisible(false);
          setSelectedGoal(null);
        }}
        onSave={handleSaveContribution}
        goal={selectedGoal}
        accounts={accounts}
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

export default GoalsScreen;

