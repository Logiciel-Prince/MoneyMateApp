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
import {Budget} from '../types';
import AddBudgetModal from '../components/AddBudgetModal';

const BudgetsScreen = () => {
  const systemColorScheme = useColorScheme();
  const {budgets, addBudget, updateBudget, deleteBudget, settings} = useData();
  const activeThemeType = settings.theme === 'system' ? systemColorScheme : settings.theme;
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
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteBudget(id),
        },
      ],
    );
  };

  const renderBudget = ({item}: {item: Budget}) => {
    const percentage = (item.spent / item.amount) * 100;
    const isOverBudget = percentage > 100;

    return (
      <TouchableOpacity
        style={[styles.budgetCard, {backgroundColor: theme.card}]}
        onLongPress={() => handleEdit(item)}>
        <View style={styles.budgetHeader}>
          <View style={styles.budgetLeft}>
            <Text style={[styles.category, {color: theme.text}]}>
              {item.category}
            </Text>
            <Text style={[styles.period, {color: theme.textSecondary}]}>
              {item.period.charAt(0).toUpperCase() + item.period.slice(1)}
            </Text>
          </View>
          <View style={styles.budgetRight}>
            <Text style={[styles.amount, {color: theme.text}]}>
              ${item.spent.toFixed(2)} / ${item.amount.toFixed(2)}
            </Text>
            <TouchableOpacity
              onPress={() => handleDelete(item.id)}
              style={styles.deleteButton}>
              <Icon name="trash-outline" size={18} color={theme.danger} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={[styles.progressBar, {backgroundColor: theme.border}]}>
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

        {/* Percentage */}
        <Text
          style={[
            styles.percentage,
            {color: isOverBudget ? theme.danger : theme.textSecondary},
          ]}>
          {percentage.toFixed(1)}% {isOverBudget ? 'over budget' : 'used'}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.background}]}>
      <FlatList
        data={budgets}
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
            <Text style={[styles.emptyText, {color: theme.textSecondary}]}>
              No budgets yet
            </Text>
            <Text style={[styles.emptySubtext, {color: theme.textSecondary}]}>
              Tap the + button to create your first budget
            </Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, {backgroundColor: theme.primary}]}
        onPress={() => {
          setEditingBudget(undefined);
          setModalVisible(true);
        }}>
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
  budgetCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
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
  percentage: {
    fontSize: 14,
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

export default BudgetsScreen;
