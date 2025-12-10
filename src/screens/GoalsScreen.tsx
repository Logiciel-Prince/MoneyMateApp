import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  useColorScheme,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useData} from '../context/DataContext';
import {lightTheme, darkTheme} from '../theme';
import {Goal} from '../types';
import AddGoalModal from '../components/AddGoalModal';

const GoalsScreen = () => {
  const systemColorScheme = useColorScheme();
  const {goals, addGoal, updateGoal, deleteGoal, settings} = useData();
  const activeThemeType = settings.theme === 'system' ? systemColorScheme : settings.theme;
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
      {text: 'Cancel', style: 'cancel'},
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
        {text: 'Cancel', style: 'cancel'},
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

  const renderGoal = ({item}: {item: Goal}) => {
    const percentage = (item.currentAmount / item.targetAmount) * 100;
    const isComplete = percentage >= 100;
    const daysLeft = Math.ceil(
      (new Date(item.deadline).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24),
    );

    return (
      <TouchableOpacity
        style={[styles.goalCard, {backgroundColor: theme.card}]}
        onLongPress={() => handleEdit(item)}>
        <View style={styles.goalHeader}>
          <View style={styles.goalLeft}>
            <Text style={[styles.goalName, {color: theme.text}]}>
              {item.name}
            </Text>
            <Text style={[styles.category, {color: theme.textSecondary}]}>
              {item.category}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => handleDelete(item.id)}
            style={styles.deleteButton}>
            <Icon name="trash-outline" size={18} color={theme.danger} />
          </TouchableOpacity>
        </View>

        {/* Progress */}
        <View style={styles.progressSection}>
          <View style={styles.amountRow}>
            <Text style={[styles.currentAmount, {color: theme.primary}]}>
              ${item.currentAmount.toFixed(2)}
            </Text>
            <Text style={[styles.targetAmount, {color: theme.textSecondary}]}>
              / ${item.targetAmount.toFixed(2)}
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={[styles.progressBar, {backgroundColor: theme.border}]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(percentage, 100)}%`,
                  backgroundColor: isComplete ? theme.success : theme.primary,
                },
              ]}
            />
          </View>

          <View style={styles.statsRow}>
            <Text
              style={[
                styles.percentage,
                {color: isComplete ? theme.success : theme.textSecondary},
              ]}>
              {percentage.toFixed(1)}% {isComplete && '✓ Complete'}
            </Text>
            <Text style={[styles.deadline, {color: theme.textSecondary}]}>
              {daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}
            </Text>
          </View>
        </View>

        {/* Add Funds Button */}
        {!isComplete && (
          <TouchableOpacity
            style={[styles.addFundsButton, {backgroundColor: theme.primary}]}
            onPress={() => handleAddFunds(item)}>
            <Icon name="add-circle-outline" size={20} color="#FFF" />
            <Text style={styles.addFundsText}>Add Funds</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.background}]}>
      <FlatList
        data={goals}
        renderItem={renderGoal}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="trophy-outline" size={64} color={theme.textSecondary} />
            <Text style={[styles.emptyText, {color: theme.textSecondary}]}>
              No goals yet
            </Text>
            <Text style={[styles.emptySubtext, {color: theme.textSecondary}]}>
              Tap the + button to create your first savings goal
            </Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, {backgroundColor: theme.primary}]}
        onPress={() => {
          setEditingGoal(undefined);
          setModalVisible(true);
        }}>
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
  goalCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  goalLeft: {
    flex: 1,
  },
  goalName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
  },
  deleteButton: {
    padding: 4,
  },
  progressSection: {
    marginBottom: 12,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  currentAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  targetAmount: {
    fontSize: 16,
    marginLeft: 4,
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
  },
  percentage: {
    fontSize: 14,
    fontWeight: '600',
  },
  deadline: {
    fontSize: 14,
  },
  addFundsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  addFundsText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
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
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default GoalsScreen;
