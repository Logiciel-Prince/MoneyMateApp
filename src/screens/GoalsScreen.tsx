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
import { Goal } from '../types';
import AddGoalModal from '../components/AddGoalModal';
import GoalCard from '../components/GoalCard';
import EmptyGoalList from '../components/EmptyGoalList';

const GoalsScreen = () => {
  const systemColorScheme = useColorScheme();
  const { goals, addGoal, updateGoal, deleteGoal, settings } = useData();
  const activeThemeType =
    settings.theme === 'system' ? systemColorScheme : settings.theme;
  const theme = activeThemeType === 'dark' ? darkTheme : lightTheme;

  const [modalVisible, setModalVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>(undefined);

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
    Alert.prompt(
      'Add Funds',
      `How much would you like to add to "${goal.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: amount => {
            const addAmount = parseFloat(amount || '0');
            if (addAmount > 0) {
              updateGoal(goal.id, {
                currentAmount: goal.currentAmount + addAmount,
              });
            }
          },
        },
      ],
      'plain-text',
      '',
      'decimal-pad',
    );
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

      {/* Add/Edit Modal */}
      <AddGoalModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingGoal(undefined);
        }}
        onSave={handleAddGoal}
        editGoal={editingGoal}
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
